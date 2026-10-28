import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redeemBootstrapKey, hasActiveSuperAdmin } from "@/lib/bootstrap";

export async function GET() {
  try {
    const isInitialized = await hasActiveSuperAdmin();
    return NextResponse.json({
      success: true,
      isInitialized,
    });
  } catch (err: any) {
    console.error("Error checking super admin initialization status:", err);
    return NextResponse.json(
      { success: false, error: "Failed to verify setup status." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, bootstrapKey } = body || {};

    if (!bootstrapKey || typeof bootstrapKey !== "string" || !bootstrapKey.trim()) {
      return NextResponse.json(
        { success: false, error: "A valid single-use Bootstrap Key is required." },
        { status: 400 }
      );
    }

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Full name, email address, and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Verify system does not already possess an active Super Admin
    const alreadyInitialized = await hasActiveSuperAdmin();
    if (alreadyInitialized) {
      return NextResponse.json(
        {
          success: false,
          error: "A Super Admin is already established on this platform. For administrative changes, please use the Super Admin Cell or direct database intervention.",
        },
        { status: 400 }
      );
    }

    // Atomically redeem the single-use bootstrap key (revoking it)
    const redeemResult = await redeemBootstrapKey(bootstrapKey, cleanEmail);
    if (!redeemResult.success) {
      return NextResponse.json(
        { success: false, error: redeemResult.error },
        { status: 400 }
      );
    }

    // Find or create the user account
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { accounts: true },
    });

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          role: "super_admin",
          emailVerified: true,
          isActive: true,
          deletedAt: null,
        },
      });
    } else {
      // Use Better-Auth signup to securely hash password and set up account
      await auth.api.signUpEmail({
        body: {
          email: cleanEmail,
          password,
          name: name.trim(),
        },
      });

      // Elevate to super_admin and ensure verified
      await prisma.user.update({
        where: { email: cleanEmail },
        data: {
          role: "super_admin",
          emailVerified: true,
          isActive: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Super Admin account initialized successfully. The bootstrap key has been consumed and revoked.",
    });
  } catch (err: any) {
    console.error("Super Admin bootstrap error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to initialize Super Admin account." },
      { status: 500 }
    );
  }
}
