import { NextRequest, NextResponse } from "next/server";
import { createHijamaBooking } from "@/lib/hijama";
import { auth } from "@/lib/auth";
import { isStaffRole } from "@/lib/rbac-base";
import prisma from "@/lib/prisma";
import { createAdminNotification } from "@/lib/notifications";
import { sendAdminHijamaNotificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required. Please sign in or create an account to reserve your Sunnah Hijama appointment.",
          requiresAuth: true,
        },
        { status: 401 }
      );
    }

    const isStaff = isStaffRole((session?.user as any)?.role);

    // Staff accounts manage the clinic; they must not book as patients.
    // Walk-in/phone bookings go through /api/hijama/bookings instead.
    if (isStaff) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Staff accounts cannot book Hijama sessions as patients. Use the admin dashboard to create a booking on behalf of a patient.",
          staffForbidden: true,
        },
        { status: 403 }
      );
    }

    if (!isStaff) {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, email: true, emailVerified: true },
      });

      if (!dbUser || !dbUser.emailVerified) {
        return NextResponse.json(
          {
            success: false,
            error: `Email verification required. Please verify your email address (${dbUser?.email || session.user.email}) before booking a Hijama session.`,
            emailUnverified: true,
            email: dbUser?.email || session.user.email,
          },
          { status: 403 }
        );
      }
    }

    const body = await request.json();

    const booking = await createHijamaBooking({
      fullName: body.fullName,
      phone: body.phone,
      email: body.email,
      age: Number(body.age),
      gender: body.gender,
      appointmentDate: body.appointmentDate,
      appointmentSlot: body.appointmentSlot,
      cuppingReason: body.cuppingReason,
      contraindications: body.contraindications,
      // Patients can never set their own fee, payment state, notes, or
      // attach a booking to someone else's account.
      paymentStatus: "UNPAID",
      userId: session.user.id,
    });

    await createAdminNotification({
      type: "HIJAMA",
      title: `New Hijama booking ${booking.ticketNumber}`,
      message: `${booking.fullName} · ${booking.phone} · ${booking.gender} · ${booking.appointmentDate} ${booking.appointmentSlot}`,
      link: "/admin?tab=hijama",
      entityId: booking.id,
    });

    sendAdminHijamaNotificationEmail({
      fullName: booking.fullName,
      ticketNumber: booking.ticketNumber,
      phone: booking.phone,
      email: booking.email,
      age: booking.age,
      gender: booking.gender,
      appointmentDate: booking.appointmentDate,
      appointmentSlot: booking.appointmentSlot,
      isSunnahDay: booking.isSunnahDay,
      cuppingReason: booking.cuppingReason,
    }).catch((err) =>
      console.error("[Admin Hijama Notification Email Async Error]:", err)
    );

    return NextResponse.json(
      {
        success: true,
        data: booking,
        message: "Your Sunnah Hijama session has been successfully booked.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating Hijama booking:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to book Hijama session. Please try again.",
      },
      { status: 400 }
    );
  }
}
