import { NextRequest, NextResponse } from "next/server";
import { requireRole, ROLES } from "@/lib/rbac";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendAdminPromotionEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const ADMIN_QUOTA_MAX = 3;

export async function GET(request: NextRequest) {
  const { session, errorResponse } = await requireRole(request, [ROLES.SUPER_ADMIN]);
  if (errorResponse) return errorResponse;

  try {
    const admins = await prisma.user.findMany({
      where: {
        role: "admin",
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        city: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const activeCount = admins.filter((a) => a.isActive).length;

    return NextResponse.json({
      success: true,
      admins,
      activeCount,
      maxQuota: ADMIN_QUOTA_MAX,
      remainingQuota: Math.max(0, ADMIN_QUOTA_MAX - activeCount),
    });
  } catch (err: any) {
    console.error("Failed to fetch staff admins:", err);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve administrative staff." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { session, errorResponse } = await requireRole(request, [ROLES.SUPER_ADMIN]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { name, email, password, phone, city, userId } = body || {};

    // Check current active admin quota
    const activeAdminCount = await prisma.user.count({
      where: {
        role: "admin",
        isActive: true,
        deletedAt: null,
      },
    });

    // 1. Promoting by user ID
    if (userId) {
      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!targetUser) {
        return NextResponse.json(
          { success: false, error: "Target user not found." },
          { status: 404 }
        );
      }

      if (targetUser.role === ROLES.SUPER_ADMIN) {
        return NextResponse.json(
          { success: false, error: "Cannot modify the Super Admin role." },
          { status: 400 }
        );
      }

      if (targetUser.role === ROLES.ADMIN) {
        return NextResponse.json(
          { success: false, error: `'${targetUser.name}' is already an active Admin.` },
          { status: 400 }
        );
      }

      if (activeAdminCount >= ADMIN_QUOTA_MAX) {
        return NextResponse.json(
          {
            success: false,
            error: `Admin quota reached. The clinic allows a maximum of ${ADMIN_QUOTA_MAX} concurrent active Admins. Please deactivate or demote an existing Admin first.`,
            code: "QUOTA_EXCEEDED",
          },
          { status: 409 }
        );
      }

      // Purge sessions so new admin claims take effect immediately
      await prisma.session.deleteMany({ where: { userId: targetUser.id } });

      const updated = await prisma.user.update({
        where: { id: targetUser.id },
        data: {
          role: "admin",
          isActive: true,
          deletedAt: null,
          ...(phone ? { phone: phone.trim() } : {}),
          ...(city ? { city: city.trim() } : {}),
        },
      });

      sendAdminPromotionEmail({ to: updated.email, name: updated.name }).catch((err) => {
        console.error("Failed to send admin promotion email:", err);
      });

      return NextResponse.json({
        success: true,
        message: `'${updated.name}' promoted to Admin successfully.`,
        admin: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          role: updated.role,
          isActive: updated.isActive,
        },
      });
    }

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email or User ID is required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      if (existing.role === ROLES.SUPER_ADMIN) {
        return NextResponse.json(
          { success: false, error: "Cannot convert the Super Admin into a standard Admin here." },
          { status: 400 }
        );
      }

      if (existing.role === ROLES.ADMIN) {
        return NextResponse.json(
          { success: false, error: `'${existing.name}' is already an Admin.` },
          { status: 400 }
        );
      }

      if (activeAdminCount >= ADMIN_QUOTA_MAX) {
        return NextResponse.json(
          {
            success: false,
            error: `Admin quota reached. The clinic allows a maximum of ${ADMIN_QUOTA_MAX} concurrent active Admins. Please deactivate or demote an existing Admin first.`,
            code: "QUOTA_EXCEEDED",
          },
          { status: 409 }
        );
      }

      // Invalidate sessions immediately
      await prisma.session.deleteMany({ where: { userId: existing.id } });

      // Elevate existing user to active admin
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          role: "admin",
          isActive: true,
          deletedAt: null,
          phone: phone || existing.phone,
          city: city || existing.city,
        },
      });

      sendAdminPromotionEmail({ to: updated.email, name: updated.name }).catch((err) => {
        console.error("Failed to send admin promotion email:", err);
      });

      return NextResponse.json({
        success: true,
        message: `'${updated.name}' promoted to Admin successfully.`,
        admin: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          role: updated.role,
          isActive: updated.isActive,
        },
      });
    }

    // If new user, require name and password
    if (!name || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required to provision a brand-new Admin." },
        { status: 400 }
      );
    }

    if (activeAdminCount >= ADMIN_QUOTA_MAX) {
      return NextResponse.json(
        {
          success: false,
          error: `Admin quota reached. The clinic allows a maximum of ${ADMIN_QUOTA_MAX} concurrent active Admins. Please deactivate or delete an existing Admin to provision a new one.`,
          code: "QUOTA_EXCEEDED",
        },
        { status: 409 }
      );
    }

    // Create via Better-Auth
    await auth.api.signUpEmail({
      body: {
        email: cleanEmail,
        password,
        name: name.trim(),
      },
    });

    const created = await prisma.user.update({
      where: { email: cleanEmail },
      data: {
        role: "admin",
        isActive: true,
        emailVerified: true,
        phone: phone || null,
        city: city || null,
      },
    });

    sendAdminPromotionEmail({ to: created.email, name: created.name }).catch((err) => {
      console.error("Failed to send admin promotion email:", err);
    });

    return NextResponse.json({
      success: true,
      message: "New operational Admin provisioned successfully.",
      admin: {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role,
        isActive: created.isActive,
      },
    });
  } catch (err: any) {
    console.error("Failed to provision staff admin:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to provision Admin account." },
      { status: 500 }
    );
  }
}
