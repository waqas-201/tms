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
    <footer className="bg-brand-green-800 text-on-inverse border-t border-brand-green-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Feature Pillars Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-brand-green-900/80">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-brand-green-900 flex items-center justify-center text-brand-gold-500 shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                100% Pure Herbs
              </h4>
              <p className="text-xs text-on-inverse/90 mt-0.5">
                Authentic, clean herbs sourced fresh with zero chemical additives.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-brand-green-900 flex items-center justify-center text-brand-gold-500 shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                Experienced Hakeem
              </h4>
              <p className="text-xs text-on-inverse/90 mt-0.5">
                Formulated by qualified herbal practitioners with 35+ years of experience.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-brand-green-900 flex items-center justify-center text-brand-gold-500 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                Cash on Delivery
              </h4>
              <p className="text-xs text-on-inverse/90 mt-0.5">
                Fast courier delivery to Karachi, Lahore, Islamabad, and across Pakistan.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-brand-green-900 flex items-center justify-center text-brand-gold-500 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                Private & Confidential
              </h4>
              <p className="text-xs text-on-inverse/90 mt-0.5">
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
              aria-label="Tameer-e-Sehat Home"
              className="inline-flex items-center group"
            >
              <BrandLogo variant="footer" />
            </Link>

            <p className="text-xs text-on-inverse/90 leading-relaxed max-w-sm">
              Established in 1990 in Karachi, Tameer-e-Sehat is a trusted herbal clinic and remedy center. We use pure, natural herbs and time-tested recipes to provide honest, gentle remedies for you and your family.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  openConsultation({
                    mode: "WHATSAPP",
                    message: "Assalam-o-Alaikum Hakeem Sahib, I would like to seek herbal guidance regarding my health symptoms.",
                  })
                }
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-whatsapp hover:bg-whatsapp-hover text-on-whatsapp text-xs font-semibold rounded-md transition-colors shadow-xs cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  openConsultation({
                    mode: "WHATSAPP",
                    message: "Assalam-o-Alaikum Hakeem Sahib, I would like to book a free herbal consultation.",
                  })
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-green-900 hover:bg-brand-green-600 text-white text-xs font-semibold rounded-md transition-colors border border-brand-green-600 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-gold-300" />
                <span>Free Consultation</span>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-brand-gold-300 uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-on-inverse/90">
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
                <Link href="/hijama" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Sunnah Hijama (Cupping)</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-secondary text-ink font-bold">
                    Sunnah
                  </span>
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
            <h4 className="font-serif text-sm font-semibold text-brand-gold-300 uppercase tracking-wider">
              Categories
            </h4>
            <ul className="space-y-2 text-xs text-on-inverse/90">
              <li>
                <Link href="/products?category=murabbajaat" className="hover:text-white transition-colors">
                  Herbal Preserves (Murabba)
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
              <li className="pt-2 border-t border-brand-green-900/50">
                <Link href="/admin" className="text-brand-gold-300 hover:underline font-semibold">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Clinic & Contact Info */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-brand-gold-300 uppercase tracking-wider">
              Clinic & Store
            </h4>
            <div className="space-y-2.5 text-xs text-on-inverse/90">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-gold-300 shrink-0 mt-0.5" />
                <div>
                  <span>{CLINIC_INFO.address}</span>
                  <a
                    href={CLINIC_INFO.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-brand-gold-300 hover:underline font-semibold text-[11px] mt-0.5"
                  >
                    View on Google Maps (Matab Tameer-e-sehat) →
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-gold-300 shrink-0" />
                <a href={`tel:${CLINIC_INFO.phone}`} className="hover:text-white" dir="ltr">
                  {CLINIC_INFO.phoneFormatted}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-gold-300 shrink-0" />
                <a href={`mailto:${CLINIC_INFO.email}`} className="hover:text-white">
                  {CLINIC_INFO.email}
                </a>
              </div>
              <div className="flex items-start gap-2 pt-1 border-t border-brand-green-900/50">
                <Clock className="w-4 h-4 text-brand-gold-300 shrink-0 mt-0.5" />
                <div>
                  <p>{CLINIC_INFO.timings}</p>
                  <p className="text-brand-gold-300">{CLINIC_INFO.fridayTimings}</p>
                </div>
              </div>
              <div className="pt-1.5">
                <button
                  type="button"
                  onClick={() =>
                    openConsultation({
                      mode: "PHYSICAL",
                      message: "I would like to book an in-person consultation appointment at the Karachi clinic with Hakeem Tahir Hameed.",
                    })
                  }
                  className="inline-flex items-center gap-1.5 text-xs text-brand-gold-300 hover:text-brand-gold-200 font-semibold hover:underline cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Clinic Visit →</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright & Secondary Navigation */}
        <div className="pt-8 border-t border-brand-green-900/60">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-inverse/85 text-center sm:text-left">
            <p>
              &copy; {new Date().getFullYear()} {CLINIC_INFO.brandName}. All rights reserved. Registered Herbal Health Clinic, Karachi, Pakistan.
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-3 gap-y-1.5 text-on-inverse/90">
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
                Clinical Specialties
              </Link>
              <span>·</span>
              <Link href="/privacy-policy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <span>·</span>
              <Link href="/track-order" className="hover:text-white transition-colors">
                Track Order (COD)
              </Link>
              <span>·</span>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact & Visit
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
