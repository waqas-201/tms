import type { Metadata, Viewport } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/app/context/CartContext";
import { LanguageProvider } from "@/app/context/LanguageContext";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import CartDrawer from "@/app/components/CartDrawer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";
import Toast from "@/app/components/Toast";

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
  title: {
    default: "Tameer-e-Sehat | Traditional Unani Medicine & Online Hakim Consultation",
    template: "%s | Tameer-e-Sehat",
  },
  description:
    "Established in 1990 in Karachi, Pakistan. 35+ years of classical Tibbi wisdom, personalized Hakim consultations, pure steam distillates (Arqiyat), and small-batch herbal preserves (Murabbajaat).",
  keywords: [
    "Tameer-e-Sehat",
    "Hakim Karachi",
    "Unani Medicine Pakistan",
    "Online Hakim Consultation",
    "Arq Makoh",
    "Arq Kasni",
    "Amla Murabba",
    "Tahiri Marham",
    "JointZen Pain Oil",
    "Herbal Medicine Pakistan",
    "Cash on Delivery Pakistan",
    "Tibb-e-Unani",
    "تعمیرِ صحت",
    "حکیم",
  ],
  authors: [{ name: "Tameer-e-Sehat Traditional Healthcare" }],
  openGraph: {
    title: "Tameer-e-Sehat | Traditional Unani Medicine & Hakim Consultation",
    description:
      "Bridging 35+ years of classical Eastern wisdom with modern purity. Pure steam distillates, artisanal herbal preserves, and confidential online consultations.",
    url: "https://tameeresehat.com",
    siteName: "Tameer-e-Sehat",
    locale: "en_PK",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#123824",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${playfair.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-[#faf8f5] text-[#1e1c19] font-sans selection:bg-[#c59b27]/20 selection:text-[#123824]">
        <LanguageProvider>
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
            <WhatsAppFloat />
            <Toast />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
