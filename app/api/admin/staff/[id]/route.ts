import { NextRequest, NextResponse } from "next/server";
import { requireRole, ROLES } from "@/lib/rbac";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ADMIN_QUOTA_MAX = 3;

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireRole(request, [ROLES.SUPER_ADMIN]);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await context.params;
    const body = await request.json();
    const { isActive, name, phone, city, action, role } = body || {};

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "Staff user not found." },
        { status: 404 }
      );
    }

    // Super Admin accounts CANNOT be modified via standard staff routes
    if (targetUser.role === "super_admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Super Admin accounts cannot be altered via staff management. Use the Super Admin Cell or direct database access.",
        },
        { status: 403 }
      );
    }

    // Demote admin to regular user
    if (action === "demote" || role === "user") {
      await prisma.session.deleteMany({
        where: { userId: id },
      });

      const demoted = await prisma.user.update({
        where: { id },
        data: {
          role: "user",
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          updatedAt: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: `'${demoted.name}' has been demoted to standard user.`,
        admin: demoted,
      });
    }

    // If reactivating, verify quota
    if (isActive === true && targetUser.isActive === false) {
      const activeCount = await prisma.user.count({
        where: {
          role: "admin",
          isActive: true,
          deletedAt: null,
          id: { not: id },
        },
      });

      if (activeCount >= ADMIN_QUOTA_MAX) {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot reactivate admin. The maximum limit of ${ADMIN_QUOTA_MAX} active Admins is already reached.`,
            code: "QUOTA_EXCEEDED",
          },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(typeof isActive === "boolean" ? { isActive } : {}),
        ...(name ? { name: name.trim() } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(city !== undefined ? { city } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    // If deactivated, revoke active sessions immediately
    if (isActive === false) {
      await prisma.session.deleteMany({
        where: { userId: id },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Admin account ${updated.isActive ? "activated" : "deactivated"} successfully.`,
      admin: updated,
    });
  } catch (err: any) {
    console.error("Failed to update staff admin:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update Admin account." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireRole(request, [ROLES.SUPER_ADMIN]);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await context.params;

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "Staff user not found." },
        { status: 404 }
      );
    }

    // Super Admin accounts CANNOT be deleted via this route
    if (targetUser.role === "super_admin") {
      return NextResponse.json(
        {
          success: false,
          error: "The Super Admin cannot be removed via standard staff management. The only valid mechanisms are the Super Admin Cell or direct database intervention.",
        },
        { status: 403 }
      );
    }

    // Purge sessions and mark as deleted / inactive
    await prisma.session.deleteMany({
      where: { userId: id },
    });

    await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        role: "user",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Admin removed successfully and quota seat restored.",
    });
  } catch (err: any) {
    console.error("Failed to delete staff admin:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to remove Admin account." },
      { status: 500 }
    );
  }
}
