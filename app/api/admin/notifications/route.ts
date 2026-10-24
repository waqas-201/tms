import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, ROLES } from "@/lib/rbac";
import { listAdminNotifications } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  try {
    const { errorResponse } = await requireRole(request, [
      ROLES.ADMIN,
      ROLES.EDITOR,
    ]);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit") || 25);

    const { notifications, unreadCount } = await listAdminNotifications(
      Number.isFinite(limit) ? limit : 25
    );

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Error loading admin notifications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load notifications." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { errorResponse } = await requireRole(request, [
      ROLES.ADMIN,
      ROLES.EDITOR,
    ]);
    if (errorResponse) return errorResponse;

    const body = await request.json().catch(() => ({}));
    const id = typeof body?.id === "string" ? body.id.trim() : "";
    const markAll = body?.all === true;

    if (!id && !markAll) {
      return NextResponse.json(
        { success: false, error: "Provide a notification id or { all: true }." },
        { status: 400 }
      );
    }

    const result = markAll
      ? await prisma.adminNotification.updateMany({
          where: { readAt: null },
          data: { readAt: new Date() },
        })
      : await prisma.adminNotification.updateMany({
          where: { id, readAt: null },
          data: { readAt: new Date() },
        });

    return NextResponse.json({
      success: true,
      updated: result.count,
    });
  } catch (error) {
    console.error("Error updating admin notifications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update notifications." },
      { status: 500 }
    );
  }
}
