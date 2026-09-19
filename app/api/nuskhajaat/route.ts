import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, ROLES } from "@/lib/rbac";
import { INITIAL_NUSKHAJAAT, Nuskha } from "@/app/data/nuskhajaat";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const prepType = searchParams.get("preparationType");
    const sort = searchParams.get("sort") || "featured";

    let nuskhajaatFromDb: any[] = [];
    try {
      const where: Record<string, unknown> = {};

      if (category && category !== "all") {
        where.category = category;
      }

      if (featured === "true") {
        where.featured = true;
      }

      if (prepType && prepType !== "all") {
        where.preparationType = prepType;
      }

      if (search && search.trim()) {
        const q = search.trim();
        where.OR = [
          { title: { contains: q, mode: "insensitive" } },
          { urduTitle: { contains: q, mode: "insensitive" } },
          { shortDescription: { contains: q, mode: "insensitive" } },
          { fullDescription: { contains: q, mode: "insensitive" } },
          { categoryLabel: { contains: q, mode: "insensitive" } },
        ];
      }

      let orderBy: Record<string, string> = { createdAt: "desc" };
      if (sort === "rating") {
        orderBy = { rating: "desc" };
      }

      nuskhajaatFromDb = await prisma.nuskha.findMany({
        where,
        orderBy,
        include: {
          ingredients: {
            orderBy: { orderIndex: "asc" },
          },
        },
      });
    } catch (dbErr) {
      console.warn("Prisma Nuskha lookup fallback to static data:", dbErr);
      nuskhajaatFromDb = [];
    }

    if (nuskhajaatFromDb && nuskhajaatFromDb.length > 0) {
      const formatted = nuskhajaatFromDb.map((n) => ({
        ...n,
        benefits: safeJsonParse(n.benefits, []),
        warnings: safeJsonParse(n.warnings || "[]", []),
      }));
      return NextResponse.json({ success: true, data: formatted, source: "database" });
    }

    // Fallback to rich static dataset if DB has not been populated yet
    let filtered = [...INITIAL_NUSKHAJAAT];

    if (category && category !== "all") {
      filtered = filtered.filter((n) => n.category === category);
    }

    if (featured === "true") {
      filtered = filtered.filter((n) => n.featured);
    }

    if (prepType && prepType !== "all") {
      filtered = filtered.filter((n) => n.preparationType.toLowerCase() === prepType.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.urduTitle.includes(q) ||
          n.shortDescription.toLowerCase().includes(q) ||
          n.categoryLabel.toLowerCase().includes(q) ||
          n.ingredients.some((ing) => ing.name.toLowerCase().includes(q) || ing.urduName.includes(q))
      );
    }

    return NextResponse.json({ success: true, data: filtered, source: "static_seed" });
  } catch (error) {
    console.error("Error fetching nuskhajaat:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch nuskhajaat." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN, ROLES.EDITOR]);
    if (errorResponse) return errorResponse;

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

    if (!title || !category || !dosageInstructions || !image) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (Title, Category, Dosage, or Image)." },
        { status: 400 }
      );
    }

    let slug = body.slug;
    if (!slug || !slug.trim()) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    const existingSlug = await prisma.nuskha.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const parsedBenefits = Array.isArray(benefits)
      ? JSON.stringify(benefits)
      : typeof benefits === "string"
      ? benefits
      : "[]";
    const parsedWarnings = Array.isArray(warnings)
      ? JSON.stringify(warnings)
      : typeof warnings === "string"
      ? warnings
      : "[]";

    const newNuskha = await prisma.nuskha.create({
      data: {
        slug,
        title,
        urduTitle: urduTitle || "",
        category,
        categoryLabel: categoryLabel || category,
        shortDescription: shortDescription || "",
        fullDescription: fullDescription || "",
        traditionalPurpose: traditionalPurpose || "",
        mizaj: mizaj || null,
        dosageInstructions,
        howToPrepare: howToPrepare || "",
        preparationType: preparationType || "Safoof",
        preparationFee: preparationFee ? Number(preparationFee) : 120,
        discountPercentage: discountPercentage ? Number(discountPercentage) : 0,
        image,
        inStock: inStock ?? true,
        featured: featured ?? false,
        rating: rating ? Number(rating) : 5.0,
        badge: badge || null,
        benefits: parsedBenefits,
        warnings: parsedWarnings,
        hakimAdvice: hakimAdvice || null,
        ingredients:
          ingredients && Array.isArray(ingredients) && ingredients.length > 0
            ? {
                create: ingredients.map((ing: any, idx: number) => ({
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
              }
            : undefined,
      },
      include: {
        ingredients: true,
      },
    });

    return NextResponse.json({ success: true, data: newNuskha }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating nuskha:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create nuskha." },
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
