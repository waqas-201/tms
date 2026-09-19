import type { Metadata } from "next";
import React from "react";
import { INITIAL_NUSKHAJAAT } from "@/app/data/nuskhajaat";

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const nuskha = INITIAL_NUSKHAJAAT.find((n) => n.slug === slug);

  if (!nuskha) {
    return {
      title: "Unani Compound Formula | Tameer-e-Sehat",
      description: "Authentic custom Unani herbal compound formulation prepared by Tameer-e-Sehat.",
    };
  }

  const title = `${nuskha.title} (${nuskha.urduTitle}) | Tameer-e-Sehat`;
  const description =
    nuskha.shortDescription ||
    `${nuskha.title} - Authentic Unani compound formulation for ${nuskha.traditionalPurpose || nuskha.categoryLabel}. Customized herbal compounding in Karachi, Pakistan.`;

  const canonicalUrl = `https://tameeresehat.com/nuskhajaat/${nuskha.slug}`;
  const imageUrl = nuskha.image.startsWith("http")
    ? nuskha.image
    : `https://tameeresehat.com${nuskha.image}`;

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
          alt: nuskha.title,
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

export default async function NuskhaDetailLayout({
  params,
  children,
}: Props) {
  const { slug } = await params;
  const nuskha = INITIAL_NUSKHAJAAT.find((n) => n.slug === slug);

  if (!nuskha) return <>{children}</>;

  const nuskhaUrl = `https://tameeresehat.com/nuskhajaat/${nuskha.slug}`;
  const imageUrl = nuskha.image.startsWith("http")
    ? nuskha.image
    : `https://tameeresehat.com${nuskha.image}`;

  // Estimate base price from ingredients
  const basePrice = nuskha.ingredients.reduce(
    (sum, ing) => sum + ing.defaultQuantity * ing.pricePerUnit,
    nuskha.preparationFee || 150
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${nuskha.title} (${nuskha.urduTitle})`,
    image: imageUrl,
    description: nuskha.shortDescription || nuskha.fullDescription,
    sku: nuskha.id,
    brand: {
      "@type": "Brand",
      name: "Tameer-e-Sehat",
    },
    offers: {
      "@type": "Offer",
      url: nuskhaUrl,
      priceCurrency: "PKR",
      price: basePrice,
      priceValidUntil: "2027-12-31",
      availability: nuskha.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Tameer-e-Sehat",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: nuskha.rating || 4.9,
      reviewCount: nuskha.reviewCount || 10,
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
        name: "Nuskhajaat",
        item: "https://tameeresehat.com/nuskhajaat",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: nuskha.title,
        item: nuskhaUrl,
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
