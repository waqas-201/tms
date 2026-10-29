"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  MessageCircle,
  ShieldCheck,

  Calendar,
  Compass,
  Droplets,
  Flame,

  Star,

} from "lucide-react";
import { useConsultation } from "@/app/context/ConsultationContext";
import { PRODUCTS, CATEGORIES, TESTIMONIALS } from "@/app/data/products";

const APOTHECARY_PILLARS = [
  {
    icon: Droplets,
    title: "Steam-Distilled Arqiyat",
    urdu: "خالص عرق مقطر",
    desc: "100% steam distilled from wild herbs without artificial essence or color.",
  },
  {
    icon: Flame,
    title: "Raw Honey Murabbajaat",
    urdu: "روایتی مربہ جات",
    desc: "Organically simmered in pure unheated honey and natural cane syrups.",
  },
  {
    icon: Compass,
    title: "Cold-Pressed Liniments",
    urdu: "قدرتی روغنیات",
    desc: "Traditional pain-relief oils infused with whole bark and botanical roots.",
  },
  {
    icon: ShieldCheck,
    title: "Zero Synthetic Steroids",
    urdu: "کیمیکل اور اسٹیرائڈز سے پاک",
    desc: "Strictly unadulterated classical recipes followed since 1990 in Karachi.",
  },
];

export default function VariantB_ApothecaryDispensary() {
  const { openConsultation } = useConsultation();
  const [activeTab, setActiveTab] = useState<string>("all");

  const filteredProducts =
    activeTab === "all"
      ? PRODUCTS.slice(0, 8)
      : PRODUCTS.filter((p) => p.category === activeTab).slice(0, 8);

  const startConsultation = () => {
    openConsultation({
      mode: "WHATSAPP",
      message:
        "Assalam-o-Alaikum Hakeem Sahib, I am browsing your apothecary dispensary and would like personalized formulation advice for my health.",
    });
  };

  return (
    <div className="bg-sand-50 text-neutral-900 min-h-screen">
      {/* ─────────────────────────────────────────────────────────────
          1. DEEP HERITAGE APOTHECARY HERO
      ───────────────────────────────────────────────────────────── */}
      <section className="relative bg-brand-green-950 text-sand-50 pt-12 pb-20 md:pt-16 md:pb-24 border-b border-brand-green-800 overflow-hidden">
        {/* Ambient lighting & subtle grain */}
        <div className="pointer-events-none absolute -top-40 right-10 w-96 h-96 rounded-full bg-brand-green-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-10 w-80 h-80 rounded-full bg-brand-gold-500/15 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Heritage Seal */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-green-900 border border-brand-gold-500/30 text-brand-gold-300 text-xs font-semibold mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold-400" />
              <span>Classical Tibb-e-Unani • Established 1990 in Karachi</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.12]">
              Traditional Unani Healing &{" "}
              <span className="text-brand-gold-400 font-serif">Botanical Dispensary</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-sand-200/90 leading-relaxed max-w-2xl mx-auto">
              Pure steam-distilled Arqiyat, wildcrafted single botanicals, and honey-cooked
              preserves formulated under 35 years of classical apothecary heritage.
            </p>

            {/* Hero Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <a
                href="#dispensary-shelf"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-brand-gold-400 text-brand-green-950 font-bold text-sm sm:text-base hover:bg-brand-gold-500 transition-colors shadow-lg shadow-black/20"
              >
                Explore Herbal Dispensary
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={startConsultation}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-sand-50/40 text-sand-50 font-semibold text-sm sm:text-base hover:border-brand-gold-400 hover:text-brand-gold-300 transition-colors"
              >
                Ask Hakeem For Formulation Advice
              </button>
            </div>
          </div>

          {/* Quick Pillars Banner */}
          <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {APOTHECARY_PILLARS.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="bg-brand-green-900/60 backdrop-blur-sm border border-brand-green-700/50 p-4 rounded-2xl"
                >
                  <Icon className="w-5 h-5 text-brand-gold-400 mb-2" />
                  <h4 className="font-serif font-bold text-sm text-white">{p.title}</h4>
                  <p className="text-[11px] text-brand-gold-300/80 font-serif mb-1">{p.urdu}</p>
                  <p className="text-[11px] text-sand-200/70 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. THE APOTHECARY DISPENSARY SHELF (Primary Affordance)
      ───────────────────────────────────────────────────────────── */}
      <section id="dispensary-shelf" className="py-16 md:py-20 border-b border-sand-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-green-700">
                Apothecary Dispensary
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mt-1">
                Handcrafted Formulations & Pure Herbs
              </h2>
              <p className="text-neutral-600 text-xs sm:text-sm mt-1">
                Freshly prepared in small batches in our Karachi Matab. Cash on delivery nationwide.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === "all"
                    ? "bg-brand-green-700 text-white"
                    : "bg-white border border-sand-200 text-neutral-700 hover:border-brand-green-300"
                }`}
              >
                All Remedies
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveTab(cat.slug)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    activeTab === cat.slug
                      ? "bg-brand-green-700 text-white"
                      : "bg-white border border-sand-200 text-neutral-700 hover:border-brand-green-300"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-4 border border-sand-200 shadow-sm hover:shadow-md hover:border-brand-green-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-sand-100 mb-3 border border-sand-100">
                    <Image
                      src={p.image || "/images/products/8683_0_ajwain.jpg"}
                      alt={p.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-neutral-900/80 backdrop-blur-sm text-white text-[10px] font-semibold">
                      {p.category.toUpperCase()}
                    </div>
                  </div>

                  <h3 className="font-serif font-bold text-sm sm:text-base text-neutral-900 line-clamp-1">
                    {p.name}
                  </h3>
                  <p className="text-[11px] text-brand-green-700 font-serif mt-0.5 line-clamp-1">
                    {p.urduName || p.categoryLabel}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                    {p.shortDescription || p.categoryLabel}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-sand-100 flex items-center justify-between">
                  <span className="font-bold text-sm text-neutral-900">
                    Rs. {p.price.toLocaleString()}
                  </span>
                  <Link
                    href={`/products/${p.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-green-700 hover:text-brand-green-800"
                  >
                    View <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. TEMPERAMENT & FORMULATION GUIDANCE CARD
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white border-b border-sand-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-green-950 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10 max-w-2xl">
              <span className="inline-block px-3 py-1 rounded-full bg-brand-gold-500/20 text-brand-gold-300 border border-brand-gold-400/30 text-xs font-bold mb-3">
                Unsure What Your Mizaj (Temperament) Needs?
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
                Consult With Hakeem Tahir Hameed Before Selecting Remedies
              </h3>
              <p className="mt-3 text-sand-200 text-sm sm:text-base leading-relaxed">
                In Unani Tibb, an herb that soothes one individual can cause dryness in another.
                Speak directly with our chief practitioner to receive a precise, customized formulation.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => openConsultation({ mode: "WHATSAPP" })}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-gold-400 text-brand-green-950 font-bold text-sm hover:bg-brand-gold-500 transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat With Hakeem On WhatsApp
                </button>
                <Link
                  href="/consultation"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/30 text-white font-medium text-sm hover:bg-white/10 transition-colors"
                >
                  Learn About Online Consultation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. SUNNAH HIJAMA CLINICAL SPOTLIGHT
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-sand-50 border-b border-sand-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-green-700">
                Sunnah Detox & Therapy
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mt-1">
                Clinical Hijama (Wet Cupping) at Our Karachi Matab
              </h2>
              <p className="text-neutral-600 text-sm mt-3 leading-relaxed">
                Certified, hygienic cupping by licensed practitioners. We strictly adhere
                to prophetic Sunnah dates (17th, 19th, and 21st of the Islamic lunar calendar)
                utilizing 100% sterile, single-use vacuum equipment.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-white rounded-xl border border-sand-200">
                  <span className="font-bold text-brand-green-800 block">Single-Use Cups</span>
                  <span className="text-neutral-500">Completely sterile & discarded after use</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-sand-200">
                  <span className="font-bold text-brand-green-800 block">Sunnah Dates</span>
                  <span className="text-neutral-500">Lunar timing for maximal circulatory benefits</span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/hijama"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-green-700 text-white font-semibold text-sm hover:bg-brand-green-800 transition-colors shadow-sm"
                >
                  <Calendar className="w-4 h-4" />
                  View Hijama Calendar & Book Slot
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-sand-200 shadow-sm text-center">
              <div className="inline-block p-4 rounded-full bg-brand-green-100 text-brand-green-800 mb-3">
                <Calendar className="w-8 h-8" />
              </div>
              <h4 className="font-serif font-bold text-lg text-neutral-900">
                Next Sunnah Hijama Sessions
              </h4>
              <p className="text-xs text-neutral-600 mt-1">
                Slots fill quickly for upcoming 17th, 19th & 21st lunar dates.
              </p>
              <div className="mt-4 p-4 rounded-2xl bg-sand-50 border border-sand-200 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Location:</span>
                  <span className="font-semibold text-neutral-900">Korangi Crossing, Karachi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Standard Rate:</span>
                  <span className="font-semibold text-neutral-900">Rs. 250 / cup (min 5 cups)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Practitioners:</span>
                  <span className="font-semibold text-neutral-900">Certified Male & Female Staff</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. VERIFIED PATIENT EXPERIENCES
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-green-700">
            Real Patient Outcomes
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mt-1 mb-8">
            Trusted by 150,000+ Families Across Pakistan
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.id}
                className="p-6 rounded-2xl bg-sand-50/60 border border-sand-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-brand-gold-500 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-brand-gold-400 text-brand-gold-400" />
                    ))}
                  </div>
                  <p className="text-sm text-neutral-700 leading-relaxed italic">
                    &ldquo;{t.text}&rdquo;
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-sand-200/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-neutral-900">{t.name}</span>
                    <span className="text-neutral-500"> • {t.city}</span>
                  </div>
                  <span className="text-brand-green-700 font-medium">{t.concern}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
