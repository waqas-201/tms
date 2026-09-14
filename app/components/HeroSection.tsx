"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { CLINIC_INFO } from "@/app/data/products";
import { useLanguage } from "@/app/context/LanguageContext";
import { Sparkles, ArrowRight, ShieldCheck, Award, MessageCircle } from "lucide-react";

export default function HeroSection() {
  const { t, isUrdu } = useLanguage();

  return (
    <section className="relative bg-[#faf8f5] border-b border-[#e6dfd5] overflow-hidden pt-8 pb-16 lg:py-24">
      {/* Subtle background ambient texture */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-[#123824]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-[#c59b27]/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left Column: Authority, Copy & CTAs (7 columns) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            {/* Heritage Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f4eee5] border border-[#e6dfd5] text-[#123824] text-xs font-medium tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#c59b27]" />
              <span className="font-serif italic font-semibold">{t("heroBadge")}</span>
              <span className="text-[#6a6660]">·</span>
              <span>{isUrdu ? "1990ء سے معتبر خدمت" : "Serving Pakistan Since 1990"}</span>
            </div>

            {/* Main Editorial Headline */}
            <div className="space-y-3">
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#123824] leading-[1.15] tracking-tight">
                {t("heroHeading")} <br />
                <span className="italic font-normal text-[#2a5a3d]">
                  {t("heroHeadingSub")}
                </span>
              </h1>
              <p className="font-urdu text-lg sm:text-xl text-[#c59b27] font-semibold leading-relaxed pt-1" dir="rtl">
                {t("heroUrduPoem")}
              </p>
            </div>

            {/* Paragraph / Value Proposition */}
            <p className="text-sm sm:text-base text-[#59534b] leading-relaxed max-w-xl">
              {t("heroSubtext")}
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Link
                href="/consultation"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#123824] hover:bg-[#0c2719] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-md transition-all shadow-md hover:shadow-lg group"
              >
                <Sparkles className="w-4 h-4 text-[#c59b27]" />
                <span>{t("bookConsultationBtn")}</span>
                <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${isUrdu ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
              </Link>

              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-[#f4eee5] text-[#123824] text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-md border border-[#e6dfd5] transition-all"
              >
                <span>{t("exploreApothecaryBtn")}</span>
              </Link>
            </div>

            {/* Quick Proof Metrics Row */}
            <div className="pt-6 border-t border-[#e6dfd5] grid grid-cols-3 gap-4 sm:gap-6">
              <div>
                <div className="text-xl sm:text-2xl font-serif font-bold text-[#123824]">
                  35+
                </div>
                <div className="text-[11px] sm:text-xs text-[#6a6660]">
                  {t("statExperience")}
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-serif font-bold text-[#123824]">
                  500+
                </div>
                <div className="text-[11px] sm:text-xs text-[#6a6660]">
                  {t("statFormulations")}
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-serif font-bold text-[#123824]">
                  100%
                </div>
                <div className="text-[11px] sm:text-xs text-[#6a6660]">
                  {isUrdu ? "کیمیکل سے پاک" : "Chemical & Steroid Free"}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Visual Showcase (5 columns) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Feature Image Container */}
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-[#f6f2ea]">
                <Image
                  src="/images/Natures-Pharmacy-Floral-Bottle-with-Herbs-and-Medicine.jpg"
                  alt="Tameer-e-Sehat Traditional Apothecary and Pure Botanicals"
                  fill
                  className="object-cover"
                  priority
                />

                {/* Gradient overlay on bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#123824]/80 via-transparent to-transparent" />

                {/* Floating Bottom Card */}
                <div className="absolute bottom-5 left-5 right-5 p-4 bg-white/95 backdrop-blur-xs rounded-xl border border-[#e6dfd5] shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#123824] text-[#c59b27] flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-[#123824] truncate">
                        {isUrdu ? "کراچی مطب و ڈسپنسری" : "Apothecary & Clinic · کراچی"}
                      </h4>
                      <p className="text-[11px] text-[#6a6660]">
                        {isUrdu ? "مستند یونانی فارماکوپیا کے تحت تیار کردہ" : "Formulated under classical Tibbi standards"}
                      </p>
                    </div>
                    <a
                      href={`https://wa.me/${CLINIC_INFO.whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-[#25D366] text-white rounded-full hover:bg-[#1EBE5D] transition-colors shadow-xs"
                      aria-label="Direct WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Floating Top Trust Badge */}
              <div className="animate-float absolute -top-4 -left-4 sm:-top-6 sm:-left-6 bg-[#123824] text-white p-3.5 rounded-xl shadow-xl border border-[#256644]/40 flex items-center gap-3 max-w-[200px]">
                <ShieldCheck className="w-7 h-7 text-[#c59b27] shrink-0" />
                <div className="text-[11px] leading-tight">
                  <span className="font-bold block text-white">{isUrdu ? "خالص معیار" : "Genuine Purity"}</span>
                  <span className="text-[#f4eee5]/80 text-[10px]">{isUrdu ? "سٹیرائیڈ سے پاک" : "No Synthetic Additives"}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
