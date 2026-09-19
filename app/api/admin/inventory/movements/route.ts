import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, ROLES } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN, ROLES.EDITOR]);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const productSizeId = searchParams.get("productSizeId");
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 50)));

    const where: any = {};
    if (productSizeId) {
      where.productSizeId = productSizeId;
    }

    const movements = await prisma.stockMovement.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        productSize: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                image: true,
              },
            },
            unit: true,
          },
        },
      },
    });

    const formatted = movements.map((m) => ({
      id: m.id,
      productSizeId: m.productSizeId,
      productName: m.productSize.product.name,
      productImage: m.productSize.product.image,
      packName: m.productSize.name,
      packWeight: m.productSize.weight,
      type: m.type,
      quantity: m.quantity,
      onHandAfter: m.onHandAfter,
      reservedAfter: m.reservedAfter,
      availableAfter: Math.max(0, m.onHandAfter - m.reservedAfter),
      reason: m.reason,
      orderId: m.orderId,
      createdById: m.createdById,
      createdAt: m.createdAt,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Error fetching inventory movements:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load stock movements." },
      { status: 500 }
    );
  }
}
