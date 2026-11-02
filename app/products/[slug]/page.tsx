import { notFound } from "next/navigation";
import { getLiveProductBySlug, getLiveCatalog, getAllProductSlugs } from "@/lib/catalog";
import ProductDetailClient from "./ProductDetailClient";

export const revalidate = 3600; // 1-hour ISR
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getLiveProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const catalog = await getLiveCatalog();

  return (
    <ProductDetailClient
      initialProduct={product}
      initialCatalog={catalog}
    />
  );
}
