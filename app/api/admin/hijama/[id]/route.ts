import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isStaffRole } from "@/lib/rbac-base";

/**
 * PATCH /api/admin/hijama/[id]
 * Updates booking status ("CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW")
 * or admin notes / payment status.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const userRole = (session?.user as any)?.role;
    if (!session || !isStaffRole(userRole)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, adminNotes, paymentStatus, feeAmount } = body;

    const existing = await prisma.hijamaBooking.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: `Booking with ID ${id} not found.` },
        { status: 404 }
      );
    }

    const updated = await prisma.hijamaBooking.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(adminNotes !== undefined ? { adminNotes } : {}),
        ...(paymentStatus ? { paymentStatus } : {}),
        ...(typeof feeAmount === "number" ? { feeAmount } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Booking ${existing.ticketNumber} updated successfully.`,
    });
  } catch (error: any) {
    console.error("Error updating Hijama booking:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update booking." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/hijama/[id]
 * Cancels or deletes a booking.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const userRole = (session?.user as any)?.role;
    if (!session || !isStaffRole(userRole)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 403 }
      );
    }

    const { id } = await params;

    await prisma.hijamaBooking.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Booking record deleted.",
    });
  } catch (error: any) {
    console.error("Error deleting Hijama booking:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete booking." },
      { status: 500 }
    );
  }
}
