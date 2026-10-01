import type { Metadata } from "next";
import React from "react";
import prisma from "@/lib/prisma";

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

async function getProductBySlugOrId(slug: string) {
  try {
    return await prisma.product.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
      include: {
        sizes: true,
      },
    });
  } catch (error) {
    console.error("Error fetching product for layout metadata:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlugOrId(slug);

  if (!product) {
    return {
      title: "Herbal Remedy | Tameer-e-Sehat",
      description: "Pure Unani herbal remedy prepared by Tameer-e-Sehat.",
    };
  }

  const title = `${product.name} | Tameer-e-Sehat`;
  const description =
    product.shortDescription ||
    `${product.name} - 100% natural Unani formulation for ${product.traditionalPurpose || "holistic wellness"}. Handcrafted in Karachi, Pakistan.`;

  const canonicalUrl = `https://tameeresehat.com/products/${product.slug}`;
  let primaryImage = product.image;
  try {
    if (primaryImage.startsWith("[")) {
      const parsed = JSON.parse(primaryImage);
      if (Array.isArray(parsed) && parsed.length > 0) primaryImage = parsed[0];
    }
  } catch {}

  const imageUrl = primaryImage.startsWith("http")
    ? primaryImage
    : `https://tameeresehat.com${primaryImage}`;

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
  const product = await getProductBySlugOrId(slug);

  if (!product) return <>{children}</>;

  const productUrl = `https://tameeresehat.com/products/${product.slug}`;
  let primaryImage = product.image;
  try {
    if (primaryImage.startsWith("[")) {
      const parsed = JSON.parse(primaryImage);
      if (Array.isArray(parsed) && parsed.length > 0) primaryImage = parsed[0];
    }
  } catch {}

  const imageUrl = primaryImage.startsWith("http")
    ? primaryImage
    : `https://tameeresehat.com${primaryImage}`;

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
      ratingValue: product.rating || 5.0,
      reviewCount: product.reviewCount || 1,
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
