import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Herbal Remedies & Pure Natural Distillates Store",
  description:
    "Shop 100% natural Unani remedies: pure steam distillates (Arqiyat), small-batch herbal preserves (Murabbajaat), pain relief oils, and vitality teas across Pakistan.",
  alternates: {
    canonical: "https://tameeresehat.com/products",
  },
  openGraph: {
    title: "Herbal Remedies & Natural Apothecary Store | Tameer-e-Sehat",
    description:
      "Shop 100% natural Unani remedies: pure steam distillates (Arqiyat), small-batch herbal preserves (Murabbajaat), pain relief oils, and vitality teas.",
    url: "https://tameeresehat.com/products",
    siteName: "Tameer-e-Sehat",
    locale: "en_PK",
    type: "website",
    images: [
      {
        url: "/images/Natures-Pharmacy-Floral-Bottle-with-Herbs-and-Medicine.jpg",
        width: 1200,
        height: 630,
        alt: "Tameer-e-Sehat Herbal Store and Natural Apothecary",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Herbal Remedies & Natural Apothecary Store | Tameer-e-Sehat",
    description:
      "Pure steam distillates (Arqiyat), traditional preserves (Murabbajaat), and pain relief oils with nationwide Cash on Delivery in Pakistan.",
    images: ["/images/Natures-Pharmacy-Floral-Bottle-with-Herbs-and-Medicine.jpg"],
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Herbal Remedies & Pure Natural Distillates Store",
    description:
      "Shop 100% natural Unani remedies: pure steam distillates (Arqiyat), small-batch herbal preserves (Murabbajaat), pain relief oils, and vitality teas.",
    url: "https://tameeresehat.com/products",
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
          name: "Shop Remedies",
          item: "https://tameeresehat.com/products",
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
