import { NextRequest, NextResponse } from "next/server";
import { createHijamaBooking } from "@/lib/hijama";
import { auth } from "@/lib/auth";
import { isStaffRole } from "@/lib/rbac-base";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const body = await request.json();
    const isStaff = isStaffRole((session?.user as any)?.role);

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
      feeAmount: isStaff ? body.feeAmount : undefined,
      paymentStatus: isStaff ? body.paymentStatus || "UNPAID" : "UNPAID",
      adminNotes: isStaff ? body.adminNotes : undefined,
      userId: isStaff
        ? body.userId || null
        : session?.user?.id || null,
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
