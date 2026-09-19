import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Saved Remedies & Wishlist | Tameer-e-Sehat Herbal Healthcare",
  description:
    "View and manage your saved Unani herbs, natural syrups, therapeutic oils, and compound nuskhajaat. Order via Cash on Delivery or consult Hakim on WhatsApp.",
  alternates: {
    canonical: "https://tameeresehat.com/wishlist",
  },
  openGraph: {
    title: "Saved Remedies & Personal Apothecary Wishlist | Tameer-e-Sehat",
    description:
      "Review your curated herbal health remedies. Direct nationwide Cash on Delivery and WhatsApp consultation support across Pakistan.",
    url: "https://tameeresehat.com/wishlist",
    siteName: "Tameer-e-Sehat",
    locale: "en_PK",
    type: "website",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
