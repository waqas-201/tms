import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireRole, ROLES } from "@/lib/rbac";
import { commitShipmentForOrder, releaseReservationForOrder } from "@/lib/inventory";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { generateInvoiceToken, verifyInvoiceToken } from "@/lib/invoice-token";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const token = request.nextUrl.searchParams.get("token");

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
    const isStaff = userRole === ROLES.ADMIN || userRole === ROLES.EDITOR || userRole === ROLES.SUPER_ADMIN;
    const isOwner = Boolean(
      session?.user &&
        (session.user.id === order.userId ||
          (order.email && session.user.email?.toLowerCase() === order.email?.toLowerCase()))
    );
    const hasValidToken = verifyInvoiceToken(order.id, order.orderNumber, token);

    if (isStaff || isOwner || hasValidToken) {
      return NextResponse.json({
        success: true,
        data: {
          ...order,
          invoiceToken: generateInvoiceToken(order.id, order.orderNumber),
        },
      });
    }

    // If order belongs to a registered user and requester is unauthenticated/unauthorized, deny full access
    if (order.userId && (!session || session.user.id !== order.userId)) {
      return NextResponse.json(
        { success: false, error: "Access denied." },
        { status: 403 }
      );
    }

    // For public status tracking queries without a token, mask personal contact information
    const maskedPhone = order.phone
      ? order.phone.replace(/(\d{4})\d+(\d{3})/, "$1****$2")
      : "";
    const maskedEmail = order.email
      ? order.email.replace(/(.{2})(.*)(@.*)/, "$1***$3")
      : null;

    const sanitizedOrder = {
      ...order,
      phone: maskedPhone,
      email: maskedEmail,
      address: `${order.city}, Pakistan`,
    };

    return NextResponse.json({ success: true, data: sanitizedOrder });
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
    const { orderStatus, paymentStatus, trackingNote, shippingFee, deliveryNotes } = body;

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

    let calculatedTotal = existing.total;
    let calculatedShippingFee = existing.shippingFee;
    let calculatedDueAmount = existing.dueAmount;

    if (shippingFee !== undefined && shippingFee !== null) {
      calculatedShippingFee = Math.max(0, Number(shippingFee) || 0);
      calculatedTotal = existing.subtotal + calculatedShippingFee;
      calculatedDueAmount = Math.max(0, calculatedTotal - existing.paidAmount);
    }

    const updated = await prisma.order.update({
      where: { id: existing.id },
      data: {
        ...(orderStatus && { orderStatus }),
        ...(paymentStatus && { paymentStatus }),
        ...(trackingNote !== undefined && { trackingNote }),
        ...(deliveryNotes !== undefined && { deliveryNotes }),
        ...(shippingFee !== undefined && shippingFee !== null && {
          shippingFee: calculatedShippingFee,
          total: calculatedTotal,
          dueAmount: calculatedDueAmount,
          deliveryFeeType: "MANUAL",
        }),
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

    // If order was confirmed and email exists, dispatch invoice email
    if (
      orderStatus === "CONFIRMED" &&
      (existing.orderStatus === "PENDING_CONFIRMATION" || existing.orderStatus === "PENDING") &&
      existing.email
    ) {
      sendOrderConfirmationEmail({
        to: existing.email,
        customerName: existing.customerName,
        orderNumber: existing.orderNumber,
        phone: existing.phone,
        city: existing.city,
        address: existing.address,
        deliveryNotes: updated.deliveryNotes,
        paymentMethod: existing.paymentMethod,
        items: updated.items.map((i) => ({
          productName: i.productName,
          sizeWeight: i.sizeWeight,
          price: i.price,
          quantity: i.quantity,
          total: i.total,
        })),
        subtotal: updated.subtotal,
        shippingFee: updated.shippingFee,
        total: updated.total,
        createdAt: updated.createdAt,
      }).catch((err) => console.error("[Order Confirmation Email on Approval Error]:", err));
    }

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
