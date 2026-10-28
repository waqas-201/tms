import { NextRequest, NextResponse } from "next/server";
import { requireRole, ROLES } from "@/lib/rbac";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { session, errorResponse } = await requireRole(request, [ROLES.SUPER_ADMIN]);
  if (errorResponse) return errorResponse;

  try {
    const superAdmin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const activeAdminCount = await prisma.user.count({
      where: {
        role: "admin",
        isActive: true,
        deletedAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      cell: {
        ...superAdmin,
        activeAdminCount,
        maxQuota: 3,
        governanceStatus: "SOVEREIGN_ACTIVE",
      },
    });
  } catch (err: any) {
    console.error("Super Admin Cell query error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to query Super Admin Cell status." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { session, errorResponse } = await requireRole(request, [ROLES.SUPER_ADMIN]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { action, password, targetEmail, confirmationText } = body || {};

    if (!password) {
      return NextResponse.json(
        { success: false, error: "Mandatory re-authentication: Current password required for Super Admin Cell operations." },
        { status: 401 }
      );
    }

    // Re-authenticate password against Better-Auth
    try {
      await auth.api.signInEmail({
        body: {
          email: session.user.email,
          password,
        },
      });
    } catch {
      return NextResponse.json(
        { success: false, error: "Re-authentication failed: Invalid password." },
        { status: 401 }
      );
    }

    if (action === "transfer") {
      if (!targetEmail || typeof targetEmail !== "string") {
        return NextResponse.json(
          { success: false, error: "Target recipient email is required to transfer the Super Admin role." },
          { status: 400 }
        );
      }

      const cleanTarget = targetEmail.toLowerCase().trim();
      const targetUser = await prisma.user.findUnique({
        where: { email: cleanTarget },
      });

      if (!targetUser || !targetUser.isActive || targetUser.deletedAt) {
        return NextResponse.json(
          { success: false, error: "Target user must be an active existing account in good standing." },
          { status: 400 }
        );
      }

      if (targetUser.id === session.user.id) {
        return NextResponse.json(
          { success: false, error: "Cannot transfer Super Admin role to yourself." },
          { status: 400 }
        );
      }

      // Execute role handoff in atomic transaction
      await prisma.$transaction(async (tx) => {
        // Promote target to super_admin
        await tx.user.update({
          where: { id: targetUser.id },
          data: { role: "super_admin" },
        });

        // Demote caller to standard admin
        await tx.user.update({
          where: { id: session.user.id },
          data: { role: "admin" },
        });
      });

      return NextResponse.json({
        success: true,
        message: `Super Admin role successfully transferred to ${cleanTarget}. Your account is now a standard Admin.`,
      });
    }

    if (action === "decommission") {
      if (confirmationText !== "DECOMMISSION_SUPER_ADMIN") {
        return NextResponse.json(
          {
            success: false,
            error: "Destructive confirmation token mismatch. Please enter 'DECOMMISSION_SUPER_ADMIN' to confirm.",
          },
          { status: 400 }
        );
      }

      // Purge sessions and decommission Super Admin
      await prisma.$transaction(async (tx) => {
        await tx.session.deleteMany({
          where: { userId: session.user.id },
        });

        await tx.user.update({
          where: { id: session.user.id },
          data: {
            isActive: false,
            deletedAt: new Date(),
            role: "user",
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: "Super Admin account decommissioned successfully via the Super Administrator Cell. Sessions purged.",
      });
    }

    return NextResponse.json(
      { success: false, error: `Unrecognized action '${action}'. Supported actions: 'transfer', 'decommission'.` },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Super Admin Cell mutation error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to execute Super Admin Cell action." },
      { status: 500 }
    );
  }
}
