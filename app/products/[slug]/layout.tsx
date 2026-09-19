import type { Metadata } from "next";
import React from "react";
import { PRODUCTS } from "@/app/data/products";

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    return {
      title: "Herbal Remedy | Tameer-e-Sehat",
      description: "Pure Unani herbal remedy prepared by Tameer-e-Sehat.",
    };
  }

  const title = `${product.name} | Tameer-e-Sehat`;
  const description =
    product.shortDescription ||
    `${product.name} - 100% natural Unani formulation for ${product.traditionalPurpose}. Handcrafted in Karachi, Pakistan.`;

  const canonicalUrl = `https://tameeresehat.com/products/${product.slug}`;
  const imageUrl = product.image.startsWith("http")
    ? product.image
    : `https://tameeresehat.com${product.image}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Tameer-e-Sehat",
      locale: "en_PK",
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductDetailLayout({
  params,
  children,
}: Props) {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);

  if (!product) return <>{children}</>;

  const productUrl = `https://tameeresehat.com/products/${product.slug}`;
  const imageUrl = product.image.startsWith("http")
    ? product.image
    : `https://tameeresehat.com${product.image}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: imageUrl,
    description: product.shortDescription || product.fullDescription,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: "Tameer-e-Sehat",
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "PKR",
      price: product.price,
      priceValidUntil: "2027-12-31",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Tameer-e-Sehat",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating || 4.9,
      reviewCount: product.reviewCount || 15,
      bestRating: "5",
      worstRating: "1",
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://tameeresehat.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop Remedies",
        item: "https://tameeresehat.com/products",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {children}
    </>
  );
}
