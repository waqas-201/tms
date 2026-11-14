import { NextRequest, NextResponse } from "next/server";
import { validateReferralCode, maskName } from "@/lib/referrals";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload provided." },
        { status: 400 }
      );
    }

    const { referralCode, phone, email } = body;

    if (!referralCode || typeof referralCode !== "string") {
      return NextResponse.json(
        { success: false, error: "Referral code is required." },
        { status: 400 }
      );
    }

    const session = await auth.api.getSession({
      headers: request.headers,
    }).catch(() => null);

    const validation = await validateReferralCode(
      referralCode,
      {
        userId: session?.user?.id || null,
        phone: phone ? String(phone).trim() : null,
        email: email ? String(email).trim() : null,
      }
    );

    if (!validation.valid || !validation.referrer) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: validation.reason || "Invalid referral code.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      referrer: {
        name: maskName(validation.referrer.name),
        referralCode: validation.referrer.referralCode,
      },
    });
  } catch (error: any) {
    console.error("[POST /api/referrals/validate] Validation error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to validate referral code." },
      { status: 500 }
    );
  }
}
