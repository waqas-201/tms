import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ROLES, isStaffRole } from "@/lib/rbac-base";
import {
  sendAppointmentConfirmationEmail,
  sendAdminAppointmentNotificationEmail,
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
      // Allow guest lookup only if exact ticket provided
      if (ticketParam) {
        const guestConsultation = await prisma.consultationRequest.findUnique({
          where: { ticketNumber: ticketParam.trim() },
        });
        return NextResponse.json({ success: true, data: guestConsultation ? [guestConsultation] : [] });
      }

      return NextResponse.json(
        { success: false, error: "Authentication required to view consultations." },
        { status: 401 }
      );
    }

    // Admin/Hakim sees all; regular user sees only their own
    if (!isStaffRole(userRole)) {
      where.userId = session.user.id;
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
    } = body;

    if (!fullName || !phone || !primarySymptoms) {
      return NextResponse.json(
        { success: false, error: "Please provide your full name, phone/WhatsApp number, and primary health concern." },
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

    const effectiveEmail = email ? email.trim().toLowerCase() : (session?.user?.email || null);

    const consultation = await prisma.consultationRequest.create({
      data: {
        ticketNumber,
        fullName: fullName.trim(),
        age: Number(age) || 35,
        gender: gender || "Not Specified",
        phone: phone.trim(),
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
        status: "NEW",
        userId: session?.user?.id || null,
      },
    });

    // Background Email Triggers (non-blocking)
    if (effectiveEmail) {
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
        message: "Consultation appointment booked successfully. A confirmation email has been dispatched.",
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
