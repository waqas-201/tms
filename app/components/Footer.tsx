"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CLINIC_INFO } from "@/app/data/products";
import BrandLogo from "./BrandLogo";
import { useLenis } from "./SmoothScroll";
import { useConsultation } from "@/app/context/ConsultationContext";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  MessageCircle,
  Truck,
  Leaf,
  HeartHandshake,
  Sparkles,
  Calendar,
} from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  const lenis = useLenis();
  const { openConsultation } = useConsultation();

  const handleHomeClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <footer className="bg-[#22623a] text-[#f4eee5] border-t border-[#143e23] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Feature Pillars Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-[#143e23]/80">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#143e23] flex items-center justify-center text-[#c59b27] shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                100% Pure Herbs
              </h4>
              <p className="text-xs text-[#f4eee5]/70 mt-0.5">
                Authentic, clean herbs sourced fresh with zero chemical additives.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#143e23] flex items-center justify-center text-[#c59b27] shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                Experienced Hakim
              </h4>
              <p className="text-xs text-[#f4eee5]/70 mt-0.5">
                Formulated by qualified herbal practitioners with 35+ years of experience.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#143e23] flex items-center justify-center text-[#c59b27] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                Cash on Delivery
              </h4>
              <p className="text-xs text-[#f4eee5]/70 mt-0.5">
                Fast courier delivery to Karachi, Lahore, Islamabad, and across Pakistan.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#143e23] flex items-center justify-center text-[#c59b27] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                Private & Confidential
              </h4>
              <p className="text-xs text-[#f4eee5]/70 mt-0.5">
                Friendly, private advice focused on your personal health and symptoms.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col (2 spans) */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              onClick={handleHomeClick}
              className="inline-flex items-center group"
              aria-label="Tameer-e-Sehat Home"
            >
              <BrandLogo variant="footer" />
            </Link>

            <p className="text-xs text-[#f4eee5]/80 leading-relaxed max-w-sm">
              Established in 1990 in Karachi, Tameer-e-Sehat is a trusted herbal clinic and remedy center. We use pure, natural herbs and time-tested recipes to provide honest, gentle remedies for you and your family.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  openConsultation({
                    mode: "WHATSAPP",
                    message: "Assalam-o-Alaikum Hakim Sahib, I would like to seek herbal guidance regarding my health symptoms.",
                  })
                }
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold rounded-md transition-colors shadow-xs cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  openConsultation({
                    mode: "WHATSAPP",
                    message: "Assalam-o-Alaikum Hakim Sahib, I would like to book a free herbal consultation.",
                  })
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#143e23] hover:bg-[#2d7648] text-white text-xs font-semibold rounded-md transition-colors border border-[#2d7648] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>Free Consultation</span>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-[#c59b27] uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-[#f4eee5]/80">
              <li>
                <Link
                  href="/"
                  onClick={handleHomeClick}
                  className="hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/consultation"
                  onClick={(e) => {
                    e.preventDefault();
                    openConsultation({ mode: "WHATSAPP" });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Online Consultation
                </Link>
              </li>
              <li>
                <Link href="/specialties" className="hover:text-white transition-colors">
                  Clinical Specialties
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Shop Remedies
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Clinic
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact & Visit
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-white transition-colors">
                  Track Order (COD)
                </Link>
              </li>
            </ul>
          </div>

          {/* Formulations / Categories */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-[#c59b27] uppercase tracking-wider">
              Categories
            </h4>
            <ul className="space-y-2 text-xs text-[#f4eee5]/80">
              <li>
                <Link href="/products?category=murabbajaat" className="hover:text-white transition-colors">
                  Herbal Preserves (Murabba)
                </Link>
              </li>
              <li>
                <Link href="/products?category=arqiyat" className="hover:text-white transition-colors">
                  Pure Herbal Waters (Arq)
                </Link>
              </li>
              <li>
                <Link href="/products?category=oils-marham" className="hover:text-white transition-colors">
                  Pain Relief Oils & Balms
                </Link>
              </li>
              <li>
                <Link href="/products?category=herbs-seeds" className="hover:text-white transition-colors">
                  Whole Herbs & Seeds
                </Link>
              </li>
              <li>
                <Link href="/products?category=teas-vitality" className="hover:text-white transition-colors">
                  Wellness Teas & Energy Mixes
                </Link>
              </li>
              <li className="pt-2 border-t border-[#143e23]/50">
                <Link href="/admin" className="text-[#c59b27] hover:underline font-semibold">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Clinic & Contact Info */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-[#c59b27] uppercase tracking-wider">
              Clinic & Store
            </h4>
            <div className="space-y-2.5 text-xs text-[#f4eee5]/80">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#c59b27] shrink-0 mt-0.5" />
                <div>
                  <span>{CLINIC_INFO.address}</span>
                  <a
                    href={CLINIC_INFO.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-[#c59b27] hover:underline font-semibold text-[11px] mt-0.5"
                  >
                    View on Google Maps (Matab Tameer-e-sehat) →
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#c59b27] shrink-0" />
                <a href={`tel:${CLINIC_INFO.phone}`} className="hover:text-white" dir="ltr">
                  {CLINIC_INFO.phoneFormatted}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#c59b27] shrink-0" />
                <a href={`mailto:${CLINIC_INFO.email}`} className="hover:text-white">
                  {CLINIC_INFO.email}
                </a>
              </div>
              <div className="flex items-start gap-2 pt-1 border-t border-[#143e23]/50">
                <Clock className="w-4 h-4 text-[#c59b27] shrink-0 mt-0.5" />
                <div>
                  <p>{CLINIC_INFO.timings}</p>
                  <p className="text-[#c59b27]">{CLINIC_INFO.fridayTimings}</p>
                </div>
              </div>
              <div className="pt-1.5">
                <button
                  type="button"
                  onClick={() =>
                    openConsultation({
                      mode: "PHYSICAL",
                      message: "I would like to book an in-person consultation appointment at the Karachi clinic with Hakim Muhammad Tariq.",
                    })
                  }
                  className="inline-flex items-center gap-1.5 text-xs text-[#c59b27] hover:text-[#e5c05d] font-semibold hover:underline cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Clinic Visit →</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Safety & Legal Disclaimer */}
        <div className="pt-8 border-t border-[#143e23]/60 space-y-3 text-[11px] text-[#f4eee5]/60 leading-relaxed">
          <p>
            <strong className="text-[#c59b27]">Important Health Notice:</strong> Our natural remedies and advice are based on traditional herbal medicine. They are designed to support your daily wellness, digestion, and natural body strength. If you have a severe medical emergency or are pregnant, please consult your doctor. Keep all natural remedies in a cool, dry place away from direct sunlight.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#143e23]/40 text-xs">
            <p>
              &copy; {new Date().getFullYear()} {CLINIC_INFO.brandName}. All rights reserved. Registered Herbal Health Clinic, Karachi, Pakistan.
            </p>
            <div className="flex items-center gap-4 text-[#f4eee5]/70">
              <Link
                href="/consultation"
                onClick={(e) => {
                  e.preventDefault();
                  openConsultation({ mode: "WHATSAPP" });
                }}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Consultation Help
              </Link>
              <span>·</span>
              <Link href="/specialties" className="hover:text-white transition-colors">
                Specialties
              </Link>
              <span>·</span>
              <Link href="/track-order" className="hover:text-white transition-colors">
                Track Order
              </Link>
              <span>·</span>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact & Support
              </Link>
              <span>·</span>
              <Link href="/login" className="hover:text-white transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
