"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MessageCircle,
  Phone,
  Clock,
  MapPin,

  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Stethoscope,


  ExternalLink,


} from "lucide-react";
import { useConsultation } from "@/app/context/ConsultationContext";
import { CLINIC_INFO, PRODUCTS } from "@/app/data/products";

const QUICK_WHATSAPP_QUESTIONS = [
  {
    label: "Stomach, Acid & Gas Problem",
    query: "Assalam-o-Alaikum, I need consultation regarding persistent stomach acidity and gas issues.",
  },
  {
    label: "Joint & Knee Pain Guidance",
    query: "Assalam-o-Alaikum, I would like guidance on remedies for knee joint pain and backache.",
  },
  {
    label: "Hijama Therapy Booking",
    query: "Assalam-o-Alaikum, I would like to book a Sunnah Hijama appointment at your Karachi clinic.",
  },
  {
    label: "Delivery & Remedy Inquiry",
    query: "Assalam-o-Alaikum, I want to inquire about availability and delivery of pure Unani herbal remedies.",
  },
];

const HUB_SERVICES = [
  {
    id: "consultation",
    title: "Online Hakeem Consultation",
    badge: "Available Nationwide",
    summary: "Personalized remote pulse & symptom evaluation with chief practitioner Hakeem Tahir Hameed.",
    features: [
      "Consult via WhatsApp video or phone call",
      "Custom herbal remedies prescribed for your Mizaj",
      "Doorstep delivery with Cash on Delivery nationwide",
      "Free follow-up check-in after 14 days",
    ],
    ctaText: "Start Online Consultation",
    ctaMode: "consultation",
  },
  {
    id: "hijama",
    title: "Sunnah Hijama Therapy Clinic",
    badge: "Karachi Matab",
    summary: "Prophetic wet cupping therapy performed using single-use medical equipment in a sterile clinic environment.",
    features: [
      "Conducted on sacred 17th, 19th & 21st Sunnah dates",
      "Certified male and female certified therapists",
      "Targeted for migraines, back pain, and metabolic detox",
      "Economical rate: Rs. 250 / cup (min 5 cups)",
    ],
    ctaText: "Check Hijama Schedule",
    ctaLink: "/hijama",
  },
  {
    id: "remedies",
    title: "Classical Botanical Dispensary",
    badge: "500+ Pure Formulations",
    summary: "Wildcrafted raw herbs, pure steam distillates (Arqiyat), and natural honey preserves.",
    features: [
      "100% natural, zero synthetic chemicals or steroids",
      "Freshly prepared in traditional copper distillers",
      "Authentic Arq Makoh, Arq Kasni, Amla Murabba & oils",
      "Free delivery on orders over Rs. 2,000",
    ],
    ctaText: "Browse Herbal Products",
    ctaLink: "/products",
  },
  {
    id: "clinic",
    title: "Karachi Walk-In Matab",
    badge: "Open Mon-Sat 10 AM - 9 PM",
    summary: "Visit our physical clinic in Korangi for classical pulse examination (Nabs) and immediate dispensary.",
    features: [
      "35+ years serving Karachi families at the same venue",
      "On-site dispensary with ready-to-use herbal medicines",
      "Walk-in patients welcome (appointments recommended)",
      "Dedicated waiting area and patient consultation room",
    ],
    ctaText: "View Clinic Location & Directions",
    ctaLink: "/contact",
  },
];

export default function VariantC_IntegratedCareHub() {
  const { openConsultation } = useConsultation();
  const [activeServiceId, setActiveServiceId] = useState("consultation");

  const activeService =
    HUB_SERVICES.find((s) => s.id === activeServiceId) || HUB_SERVICES[0];

  const handleQuickWhatsApp = (msg: string) => {
    const text = encodeURIComponent(msg);
    window.open(`https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${text}`, "_blank");
  };

  return (
    <div className="bg-sand-50 text-neutral-900 min-h-screen">
      {/* ─────────────────────────────────────────────────────────────
          1. DUAL-TRACK CONCIERGE HERO (WhatsApp + Walk-in Clinic)
      ───────────────────────────────────────────────────────────── */}
      <section className="pt-8 pb-16 md:pt-12 md:pb-20 border-b border-sand-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Box: Online Consultation & Fast-Track WhatsApp */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Doctors Available Online via WhatsApp</span>
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-950 leading-tight">
                  Tameer-e-Sehat{" "}
                  <span className="text-brand-green-700">Healthcare Concierge</span>
                </h1>

                <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed">
                  Fast-track medical advice and authentic Unani remedies. Connect
                  with Hakeem Tahir Hameed directly on WhatsApp or book an appointment in 60 seconds.
                </p>

                {/* Pre-filled WhatsApp Triage Buttons */}
                <div className="mt-6">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-2.5">
                    Tap to ask directly on WhatsApp:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {QUICK_WHATSAPP_QUESTIONS.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickWhatsApp(q.query)}
                        className="text-left p-3 rounded-xl border border-sand-200 bg-sand-50/60 hover:bg-emerald-50/60 hover:border-emerald-300 text-xs font-medium text-neutral-800 flex items-center justify-between group transition-colors"
                      >
                        <span className="truncate pr-2">{q.label}</span>
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Booking Bar */}
              <div className="mt-8 pt-5 border-t border-sand-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => openConsultation({ mode: "WHATSAPP" })}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-green-700 text-white font-bold text-sm hover:bg-brand-green-800 transition-colors shadow-sm"
                >
                  <Stethoscope className="w-4 h-4" />
                  Book Full Video / Audio Consultation
                </button>
                <a
                  href={`tel:${CLINIC_INFO.phoneFormatted}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-sand-200 bg-sand-50 text-neutral-800 text-sm font-semibold hover:bg-white transition-colors"
                >
                  <Phone className="w-4 h-4 text-brand-green-700" />
                  Call Clinic
                </a>
              </div>
            </div>

            {/* Right Box: Walk-in Karachi Clinic Status & Location */}
            <div className="lg:col-span-5 bg-brand-green-900 text-sand-50 rounded-3xl p-6 sm:p-8 border border-brand-green-800 flex flex-col justify-between shadow-md">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-md bg-brand-gold-500/20 text-brand-gold-300 border border-brand-gold-400/30 text-xs font-bold uppercase tracking-wider">
                    Physical Matab
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-brand-green-200">
                    <Clock className="w-3.5 h-3.5 text-brand-gold-400" />
                    <span>Open Today (10 AM - 9 PM)</span>
                  </div>
                </div>

                <h3 className="font-serif text-2xl font-bold text-white">
                  Visit Matab Tameer-e-sehat in Karachi
                </h3>

                <p className="mt-2 text-xs text-sand-200/80 leading-relaxed">
                  Established in 1990. Experience traditional pulse diagnosis (Nabs),
                  in-person consultation, and an on-site apothecary.
                </p>

                <div className="mt-6 space-y-3 text-xs">
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10">
                    <MapPin className="w-4 h-4 text-brand-gold-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white block">Clinic Address:</span>
                      <span className="text-sand-200">
                        {CLINIC_INFO.address}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-sand-200">Consultation Timings:</span>
                    <span className="font-bold text-white">Mon - Sat: 10:00 AM - 9:00 PM</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <a
                  href={CLINIC_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-brand-green-950 font-bold text-xs sm:text-sm hover:bg-sand-100 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-brand-green-700" />
                  Open in Google Maps
                  <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. INTERACTIVE SERVICE PATHWAY SWITCHER
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white border-b border-sand-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-green-700">
              Integrated Services
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mt-1">
              Select Your Preferred Care Pathway
            </h2>
            <p className="text-neutral-600 text-xs sm:text-sm mt-1">
              Whether you need remote consultation, clinic therapy, or home remedies, we provide holistic care.
            </p>
          </div>

          {/* Service Tabs */}
          <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
            {HUB_SERVICES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveServiceId(s.id)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  activeServiceId === s.id
                    ? "bg-brand-green-700 text-white shadow-sm ring-1 ring-brand-green-800"
                    : "bg-sand-50 border border-sand-200 text-neutral-700 hover:border-brand-green-300"
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>

          {/* Active Service Panel */}
          <div className="bg-sand-50/60 rounded-3xl p-6 sm:p-10 border border-sand-200 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <div className="inline-block px-3 py-1 rounded-md bg-brand-green-100 text-brand-green-800 text-xs font-bold mb-3">
                {activeService.badge}
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
                {activeService.title}
              </h3>
              <p className="mt-2 text-sm sm:text-base text-neutral-600 leading-relaxed">
                {activeService.summary}
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeService.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-neutral-800">
                    <CheckCircle2 className="w-4 h-4 text-brand-green-600 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                {activeService.ctaMode === "consultation" ? (
                  <button
                    type="button"
                    onClick={() => openConsultation({ mode: "WHATSAPP" })}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-green-700 text-white font-bold text-sm hover:bg-brand-green-800 transition-colors shadow-sm"
                  >
                    {activeService.ctaText}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <Link
                    href={activeService.ctaLink || "#"}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-green-700 text-white font-bold text-sm hover:bg-brand-green-800 transition-colors shadow-sm"
                  >
                    {activeService.ctaText}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>

            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-sand-200 shadow-sm text-center">
              <div className="w-16 h-16 rounded-full bg-brand-green-50 text-brand-green-700 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h4 className="font-serif font-bold text-base text-neutral-900">
                Verified Healthcare Standards
              </h4>
              <p className="text-xs text-neutral-500 mt-1">
                Every consultation and formulation is governed by 35 years of clinical Unani protocols.
              </p>
              <div className="mt-4 pt-3 border-t border-sand-100 text-xs font-bold text-brand-green-800">
                150,000+ Treated Patients
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. CURATED BEST-SELLER REMEDIES
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-sand-50 border-b border-sand-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-green-700">
                Pharmacy Favorites
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mt-1">
                Most Prescribed Formulations
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs font-bold text-brand-green-800 hover:underline flex items-center gap-1"
            >
              Browse All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {PRODUCTS.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-4 border border-sand-200 shadow-sm hover:border-brand-green-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-sand-100 mb-3">
                    <Image
                      src={p.image || "/images/products/8683_0_ajwain.jpg"}
                      alt={p.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h4 className="font-serif font-bold text-sm text-neutral-900 line-clamp-1">
                    {p.name}
                  </h4>
                  <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                    {p.urduName || p.categoryLabel}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-sand-100 flex items-center justify-between">
                  <span className="font-bold text-xs text-brand-green-800">
                    Rs. {p.price.toLocaleString()}
                  </span>
                  <Link
                    href={`/products/${p.slug}`}
                    className="text-[11px] font-semibold text-brand-green-700 hover:underline"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
