"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,

  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MessageCircle,

  MapPin,
  Sparkles,
  Award,
  ChevronDown,
  Stethoscope,
  HeartPulse,
  Leaf,
  Activity,
  UserCheck,
} from "lucide-react";
import { useConsultation } from "@/app/context/ConsultationContext";
import { CLINIC_INFO, PRODUCTS } from "@/app/data/products";

const TRIAGE_CONCERNS = [
  {
    id: "stomach",
    label: "Stomach & Digestion",
    urdu: "معدہ و نظام انہضام",
    desc: "Acidity, gas, bloating, constipation, fatty liver",
    icon: Activity,
  },
  {
    id: "joints",
    label: "Joint & Back Pain",
    urdu: "جوڑوں اور کمر کا درد",
    desc: "Knee stiffness, sciatica, arthritis, uric acid",
    icon: ShieldCheck,
  },
  {
    id: "energy",
    label: "Vitality & Stamina",
    urdu: "توانائی اور عمومی کمزوری",
    desc: "Chronic fatigue, mental fog, seasonal weakness",
    icon: HeartPulse,
  },
  {
    id: "skin",
    label: "Skin & Scalp Health",
    urdu: "جلد اور بالوں کے امراض",
    desc: "Hair fall, scalp irritation, dry eczema, acne",
    icon: Sparkles,
  },
  {
    id: "respiratory",
    label: "Cough & Allergies",
    urdu: "کھانسی اور موسمی الرجی",
    desc: "Chest congestion, seasonal asthma, persistent phlegm",
    icon: Leaf,
  },
  {
    id: "private",
    label: "Confidential Wellness",
    urdu: "مردانہ و نسوانی پوشیدہ مسائل",
    desc: "Completely private, 1-on-1 confidential advice",
    icon: UserCheck,
  },
];

const FAQS = [
  {
    q: "How does the online Hakeem consultation work?",
    a: "After you choose your health concern and enter your details, our certified Hakeem reviews your symptoms via WhatsApp or phone. A tailored herbal treatment plan and dietary guidelines are formulated specifically for your temperament (Mizaj).",
  },
  {
    q: "Are your remedies delivered across Pakistan?",
    a: "Yes. All prescribed herbal extracts (Arqiyat), preserves (Murabbajaat), and medicinal oils are freshly prepared and dispatched via Cash on Delivery (COD) across Karachi, Lahore, Islamabad, and all cities in Pakistan.",
  },
  {
    q: "What is Sunnah Hijama therapy and is it hygienic?",
    a: "Hijama (cupping) is a classical sunnah therapeutic detox performed at our Karachi clinic. We use single-use, medically sealed disposable cups and surgical-grade sterilization protocols.",
  },
  {
    q: "Are your medicines chemical-free and without steroids?",
    a: "Guaranteed 100% natural. Matab Tameer-e-Sehat has operated for over 35 years under strict classical Unani pharmacopoeia with zero chemical additives, preservatives, or synthetic steroids.",
  },
];

export default function VariantA_ClinicalTriage() {
  const { openConsultation } = useConsultation();
  const [selectedConcern, setSelectedConcern] = useState(TRIAGE_CONCERNS[0]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const featuredRemedies = PRODUCTS.slice(0, 4);

  const handleBookSelected = () => {
    openConsultation({
      mode: "WHATSAPP",
      concern: selectedConcern.label,
      message: `Assalam-o-Alaikum Hakeem Sahib, I would like to book a consultation for ${selectedConcern.label} (${selectedConcern.desc}).`,
    });
  };

  const handleWhatsAppDirect = () => {
    const text = encodeURIComponent(
      `Assalam-o-Alaikum, I am inquiring about consultation at Tameer-e-Sehat regarding ${selectedConcern.label}.`
    );
    window.open(`https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${text}`, "_blank");
  };

  return (
    <div className="bg-sand-50 text-neutral-900 min-h-screen">
      {/* ─────────────────────────────────────────────────────────────
          1. CLINICAL TRIAGE HERO (Doctor-First, Interactive)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-8 pb-16 md:pt-12 md:pb-20 border-b border-sand-200 overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(var(--color-primary) 1px, transparent 1px), radial-gradient(var(--color-primary) 1px, var(--color-sand-50) 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb / Category Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-green-100/80 border border-brand-green-300 text-brand-green-800 text-xs font-semibold mb-6">
            <Award className="w-3.5 h-3.5 text-brand-green-700" />
            <span>35+ Years of Clinical Unani Medicine • Karachi, Pakistan</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Heading, Triage Selector & CTAs */}
            <div className="lg:col-span-7">
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-950 leading-[1.15]">
                Direct Clinical Care &{" "}
                <span className="text-brand-green-700">Expert Hakeem Consultation</span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-neutral-700 leading-relaxed max-w-2xl">
                Consult verified Unani practitioners for chronic digestive, joint, and
                metabolic health concerns. Personalised herbal therapy backed by 35 years
                of hospital-grade botanical practice.
              </p>

              {/* Triage Step: What is your health concern? */}
              <div className="mt-8 p-5 sm:p-6 bg-white rounded-2xl border border-sand-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-green-800 flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-brand-green-700" />
                    Step 1: Select Your Health Concern
                  </span>
                  <span className="text-xs text-neutral-500 font-medium">
                    100% Confidential
                  </span>
                </div>

                {/* Concern Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {TRIAGE_CONCERNS.map((c) => {
                    const isSelected = selectedConcern.id === c.id;
                    const Icon = c.icon;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedConcern(c)}
                        className={`text-left p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                          isSelected
                            ? "bg-brand-green-50 border-brand-green-600 text-brand-green-900 shadow-sm ring-1 ring-brand-green-600"
                            : "bg-sand-50/50 border-sand-200 text-neutral-700 hover:border-brand-green-300 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon
                            className={`w-4 h-4 ${
                              isSelected
                                ? "text-brand-green-700"
                                : "text-neutral-500"
                            }`}
                          />
                          <span className="font-semibold truncate">{c.label}</span>
                        </div>
                        <p className="text-[11px] text-neutral-500 line-clamp-1">
                          {c.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Concern Preview & CTAs */}
                <div className="mt-5 pt-4 border-t border-sand-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="text-xs text-neutral-600">
                    Active selection:{" "}
                    <span className="font-bold text-neutral-900">
                      {selectedConcern.label}
                    </span>{" "}
                    <span className="text-brand-green-700 font-serif">
                      ({selectedConcern.urdu})
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleBookSelected}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-green-700 text-white font-semibold text-sm hover:bg-brand-green-800 transition-colors shadow-sm"
                    >
                      Book Consultation
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleWhatsAppDirect}
                      className="inline-flex items-center justify-center p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                      title="Chat on WhatsApp"
                      aria-label="Chat on WhatsApp"
                    >
                      <MessageCircle className="w-5 h-5 text-emerald-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Practitioner Credential Card */}
            <div className="lg:col-span-5">
              <div className="relative bg-white rounded-3xl p-6 sm:p-7 border border-sand-200 shadow-md">
                <div className="flex items-start gap-4">
                  <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden bg-brand-green-100 flex-shrink-0 border border-brand-green-200">
                    <Image
                      src="/images/hakeem-portrait.webp"
                      alt="Hakeem Tahir Hameed"
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-brand-green-100 text-brand-green-800 text-[11px] font-bold tracking-wide uppercase">
                      Chief Herbal Physician
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-neutral-900 mt-1">
                      Hakeem Tahir Hameed
                    </h3>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      35+ Years Clinical Lineage • Karachi
                    </p>
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs text-brand-green-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-brand-green-600 flex-shrink-0" />
                      <span>Certified National Tibbi Council</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-sand-100 space-y-2.5 text-xs text-neutral-700">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Total Consultations:</span>
                    <span className="font-bold text-neutral-900">150,000+ Patients</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Prescription Mode:</span>
                    <span className="font-bold text-neutral-900">WhatsApp / In-person Matab</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Clinic Timings:</span>
                    <span className="font-bold text-neutral-900">Mon–Sat: 10 AM – 9 PM</span>
                  </div>
                </div>

                <div className="mt-5 p-3.5 rounded-xl bg-sand-100/70 border border-sand-200 text-xs text-neutral-700 flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-brand-green-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-neutral-900">Physical Clinic:</span>{" "}
                    Plot L, 41 Korangi Crossing Rd, Sector 31 B, Karachi
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. COMPACT CREDIBILITY STRIP
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-sand-200 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-2">
              <div className="font-serif text-2xl sm:text-3xl font-bold text-brand-green-800">
                35+ Years
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 font-medium">
                Clinical Unani Practice
              </p>
            </div>
            <div className="p-2">
              <div className="font-serif text-2xl sm:text-3xl font-bold text-brand-green-800">
                150,000+
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 font-medium">
                Patients Treated in Pakistan
              </p>
            </div>
            <div className="p-2">
              <div className="font-serif text-2xl sm:text-3xl font-bold text-brand-green-800">
                500+
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 font-medium">
                Botanicals & Distillates
              </p>
            </div>
            <div className="p-2">
              <div className="font-serif text-2xl sm:text-3xl font-bold text-brand-green-800">
                100% Pure
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 font-medium">
                Zero Steroids or Chemicals
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. HOW CLINICAL CONSULTATION WORKS (Step-by-Step)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-sand-50 border-b border-sand-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-green-700">
              Care Pathway
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mt-1.5">
              How Your Unani Consultation Works
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base mt-2">
              Transparent, patient-centered diagnosis from symptom assessment to home remedy delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-sand-200 relative shadow-sm">
              <div className="w-10 h-10 rounded-full bg-brand-green-100 text-brand-green-800 flex items-center justify-center font-bold text-base mb-4">
                1
              </div>
              <h3 className="font-serif font-bold text-lg text-neutral-900">
                Share Symptoms & History
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
                Connect via WhatsApp or schedule an appointment. Detail your medical complaints, lifestyle, and previous lab reports.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-sand-200 relative shadow-sm">
              <div className="w-10 h-10 rounded-full bg-brand-green-100 text-brand-green-800 flex items-center justify-center font-bold text-base mb-4">
                2
              </div>
              <h3 className="font-serif font-bold text-lg text-neutral-900">
                Mizaj & Root-Cause Diagnosis
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
                Hakeem Tahir Hameed analyzes your temperament (Mizaj), digestive fire, and root causes rather than just masking symptoms.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-sand-200 relative shadow-sm">
              <div className="w-10 h-10 rounded-full bg-brand-green-100 text-brand-green-800 flex items-center justify-center font-bold text-base mb-4">
                3
              </div>
              <h3 className="font-serif font-bold text-lg text-neutral-900">
                Custom Herbal Plan & Delivery
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
                Receive unadulterated botanical extracts (Arqiyat), preserves, and dietary directions delivered with Cash on Delivery nationwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. 4 CORE SERVICES DISCOVERY
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white border-b border-sand-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-green-700">
              Our Capabilities
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mt-1.5">
              Comprehensive Traditional Care Services
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base mt-2">
              Select the service relevant to your healing journey.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl border border-sand-200 bg-sand-50/50 hover:bg-white hover:border-brand-green-400 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-brand-green-100 text-brand-green-800 flex items-center justify-center mb-4">
                  <Stethoscope className="w-5 h-5 text-brand-green-700" />
                </div>
                <h3 className="font-serif font-bold text-lg text-neutral-900">
                  Online Consultation
                </h3>
                <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                  Remote diagnosis via WhatsApp or phone with custom herbal plans.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openConsultation({ mode: "WHATSAPP" })}
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-brand-green-800 hover:text-brand-green-900"
              >
                Book Appointment <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl border border-sand-200 bg-sand-50/50 hover:bg-white hover:border-brand-green-400 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-brand-green-100 text-brand-green-800 flex items-center justify-center mb-4">
                  <Calendar className="w-5 h-5 text-brand-green-700" />
                </div>
                <h3 className="font-serif font-bold text-lg text-neutral-900">
                  Sunnah Hijama Therapy
                </h3>
                <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                  Clinical cupping for blood purification and joint inflammation.
                </p>
              </div>
              <Link
                href="/hijama"
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-brand-green-800 hover:text-brand-green-900"
              >
                View Hijama Dates <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl border border-sand-200 bg-sand-50/50 hover:bg-white hover:border-brand-green-400 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-brand-green-100 text-brand-green-800 flex items-center justify-center mb-4">
                  <Leaf className="w-5 h-5 text-brand-green-700" />
                </div>
                <h3 className="font-serif font-bold text-lg text-neutral-900">
                  Unani Herbal Remedies
                </h3>
                <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                  500+ pure steam distillates, honey preserves, and herbal powders.
                </p>
              </div>
              <Link
                href="/products"
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-brand-green-800 hover:text-brand-green-900"
              >
                Browse Dispensary <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl border border-sand-200 bg-sand-50/50 hover:bg-white hover:border-brand-green-400 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-brand-green-100 text-brand-green-800 flex items-center justify-center mb-4">
                  <MapPin className="w-5 h-5 text-brand-green-700" />
                </div>
                <h3 className="font-serif font-bold text-lg text-neutral-900">
                  Karachi Walk-In Matab
                </h3>
                <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                  In-person pulse examination (Nabs) and direct clinic consultations.
                </p>
              </div>
              <Link
                href="/contact"
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-brand-green-800 hover:text-brand-green-900"
              >
                Get Clinic Directions <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. CLINICAL REMEDIES SHOWCASE
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-sand-50 border-b border-sand-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-green-700">
                Dispensary Formulations
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mt-1.5">
                Physician-Formulated Herbal Remedies
              </h2>
              <p className="text-neutral-600 text-xs sm:text-sm mt-1">
                Authentic, chemical-free Unani formulas prepared according to classical standards.
              </p>
            </div>
            <Link
              href="/products"
              className="mt-4 sm:mt-0 text-xs font-bold text-brand-green-800 hover:underline inline-flex items-center gap-1"
            >
              View all remedies <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {featuredRemedies.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-4 border border-sand-200 shadow-sm flex flex-col justify-between hover:border-brand-green-300 transition-all"
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
                  <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">
                    {p.urduName || p.categoryLabel}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-sand-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-green-800">
                    Rs. {p.price.toLocaleString()}
                  </span>
                  <Link
                    href={`/products/${p.slug}`}
                    className="text-[11px] font-semibold text-brand-green-700 hover:underline"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. CLINICAL FAQ
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-green-700">
              Questions & Answers
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mt-1.5">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-sand-200 overflow-hidden bg-sand-50/50"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left font-serif font-bold text-sm sm:text-base text-neutral-900 flex items-center justify-between gap-4"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-500 transition-transform ${
                        isOpen ? "rotate-180 text-brand-green-700" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-sand-200/50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
