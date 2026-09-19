import type { Metadata } from "next";
import React from "react";
import { CLINIC_INFO } from "@/app/data/products";

export const metadata: Metadata = {
  title: "Contact Us, Clinic Location & Hakim Timings",
  description:
    "Visit Matab Tameer-e-Sehat in Korangi Karachi or contact our Hakim directly via WhatsApp & phone. Monday to Saturday clinic hours, directions, and FAQs.",
  alternates: {
    canonical: "https://tameeresehat.com/contact",
  },
  openGraph: {
    title: "Contact Matab Tameer-e-Sehat | Herbal Clinic Karachi",
    description:
      "Get in touch with Tameer-e-Sehat clinic in Karachi. Physical clinic address, consultation helpline, WhatsApp support, and delivery assistance.",
    url: "https://tameeresehat.com/contact",
    siteName: "Tameer-e-Sehat",
    locale: "en_PK",
    type: "website",
    images: [
      {
        url: "/images/Natures-Pharmacy-Floral-Bottle-with-Herbs-and-Medicine.jpg",
        width: 1200,
        height: 630,
        alt: "Contact Matab Tameer-e-Sehat Karachi Clinic",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Matab Tameer-e-Sehat | Herbal Clinic Karachi",
    description:
      "Visit our clinic in Korangi Karachi or chat with our team on WhatsApp for herbal orders and consultation support.",
    images: ["/images/Natures-Pharmacy-Floral-Bottle-with-Herbs-and-Medicine.jpg"],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        name: "Contact Matab Tameer-e-Sehat",
        description:
          "Contact details, physical location, opening hours, and direct consultation channels for Matab Tameer-e-Sehat in Karachi.",
        url: "https://tameeresehat.com/contact",
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Can I visit your physical clinic in Karachi?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes! Our clinic is located at Plot no L, 41 Korangi Crossing Rd, Sector 31 B Korangi, Karachi. We welcome visitors Monday through Saturday from 10:00 AM to 9:00 PM.",
            },
          },
          {
            "@type": "Question",
            name: "How does the online consultation work for other cities?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "If you live in Lahore, Islamabad, Rawalpindi, Peshawar, Quetta, or any other city across Pakistan, simply fill out our short consultation form or message us on WhatsApp. Our Hakim will review your symptoms and advise you directly.",
            },
          },
          {
            "@type": "Question",
            name: "What are your delivery times and Cash on Delivery policy?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Karachi deliveries arrive within 24 to 48 hours. Orders to all other cities in Pakistan take 2 to 4 business days. You comfortably pay cash upon receiving your sealed parcel.",
            },
          },
          {
            "@type": "Question",
            name: "Are all remedies 100% pure and chemical-free?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, 100%. Tameer-e-Sehat has been preparing authentic herbal remedies since 1990. Our preserves, distillates, and oils are prepared in clean, small batches with zero steroids or chemicals.",
            },
          },
        ],
      },
      {
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
            name: "Contact Us",
            item: "https://tameeresehat.com/contact",
          },
        ],
      },
    ],
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
