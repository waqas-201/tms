import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, ROLES } from "@/lib/rbac";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN, ROLES.EDITOR]);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const overrideEmail = body.email;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found." },
        { status: 404 }
      );
    }

    const targetEmail = overrideEmail || order.email;
    if (!targetEmail) {
      return NextResponse.json(
        { success: false, error: "No email address found for this customer." },
        { status: 400 }
      );
    }

    const result = await sendOrderConfirmationEmail({
      to: targetEmail,
      customerName: order.customerName,
      orderNumber: order.orderNumber,
      phone: order.phone,
      city: order.city,
      address: order.address,
      deliveryNotes: order.deliveryNotes,
      paymentMethod: order.paymentMethod === "COD" ? "Cash on Delivery (COD)" : order.paymentMethod,
      items: order.items.map((i) => ({
        productName: i.productName,
        sizeWeight: i.sizeWeight,
        price: i.price,
        quantity: i.quantity,
        total: i.total,
      })),
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      total: order.total,
      createdAt: order.createdAt,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to dispatch email." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Invoice email successfully dispatched to ${targetEmail}.`,
    });
  } catch (error: any) {
    console.error("Error dispatching invoice email:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to send invoice email." },
      { status: 500 }
    );
  }
}
