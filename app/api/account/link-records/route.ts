import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { linkGuestRecordsToUser } from "@/lib/link-records";

/**
 * Attaches guest bookings (consultations, Hijama, orders) to the signed-in
 * account when their email addresses match a VERIFIED account email.
 *
 * Safe to call on every account visit: already-linked records are untouched.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    if (!session.user.emailVerified) {
      return NextResponse.json({
        success: true,
        data: {
          consultations: 0,
          hijamaBookings: 0,
          orders: 0,
          skipped: "email-not-verified",
        },
      });
    }

    const result = await linkGuestRecordsToUser({
      userId: session.user.id,
      email: session.user.email,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error linking guest records:", error);
    return NextResponse.json(
      { success: false, error: "Failed to link booking records." },
      { status: 500 }
    );
  }
}
