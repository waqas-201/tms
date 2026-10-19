import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createHijamaBooking } from "@/lib/hijama";

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

/**
 * Lists Hijama bookings or creates a new Hijama booking.
 *
 * - GET:
 *   - Signed-in patients: all bookings linked to their account.
 *   - Guests: exact ticket + matching phone number.
 * - POST:
 *   - Creates a new Hijama booking.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const { searchParams } = new URL(request.url);
    const ticket = (searchParams.get("ticket") || searchParams.get("ticketNumber"))?.trim();
    const phone = searchParams.get("phone")?.trim();

    if (session?.user?.id) {
      const bookings = await prisma.hijamaBooking.findMany({
        where: { userId: session.user.id },
        orderBy: [{ appointmentDate: "desc" }, { createdAt: "desc" }],
      });

      return NextResponse.json({ success: true, data: bookings });
    }

    if (ticket && phone) {
      const booking = await prisma.hijamaBooking.findUnique({
        where: { ticketNumber: ticket },
      });

      const digits = normalizePhone(phone);
      if (!booking || normalizePhone(booking.phone) !== digits || digits.length < 7) {
        return NextResponse.json(
          {
            success: false,
            error:
              "No booking found for that ticket and phone number. Please check both and try again.",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: [booking] });
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "Please sign in, or provide both the booking ticket number and the phone number used to book.",
      },
      { status: 401 }
    );
  } catch (error: any) {
    console.error("Error fetching Hijama bookings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load Hijama bookings." },
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
      feeAmount: body.feeAmount,
      paymentStatus: body.paymentStatus || "UNPAID",
      adminNotes: body.adminNotes,
      userId: session?.user?.id || body.userId || null,
    });

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
