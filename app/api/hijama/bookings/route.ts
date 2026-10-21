import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isStaffRole } from "@/lib/rbac";
import prisma from "@/lib/prisma";
import {
  createHijamaBooking,
  getHijamaBookingByTicket,
  listHijamaBookings,
} from "@/lib/hijama";

/**
 * Public & Authenticated Hijama Booking Creation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request payload." },
        { status: 400 }
      );
    }

    const {
      fullName,
      phone,
      email,
      age,
      gender,
      appointmentDate,
      appointmentSlot,
      cuppingReason,
      contraindications,
    } = body;

    // Field validation
    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      return NextResponse.json(
        { success: false, error: "Full name is required." },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json(
        { success: false, error: "Phone number is required." },
        { status: 400 }
      );
    }

    const parsedAge = Number(age);
    if (!age || isNaN(parsedAge) || parsedAge <= 0) {
      return NextResponse.json(
        { success: false, error: "A valid positive age is required." },
        { status: 400 }
      );
    }

    if (gender !== "MALE" && gender !== "FEMALE") {
      return NextResponse.json(
        { success: false, error: "Gender must be either 'MALE' or 'FEMALE'." },
        { status: 400 }
      );
    }

    if (
      !appointmentDate ||
      typeof appointmentDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Appointment date is required and must be in YYYY-MM-DD format.",
        },
        { status: 400 }
      );
    }

    if (
      !appointmentSlot ||
      typeof appointmentSlot !== "string" ||
      !appointmentSlot.trim()
    ) {
      return NextResponse.json(
        { success: false, error: "Appointment slot is required." },
        { status: 400 }
      );
    }

    // Enforce authentication gate on Hijama booking
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

    const userRole = (session.user as any)?.role;
    const staffSession = isStaffRole(userRole);

    if (!staffSession) {
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

    // Attach the patient account.
    // - Patients: their own verified session account.
    // - Staff: the explicitly selected patient account (or unlinked for a
    //   phone booking) — never the staff member's own account.
    let userId: string | null = null;
    if (staffSession) {
      userId =
        typeof body.userId === "string" && body.userId.trim()
          ? body.userId.trim()
          : null;
    } else {
      userId = session.user.id;
    }

    const booking = await createHijamaBooking({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: typeof email === "string" ? email.trim() : null,
      age: parsedAge,
      gender,
      appointmentDate,
      appointmentSlot: appointmentSlot.trim(),
      cuppingReason:
        typeof cuppingReason === "string" ? cuppingReason.trim() : null,
      contraindications: contraindications || null,
      userId,
    });

    return NextResponse.json(
      {
        success: true,
        data: booking,
        message: "Hijama appointment confirmed successfully.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating Hijama booking:", error);

    const errorMessage = error?.message || "Failed to create Hijama booking.";
    const lowerMessage = errorMessage.toLowerCase();

    // Determine status code: 409 Conflict if slot is fully booked or clinic is closed
    const isConflict =
      lowerMessage.includes("capacity") ||
      lowerMessage.includes("closed") ||
      lowerMessage.includes("fully booked");

    const status = isConflict ? 409 : 400;

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status }
    );
  }
}

/**
 * List Hijama Bookings (Staff or User view), or fetch single booking by ticketNumber
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketNumber = searchParams.get("ticketNumber")?.trim();
    const phone = searchParams.get("phone")?.trim();

    // 1. If ticketNumber is provided: staff and the booking owner can fetch it
    // directly; guests (and other patients) must also verify the booking phone.
    if (ticketNumber) {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      const booking = await getHijamaBookingByTicket(ticketNumber);
      if (!booking) {
        return NextResponse.json(
          { success: false, error: `Booking with ticket "${ticketNumber}" not found.` },
          { status: 404 }
        );
      }

      const userRole = (session?.user as any)?.role;
      const isStaff = isStaffRole(userRole);
      const isOwner =
        !!session?.user?.id && booking.userId === session.user.id;

      if (!isStaff && !isOwner) {
        const digits = (phone || "").replace(/\D/g, "");
        if (digits.length < 7 || booking.phone.replace(/\D/g, "") !== digits) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Please provide the phone number used when booking to view this Hijama ticket.",
            },
            { status: 403 }
          );
        }
      }

      return NextResponse.json({
        success: true,
        data: [booking],
        total: 1,
        page: 1,
        totalPages: 1,
      });
    }

    // 2. Listing bookings requires session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required to view bookings.",
        },
        { status: 401 }
      );
    }

    const userRole = (session.user as any)?.role;
    const isStaff = isStaffRole(userRole);

    // If user is not staff, restrict filter strictly to their own user ID
    const userId = isStaff ? undefined : session.user.id;

    const date = searchParams.get("date")?.trim() || undefined;
    const status = searchParams.get("status")?.trim() || undefined;
    const gender = searchParams.get("gender")?.trim() || undefined;
    const search = searchParams.get("search")?.trim() || undefined;

    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const limitParam = parseInt(searchParams.get("limit") || "20", 10);

    const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const limit = isNaN(limitParam) || limitParam < 1 ? 20 : Math.min(limitParam, 100);
    const offset = (page - 1) * limit;

    const result = await listHijamaBookings({
      date,
      status,
      gender,
      search,
      userId,
      limit,
      offset,
    });

    const totalPages = Math.ceil(result.total / limit) || 1;

    return NextResponse.json({
      success: true,
      data: result.bookings,
      total: result.total,
      page,
      totalPages,
    });
  } catch (error: any) {
    console.error("Error listing Hijama bookings:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to list Hijama bookings.",
      },
      { status: 500 }
    );
  }
}
