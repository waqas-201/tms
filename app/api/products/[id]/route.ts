import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, ROLES } from "@/lib/rbac";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: id }, { slug: id }],
      },
      include: {
        sizes: true,
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

    const formatted = {
      ...product,
      benefits: safeJsonParse(product.benefits, []),
      ingredients: safeJsonParse(product.ingredients, []),
      warnings: safeJsonParse(product.warnings || "[]", []),
    };

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
    // Both Admin and Editor can edit products in the catalog
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN, ROLES.EDITOR]);
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
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Product not found." },
        { status: 404 }
      );
    }

    // Update sizes if provided
    if (sizes && Array.isArray(sizes)) {
      await prisma.productSize.deleteMany({ where: { productId: existing.id } });
      if (sizes.length > 0) {
        await prisma.productSize.createMany({
          data: sizes.map((s: { name: string; weight: string; price: number; originalPrice?: number }) => ({
            productId: existing.id,
            name: s.name,
            weight: s.weight,
            price: Number(s.price),
            originalPrice: s.originalPrice ? Number(s.originalPrice) : null,
          })),
        });
      }
    }

    const parsedBenefits = benefits !== undefined ? (Array.isArray(benefits) ? JSON.stringify(benefits) : String(benefits)) : undefined;
    const parsedIngredients = ingredients !== undefined ? (Array.isArray(ingredients) ? JSON.stringify(ingredients) : String(ingredients)) : undefined;
    const parsedWarnings = warnings !== undefined ? (Array.isArray(warnings) ? JSON.stringify(warnings) : String(warnings)) : undefined;

    const updated = await prisma.product.update({
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
        ...(price !== undefined && { price: Number(price) }),
        ...(originalPrice !== undefined && { originalPrice: originalPrice ? Number(originalPrice) : null }),
        ...(discountPercentage !== undefined && { discountPercentage: discountPercentage ? Number(discountPercentage) : null }),
        ...(image && { image }),
        ...(inStock !== undefined && { inStock }),
        ...(featured !== undefined && { featured }),
        ...(rating !== undefined && { rating: Number(rating) }),
        ...(badge !== undefined && { badge }),
        ...(mizaj !== undefined && { mizaj }),
      },
      include: {
        sizes: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
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
    // Only Admin can delete products
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

function safeJsonParse(val: string, fallback: unknown) {
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}
