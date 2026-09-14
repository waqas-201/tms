import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
        { name: { contains: q } },
        { urduName: { contains: q } },
        { shortDescription: { contains: q } },
        { benefits: { contains: q } },
        { categoryLabel: { contains: q } },
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
      { success: false, error: "Failed to fetch formulations." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Admin authorization check
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      slug,
      name,
      urduName,
      categoryId,
      categoryLabel,
      categoryUrdu,
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

    if (!slug || !name || !urduName || !categoryId || !price || !image) {
      return NextResponse.json(
        { success: false, error: "Missing required product fields." },
        { status: 400 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        slug,
        name,
        urduName,
        categoryId,
        categoryLabel: categoryLabel || categoryId,
        categoryUrdu: categoryUrdu || "",
        shortDescription: shortDescription || "",
        fullDescription: fullDescription || "",
        traditionalPurpose: traditionalPurpose || "",
        benefits: JSON.stringify(benefits || []),
        ingredients: JSON.stringify(ingredients || []),
        howToUse: howToUse || "",
        dosage: dosage || "",
        hakimAdvice: hakimAdvice || "",
        warnings: JSON.stringify(warnings || []),
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        discountPercentage: discountPercentage ? Number(discountPercentage) : null,
        image,
        inStock: inStock ?? true,
        featured: featured ?? false,
        rating: rating ? Number(rating) : 5.0,
        badge: badge || null,
        mizaj: mizaj || null,
        sizes: sizes && Array.isArray(sizes) ? {
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
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create formulation." },
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
