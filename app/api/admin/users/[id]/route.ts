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
    const { role, phone, city } = body;

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    // Safety checks:
    // 1. Cannot alter own admin account role
    if (targetUser.id === session.user.id && role && role !== ROLES.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Cannot demote or alter your own primary Admin account." },
        { status: 400 }
      );
    }

    // 2. Cannot promote another user to "admin" (preserving single-admin constraint)
    if (role === ROLES.ADMIN && targetUser.id !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Only ONE primary admin can exist in the system. You cannot assign the 'admin' role to other accounts.",
        },
        { status: 400 }
      );
    }

    // Validate allowed roles
    if (role && ![ROLES.ADMIN, ROLES.EDITOR, ROLES.CONTRIBUTOR, ROLES.USER].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid role specified. Allowed values: 'editor', 'contributor', 'user'.",
        },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(phone !== undefined && { phone }),
        ...(city !== undefined && { city }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        city: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `User '${updated.name}' successfully updated to role '${updated.role}'.`,
    });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update user." },
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

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    // Cannot delete own admin account
    if (targetUser.id === session.user.id || targetUser.role === ROLES.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Cannot delete the primary Admin account." },
        { status: 400 }
      );
    }

    // Delete associated sessions and accounts first, then delete user
    await prisma.session.deleteMany({ where: { userId: id } });
    await prisma.account.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `User '${targetUser.name}' (${targetUser.email}) removed successfully.`,
    });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete user." },
      { status: 500 }
    );
  }
}
