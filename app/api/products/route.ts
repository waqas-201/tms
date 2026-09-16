import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, ROLES } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const sort = searchParams.get("sort") || "featured";

    const where: Record<string, unknown> = {};

    if (category && category !== "all") {
      where.categoryId = category;
    }

    if (featured === "true") {
      where.featured = true;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { shortDescription: { contains: q, mode: "insensitive" } },
        { benefits: { contains: q, mode: "insensitive" } },
        { categoryLabel: { contains: q, mode: "insensitive" } },
      ];
    }

    let orderBy: Record<string, string> = { createdAt: "desc" };
    if (sort === "price-low") {
      orderBy = { price: "asc" };
    } else if (sort === "price-high") {
      orderBy = { price: "desc" };
    } else if (sort === "rating") {
      orderBy = { rating: "desc" };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        sizes: true,
      },
    });

    // Parse JSON fields safely for response
    const formatted = products.map((p) => ({
      ...p,
      benefits: safeJsonParse(p.benefits, []),
      ingredients: safeJsonParse(p.ingredients, []),
      warnings: safeJsonParse(p.warnings || "[]", []),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Both Admin and Editor can create new products in the catalog
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN, ROLES.EDITOR]);
    if (errorResponse) return errorResponse;

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

    if (!name || !categoryId || price === undefined || price === null || !image) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (Name, Category, Price, or Image)." },
        { status: 400 }
      );
    }

    // Auto-generate slug if missing
    let slug = body.slug;
    if (!slug || !slug.trim()) {
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    // Check if slug already exists; if so, append a timestamp suffix
    const existingSlug = await prisma.product.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    // Ensure category exists in DB (upsert if needed)
    const catId = categoryId.toLowerCase().replace(/\s+/g, "-");
    const catLabel = categoryLabel || categoryId;
    await prisma.category.upsert({
      where: { id: catId },
      update: { name: catLabel },
      create: {
        id: catId,
        slug: catId,
        name: catLabel,
        urduName: "",
        description: `${catLabel} remedies and herbal formulations.`,
        heroImage: image,
      },
    });

    const parsedBenefits = Array.isArray(benefits) ? JSON.stringify(benefits) : (typeof benefits === "string" ? benefits : "[]");
    const parsedIngredients = Array.isArray(ingredients) ? JSON.stringify(ingredients) : (typeof ingredients === "string" ? ingredients : "[]");
    const parsedWarnings = Array.isArray(warnings) ? JSON.stringify(warnings) : (typeof warnings === "string" ? warnings : "[]");

    const newProduct = await prisma.product.create({
      data: {
        slug,
        name,
        urduName: body.urduName || "",
        categoryId: catId,
        categoryLabel: catLabel,
        categoryUrdu: "",
        shortDescription: shortDescription || "",
        fullDescription: fullDescription || "",
        traditionalPurpose: traditionalPurpose || "",
        benefits: parsedBenefits,
        ingredients: parsedIngredients,
        howToUse: howToUse || "",
        dosage: dosage || "",
        hakimAdvice: hakimAdvice || "",
        warnings: parsedWarnings,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        discountPercentage: discountPercentage ? Number(discountPercentage) : null,
        image,
        inStock: inStock ?? true,
        featured: featured ?? false,
        rating: rating ? Number(rating) : 5.0,
        badge: badge || null,
        mizaj: mizaj || null,
        sizes: sizes && Array.isArray(sizes) && sizes.length > 0 ? {
          create: sizes.map((s: { name: string; weight: string; price: number; originalPrice?: number }) => ({
            name: s.name,
            weight: s.weight,
            price: Number(s.price),
            originalPrice: s.originalPrice ? Number(s.originalPrice) : null,
          })),
        } : undefined,
      },
      include: {
        sizes: true,
      },
    });

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create product." },
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
