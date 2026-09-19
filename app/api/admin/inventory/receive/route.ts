import { NextRequest, NextResponse } from "next/server";
import { requireRole, ROLES } from "@/lib/rbac";
import { receiveStock } from "@/lib/inventory";

export async function POST(request: NextRequest) {
  try {
    const { session, errorResponse } = await requireRole(request, [ROLES.ADMIN, ROLES.EDITOR]);
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
    if (isNaN(numQty) || numQty <= 0) {
      return NextResponse.json(
        { success: false, error: "Received quantity must be a positive number greater than 0." },
        { status: 400 }
      );
    }

    const result = await receiveStock({
      productSizeId,
      quantity: Math.floor(numQty),
      reason: reason?.trim() || "Batch stock reception",
      userId: session.user.id,
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: `Successfully received +${numQty} units into active inventory.`,
    });
  } catch (error: any) {
    console.error("Error receiving stock:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to receive stock." },
      { status: 500 }
    );
  }
}
