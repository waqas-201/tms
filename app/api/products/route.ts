import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, ROLES } from "@/lib/rbac";
import { formatProductRecord } from "@/lib/catalog";

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
        sizes: {
          include: { unit: true },
          orderBy: { price: "asc" },
        },
      },
    });

    const formatted = products.map(formatProductRecord);

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
    const { session, errorResponse } = await requireRole(request, [ROLES.ADMIN, ROLES.EDITOR]);
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

    const parsedBenefits = Array.isArray(benefits)
      ? JSON.stringify(benefits)
      : typeof benefits === "string"
      ? benefits
      : "[]";
    const parsedIngredients = Array.isArray(ingredients)
      ? JSON.stringify(ingredients)
      : typeof ingredients === "string"
      ? ingredients
      : "[]";
    const parsedWarnings = Array.isArray(warnings)
      ? JSON.stringify(warnings)
      : typeof warnings === "string"
      ? warnings
      : "[]";

    // Derive display price from lowest size price if sizes are given
    let basePrice = Number(price);
    if (sizes && Array.isArray(sizes) && sizes.length > 0) {
      const minSizePrice = Math.min(...sizes.map((s: any) => Number(s.price) || basePrice));
      if (!isNaN(minSizePrice) && minSizePrice > 0) {
        basePrice = minSizePrice;
      }
    }

    const newProduct = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.create({
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
          price: basePrice,
          originalPrice: originalPrice ? Number(originalPrice) : null,
          discountPercentage: discountPercentage ? Number(discountPercentage) : null,
          image,
          inStock: inStock ?? true,
          featured: featured ?? false,
          rating: rating ? Number(rating) : 5.0,
          badge: badge || null,
          mizaj: mizaj || null,
        },
      });

      if (sizes && Array.isArray(sizes) && sizes.length > 0) {
        for (const s of sizes) {
          const initialQty = Math.max(0, Number(s.initialStock || s.stockOnHand || 0));
          const sku = s.sku || `${slug}-${(s.name || s.weight || "std").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

          const createdSize = await tx.productSize.create({
            data: {
              productId: prod.id,
              name: s.name || "Standard Pack",
              weight: s.weight || s.name || "Standard",
              price: Number(s.price) || basePrice,
              originalPrice: s.originalPrice ? Number(s.originalPrice) : null,
              unitId: s.unitId || null,
              quantityValue: s.quantityValue !== undefined && s.quantityValue !== null ? Number(s.quantityValue) : null,
              sku,
              stockOnHand: initialQty,
              stockReserved: 0,
              lowStockThreshold: Number(s.lowStockThreshold) || 5,
              isActive: s.isActive !== undefined ? Boolean(s.isActive) : true,
            },
          });

          if (initialQty > 0) {
            await tx.stockMovement.create({
              data: {
                productSizeId: createdSize.id,
                type: "RECEIVE",
                quantity: initialQty,
                onHandAfter: initialQty,
                reservedAfter: 0,
                reason: "Initial product creation stock",
                createdById: session?.user?.id || null,
              },
            });
          }
        }
      }

      return await tx.product.findUnique({
        where: { id: prod.id },
        include: {
          sizes: {
            include: { unit: true },
            orderBy: { price: "asc" },
          },
        },
      });
    });

    return NextResponse.json(
      { success: true, data: formatProductRecord(newProduct) },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create product." },
      { status: 500 }
    );
  }
}
