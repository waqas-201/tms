import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, ROLES } from "@/lib/rbac";
import { sendAdminPromotionEmail } from "@/lib/email";

const ADMIN_QUOTA_MAX = 3;

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

    const requesterRole = String((session?.user as any)?.role || "").toLowerCase();
    const isSuperAdmin = requesterRole === ROLES.SUPER_ADMIN;

    // Safety check 1: Target is Super Admin
    if (targetUser.role === ROLES.SUPER_ADMIN) {
      return NextResponse.json(
        {
          success: false,
          error: "The Super Admin cannot be modified through general user management. Use the Super Admin Cell or direct database access.",
        },
        { status: 403 }
      );
    }

    // Safety check 2: Target is Admin, but requester is not Super Admin
    if (targetUser.role === ROLES.ADMIN && !isSuperAdmin && targetUser.id !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Only the Super Admin can manage or modify operational Admin accounts.",
        },
        { status: 403 }
      );
    }

    let isPromotingToAdmin = false;
    let isDemotingFromAdmin = false;

    // Safety check 3: Role changes
    if (role) {
      const normalizedRole = role.toLowerCase().trim();
      if (normalizedRole === ROLES.SUPER_ADMIN) {
        return NextResponse.json(
          {
            success: false,
            error: "The Super Admin role cannot be assigned here. It must be claimed via one-time Bootstrap Key or transferred in the Super Admin Cell.",
          },
          { status: 403 }
        );
      }

      // Demoting an admin
      if (targetUser.role === ROLES.ADMIN && normalizedRole !== ROLES.ADMIN) {
        if (!isSuperAdmin) {
          return NextResponse.json(
            {
              success: false,
              error: "Only the Super Admin can demote operational Admin accounts.",
            },
            { status: 403 }
          );
        }
        isDemotingFromAdmin = true;
      }

      // Promoting to admin
      if (normalizedRole === ROLES.ADMIN && targetUser.role !== ROLES.ADMIN) {
        if (!isSuperAdmin) {
          return NextResponse.json(
            {
              success: false,
              error: "Only the Super Admin can promote accounts to the Admin role.",
            },
            { status: 403 }
          );
        }

        // Quota check
        const activeAdminCount = await prisma.user.count({
          where: {
            role: ROLES.ADMIN,
            isActive: true,
            deletedAt: null,
          },
        });

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

        isPromotingToAdmin = true;
      }
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

    // Auto-restore & activate if promoting to Admin
    if (isPromotingToAdmin) {
      updateData.deletedAt = null;
      updateData.isActive = true;
    } else if (restore === true) {
      updateData.deletedAt = null;
      updateData.isActive = true;
    } else if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    // Purge active sessions if suspended, deactivated, promoted, or demoted
    if (updateData.isActive === false || isPromotingToAdmin || isDemotingFromAdmin) {
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

    if (isPromotingToAdmin) {
      // Dispatch notification email
      sendAdminPromotionEmail({ to: updated.email, name: updated.name }).catch((err) => {
        console.error("[sendAdminPromotionEmail Exception]:", err);
      });
    }

    let statusMessage = `User '${updated.name}' updated successfully.`;
    if (isPromotingToAdmin) {
      statusMessage = `Account '${updated.name}' has been promoted to Admin successfully.`;
    } else if (isDemotingFromAdmin) {
      statusMessage = `Account '${updated.name}' has been demoted to standard user.`;
    } else if (restore === true) {
      statusMessage = `Account '${updated.name}' restored successfully.`;
    } else if (updateData.isActive === false) {
      statusMessage = `Account '${updated.name}' has been suspended and all active sessions revoked.`;
    }

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

    // Safety check 1: Target is Super Admin
    if (targetUser.role === ROLES.SUPER_ADMIN) {
      return NextResponse.json(
        {
          success: false,
          error: "The Super Admin cannot be removed via user management. The only valid removal mechanisms are the Super Admin Cell or direct database intervention.",
        },
        { status: 403 }
      );
    }

    const requesterRole = String((session?.user as any)?.role || "").toLowerCase();
    const isSuperAdmin = requesterRole === ROLES.SUPER_ADMIN;

    // Safety check 2: Target is Admin, but requester is not Super Admin
    if (targetUser.role === ROLES.ADMIN && !isSuperAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Only the Super Admin can delete or decommission operational Admin accounts.",
        },
        { status: 403 }
      );
    }

    // Safety check 3: Self deletion
    if (targetUser.id === session.user.id) {
      return NextResponse.json(
        { success: false, error: "You cannot delete your own account while logged in." },
        { status: 400 }
      );
    }

    // Invalidate sessions immediately
    await prisma.session.deleteMany({ where: { userId: id } });

    if (permanent) {
      // Hard delete
      const totalHistory =
        (targetUser._count?.orders || 0) +
        (targetUser._count?.consultations || 0) +
        (targetUser._count?.hijamaBookings || 0);

      if (totalHistory > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot permanently delete '${targetUser.name}' because they have ${totalHistory} associated records (orders/consultations). Use soft-delete/suspension instead to protect clinical history.`,
          },
          { status: 409 }
        );
      }

      await prisma.user.delete({ where: { id } });

      return NextResponse.json({
        success: true,
        message: `User '${targetUser.name}' and associated credentials permanently removed.`,
      });
    }

    // Soft delete
    await prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: `User '${targetUser.name}' archived. Access has been suspended.`,
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
