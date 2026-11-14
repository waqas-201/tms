import { NextRequest, NextResponse, after } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireRole, ROLES } from "@/lib/rbac";
import { transitionOrderStatus, OrderStatus, PaymentStatus } from "@/lib/orders";
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
      let invoiceToken: string | null = null;
      try {
        invoiceToken = generateInvoiceToken(order.id, order.orderNumber);
      } catch {
        invoiceToken = null;
      }
      return NextResponse.json({
        success: true,
        data: {
          ...order,
          invoiceToken,
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

    const { order: updated, previousStatus, statusChanged } = await transitionOrderStatus({
      orderId: id,
      orderStatus: orderStatus as OrderStatus | undefined,
      paymentStatus: paymentStatus as PaymentStatus | undefined,
      trackingNote,
      shippingFee,
      deliveryNotes,
      staffUserId: session?.user?.id || null,
    });

    // If order was confirmed and email exists, dispatch invoice email via Next.js 15 after()
    if (
      statusChanged &&
      orderStatus === "CONFIRMED" &&
      (previousStatus === "PENDING_CONFIRMATION" || previousStatus === "PENDING") &&
      updated.email
    ) {
      after(async () => {
        try {
          await sendOrderConfirmationEmail({
            to: updated.email!,
            customerName: updated.customerName,
            orderNumber: updated.orderNumber,
            phone: updated.phone,
            city: updated.city,
            address: updated.address,
            deliveryNotes: updated.deliveryNotes,
            paymentMethod: updated.paymentMethod,
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
          });
        } catch (err) {
          console.error("[Order Confirmation Email on Approval Error]:", err);
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Order status updated to ${orderStatus || previousStatus}.`,
    });
  } catch (error: any) {
    console.error("Error updating order:", error);
    if (error?.message && error.message.includes("Order not found")) {
      return NextResponse.json(
        { success: false, error: "Order not found." },
        { status: 404 }
      );
    }
    if (
      error?.message &&
      (error.message.includes("Illegal state transition") ||
        error.message.includes("Invalid shippingFee"))
    ) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update order status." },
      { status: 500 }
    );
  }
}
