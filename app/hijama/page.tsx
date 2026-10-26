import type { Metadata } from "next";
import HijamaLandingClient from "./HijamaLandingClient";
import { CLINIC_INFO } from "@/app/data/products";
import { SITE_URL } from "@/lib/site";


export const metadata: Metadata = {
  title: "Sunnah Hijama (Wet Cupping) — Classical Healing by Prophetic Tradition",
  description:
    "Sterile, physician-grade wet cupping administered by certified Hakeems & Hajjama practitioners in Karachi. 100% single-use sterile cups, segregated male & female wings, authentic 17th, 19th, 21st Sunnah timings.",
  keywords: [
    "Hijama Karachi",
    "Sunnah Cupping Pakistan",
    "Wet Cupping Karachi",
    "Female Hajjama Karachi",
    "Hijama Sunnah Days",
    "17 19 21 Islamic Month Cupping",
    "Tameer-e-Sehat Hijama",
    "Sterile Cupping Clinic",
    "Hijama for Migraine",
    "Hijama for Back Pain",
    "Tibb-e-Nabawi Karachi",
  ],
  alternates: {
    canonical: `${SITE_URL}/hijama`,
  },
  openGraph: {
    title:
      "Sunnah Hijama (Wet Cupping) — Classical Healing by Prophetic Tradition | Tameer-e-Sehat",
    description:
      "Sterile, physician-grade wet cupping administered by certified Hakeems & Hajjama practitioners in Karachi. 100% single-use sterile cups, segregated wings, authentic lunar Sunnah timings.",
    url: `${SITE_URL}/hijama`,
    siteName: "Tameer-e-Sehat",
    locale: "en_PK",
    type: "website",
    images: [
      {
        url: "/images/Natures-Pharmacy-Floral-Bottle-with-Herbs-and-Medicine.jpg",
        width: 1200,
        height: 630,
        alt: "Sunnah Hijama Wet Cupping Clinic Tameer-e-Sehat Karachi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sunnah Hijama (Wet Cupping) — Tameer-e-Sehat Karachi",
    description:
      "Physician-grade wet cupping in Karachi. Single-use sterile cups, segregated male & female wings, authentic Sunnah timings.",
    images: ["/images/Natures-Pharmacy-Floral-Bottle-with-Herbs-and-Medicine.jpg"],
  },
};

export default function HijamaPage() {
  const hijamaStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalProcedure",
        name: "Sunnah Hijama (Wet Cupping Therapy)",
        alternateName: "Wet Cupping Therapy",
        procedureType: "NonSurgicalProcedure",
        bodyLocation: ["Back", "Neck", "Head", "Shoulders", "Lower Extremities"],
        howPerformed:
          "Superficial micro-incisions with surgical blades combined with vacuum suction cups to extract cellular debris, oxidized metabolic waste, and relieve vascular stagnation in accordance with prophetic Sunnah timings.",
        relevantSpecialty: "TraditionalMedicine",
        offers: {
          "@type": "Offer",
          price: "2500",
          priceCurrency: "PKR",
          availability: "https://schema.org/InStock",
          validFrom: "2026-01-01",
        },
      },
      {
        "@type": "MedicalClinic",
        name: CLINIC_INFO.clinicName,
        url: `${SITE_URL}/hijama`,
        telephone: CLINIC_INFO.phoneFormatted,
        address: {
          "@type": "PostalAddress",
          streetAddress:
            "Plot no L, 41 Korangi Crossing Rd, K.D.A Allah Wala Town Sector 31 B Korangi",
          addressLocality: "Karachi",
          addressRegion: "Sindh",
          postalCode: "74900",
          addressCountry: "PK",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(hijamaStructuredData),
        }}
      />
      <HijamaLandingClient />
    </>
  );
}
