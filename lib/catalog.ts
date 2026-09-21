import prisma from "@/lib/prisma";
import { getAvailableStock } from "@/lib/inventory";
import { Product, ProductSize } from "@/app/data/products";

function safeJsonParse<T>(val: any, fallback: T): T {
  if (Array.isArray(val) || (typeof val === "object" && val !== null)) {
    return val as T;
  }
  if (typeof val !== "string") return fallback;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

export function formatProductRecord(p: any): Product {
  const sizes: ProductSize[] = (p.sizes || []).map((s: any) => {
    const available = getAvailableStock(s);
    return {
      id: s.id,
      name: s.name,
      weight: s.weight,
      price: s.price,
      originalPrice: s.originalPrice || undefined,
      unitId: s.unitId,
      unit: s.unit ? { id: s.unit.id, code: s.unit.code, name: s.unit.name, kind: s.unit.kind } : null,
      quantityValue: s.quantityValue,
      sku: s.sku,
      stockOnHand: s.stockOnHand,
      stockReserved: s.stockReserved,
      available,
      lowStockThreshold: s.lowStockThreshold || 5,
      isActive: s.isActive ?? true,
    };
  });

  // Calculate live inStock flag based on sizes availability
  const hasLiveStock = sizes.length > 0 ? sizes.some((s) => (s.available ?? 0) > 0 && s.isActive) : p.inStock;

  // Parse multi-image gallery or single primary image
  let gallery: string[] = [];
  if (p.image) {
    if (typeof p.image === "string" && (p.image.startsWith("[") || p.image.startsWith("{"))) {
      try {
        const parsed = JSON.parse(p.image);
        if (Array.isArray(parsed)) {
          gallery = parsed.filter((img: any) => typeof img === "string" && img.trim().length > 0);
        }
      } catch {
        gallery = [];
      }
    }
    if (gallery.length === 0 && typeof p.image === "string" && p.image.trim()) {
      gallery = [p.image.trim()];
    }
  }
  const primaryImage = gallery[0] || (typeof p.image === "string" ? p.image : "") || "/images/placeholder.jpg";

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    urduName: p.urduName || "",
    category: p.categoryId as any,
    categoryLabel: p.categoryLabel || p.categoryId,
    categoryUrdu: p.categoryUrdu || "",
    shortDescription: p.shortDescription || "",
    fullDescription: p.fullDescription || "",
    traditionalPurpose: p.traditionalPurpose || "",
    benefits: safeJsonParse<string[]>(p.benefits, []),
    ingredients: safeJsonParse<{ name: string; urdu?: string; role: string }[]>(p.ingredients, []),
    howToUse: p.howToUse || "",
    dosage: p.dosage || "",
    hakimAdvice: p.hakimAdvice || "",
    warnings: safeJsonParse<string[]>(p.warnings, []),
    price: p.price,
    originalPrice: p.originalPrice || undefined,
    discountPercentage: p.discountPercentage || undefined,
    image: primaryImage,
    gallery,
    sizes,
    inStock: hasLiveStock,
    featured: p.featured ?? false,
    rating: p.rating ?? 5.0,
    reviewCount: p.reviewCount ?? 0,
    badge: p.badge || undefined,
    mizaj: p.mizaj || undefined,
  };
}

export async function getLiveCatalog(options: {
  category?: string;
  featured?: boolean;
  search?: string;
  sort?: string;
} = {}): Promise<Product[]> {
  const where: Record<string, unknown> = {};

  if (options.category && options.category !== "all") {
    where.categoryId = options.category;
  }

  if (options.featured) {
    where.featured = true;
  }

  if (options.search && options.search.trim()) {
    const q = options.search.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { shortDescription: { contains: q, mode: "insensitive" } },
      { benefits: { contains: q, mode: "insensitive" } },
      { categoryLabel: { contains: q, mode: "insensitive" } },
    ];
  }

  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (options.sort === "price-low") {
    orderBy = { price: "asc" };
  } else if (options.sort === "price-high") {
    orderBy = { price: "desc" };
  } else if (options.sort === "rating") {
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

  return products.map(formatProductRecord);
}

export async function getLiveProductBySlug(slug: string): Promise<Product | null> {
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
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

  if (!product) return null;
  return formatProductRecord(product);
}
