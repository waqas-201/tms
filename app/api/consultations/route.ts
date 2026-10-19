import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ROLES, isStaffRole } from "@/lib/rbac-base";
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const ticketParam = searchParams.get("ticket");
    const dateParam = searchParams.get("date");

    const where: Record<string, unknown> = {};

    const userRole = (session?.user as any)?.role;

    if (!session) {
      const phoneParam = searchParams.get("phone");

      if (!ticketParam) {
        return NextResponse.json(
          {
            success: false,
            error: "Authentication required to view consultations.",
          },
          { status: 401 }
        );
      }

      if (!phoneParam || phoneParam.replace(/\D/g, "").length < 7) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Please enter the phone number used when booking to view this consultation.",
          },
          { status: 400 }
        );
      }

      // Guests must verify with BOTH the ticket number and the booking phone.
      const guestConsultation = await prisma.consultationRequest.findUnique({
        where: { ticketNumber: ticketParam.trim() },
      });

      const digits = phoneParam.replace(/\D/g, "");
      if (
        !guestConsultation ||
        guestConsultation.phone.replace(/\D/g, "") !== digits
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "No consultation found for that ticket and phone number. Please check both and try again.",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: [guestConsultation],
      });
    }

    // Admin/Hakim sees all; regular user sees only their own
    if (!isStaffRole(userRole)) {
      where.userId = session.user.id;
    }

    // Exact ticket lookups (e.g. from the public track page) must stay
    // scoped to the signed-in patient's own records.
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
        { fullName: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { primarySymptoms: { contains: q, mode: "insensitive" } },
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
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: consultations });
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

    const body = await request.json();
    const {
      fullName,
      age,
      gender = "Not Specified",
      phone,
      email,
      city = "Pakistan",
      primarySymptoms,
      duration = "Recent / Ongoing",
      previousTreatments,
      currentMedications,
      digestiveState,
      sleepEnergyState,
      channel = "EMAIL",
      consultationType = "ONLINE",
      appointmentDate,
      appointmentSlot,
      preferredContact = "EMAIL",
      status: requestedStatus,
      userId: requestedUserId,
      reportUrl,
      reportName,
      reportSize,
    } = body;

    const effectivePhone = phone ? phone.trim() : "";
    let effectiveEmail = email
      ? email.trim().toLowerCase()
      : session?.user?.email
      ? session.user.email.toLowerCase()
      : null;

    if (!fullName || (!effectivePhone && !effectiveEmail) || !primarySymptoms) {
      return NextResponse.json(
        { success: false, error: "Please provide your full name, contact details (email or phone), and primary health concern." },
        { status: 400 }
      );
    }

    if (appointmentDate && !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) {
      return NextResponse.json(
        { success: false, error: "Invalid appointment date format. Use YYYY-MM-DD." },
        { status: 400 }
      );
    }

    if (appointmentDate && !appointmentSlot) {
      return NextResponse.json(
        { success: false, error: "Please select an available time slot for your clinic appointment." },
        { status: 400 }
      );
    }

    // If appointment date & slot are specified, verify slot capacity in real-time
    if (appointmentDate && appointmentSlot) {
      const availability = await getAvailableSlotsForDate(appointmentDate);
      if (availability.isHoliday) {
        return NextResponse.json(
          {
            success: false,
            error: `The clinic is closed on ${appointmentDate} due to: ${availability.holidayReason || "Official Holiday"}. Please pick another date.`,
          },
          { status: 409 }
        );
      }

      if (!availability.isOpen) {
        return NextResponse.json(
          {
            success: false,
            error: `The clinic is closed on ${availability.dayName}s. Please choose an active clinic day (Monday to Saturday).`,
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
            error: `The slot "${appointmentSlot}" on ${appointmentDate} is already booked. Please choose another available time slot.`,
          },
          { status: 409 }
        );
      }
    }

    // Generate ticket number: CON-YYYY-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `CON-${new Date().getFullYear()}-${randomSuffix}`;

    const staffSession =
      !!session && isStaffRole((session?.user as any)?.role);
    const ALLOWED_STATUSES = [
      "NEW",
      "CONFIRMED",
      "RESCHEDULED",
      "PRESCRIBED",
      "COMPLETED",
      "CANCELLED",
    ];

    let effectiveUserId: string | null = session?.user?.id || null;
    let initialStatus = "NEW";

    if (staffSession) {
      // Staff can create bookings on behalf of a patient (e.g. WhatsApp bookings)
      // and choose the starting status. Never fall back to the staff member's
      // own email for a guest booking.
      initialStatus = ALLOWED_STATUSES.includes(requestedStatus)
        ? requestedStatus
        : "NEW";
      effectiveUserId = null;
      effectiveEmail = email ? email.trim().toLowerCase() : null;

      if (requestedUserId) {
        const linkedUser = await prisma.user.findUnique({
          where: { id: requestedUserId },
          select: { id: true, email: true },
        });
        if (!linkedUser) {
          return NextResponse.json(
            { success: false, error: "The selected patient account was not found." },
            { status: 400 }
          );
        }
        effectiveUserId = linkedUser.id;
        if (!effectiveEmail && linkedUser.email) {
          effectiveEmail = linkedUser.email.toLowerCase();
        }
      }
    } else if (!effectiveEmail && session?.user?.email) {
      effectiveEmail = session.user.email.toLowerCase();
    }

    const consultation = await prisma.consultationRequest.create({
      data: {
        ticketNumber,
        fullName: fullName.trim(),
        age: Number(age) || 35,
        gender: gender || "Not Specified",
        phone: effectivePhone || effectiveEmail || "Via Email",
        email: effectiveEmail,
        city: city ? city.trim() : "Pakistan",
        primarySymptoms: primarySymptoms.trim(),
        duration: duration || "Recent / Ongoing",
        previousTreatments: previousTreatments || null,
        currentMedications: currentMedications || null,
        digestiveState: digestiveState || null,
        sleepEnergyState: sleepEnergyState || null,
        channel: channel || "EMAIL",
        consultationType: consultationType || "ONLINE",
        appointmentDate: appointmentDate || null,
        appointmentSlot: appointmentSlot || null,
        preferredContact: preferredContact || "EMAIL",
        status: initialStatus,
        reportUrl: reportUrl ? String(reportUrl).trim() : null,
        reportName: reportName ? String(reportName).trim() : null,
        reportSize: reportSize ? String(reportSize).trim() : null,
        userId: effectiveUserId,
      },
    });

    // Background Email Triggers (non-blocking)
    if (effectiveEmail) {
      if (initialStatus === "NEW") {
        sendAppointmentConfirmationEmail({
          to: effectiveEmail,
          fullName: consultation.fullName,
          ticketNumber: consultation.ticketNumber,
          consultationType: consultation.consultationType,
          appointmentDate: consultation.appointmentDate,
          appointmentSlot: consultation.appointmentSlot,
          phone: consultation.phone,
          city: consultation.city,
          primarySymptoms: consultation.primarySymptoms,
          channel: consultation.channel,
        }).catch((err) =>
          console.error("[Appointment Confirmation Email Async Error]:", err)
        );
      } else {
        sendAppointmentStatusEmail({
          to: effectiveEmail,
          fullName: consultation.fullName,
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
      fullName: consultation.fullName,
      ticketNumber: consultation.ticketNumber,
      consultationType: consultation.consultationType,
      appointmentDate: consultation.appointmentDate,
      appointmentSlot: consultation.appointmentSlot,
      phone: consultation.phone,
      email: effectiveEmail,
      city: consultation.city,
      primarySymptoms: consultation.primarySymptoms,
      channel: consultation.channel,
      duration: consultation.duration,
    }).catch((err) =>
      console.error("[Admin Appointment Notification Email Async Error]:", err)
    );

    return NextResponse.json(
      {
        success: true,
        data: consultation,
        message: effectiveEmail
          ? "Consultation booking request received. A confirmation email has been dispatched."
          : "Consultation booking request received. Keep your ticket number to track its status.",
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
