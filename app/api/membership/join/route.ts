import { NextRequest, NextResponse } from "next/server";
import { createOrRetrieveMembership, maskPhone } from "@/lib/membership";
import { normalizePhoneNumber } from "@/lib/phone";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload provided." },
        { status: 400 }
      );
    }

    const { name, phone, email, city, source } = body;

    // Validate customer name
    const trimmedName = String(name || "").trim();
    if (!trimmedName || trimmedName.length < 2) {
      return NextResponse.json(
        { success: false, error: "Please enter your full name (at least 2 characters)." },
        { status: 400 }
      );
    }

    // Validate phone number
    const cleanPhone = normalizePhoneNumber(phone);
    if (!cleanPhone) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please provide a valid Pakistani mobile number (e.g. 03001234567 or +923001234567).",
        },
        { status: 400 }
      );
    }

    // Validate optional email format if provided
    const trimmedEmail = email ? String(email).trim().toLowerCase() : null;
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address or leave it blank." },
        { status: 400 }
      );
    }

    const membership = await createOrRetrieveMembership({
      name: trimmedName,
      phone: cleanPhone,
      email: trimmedEmail,
      city: city ? String(city).trim() : null,
      signupSource: source ? String(source).trim().toUpperCase() : "QR",
    });

    // Privacy Guard: Prevent unauthenticated reverse phone directory scraping
    // If user already exists, do not reveal full name, raw phone, or coupon code
    if (!membership.isNew) {
      return NextResponse.json({
        success: true,
        data: {
          isNew: false,
          message: "Welcome back! Your membership is active.",
          membershipId: membership.membershipId,
          maskedPhone: maskPhone(membership.user.phone),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        isNew: true,
        membershipId: membership.membershipId,
        name: membership.user.name,
        phone: membership.user.phone,
        couponCode: membership.coupon.code,
        discountAmount: membership.coupon.discountValue,
        minSubtotal: membership.coupon.minSubtotal,
        expiresAt: membership.coupon.endDate,
      },
    });
  } catch (error: any) {
    console.error("[POST /api/membership/join] Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process membership registration. Please try again.",
      },
      { status: 500 }
    );
  }
}
