import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ROLES } from "@/lib/rbac";
import { getAvailableStock, reserveStockForOrder } from "@/lib/inventory";

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

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required to view orders." },
        { status: 401 }
      );
    }

    if (userRole !== ROLES.ADMIN && userRole !== ROLES.EDITOR) {
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
        items: {
          include: {
            productSize: {
              include: { unit: true },
            },
          },
        },
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

    // Process & validate items with DB inventory
    const resolvedItems: {
      productId: string | null;
      productSizeId: string | null;
      productName: string;
      productUrduName: string | null;
      sizeName: string;
      sizeWeight: string;
      price: number;
      quantity: number;
      total: number;
      productImage: string | null;
      stockState: string;
    }[] = [];

    // Collect all size IDs & product IDs
    const sizeIds = items.map((i: any) => i.productSizeId || i.sizeId).filter(Boolean);
    const productIds = items.map((i: any) => i.productId).filter(Boolean);

    const [dbSizes, dbProducts] = await Promise.all([
      prisma.productSize.findMany({
        where: { id: { in: sizeIds } },
        include: { product: true, unit: true },
      }),
      prisma.product.findMany({
        where: { id: { in: productIds } },
        include: { sizes: { include: { unit: true, product: true } } },
      }),
    ]);

    for (const item of items) {
      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
      let matchedSize = dbSizes.find((s) => s.id === (item.productSizeId || item.sizeId));

      // If size not matched by ID, try matching by productId + weight/name
      if (!matchedSize && item.productId) {
        const prod = dbProducts.find((p) => p.id === item.productId);
        if (prod && prod.sizes.length > 0) {
          matchedSize = prod.sizes.find(
            (s) => s.weight === item.sizeWeight || s.name === item.sizeName
          ) || prod.sizes[0];
        }
      }

      let unitPrice = Number(item.price);
      let productName = item.productName;
      let productUrduName = item.productUrduName || null;
      let sizeName = item.sizeName || "Standard";
      let sizeWeight = item.sizeWeight || "Standard";
      let productImage = item.productImage || null;
      let productSizeId: string | null = null;
      let productId: string | null = item.productId || null;

      if (matchedSize) {
        productSizeId = matchedSize.id;
        productId = matchedSize.productId;
        productName = matchedSize.product.name;
        productUrduName = matchedSize.product.urduName || null;
        sizeName = matchedSize.name;
        sizeWeight = matchedSize.weight;
        unitPrice = matchedSize.price;
        productImage = matchedSize.product.image || productImage;

        // Check stock availability
        const available = getAvailableStock(matchedSize);
        if (available < qty) {
          return NextResponse.json(
            {
              success: false,
              error: `Insufficient stock for "${matchedSize.product.name} (${matchedSize.weight})". Only ${available} available.`,
            },
            { status: 409 }
          );
        }
      }

      resolvedItems.push({
        productId,
        productSizeId,
        productName,
        productUrduName,
        sizeName,
        sizeWeight,
        price: unitPrice,
        quantity: qty,
        total: unitPrice * qty,
        productImage,
        stockState: productSizeId ? "RESERVED" : "NONE",
      });
    }

    // Calculate subtotal from verified DB prices
    const subtotal = resolvedItems.reduce((sum, item) => sum + item.total, 0);
    const shippingFee = subtotal >= 2000 ? 0 : 200;
    const finalDiscount = Math.min(subtotal, Math.max(0, Number(discountAmount) || 0));
    const total = Math.max(0, subtotal + shippingFee - finalDiscount);

    let finalDeliveryNotes = deliveryNotes || null;
    if (couponCode) {
      finalDeliveryNotes = `[COUPON APPLIED: ${couponCode} | DISCOUNT: ₨ ${finalDiscount}] ` + (finalDeliveryNotes || "");
    }

    // Generate readable order number: TMS-YYYY-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `TMS-${new Date().getFullYear()}-${randomSuffix}`;

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
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
            create: resolvedItems.map((item) => ({
              productId: item.productId,
              productSizeId: item.productSizeId,
              productName: item.productName,
              productUrduName: item.productUrduName,
              sizeName: item.sizeName,
              sizeWeight: item.sizeWeight,
              price: item.price,
              quantity: item.quantity,
              total: item.total,
              productImage: item.productImage,
              stockState: item.stockState,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Reserve stock for the ordered items in this transaction
      const itemsToReserve = resolvedItems
        .filter((i) => i.productSizeId !== null)
        .map((i) => ({
          productSizeId: i.productSizeId as string,
          quantity: i.quantity,
        }));

      if (itemsToReserve.length > 0) {
        await reserveStockForOrder(tx, createdOrder.id, itemsToReserve);
      }

      return createdOrder;
    });

    return NextResponse.json(
      {
        success: true,
        data: order,
        message: "Order placed successfully! Cash on Delivery will be dispatched shortly.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to place order." },
      { status: 500 }
    );
  }
}
