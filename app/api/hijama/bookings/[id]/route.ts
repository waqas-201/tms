import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireRole, ROLES, isStaffRole } from "@/lib/rbac";
import {
  getHijamaBookingById,
  getHijamaBookingByTicket,
  updateHijamaBookingStatus,
} from "@/lib/hijama";

const VALID_BOOKING_STATUSES = [
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
] as const;

type BookingStatus = (typeof VALID_BOOKING_STATUSES)[number];

const VALID_PAYMENT_STATUSES = ["UNPAID", "PAID_AT_CLINIC"] as const;
type PaymentStatus = (typeof VALID_PAYMENT_STATUSES)[number];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Booking ID or ticket number required." },
        { status: 400 }
      );
    }

    const booking =
      (await getHijamaBookingById(id)) ||
      (await getHijamaBookingByTicket(id));

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Hijama booking not found." },
        { status: 404 }
      );
    }

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const userRole = (session?.user as any)?.role;
    const isStaff = isStaffRole(userRole);

    // If the booking is linked to a registered user, ensure authorized viewer:
    // Either staff or the booking owner.
    if (
      booking.userId &&
      session?.user &&
      !isStaff &&
      session.user.id !== booking.userId
    ) {
      return NextResponse.json(
        { success: false, error: "Access denied." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error: any) {
    console.error("Error retrieving Hijama booking:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to retrieve Hijama booking.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Staff only: Admin or Editor
    const { session, errorResponse } = await requireRole(request, [
      ROLES.ADMIN,
      ROLES.EDITOR,
    ]);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const { status, adminNotes, paymentStatus } = body;

    if (status && !VALID_BOOKING_STATUSES.includes(status as BookingStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status "${status}". Allowed values: ${VALID_BOOKING_STATUSES.join(
            ", "
          )}.`,
        },
        { status: 400 }
      );
    }

    if (
      paymentStatus &&
      !VALID_PAYMENT_STATUSES.includes(paymentStatus as PaymentStatus)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid paymentStatus "${paymentStatus}". Allowed values: ${VALID_PAYMENT_STATUSES.join(
            ", "
          )}.`,
        },
        { status: 400 }
      );
    }

    const existing =
      (await getHijamaBookingById(id)) ||
      (await getHijamaBookingByTicket(id));

    if (!existing) {
      return NextResponse.json(
        { success: false, error: `Hijama booking with ID "${id}" not found.` },
        { status: 404 }
      );
    }

    // Perform status update if status was provided
    if (status) {
      await updateHijamaBookingStatus(
        existing.id,
        status as BookingStatus,
        adminNotes !== undefined ? adminNotes : undefined
      );
    } else if (adminNotes !== undefined) {
      await prisma.hijamaBooking.update({
        where: { id: existing.id },
        data: { adminNotes },
      });
    }

    // Perform paymentStatus update if provided
    if (paymentStatus) {
      await prisma.hijamaBooking.update({
        where: { id: existing.id },
        data: { paymentStatus },
      });
    }

    const updatedBooking = await getHijamaBookingById(existing.id);

    return NextResponse.json({
      success: true,
      data: updatedBooking,
      message: "Hijama booking updated successfully.",
    });
  } catch (error: any) {
    console.error("Error updating Hijama booking:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to update Hijama booking.",
      },
      { status: 500 }
    );
  }
}
