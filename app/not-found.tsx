import type { Metadata } from "next";
import Link from "next/link";
import {
  Search,
  Package,
  Calendar,
  Sparkles,
  PhoneCall,
  MapPin,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { CLINIC_INFO } from "@/app/data/products";

export const metadata: Metadata = {
  title: "Page Not Found (404) | Matab Tameer-e-Sehat",
  description:
    "The requested herbal remedy or page could not be found. Search our natural dispensary or connect with our Karachi clinic.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  const quickLinks = [
    {
      title: "Herbal Remedies",
      description: "Browse 100% natural Unani Arqiyat, Murabbajaat & vital herbs.",
      href: "/products",
      icon: Package,
      badge: "Dispensary",
    },
    {
      title: "Online Consultation",
      description: "Book a personalized clinical session with Hakeem Sahib.",
      href: "/consultation",
      icon: Calendar,
      badge: "Clinical Care",
    },
    {
      title: "Sunnah Hijama Cupping",
      description: "Certified clinical cupping with single-use sterile kits.",
      href: "/hijama",
      icon: Sparkles,
      badge: "Sunnah Days",
    },
    {
      title: "Clinics & Contact",
      description: "Visit our clinics in Karachi & Rawalpindi or view timings.",
      href: "/contact",
      icon: MapPin,
      badge: "Our Clinics",
    },
  ];

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-surface">
      <div className="max-w-3xl w-full text-center space-y-8">
        {/* Badge & Notice */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-line text-xs font-semibold text-primary">
          <ShieldAlert className="w-4 h-4 text-brand-gold-600" />
          <span>Error 404 &bull; صفحہ دستیاب نہیں ہے</span>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary">
            Looking for a Specific Remedy?
          </h1>
          <p className="text-sm sm:text-base text-ink-muted max-w-xl mx-auto leading-relaxed">
            The page or legacy link you followed may have moved or been updated during our catalog modernization. Use the search bar below or explore our core departments.
          </p>
        </div>

        {/* Search Bar */}
        <form
          action="/products"
          method="GET"
          className="max-w-lg mx-auto relative flex items-center"
        >
          <Search className="absolute left-4 w-5 h-5 text-ink-muted pointer-events-none" />
          <input
            type="text"
            name="search"
            placeholder="Search remedies (e.g. Arq Gulab, Murabba Baans, Roghan)..."
            className="w-full pl-12 pr-28 py-3.5 bg-white rounded-xl border border-line text-ink text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 px-4 py-2 bg-primary hover:bg-brand-green-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-4">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group p-5 rounded-2xl bg-white border border-line hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2 rounded-xl bg-surface border border-line text-primary group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="text-[11px] font-semibold text-brand-gold-600 uppercase tracking-wider">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="font-serif text-base font-bold text-primary group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-ink-body mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="mt-4 flex items-center text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
                  <span>Visit section</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Urgent Helpline / WhatsApp Escapement */}
        <div className="p-4 rounded-xl bg-white border border-line flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-body">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-primary shrink-0" />
            <span>Need immediate guidance on finding an unlisted herbal formulation?</span>
          </div>
          <a
            href={`https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent("Assalam-o-Alaikum, I am looking for a remedy on Tameer-e-Sehat that I could not find:")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-semibold hover:underline inline-flex items-center gap-1 shrink-0"
          >
            WhatsApp Hakeem Sahib &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
