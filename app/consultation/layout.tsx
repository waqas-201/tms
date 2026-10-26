import type { Metadata } from "next";
import React from "react";
import { CLINIC_INFO } from "@/app/data/products";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Online Hakeem Consultation & Personalized Herbal Care",
  description:
    "Book a confidential online Tibbi consultation with our experienced Hakeem in Karachi. Receive personalized herbal regimens, dietary advice, and custom compound formulations.",
  alternates: {
    canonical: `${SITE_URL}/consultation`,
  },
  openGraph: {
    title: "Online Hakeem Consultation & Herbal Guidance | Tameer-e-Sehat",
    description:
      "Consult directly with our experienced Hakeem (35+ years of Unani practice). Receive a tailored treatment dossier, herbal remedies, and lifestyle plan.",
    url: `${SITE_URL}/consultation`,
    siteName: "Tameer-e-Sehat",
    locale: "en_PK",
    type: "website",
    images: [
      {
        url: "/images/Natures-Pharmacy-Floral-Bottle-with-Herbs-and-Medicine.jpg",
        width: 1200,
        height: 630,
        alt: "Online Hakeem Consultation Tameer-e-Sehat Karachi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Hakeem Consultation & Herbal Guidance | Tameer-e-Sehat",
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
    name: "Online Hakeem Consultation & Personalized Herbal Care",
    description:
      "Book a confidential online Tibbi consultation with our experienced Hakeem in Karachi. Receive personalized herbal regimens and dietary advice.",
    url: `${SITE_URL}/consultation`,
    isPartOf: {
      "@type": "WebSite",
      name: "Tameer-e-Sehat",
      url: SITE_URL,
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
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Consultation",
          item: `${SITE_URL}/consultation`,
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
