import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isStaffRole } from "@/lib/rbac-base";
import {
  sendAppointmentConfirmationEmail,
  sendAdminAppointmentNotificationEmail,
  sendAppointmentStatusEmail,
} from "@/lib/email";
import { getAvailableSlotsForDate } from "@/lib/clinic-schedule";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required to view consultations. Please sign in.",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const ticketParam = searchParams.get("ticket");
    const dateParam = searchParams.get("date");

    const userRole = (session.user as any)?.role;
    const where: Record<string, unknown> = {};

    // Admin/Hakim sees all; regular user sees only their own
    if (!isStaffRole(userRole)) {
      where.userId = session.user.id;
    }

    if (ticketParam && ticketParam.trim()) {
      where.ticketNumber = ticketParam.trim();
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (dateParam) {
      where.appointmentDate = dateParam;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { ticketNumber: { contains: q, mode: "insensitive" } },
        { patientName: { contains: q, mode: "insensitive" } },
        { patientPhone: { contains: q, mode: "insensitive" } },
        { patientEmail: { contains: q, mode: "insensitive" } },
        { primarySymptoms: { contains: q, mode: "insensitive" } },
        { user: { name: { contains: q, mode: "insensitive" } } },
        { user: { email: { contains: q, mode: "insensitive" } } },
      ];
    }

    const consultations = await prisma.consultationRequest.findMany({
      where,
      orderBy: [
        { appointmentDate: "asc" },
        { createdAt: "desc" },
      ],
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, city: true },
        },
      },
    });

    const mapped = consultations.map((c) => ({
      ...c,
      fullName: c.patientName || c.user?.name || "Patient",
      phone: c.patientPhone || c.user?.phone || "Via Account",
      email: c.patientEmail || c.user?.email || null,
      city: c.user?.city || "Pakistan",
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (error) {
    console.error("Error fetching consultation requests:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve consultations." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required. Please sign in or create an account to book a consultation slot.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      appointmentDate,
      appointmentSlot,
      consultationType = "ONLINE",
      primarySymptoms,
      patientName,
      patientPhone,
      patientEmail,
      reportUrl,
      reportName,
      reportSize,
      status: requestedStatus,
      userId: requestedUserId,
    } = body;

    // Validate required appointment slot
    if (!appointmentDate || !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) {
      return NextResponse.json(
        { success: false, error: "Please select a valid consultation appointment date (YYYY-MM-DD)." },
        { status: 400 }
      );
    }

    if (!appointmentSlot || typeof appointmentSlot !== "string") {
      return NextResponse.json(
        { success: false, error: "Please select an available consultation time slot." },
        { status: 400 }
      );
    }

    // Verify slot capacity in real-time
    const availability = await getAvailableSlotsForDate(appointmentDate);
    if (availability.isHoliday) {
      return NextResponse.json(
        {
          success: false,
          error: `The clinic is closed on ${appointmentDate} due to: ${availability.holidayReason || "Official Holiday"}. Please choose another date.`,
        },
        { status: 409 }
      );
    }

    if (!availability.isOpen) {
      return NextResponse.json(
        {
          success: false,
          error: `The clinic is closed on ${availability.dayName}s. Please choose an active clinic day.`,
        },
        { status: 409 }
      );
    }

    const matchedSlot = availability.slots.find(
      (s) => s.slot === appointmentSlot || s.slot.startsWith(appointmentSlot.split(" - ")[0])
    );

    if (matchedSlot && !matchedSlot.available) {
      return NextResponse.json(
        {
          success: false,
          error: `The time slot "${appointmentSlot}" on ${appointmentDate} has already been reserved. Please select another slot.`,
        },
        { status: 409 }
      );
    }

    // Determine target user and permissions
    const userRole = (session.user as any)?.role;
    const staffSession = isStaffRole(userRole);
    let targetUserId = session.user.id;
    let initialStatus = "NEW";

    const ALLOWED_STATUSES = [
      "NEW",
      "CONFIRMED",
      "RESCHEDULED",
      "PRESCRIBED",
      "COMPLETED",
      "CANCELLED",
    ];

    if (staffSession) {
      initialStatus = ALLOWED_STATUSES.includes(requestedStatus)
        ? requestedStatus
        : "NEW";

      if (requestedUserId) {
        const linkedUser = await prisma.user.findUnique({
          where: { id: requestedUserId },
          select: { id: true, email: true, name: true, phone: true },
        });
        if (!linkedUser) {
          return NextResponse.json(
            { success: false, error: "The target patient account was not found." },
            { status: 400 }
          );
        }
        targetUserId = linkedUser.id;
      }
    }

    // Contact resolution (defaults to user account info)
    const effectiveName = patientName?.trim() || session.user.name || "Patient";
    const effectiveEmail = (patientEmail?.trim() || session.user.email || "").toLowerCase();
    const effectivePhone = patientPhone?.trim() || (session.user as any)?.phone || null;

    // Generate ticket number: CON-YYYY-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `CON-${new Date().getFullYear()}-${randomSuffix}`;

    const consultation = await prisma.consultationRequest.create({
      data: {
        ticketNumber,
        userId: targetUserId,
        consultationType: consultationType === "IN_PERSON" ? "IN_PERSON" : "ONLINE",
        appointmentDate,
        appointmentSlot,
        patientName: effectiveName,
        patientPhone: effectivePhone,
        patientEmail: effectiveEmail || null,
        primarySymptoms: primarySymptoms?.trim() || null,
        reportUrl: reportUrl ? String(reportUrl).trim() : null,
        reportName: reportName ? String(reportName).trim() : null,
        reportSize: reportSize ? String(reportSize).trim() : null,
        status: initialStatus,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, city: true },
        },
      },
    });

    // Background Email Triggers (non-blocking)
    const emailPhone = effectivePhone || "Via Account";
    const emailCity = (consultation.user as any)?.city || "Pakistan";
    const emailSymptoms = consultation.primarySymptoms || "General Clinical Health Assessment";

    if (effectiveEmail) {
      if (initialStatus === "NEW") {
        sendAppointmentConfirmationEmail({
          to: effectiveEmail,
          fullName: effectiveName,
          ticketNumber: consultation.ticketNumber,
          consultationType: consultation.consultationType,
          appointmentDate: consultation.appointmentDate,
          appointmentSlot: consultation.appointmentSlot,
          phone: emailPhone,
          city: emailCity,
          primarySymptoms: emailSymptoms,
        }).catch((err) =>
          console.error("[Appointment Confirmation Email Async Error]:", err)
        );
      } else {
        sendAppointmentStatusEmail({
          to: effectiveEmail,
          fullName: effectiveName,
          ticketNumber: consultation.ticketNumber,
          status: initialStatus,
          appointmentDate: consultation.appointmentDate,
          appointmentSlot: consultation.appointmentSlot,
          hakimNotes: consultation.hakimNotes,
        }).catch((err) =>
          console.error("[Appointment Status Email Async Error]:", err)
        );
      }
    }

    sendAdminAppointmentNotificationEmail({
      to: "admin",
      fullName: effectiveName,
      ticketNumber: consultation.ticketNumber,
      consultationType: consultation.consultationType,
      appointmentDate: consultation.appointmentDate,
      appointmentSlot: consultation.appointmentSlot,
      phone: emailPhone,
      email: effectiveEmail || undefined,
      city: emailCity,
      primarySymptoms: emailSymptoms,
    }).catch((err) =>
      console.error("[Admin Appointment Notification Email Async Error]:", err)
    );

    const mappedConsultation = {
      ...consultation,
      fullName: consultation.patientName || consultation.user?.name || effectiveName,
      phone: consultation.patientPhone || consultation.user?.phone || effectivePhone || "Via Account",
      email: consultation.patientEmail || consultation.user?.email || effectiveEmail || null,
      city: consultation.user?.city || "Pakistan",
    };

    return NextResponse.json(
      {
        success: true,
        data: mappedConsultation,
        message: "Consultation slot booked successfully.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating consultation appointment:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to book consultation appointment." },
      { status: 500 }
    );
  }
}
