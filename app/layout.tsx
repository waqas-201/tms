import type { Metadata, Viewport } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/app/context/CartContext";
import { ConsultationProvider } from "@/app/context/ConsultationContext";
import SmoothScroll from "@/app/components/SmoothScroll";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";
import Toast from "@/app/components/Toast";
import ClientModals from "@/app/components/ClientModals";
import RouteFade from "@/app/components/motion/RouteFade";
import { CLINIC_INFO } from "@/app/data/products";
import { BRAND } from "@/lib/brand-colors";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tameeresehat.com"),
  title: {
    default: "Tameer-e-Sehat | Traditional Unani Medicine & Online Hakeem Consultation",
    template: "%s | Tameer-e-Sehat",
  },
  description:
    "Established in 1990 in Karachi, Pakistan. 35+ years of classical Tibbi wisdom, personalized Hakeem consultations, pure steam distillates (Arqiyat), and small-batch herbal preserves (Murabbajaat).",
  keywords: [
    "Tameer-e-Sehat",
    "Hakeem Karachi",
    "Unani Medicine Pakistan",
    "Online Hakeem Consultation",
    "Matab Tameer e Sehat",
    "Arq Makoh",
    "Arq Kasni",
    "Amla Murabba",
    "Tahiri Marham",
    "JointZen Pain Oil",
    "Herbal Medicine Pakistan",
    "Cash on Delivery Pakistan",
    "Tibb-e-Unani",
    "Natural Herbal Clinic Karachi",
  ],
  authors: [{ name: "Tameer-e-Sehat Traditional Healthcare" }],
  creator: "Tameer-e-Sehat",
  publisher: "Matab Tameer-e-sehat",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "Tameer-e-Sehat | Traditional Unani Medicine & Hakeem Consultation",
    description:
      "Bridging 35+ years of classical Eastern wisdom with modern purity. Pure steam distillates, artisanal herbal preserves, and confidential online consultations.",
    url: "https://tameeresehat.com",
    siteName: "Tameer-e-Sehat",
    locale: "en_PK",
    type: "website",
    images: [
      {
        url: "/images/Natures-Pharmacy-Floral-Bottle-with-Herbs-and-Medicine.jpg",
        width: 1200,
        height: 630,
        alt: "Tameer-e-Sehat Herbal Clinic & Natural Remedies Pakistan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tameer-e-Sehat | Traditional Unani Medicine & Hakeem Consultation",
    description:
      "Bridging 35+ years of classical Eastern wisdom with modern purity. Pure steam distillates, artisanal herbal preserves, and confidential online consultations in Karachi.",
    images: ["/images/Natures-Pharmacy-Floral-Bottle-with-Herbs-and-Medicine.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: BRAND.primary,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clinicStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["MedicalClinic", "LocalBusiness", "Pharmacy"],
        "@id": "https://tameeresehat.com/#clinic",
        name: CLINIC_INFO.clinicName,
        alternateName: "Tameer-e-Sehat Herbal Clinic & Apothecary",
        url: "https://tameeresehat.com",
        logo: "https://tameeresehat.com/images/cropped-logo.png",
        image: "https://tameeresehat.com/images/Natures-Pharmacy-Floral-Bottle-with-Herbs-and-Medicine.jpg",
        description:
          "Established in 1990 in Karachi, Pakistan. 35+ years of classical Tibbi wisdom, personalized Hakeem consultations, pure steam distillates (Arqiyat), and small-batch herbal preserves (Murabbajaat).",
        telephone: CLINIC_INFO.phoneFormatted,
        email: CLINIC_INFO.email,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Plot no L, 41 Korangi Crossing Rd, K.D.A Allah Wala Town Sector 31 B Korangi",
          addressLocality: "Karachi",
          addressRegion: "Sindh",
          postalCode: "74900",
          addressCountry: "PK",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 24.8387,
          longitude: 67.1208,
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Saturday"],
            opens: "10:00",
            closes: "21:00",
          },
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: "Friday",
            opens: "15:00",
            closes: "21:00",
          },
        ],
        medicalSpecialty: [
          "Gastroenterology",
          "HerbalMedicine",
          "Holistic",
        ],
        priceRange: "₨₨",
        currenciesAccepted: "PKR",
        paymentAccepted: "Cash on Delivery, Bank Transfer",
        hasMap: CLINIC_INFO.googleMapsUrl,
      },
      {
        "@type": "WebSite",
        "@id": "https://tameeresehat.com/#website",
        url: "https://tameeresehat.com",
        name: "Tameer-e-Sehat",
        publisher: {
          "@id": "https://tameeresehat.com/#clinic",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://tameeresehat.com/products?search={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${outfit.variable} ${playfair.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(clinicStructuredData) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface text-ink font-sans selection:bg-secondary/20 selection:text-primary">
        <CartProvider>
          <ConsultationProvider>
            <SmoothScroll>
              <Header />
              <main className="flex-1">
                <RouteFade>{children}</RouteFade>
              </main>
              <Footer />
              <WhatsAppFloat />
              <Toast />
              <ClientModals />
            </SmoothScroll>
          </ConsultationProvider>
        </CartProvider>
      </body>
    </html>
  );
}
