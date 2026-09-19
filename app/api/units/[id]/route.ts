import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, ROLES } from "@/lib/rbac";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN]);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const body = await request.json();
    const { name, kind, isActive } = body;

    const existing = await prisma.unit.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Unit not found." },
        { status: 404 }
      );
    }

    const updated = await prisma.unit.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(kind && { kind: kind.toUpperCase() }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Error updating unit:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update unit." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN]);
    if (errorResponse) return errorResponse;

    const { id } = await params;

    // Check if any product sizes are currently using this unit
    const usageCount = await prisma.productSize.count({
      where: { unitId: id },
    });

    if (usageCount > 0) {
      // Soft-deactivate instead of hard delete to preserve historical integrity
      await prisma.unit.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({
        success: true,
        message: `Unit is in use by ${usageCount} product sizes. Deactivated successfully.`,
      });
    }

    await prisma.unit.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Unit deleted successfully." });
  } catch (error: any) {
    console.error("Error deleting unit:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete unit." },
      { status: 500 }
    );
  }
}
