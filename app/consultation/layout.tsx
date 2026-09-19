import type { Metadata } from "next";
import React from "react";
import { CLINIC_INFO } from "@/app/data/products";

export const metadata: Metadata = {
  title: "Online Hakim Consultation & Personalized Herbal Care",
  description:
    "Book a confidential online Tibbi consultation with our experienced Hakim in Karachi. Receive personalized herbal regimens, dietary advice, and custom compound formulations.",
  alternates: {
    canonical: "https://tameeresehat.com/consultation",
  },
  openGraph: {
    title: "Online Hakim Consultation & Herbal Guidance | Tameer-e-Sehat",
    description:
      "Consult directly with our experienced Hakim (35+ years of Unani practice). Receive a tailored treatment dossier, herbal remedies, and lifestyle plan.",
    url: "https://tameeresehat.com/consultation",
    siteName: "Tameer-e-Sehat",
    locale: "en_PK",
    type: "website",
    images: [
      {
        url: "/images/Natures-Pharmacy-Floral-Bottle-with-Herbs-and-Medicine.jpg",
        width: 1200,
        height: 630,
        alt: "Online Hakim Consultation Tameer-e-Sehat Karachi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Hakim Consultation & Herbal Guidance | Tameer-e-Sehat",
    description:
      "Confidential herbal health consultations for digestive, joint, vitality, and metabolic health. Direct WhatsApp support across Pakistan.",
    images: ["/images/Natures-Pharmacy-Floral-Bottle-with-Herbs-and-Medicine.jpg"],
  },
};

export default function ConsultationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: "Online Hakim Consultation & Personalized Herbal Care",
    description:
      "Book a confidential online Tibbi consultation with our experienced Hakim in Karachi. Receive personalized herbal regimens and dietary advice.",
    url: "https://tameeresehat.com/consultation",
    isPartOf: {
      "@type": "WebSite",
      name: "Tameer-e-Sehat",
      url: "https://tameeresehat.com",
    },
    about: {
      "@type": "MedicalClinic",
      name: CLINIC_INFO.clinicName,
      telephone: CLINIC_INFO.phoneFormatted,
      address: {
        "@type": "PostalAddress",
        streetAddress: CLINIC_INFO.address,
        addressLocality: CLINIC_INFO.city,
        addressCountry: "PK",
      },
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
          name: "Consultation",
          item: "https://tameeresehat.com/consultation",
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
