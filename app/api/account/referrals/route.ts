import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserReferralStats } from "@/lib/referrals";

export async function GET(request: NextRequest) {
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

    const host = request.headers.get("host") || "tameeresehat.com";
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const originUrl = `${protocol}://${host}`;

    const stats = await getUserReferralStats(session.user.id, originUrl);

    return NextResponse.json({
      success: true,
      ...stats,
    });
  } catch (error: any) {
    console.error("[GET /api/account/referrals] Error fetching referral stats:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load referral stats." },
      { status: 500 }
    );
  }
}
