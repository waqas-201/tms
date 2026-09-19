import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, ROLES } from "@/lib/rbac";
import { formatProductRecord } from "@/lib/catalog";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        sizes: {
          include: { unit: true },
          orderBy: { price: "asc" },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found." },
        { status: 404 }
      );
    }

    const formatted = formatProductRecord(product);

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Error fetching product detail:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product detail." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, errorResponse } = await requireRole(request, [ROLES.ADMIN, ROLES.EDITOR]);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      categoryId,
      categoryLabel,
      shortDescription,
      fullDescription,
      traditionalPurpose,
      benefits,
      ingredients,
      howToUse,
      dosage,
      hakimAdvice,
      warnings,
      price,
      originalPrice,
      discountPercentage,
      image,
      inStock,
      featured,
      rating,
      badge,
      mizaj,
      sizes,
    } = body;

    const existing = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { sizes: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Product not found." },
        { status: 404 }
      );
    }

    const parsedBenefits = benefits !== undefined ? (Array.isArray(benefits) ? JSON.stringify(benefits) : String(benefits)) : undefined;
    const parsedIngredients = ingredients !== undefined ? (Array.isArray(ingredients) ? JSON.stringify(ingredients) : String(ingredients)) : undefined;
    const parsedWarnings = warnings !== undefined ? (Array.isArray(warnings) ? JSON.stringify(warnings) : String(warnings)) : undefined;

    let basePrice = price !== undefined ? Number(price) : existing.price;

    const updated = await prisma.$transaction(async (tx) => {
      // Upsert / update sizes if provided
      if (sizes && Array.isArray(sizes) && sizes.length > 0) {
        const minSizePrice = Math.min(...sizes.map((s: any) => Number(s.price) || basePrice));
        if (!isNaN(minSizePrice) && minSizePrice > 0) {
          basePrice = minSizePrice;
        }

        const incomingSizeIds = new Set(sizes.map((s: any) => s.id).filter(Boolean));

        // Mark missing existing sizes as inactive
        for (const existingSize of existing.sizes) {
          if (!incomingSizeIds.has(existingSize.id)) {
            await tx.productSize.update({
              where: { id: existingSize.id },
              data: { isActive: false },
            });
          }
        }

        // Update or create sizes
        for (const s of sizes) {
          const sku = s.sku || `${existing.slug}-${(s.name || s.weight || "std").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
          const sizePrice = Number(s.price) || basePrice;
          const original = s.originalPrice ? Number(s.originalPrice) : null;
          const lowStockThreshold = Number(s.lowStockThreshold) || 5;
          const qtyVal = s.quantityValue !== undefined && s.quantityValue !== null ? Number(s.quantityValue) : null;

          if (s.id && existing.sizes.some((es) => es.id === s.id)) {
            await tx.productSize.update({
              where: { id: s.id },
              data: {
                name: s.name || "Standard Pack",
                weight: s.weight || s.name || "Standard",
                price: sizePrice,
                originalPrice: original,
                unitId: s.unitId || null,
                quantityValue: qtyVal,
                sku,
                lowStockThreshold,
                isActive: s.isActive !== undefined ? Boolean(s.isActive) : true,
              },
            });
          } else {
            const initialQty = Math.max(0, Number(s.initialStock || s.stockOnHand || 0));
            const newSize = await tx.productSize.create({
              data: {
                productId: existing.id,
                name: s.name || "Standard Pack",
                weight: s.weight || s.name || "Standard",
                price: sizePrice,
                originalPrice: original,
                unitId: s.unitId || null,
                quantityValue: qtyVal,
                sku,
                stockOnHand: initialQty,
                stockReserved: 0,
                lowStockThreshold,
                isActive: s.isActive !== undefined ? Boolean(s.isActive) : true,
              },
            });

            if (initialQty > 0) {
              await tx.stockMovement.create({
                data: {
                  productSizeId: newSize.id,
                  type: "RECEIVE",
                  quantity: initialQty,
                  onHandAfter: initialQty,
                  reservedAfter: 0,
                  reason: "Initial variant stock on product edit",
                  createdById: session?.user?.id || null,
                },
              });
            }
          }
        }
      }

      await tx.product.update({
        where: { id: existing.id },
        data: {
          ...(name && { name }),
          ...(categoryId && { categoryId }),
          ...(categoryLabel && { categoryLabel }),
          ...(shortDescription !== undefined && { shortDescription }),
          ...(fullDescription !== undefined && { fullDescription }),
          ...(traditionalPurpose !== undefined && { traditionalPurpose }),
          ...(parsedBenefits !== undefined && { benefits: parsedBenefits }),
          ...(parsedIngredients !== undefined && { ingredients: parsedIngredients }),
          ...(howToUse !== undefined && { howToUse }),
          ...(dosage !== undefined && { dosage }),
          ...(hakimAdvice !== undefined && { hakimAdvice }),
          ...(parsedWarnings !== undefined && { warnings: parsedWarnings }),
          price: basePrice,
          ...(originalPrice !== undefined && { originalPrice: originalPrice ? Number(originalPrice) : null }),
          ...(discountPercentage !== undefined && { discountPercentage: discountPercentage ? Number(discountPercentage) : null }),
          ...(image && { image }),
          ...(inStock !== undefined && { inStock }),
          ...(featured !== undefined && { featured }),
          ...(rating !== undefined && { rating: Number(rating) }),
          ...(badge !== undefined && { badge }),
          ...(mizaj !== undefined && { mizaj }),
        },
      });

      return await tx.product.findUnique({
        where: { id: existing.id },
        include: {
          sizes: {
            include: { unit: true },
            orderBy: { price: "asc" },
          },
          reviews: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
    });

    return NextResponse.json({ success: true, data: formatProductRecord(updated) });
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update product." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN]);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const existing = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Product not found." },
        { status: 404 }
      );
    }

    await prisma.product.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true, message: "Product deleted successfully." });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product." },
      { status: 500 }
    );
  }
}
