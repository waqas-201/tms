import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, ROLES } from "@/lib/rbac";
import {
  getUserLoyaltyBalance,
  getUserLoyaltyHistory,
  POINT_TO_PKR_RATE,
} from "@/lib/loyalty";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { errorResponse } = await requireRole(request, [
      ROLES.ADMIN,
      ROLES.SUPER_ADMIN,
    ]);
    if (errorResponse) return errorResponse;

    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing required userId parameter." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        membershipId: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: `User not found: ${userId}` },
        { status: 404 }
      );
    }

    const pointsBalance = await getUserLoyaltyBalance(userId);
    const pkrValue = pointsBalance * POINT_TO_PKR_RATE;
    const history = await getUserLoyaltyHistory(userId, 200);

    return NextResponse.json({
      success: true,
      userId,
      user,
      pointsBalance,
      pkrValue,
      history,
    });
  } catch (error: any) {
    console.error("Error fetching admin loyalty data:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch user loyalty data." },
      { status: 500 }
    );
  }
}
