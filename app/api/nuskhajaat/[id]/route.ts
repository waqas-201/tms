import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, ROLES } from "@/lib/rbac";
import { INITIAL_NUSKHAJAAT } from "@/app/data/nuskhajaat";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let nuskha: any = null;
    try {
      nuskha = await prisma.nuskha.findFirst({
        where: {
          OR: [{ id: id }, { slug: id }],
        },
        include: {
          ingredients: {
            orderBy: { orderIndex: "asc" },
          },
        },
      });
    } catch (dbErr) {
      console.warn("Prisma Nuskha single lookup fallback to static data:", dbErr);
    }

    if (nuskha) {
      const formatted = {
        ...nuskha,
        benefits: safeJsonParse(nuskha.benefits, []),
        warnings: safeJsonParse(nuskha.warnings || "[]", []),
      };
      return NextResponse.json({ success: true, data: formatted, source: "database" });
    }

    // Static fallback lookup
    const staticItem = INITIAL_NUSKHAJAAT.find(
      (n) => n.id === id || n.slug === id
    );

    if (staticItem) {
      return NextResponse.json({ success: true, data: staticItem, source: "static_seed" });
    }

    return NextResponse.json(
      { success: false, error: "Nuskha compound not found." },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error fetching nuskha detail:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch nuskha detail." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN, ROLES.EDITOR]);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      urduTitle,
      category,
      categoryLabel,
      shortDescription,
      fullDescription,
      traditionalPurpose,
      mizaj,
      dosageInstructions,
      howToPrepare,
      preparationType,
      preparationFee,
      discountPercentage,
      image,
      inStock,
      featured,
      rating,
      badge,
      benefits,
      warnings,
      hakimAdvice,
      ingredients,
    } = body;

    const existing = await prisma.nuskha.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Nuskha not found in database." },
        { status: 404 }
      );
    }

    // Update ingredients if provided
    if (ingredients && Array.isArray(ingredients)) {
      await prisma.nuskhaIngredient.deleteMany({ where: { nuskhaId: existing.id } });
      if (ingredients.length > 0) {
        await prisma.nuskhaIngredient.createMany({
          data: ingredients.map((ing: any, idx: number) => ({
            nuskhaId: existing.id,
            name: ing.name,
            urduName: ing.urduName || "",
            role: ing.role || null,
            unit: ing.unit || "grams",
            defaultQuantity: Number(ing.defaultQuantity) || 50,
            minQuantity: Number(ing.minQuantity) || 10,
            maxQuantity: Number(ing.maxQuantity) || 500,
            step: Number(ing.step) || 5,
            pricePerUnit: Number(ing.pricePerUnit) || 2.0,
            isOptional: Boolean(ing.isOptional),
            notes: ing.notes || null,
            orderIndex: idx,
          })),
        });
      }
    }

    const parsedBenefits =
      benefits !== undefined
        ? Array.isArray(benefits)
          ? JSON.stringify(benefits)
          : String(benefits)
        : undefined;
    const parsedWarnings =
      warnings !== undefined
        ? Array.isArray(warnings)
          ? JSON.stringify(warnings)
          : String(warnings)
        : undefined;

    const updated = await prisma.nuskha.update({
      where: { id: existing.id },
      data: {
        ...(title && { title }),
        ...(urduTitle !== undefined && { urduTitle }),
        ...(category && { category }),
        ...(categoryLabel && { categoryLabel }),
        ...(shortDescription !== undefined && { shortDescription }),
        ...(fullDescription !== undefined && { fullDescription }),
        ...(traditionalPurpose !== undefined && { traditionalPurpose }),
        ...(mizaj !== undefined && { mizaj }),
        ...(dosageInstructions !== undefined && { dosageInstructions }),
        ...(howToPrepare !== undefined && { howToPrepare }),
        ...(preparationType && { preparationType }),
        ...(preparationFee !== undefined && { preparationFee: Number(preparationFee) }),
        ...(discountPercentage !== undefined && {
          discountPercentage: discountPercentage ? Number(discountPercentage) : 0,
        }),
        ...(image && { image }),
        ...(inStock !== undefined && { inStock }),
        ...(featured !== undefined && { featured }),
        ...(rating !== undefined && { rating: Number(rating) }),
        ...(badge !== undefined && { badge }),
        ...(parsedBenefits !== undefined && { benefits: parsedBenefits }),
        ...(parsedWarnings !== undefined && { warnings: parsedWarnings }),
        ...(hakimAdvice !== undefined && { hakimAdvice }),
      },
      include: {
        ingredients: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Error updating nuskha:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update nuskha." },
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
    const existing = await prisma.nuskha.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Nuskha not found." },
        { status: 404 }
      );
    }

    await prisma.nuskha.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true, message: "Nuskha deleted successfully." });
  } catch (error) {
    console.error("Error deleting nuskha:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete nuskha." },
      { status: 500 }
    );
  }
}

function safeJsonParse(val: any, fallback: unknown) {
  if (!val) return fallback;
  if (typeof val !== "string") return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}
