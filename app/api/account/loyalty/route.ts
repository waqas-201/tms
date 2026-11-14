import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getUserLoyaltyBalance,
  getUserLoyaltyHistory,
  POINT_TO_PKR_RATE,
  MIN_REDEMPTION_POINTS,
  MAX_SUBTOTAL_CAP_PERCENT,
} from "@/lib/loyalty";

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

    const pointsBalance = await getUserLoyaltyBalance(session.user.id);
    const pkrValue = pointsBalance * POINT_TO_PKR_RATE;
    const history = await getUserLoyaltyHistory(session.user.id, 100);

    return NextResponse.json({
      success: true,
      pointsBalance,
      pkrValue,
      rules: {
        pointToPkrRate: POINT_TO_PKR_RATE,
        minRedemptionPoints: MIN_REDEMPTION_POINTS,
        maxSubtotalCapPercent: MAX_SUBTOTAL_CAP_PERCENT,
      },
      history,
    });
  } catch (error: any) {
    console.error("Error fetching loyalty account data:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load loyalty account data." },
      { status: 500 }
    );
  }
}
