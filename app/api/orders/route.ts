import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ROLES } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    const userRole = (session?.user as any)?.role;

    // Only Admin can view all store orders. Regular customers and other staff only see their own placed orders.
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required to view orders." },
        { status: 401 }
      );
    }

    if (userRole !== ROLES.ADMIN) {
      where.userId = session.user.id;
    }

    if (status && status !== "ALL") {
      where.orderStatus = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { orderNumber: { contains: q, mode: "insensitive" } },
        { customerName: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const body = await request.json();
    const {
      customerName,
      phone,
      email,
      city,
      address,
      deliveryNotes,
      paymentMethod = "COD",
      items,
      discountAmount = 0,
      couponCode = null,
    } = body;

    if (!customerName || !phone || !city || !address || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please provide complete delivery details and cart items." },
        { status: 400 }
      );
    }

    // Calculate subtotal and shipping
    const subtotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + Number(item.price) * Number(item.quantity),
      0
    );

    const shippingFee = subtotal >= 2000 ? 0 : 200;
    const total = Math.max(0, subtotal + shippingFee - discountAmount);

    let finalDeliveryNotes = deliveryNotes || null;
    if (couponCode) {
      finalDeliveryNotes = `[COUPON APPLIED: ${couponCode} | DISCOUNT: ₨ ${discountAmount}] ` + (finalDeliveryNotes || "");
    }

    // Generate readable order number: TMS-YYYY-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `TMS-${new Date().getFullYear()}-${randomSuffix}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        phone,
        email: email || null,
        city,
        address,
        deliveryNotes: finalDeliveryNotes,
        paymentMethod,
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
        subtotal,
        shippingFee,
        total,
        userId: session?.user?.id || null,
        items: {
          create: items.map((item: {
            productId?: string;
            productName: string;
            productUrduName?: string;
            sizeName: string;
            sizeWeight: string;
            price: number;
            quantity: number;
            productImage?: string;
          }) => ({
            productId: item.productId || null,
            productName: item.productName,
            productUrduName: item.productUrduName || null,
            sizeName: item.sizeName,
            sizeWeight: item.sizeWeight,
            price: Number(item.price),
            quantity: Number(item.quantity),
            total: Number(item.price) * Number(item.quantity),
            productImage: item.productImage || null,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: order,
        message: "Order placed successfully! Cash on Delivery will be dispatched shortly.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to place order." },
      { status: 500 }
    );
  }
}
