import { NextRequest, NextResponse } from "next/server";
import { requireRole, ROLES } from "@/lib/rbac";
import { adminAdjustLoyaltyPoints, MAX_ADMIN_ADJUSTMENT_POINTS } from "@/lib/loyalty";

export async function POST(request: NextRequest) {
  try {
    const { session, errorResponse } = await requireRole(request, [
      ROLES.ADMIN,
      ROLES.SUPER_ADMIN,
    ]);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { userId, amount, reason } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { success: false, error: "A valid customer userId is required." },
        { status: 400 }
      );
    }

    const numAmount = Number(amount);
    if (!Number.isInteger(numAmount) || numAmount === 0) {
      return NextResponse.json(
        { success: false, error: "Adjustment amount must be a non-zero integer." },
        { status: 400 }
      );
    }

    if (Math.abs(numAmount) > MAX_ADMIN_ADJUSTMENT_POINTS) {
      return NextResponse.json(
        {
          success: false,
          error: `Adjustment amount cannot exceed ±${MAX_ADMIN_ADJUSTMENT_POINTS} points without executive override.`,
        },
        { status: 400 }
      );
    }

    const trimmedReason = (reason || "").trim();
    if (trimmedReason.length < 5) {
      return NextResponse.json(
        {
          success: false,
          error: "A mandatory adjustment reason with at least 5 characters is required.",
        },
        { status: 400 }
      );
    }

    const result = await adminAdjustLoyaltyPoints({
      userId,
      amount: numAmount,
      reason: trimmedReason,
      staffUserId: session.user.id,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully adjusted loyalty balance by ${numAmount > 0 ? `+${numAmount}` : numAmount} points.`,
      ...result,
    });
  } catch (error: any) {
    console.error("Error in admin loyalty adjustment:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to adjust loyalty points." },
      { status: 500 }
    );
  }
}
