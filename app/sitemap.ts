import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { PRODUCTS } from "@/app/data/products";
import { SITE_URL } from "@/lib/site";

// Crawlers usually arrive on a cold serverless function, and this sitemap was
// being rebuilt from the database on every fetch — one fetch took 51 seconds
// and Search Console recorded "Couldn't fetch". Prerendering it and refreshing
// in the background means a fetch is answered from the CDN, and a slow or
// unreachable database can never fail the response.
export const revalidate = 3600;

// Public pages with real content. Auth, checkout, account and wishlist screens
// are absent by design, and so are the ?category= / ?page= filter views: they
// canonicalise to /products, so listing them here would only invite duplicates.
const STATIC_PATHS = [
  "",
  "/products",
  "/specialties",
  "/hijama",
  "/consultation",
  "/about",
  "/contact",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
  }));

  return [...staticRoutes, ...(await productRoutes())];
}

async function productRoutes(): Promise<MetadataRoute.Sitemap> {
  try {
    const products = await prisma.product.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    if (products.length > 0) {
      return products.map((product) => ({
        url: `${SITE_URL}/products/${product.slug}`,
        // A real edit timestamp. Google discards lastmod values that only ever
        // reflect the moment of the request, so nothing here is invented.
        lastModified: product.updatedAt,
      }));
    }
  } catch (error) {
    // A build or revalidation must never fail because Postgres is unavailable;
    // the static catalogue keeps the sitemap complete until the next cycle.
    console.error("Sitemap: database unavailable, using static catalogue", error);
  }

  return PRODUCTS.map((product) => ({
    url: `${SITE_URL}/products/${product.slug}`,
  }));
}
