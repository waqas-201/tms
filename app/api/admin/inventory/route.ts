import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, ROLES } from "@/lib/rbac";
import { getAvailableStock } from "@/lib/inventory";

export async function GET(request: NextRequest) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN, ROLES.EDITOR]);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const category = searchParams.get("category");
    const lowStockOnly = searchParams.get("lowStock") === "true";

    const where: any = {
      isActive: true,
    };

    if (category && category !== "all") {
      where.product = { categoryId: category };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { weight: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { product: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const sizes = await prisma.productSize.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            slug: true,
            name: true,
            urduName: true,
            image: true,
            categoryId: true,
            categoryLabel: true,
            inStock: true,
          },
        },
        unit: true,
      },
      orderBy: [
        { product: { name: "asc" } },
        { price: "asc" },
      ],
    });

    const formatted = sizes.map((s) => {
      const available = getAvailableStock(s);
      const isLowStock = available <= (s.lowStockThreshold || 5);
      return {
        id: s.id,
        productId: s.productId,
        productName: s.product.name,
        productUrduName: s.product.urduName,
        productSlug: s.product.slug,
        productImage: s.product.image,
        categoryLabel: s.product.categoryLabel,
        name: s.name,
        weight: s.weight,
        price: s.price,
        originalPrice: s.originalPrice,
        sku: s.sku,
        unitId: s.unitId,
        unitCode: s.unit?.code || null,
        unitName: s.unit?.name || null,
        quantityValue: s.quantityValue,
        stockOnHand: s.stockOnHand,
        stockReserved: s.stockReserved,
        available,
        lowStockThreshold: s.lowStockThreshold || 5,
        isLowStock,
        isActive: s.isActive,
      };
    });

    const finalData = lowStockOnly ? formatted.filter((item) => item.isLowStock) : formatted;

    const summary = {
      totalPacks: formatted.length,
      totalOnHand: formatted.reduce((acc, curr) => acc + curr.stockOnHand, 0),
      totalReserved: formatted.reduce((acc, curr) => acc + curr.stockReserved, 0),
      totalAvailable: formatted.reduce((acc, curr) => acc + curr.available, 0),
      lowStockCount: formatted.filter((f) => f.isLowStock).length,
      outOfStockCount: formatted.filter((f) => f.available === 0).length,
    };

    return NextResponse.json({
      success: true,
      data: finalData,
      summary,
    });
  } catch (error) {
    console.error("Error fetching admin inventory:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load inventory data." },
      { status: 500 }
    );
  }
}
