import { NextRequest, NextResponse } from "next/server";
import { requireRole, ROLES } from "@/lib/rbac";
import { adjustStock } from "@/lib/inventory";

export async function POST(request: NextRequest) {
  try {
    const { session, errorResponse } = await requireRole(request, [ROLES.ADMIN]);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { productSizeId, quantity, reason } = body;

    if (!productSizeId) {
      return NextResponse.json(
        { success: false, error: "Please select a product variant/pack." },
        { status: 400 }
      );
    }

    const numQty = Number(quantity);
    if (isNaN(numQty) || numQty === 0) {
      return NextResponse.json(
        { success: false, error: "Adjustment quantity cannot be zero." },
        { status: 400 }
      );
    }

    const result = await adjustStock({
      productSizeId,
      quantity: Math.floor(numQty),
      reason: reason?.trim() || "Manual inventory adjustment",
      userId: session.user.id,
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: `Stock adjusted by ${numQty > 0 ? `+${numQty}` : numQty} units.`,
    });
  } catch (error: any) {
    console.error("Error adjusting stock:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to adjust stock." },
      { status: 500 }
    );
  }
}
