import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { validateCoupon } from "@/lib/coupons";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const body = await request.json();
    const { code, scope = "PRODUCTS", subtotal = 0, items = [], phone = null } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a coupon code.",
        },
        { status: 400 }
      );
    }

    const validation = await validateCoupon({
      code,
      scope: scope as "PRODUCTS" | "HIJAMA" | "CONSULTATION",
      subtotal: Number(subtotal) || 0,
      items,
      userId: session?.user?.id || null,
      phone: phone || (session?.user as any)?.phone || null,
    });

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error || "Coupon could not be applied.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        coupon: validation.coupon,
        discountAmount: validation.discountAmount,
        isFreeShipping: validation.isFreeShipping,
        message: validation.message,
      },
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to validate coupon." },
      { status: 500 }
    );
  }
}
