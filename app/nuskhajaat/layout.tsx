import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Authentic Unani Nuskhajaat & Custom Herbal Compounding",
  description:
    "Order authentic Unani compound formulas (Nuskhajaat) or customize individual herbs, gram weights, and preparation formats. Freshly compounded in Karachi, Pakistan.",
  alternates: {
    canonical: "https://tameeresehat.com/nuskhajaat",
  },
  openGraph: {
    title: "Authentic Unani Nuskhajaat & Custom Compounding | Tameer-e-Sehat",
    description:
      "Order authentic Unani compound formulas (Nuskhajaat) or customize individual herbs and gram weights. Freshly compounded in Karachi.",
    url: "https://tameeresehat.com/nuskhajaat",
    siteName: "Tameer-e-Sehat",
    locale: "en_PK",
    type: "website",
    images: [
      {
        url: "/images/Natures-Pharmacy-Floral-Bottle-with-Herbs-and-Medicine.jpg",
        width: 1200,
        height: 630,
        alt: "Classical Unani Nuskhajaat Compounding Pakistan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Authentic Unani Nuskhajaat & Custom Compounding | Tameer-e-Sehat",
    description:
      "Traditional Unani compound remedies crafted from whole medicinal herbs. Customized grams, freshly ground Safoof, and honey-based Majun.",
    images: ["/images/Natures-Pharmacy-Floral-Bottle-with-Herbs-and-Medicine.jpg"],
  },
};

export default function NuskhajaatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Authentic Unani Nuskhajaat & Custom Compounding",
    description:
      "Explore authentic Unani compound formulas (Nuskhajaat) or customize individual herbs, exact gram weights, and preparation formats.",
    url: "https://tameeresehat.com/nuskhajaat",
    isPartOf: {
      "@type": "WebSite",
      name: "Tameer-e-Sehat",
      url: "https://tameeresehat.com",
    },
    breadcrumb: {
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
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
