import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireRole, ROLES } from "@/lib/rbac";
import { commitShipmentForOrder, releaseReservationForOrder } from "@/lib/inventory";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: id }, { orderNumber: id }],
      },
      include: {
        items: {
          include: {
            productSize: {
              include: { unit: true },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found." },
        { status: 404 }
      );
    }

    const userRole = (session?.user as any)?.role;

    // If order belongs to a user, ensure authorized viewer or admin or guest with order number
    if (order.userId && session && userRole !== ROLES.ADMIN && userRole !== ROLES.EDITOR && session.user.id !== order.userId) {
      return NextResponse.json(
        { success: false, error: "Access denied." },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Error fetching order details:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve order." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, errorResponse } = await requireRole(request, [ROLES.ADMIN, ROLES.EDITOR]);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const body = await request.json();
    const { orderStatus, paymentStatus, trackingNote } = body;

    const existing = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: { items: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Order not found." },
        { status: 404 }
      );
    }

    // Process inventory status transitions
    if (orderStatus && orderStatus !== existing.orderStatus) {
      if (orderStatus === "DISPATCHED" || orderStatus === "DELIVERED") {
        // Physical reduction of stock from shelf (committed sale)
        await commitShipmentForOrder(existing.id, session?.user?.id);
      } else if (orderStatus === "CANCELLED") {
        // Release reservation back to available stock
        await releaseReservationForOrder(existing.id, session?.user?.id);
      }
    }

    const updated = await prisma.order.update({
      where: { id: existing.id },
      data: {
        ...(orderStatus && { orderStatus }),
        ...(paymentStatus && { paymentStatus }),
        ...(trackingNote !== undefined && { trackingNote }),
      },
      include: {
        items: {
          include: {
            productSize: {
              include: { unit: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Order status updated to ${orderStatus || existing.orderStatus}.`,
    });
  } catch (error: any) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update order status." },
      { status: 500 }
    );
  }
}
