import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, ROLES } from "@/lib/rbac";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, errorResponse } = await requireRole(request, [ROLES.ADMIN]);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const body = await request.json();
    const { role, phone, city, name, isActive, restore, address, latitude, longitude } = body;

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    // Safety check 1: Cannot demote or suspend own admin account
    const isTargetAdmin = targetUser.id === session.user.id || targetUser.role === ROLES.ADMIN;
    if (isTargetAdmin) {
      if (role && role !== ROLES.ADMIN) {
        return NextResponse.json(
          { success: false, error: "Cannot demote or alter the role of the primary Admin account." },
          { status: 400 }
        );
      }
      if (isActive === false) {
        return NextResponse.json(
          { success: false, error: "Cannot suspend or deactivate the primary Admin account." },
          { status: 400 }
        );
      }
    }

    // Safety check 2: Cannot promote another user to "admin" (single admin constraint)
    if (role === ROLES.ADMIN && targetUser.id !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Only ONE primary admin can exist. You cannot promote another account to 'admin'.",
        },
        { status: 400 }
      );
    }

    // Validate allowed roles
    if (role && ![ROLES.ADMIN, ROLES.HAKIM, ROLES.EDITOR, ROLES.CONTRIBUTOR, ROLES.USER].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid role specified. Allowed values: 'hakim', 'editor', 'contributor', 'user'.",
        },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (role) updateData.role = role.toLowerCase().trim();
    if (phone !== undefined) updateData.phone = phone ? String(phone).trim() : null;
    if (city !== undefined) updateData.city = city ? String(city).trim() : "Karachi";
    if (name !== undefined && name.trim()) updateData.name = name.trim();
    if (address !== undefined) {
      updateData.address = typeof address === "string" && address.trim() ? address.trim() : null;
    }
    if (latitude !== undefined) {
      updateData.latitude = typeof latitude === "number" && !isNaN(latitude) ? latitude : null;
    }
    if (longitude !== undefined) {
      updateData.longitude = typeof longitude === "number" && !isNaN(longitude) ? longitude : null;
    }

    // Handling restore action
    if (restore === true) {
      updateData.deletedAt = null;
      updateData.isActive = true;
    } else if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    // If user is being suspended/deactivated or restored
    if (updateData.isActive === false) {
      // Purge all active sessions for this user immediately
      await prisma.session.deleteMany({ where: { userId: id } });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        city: true,
        address: true,
        latitude: true,
        longitude: true,
        isActive: true,
        deletedAt: true,
        updatedAt: true,
      },
    });

    const statusMessage =
      restore === true
        ? `Account '${updated.name}' restored successfully.`
        : updateData.isActive === false
        ? `Account '${updated.name}' has been suspended and all active sessions revoked.`
        : `User '${updated.name}' updated successfully.`;

    return NextResponse.json({
      success: true,
      data: updated,
      message: statusMessage,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to update user.";
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, errorResponse } = await requireRole(request, [ROLES.ADMIN]);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get("permanent") === "true";

    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true,
            consultations: true,
            hijamaBookings: true,
          },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    // Cannot delete primary admin account
    if (targetUser.id === session.user.id || targetUser.role === ROLES.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Cannot delete the primary Admin account." },
        { status: 400 }
      );
    }

    // Permanent hard delete check
    if (permanent) {
      const hasRecords =
        targetUser._count.orders > 0 ||
        targetUser._count.consultations > 0 ||
        targetUser._count.hijamaBookings > 0;

      if (hasRecords) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Cannot permanently wipe this user because existing clinical or order history is linked to them. Keep them archived/soft-deleted instead to preserve audit logs.",
          },
          { status: 400 }
        );
      }

      // Hard delete: remove sessions, accounts, and user
      await prisma.session.deleteMany({ where: { userId: id } });
      await prisma.account.deleteMany({ where: { userId: id } });
      await prisma.user.delete({ where: { id } });

      return NextResponse.json({
        success: true,
        message: `Account '${targetUser.name}' permanently deleted.`,
      });
    }

    // Soft delete: mark deletedAt and deactivate
    await prisma.session.deleteMany({ where: { userId: id } });
    await prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Account '${targetUser.name}' archived/soft-deleted successfully.`,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to delete user.";
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
