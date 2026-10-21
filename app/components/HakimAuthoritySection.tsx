"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CLINIC_INFO } from "@/app/data/products";
import {
  Award,
  BookOpen,
  CheckCircle2,
  HeartHandshake,
  ShieldCheck,
  Stethoscope,
  Users,
  ArrowRight,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Navigation,
  Building2,
  Calendar,
  Sparkles,
  ShoppingBag,
  Activity,
  Check,
} from "lucide-react";
import Reveal from "./motion/Reveal";
import { useConsultation } from "@/app/context/ConsultationContext";

export default function HakimAuthoritySection() {
  const { openConsultation } = useConsultation({ mode: "PHYSICAL" });

  const clinicalMetrics = [
    {
      value: "35+",
      label: "Years Clinical Practice",
      subLabel: "Serving Karachi Since 1990",
      icon: Award,
    },
    {
      value: "150K+",
      label: "Patients Consulted & Treated",
      subLabel: "Documented Clinical Case Histories",
      icon: Users,
    },
    {
      value: "100%",
      label: "Pure Botanical Herbal Extracts",
      subLabel: "Small-Batch Hydro-Distillates",
      icon: ShieldCheck,
    },
    {
      value: "0%",
      label: "Steroids, Chemicals or Additives",
      subLabel: "Guaranteed Pure & Non-Habit Forming",
      icon: Stethoscope,
    },
  ];

  return (
    <section
      id="hakim-authority"
      className="py-14 sm:py-18 lg:py-24 bg-surface border-b border-line relative overflow-hidden"
    >
      {/* Subtle background ambient accents */}
      <div className="absolute top-1/4 right-0 -mr-32 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-0 -ml-32 w-80 h-80 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16 relative z-10">

        {/* ─── 1. Hakim Clinical Pedigree & Philosophy ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Hakim Portrait & Clinical Practice Card (5 cols) */}
          <Reveal className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border-2 border-line bg-white group">
              {/* Image Frame */}
              <div className="relative aspect-[4/4.2] sm:aspect-[4/4.4] w-full overflow-hidden bg-gradient-to-b from-sand-100 to-sand-200">
                <Image
                  src="/images/hkm.png"
                  alt="Hakim Muhammad Tariq Mahmood - Senior Tibbi Consultant at Tameer-e-Sehat Karachi"
                  fill
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-102"
                  sizes="(max-width: 1024px) 100vw, 480px"
                  priority={false}
                />

                {/* Subtle soft lighting overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Top Floating Badge */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-primary text-[11px] font-bold uppercase tracking-wider shadow-sm border border-line">
                    <Award className="w-3.5 h-3.5 text-secondary-text" />
                    <span>Est. 1990 · 35+ Yrs Heritage</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/90 text-white text-[10px] font-semibold backdrop-blur-xs shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>Consultations Open</span>
                  </span>
                </div>

                {/* Bottom Overlay on Image */}
                <div className="absolute bottom-4 left-5 right-5 text-white space-y-0.5">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-xs">
                    Hakim Muhammad Tariq
                  </h3>
                  <p className="text-xs text-white/90 font-medium leading-snug drop-shadow-xs">
                    Senior Tibbi Consultant &amp; Master Herbalist · Karachi Clinic
                  </p>
                </div>
              </div>

              {/* Informative Clinical Highlights Panel */}
              <div className="p-4 sm:p-5 bg-white space-y-2.5 border-t border-line">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-ink-body">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-surface border border-line/80">
                    <Activity className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-semibold text-ink">Pulse Diagnosis (Nabz)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-surface border border-line/80">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-semibold text-ink">100% Pure Botanical</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-ink-subtle border-t border-sand-100">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-secondary-text" />
                    <span>Rahat Commercial, DHA Phase 6, Karachi</span>
                  </span>
                  <span className="font-semibold text-primary">Walk-ins &amp; Online</span>
                </div>
              </div>
            </div>

            {/* Floating Trust Seal for Desktop */}
            <div className="hidden lg:block absolute -bottom-4 -right-4 bg-white p-3.5 rounded-2xl border border-brand-green-200 shadow-xl max-w-[220px]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-brand-green-50 text-primary flex items-center justify-center shrink-0">
                  <HeartHandshake className="w-5 h-5 text-primary" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-primary block">Est. 1990</span>
                  <span className="text-ink-muted text-[11px] block leading-tight">35+ Years of Clinical Trust</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Clinical Heritage & Philosophy Column (7 cols) */}
          <Reveal delay={0.06} className="lg:col-span-7 space-y-5 lg:pl-3">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-sunken border border-line text-brand-gold-800 text-xs font-semibold uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-brand-gold-800" />
                <span>Clinical Lineage &amp; Heritage · Est. 1990</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-primary leading-[1.2] tracking-tight">
                Authentic Eastern Healing, Rooted in 35+ Years of Practice
              </h2>
            </div>

            <p className="text-sm sm:text-base text-ink-body leading-relaxed">
              At Matab Tameer-e-Sehat, we uphold classical Tibb-e-Unani wisdom by identifying your fundamental temperamental imbalance (<span className="font-medium text-primary">Mizaj</span>) rather than suppressing symptoms with synthetic compounds. Every formulation is compounded to restore long-term metabolic and organic vitality.
            </p>

            {/* 3 Core Clinical Standards */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-start gap-3 p-3.5 rounded-xl sm:rounded-2xl bg-white border border-line shadow-2xs hover:border-brand-green-200 transition-colors">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <strong className="text-ink font-semibold">Individualized Temperament Assessment (طبی تشخیص): </strong>
                  <span className="text-ink-body">Remedies formulated specifically according to your age, digestive strength, and dominant Mizaj.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl sm:rounded-2xl bg-white border border-line shadow-2xs hover:border-brand-green-200 transition-colors">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <strong className="text-ink font-semibold">100% Pure Herbs, Zero Steroids (خالص قدرتی اجزاء): </strong>
                  <span className="text-ink-body">Guaranteed pure hydro-distillates (Arqiyat) and raw honey preserves without any steroids, NSAIDs, or synthetic binders.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl sm:rounded-2xl bg-white border border-line shadow-2xs hover:border-brand-green-200 transition-colors">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <strong className="text-ink font-semibold">Direct Clinical Follow-up &amp; Regimen (طبی رہنمائی): </strong>
                  <span className="text-ink-body">Personal guidance on dietary restrictions (Parhez), dosage adjustments, and ongoing recovery check-ins.</span>
                </div>
              </div>
            </div>

            {/* Actions: One for Consultation, One for Purchasing Remedies */}
            <div className="pt-2 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
              <button
                type="button"
                onClick={() =>
                  openConsultation({
                    message:
                      "Assalam-o-Alaikum Hakim Sahib, I would like to consult with you regarding authentic herbal guidance for my health condition.",
                  })
                }
                className="px-6 py-3.5 bg-primary hover:bg-brand-green-800 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer group"
              >
                <Sparkles className="w-4 h-4 text-brand-gold-300 shrink-0" />
                <span>Consult Hakim Sahib</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              <Link
                href="/products"
                className="px-6 py-3.5 bg-white hover:bg-surface text-primary border border-primary/30 hover:border-primary text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-secondary-text shrink-0" />
                <span>Browse Remedies</span>
              </Link>

              <Link
                href="/about"
                className="px-4 py-3.5 bg-transparent hover:bg-white/80 text-ink-body hover:text-primary text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center text-center"
              >
                Our 35-Year Story →
              </Link>
            </div>
          </Reveal>
        </div>

        {/* ─── 2. Four Clinical Trust Metrics Strip ─── */}
        <Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 bg-white p-4 sm:p-6 lg:p-7 rounded-2xl sm:rounded-3xl border border-line shadow-xs">
            {clinicalMetrics.map((metric, i) => {
              const Icon = metric.icon;
              return (
                <div
                  key={i}
                  className="text-center space-y-1 p-2 sm:p-3 rounded-2xl hover:bg-surface transition-colors group"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-green-50 text-primary flex items-center justify-center mx-auto mb-1 group-hover:scale-105 transition-transform">
                    <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                  </div>
                  <span className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-primary block tracking-tight">
                    {metric.value}
                  </span>
                  <span className="text-xs sm:text-sm text-ink font-semibold block leading-tight">
                    {metric.label}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-secondary-text font-medium block pt-0.5">
                    {metric.subLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* ─── 3. In-Person Karachi Clinic & Pulse Diagnosis ─── */}
        <Reveal className="p-5 sm:p-8 lg:p-10 bg-white rounded-3xl border border-line shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">

            {/* Left: Location & Hours Details (7 cols) */}
            <div className="lg:col-span-7 space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-green-50 border border-brand-green-200 text-primary text-xs font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-secondary-text" />
                  <span>Karachi Clinic · DHA Phase 6</span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                    Visit Our Clinic for Pulse Diagnosis (Nabz)
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-body leading-relaxed">
                    Prefer to visit in person? Come see Hakim Sahib at our Karachi clinic for a personal pulse check (<em>Nabz</em>) and custom herbal remedies prepared for your health.
                  </p>
                </div>
              </div>

              {/* Two info cards: Location & Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Address Card */}
                <div className="p-4 rounded-2xl bg-surface border border-line space-y-2 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                      <MapPin className="w-4 h-4 text-secondary-text shrink-0" />
                      <span>Clinic Location</span>
                    </div>
                    <p className="text-xs text-ink-body leading-relaxed">
                      {CLINIC_INFO.address}
                    </p>
                    <p className="text-[11px] text-ink-subtle">
                      Easily accessible from DHA, Clifton, and across Karachi.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-line/60">
                    <a
                      href={CLINIC_INFO.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary hover:underline"
                    >
                      <Navigation className="w-3.5 h-3.5 text-secondary-text shrink-0" />
                      <span>Open in Google Maps →</span>
                    </a>
                  </div>
                </div>

                {/* Visiting Hours Card */}
                <div className="p-4 rounded-2xl bg-surface border border-line space-y-2 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                      <Clock className="w-4 h-4 text-secondary-text shrink-0" />
                      <span>Visiting Hours</span>
                    </div>
                    <div className="text-xs text-ink-body space-y-1">
                      <p>
                        <strong className="text-ink">Mon – Sat:</strong> {CLINIC_INFO.timings}
                      </p>
                      <p className="text-secondary-text font-semibold">
                        <strong className="text-ink">Friday:</strong> {CLINIC_INFO.fridayTimings}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-line/60">
                    <p className="text-[11px] text-ink-subtle flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                      <span>Walk-ins welcome, or book ahead to skip the wait.</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Landmark Accessibility Note */}
              <div className="p-3 bg-brand-green-50 rounded-xl border border-brand-green-200 text-xs text-primary flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span>
                  Located at Rahat Commercial in DHA Phase 6, with convenient parking outside the clinic.
                </span>
              </div>
            </div>

            {/* Right: Quick Action Booking Banner (5 cols) */}
            <div className="lg:col-span-5 bg-primary rounded-2xl sm:rounded-3xl p-6 sm:p-7 text-white flex flex-col justify-between space-y-4 shadow-lg border border-brand-green-600/40 relative overflow-hidden">
              {/* Subtle ambient light */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-40 h-40 rounded-full bg-secondary/20 blur-2xl pointer-events-none" />

              <div className="space-y-3 relative z-10">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-green-900 text-brand-gold-500 text-xs font-bold uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>In-Person Visit</span>
                </div>

                <h4 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  Book Your Clinic Visit
                </h4>

                <p className="text-xs sm:text-sm text-on-inverse/85 leading-relaxed">
                  Reserve your preferred time slot with Hakim Sahib to get a personal pulse check without waiting in line.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 relative z-10">
                <button
                  type="button"
                  onClick={() =>
                    openConsultation({
                      mode: "PHYSICAL",
                      message:
                        "Assalam-o-Alaikum Hakim Sahib, I would like to book an in-person consultation appointment at your DHA Phase 6 Karachi clinic.",
                    })
                  }
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-whatsapp hover:bg-whatsapp-hover text-on-whatsapp text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>Select Clinic Slot &amp; Book</span>
                </button>

                <a
                  href={`https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(
                    "Assalam-o-Alaikum Hakim Sahib, I would like to schedule an in-person clinic visit at your DHA Phase 6 Matab in Karachi."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold rounded-xl border border-white/20 transition-all text-center"
                >
                  <MessageCircle className="w-4 h-4 text-whatsapp shrink-0" />
                  <span>WhatsApp Clinic</span>
                </a>

                <a
                  href={`tel:${CLINIC_INFO.phone}`}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-transparent hover:bg-white/5 text-white/90 text-xs font-medium rounded-xl transition-all text-center"
                >
                  <Phone className="w-3.5 h-3.5 text-brand-gold-300 shrink-0" />
                  <span>Call Clinic: {CLINIC_INFO.phoneFormatted}</span>
                </a>
              </div>
            </div>

          </div>
        </Reveal>

      </div>
    </section>
  );
}
