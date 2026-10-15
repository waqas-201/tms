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
      subLabel: "Verified Reviews on Google ↗",
      icon: Users,
      href: CLINIC_INFO.googleMapsUrl,
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
      className="py-14 sm:py-18 lg:py-24 bg-[#faf8f5] border-b border-[#e6dfd5] relative overflow-hidden"
    >
      {/* Subtle background ambient accents */}
      <div className="absolute top-1/4 right-0 -mr-32 w-80 h-80 rounded-full bg-[#22623a]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-0 -ml-32 w-80 h-80 rounded-full bg-[#c59b27]/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16 relative z-10">

        {/* ─── 1. Hakim Clinical Pedigree & Philosophy ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Hakim Portrait Visual Column (5 cols) */}
          <Reveal className="lg:col-span-5 relative">
            {/* Desktop Full Portrait View */}
            <div className="hidden lg:block relative aspect-[4/4.9] rounded-3xl overflow-hidden shadow-xl border-2 border-[#e6dfd5] bg-[#f6f2ea] group">
              <Image
                src="/images/2-scaled.png"
                alt="Hakim Muhammad Tariq - Senior Tibbi Consultant at Tameer-e-Sehat Karachi"
                fill
                className="object-cover object-top transition-transform duration-700 group-hover:scale-102"
                sizes="(max-width: 1024px) 100vw, 480px"
                priority={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#143e23] via-[#22623a]/30 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c59b27] text-white text-[11px] font-bold uppercase tracking-wider shadow-xs">
                  <Award className="w-3.5 h-3.5" />
                  <span>Certified Tibbi Lineage · Est. 1990</span>
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold tracking-tight text-white">
                    Hakim Muhammad Tariq
                  </h3>
                  <p className="text-xs text-[#f4eee5]/90 font-medium pt-0.5 leading-snug">
                    Senior Tibbi Consultant &amp; Master Herbalist · Serving Karachi Since 1990
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Dignified Editorial Portrait Card */}
            <div className="block lg:hidden relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#e6dfd5] bg-[#f6f2ea] shadow-md">
              <div className="relative aspect-[16/11] sm:aspect-[16/10] w-full">
                <Image
                  src="/images/2-scaled.png"
                  alt="Hakim Muhammad Tariq"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#143e23] via-[#22623a]/40 to-transparent" />

                <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#c59b27] text-white text-[10px] font-bold uppercase tracking-wider">
                    <Award className="w-3 h-3" />
                    <span>Est. 1990 · 35+ Yrs Heritage</span>
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white leading-tight">
                    Hakim Muhammad Tariq
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#f4eee5]/90 leading-snug">
                    Senior Tibbi Consultant &amp; Master Herbalist · Karachi Matab
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Trust Seal for Desktop */}
            <div className="hidden lg:block absolute -bottom-4 -right-4 bg-white p-3.5 rounded-2xl border border-[#cde4d6] shadow-xl max-w-[220px]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#eef7f1] text-[#22623a] flex items-center justify-center shrink-0">
                  <HeartHandshake className="w-5 h-5 text-[#22623a]" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-[#22623a] block">Est. 1990</span>
                  <span className="text-[#6a6660] text-[11px] block leading-tight">35+ Years of Clinical Trust</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Clinical Heritage & Philosophy Column (7 cols) */}
          <Reveal delay={0.06} className="lg:col-span-7 space-y-5 lg:pl-3">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4eee5] border border-[#e6dfd5] text-[#8c6a15] text-xs font-semibold uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-[#8c6a15]" />
                <span>Clinical Lineage &amp; Heritage · Est. 1990</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#22623a] leading-[1.2] tracking-tight">
                Authentic Eastern Healing, Rooted in 35+ Years of Practice
              </h2>
            </div>

            <p className="text-sm sm:text-base text-[#59534b] leading-relaxed">
              At Matab Tameer-e-Sehat, we uphold classical Tibb-e-Unani wisdom by identifying your fundamental temperamental imbalance (<span className="font-medium text-[#22623a]">Mizaj</span>) rather than suppressing symptoms with synthetic compounds. Every formulation is compounded to restore long-term metabolic and organic vitality.
            </p>

            {/* 3 Core Clinical Standards */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-start gap-3 p-3.5 rounded-xl sm:rounded-2xl bg-white border border-[#e6dfd5] shadow-2xs hover:border-[#cde4d6] transition-colors">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#22623a] shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <strong className="text-[#1a1816] font-semibold">Individualized Temperament Assessment (طبی تشخیص): </strong>
                  <span className="text-[#59534b]">Remedies formulated specifically according to your age, digestive strength, and dominant Mizaj.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl sm:rounded-2xl bg-white border border-[#e6dfd5] shadow-2xs hover:border-[#cde4d6] transition-colors">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#22623a] shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <strong className="text-[#1a1816] font-semibold">100% Pure Herbs, Zero Steroids (خالص قدرتی اجزاء): </strong>
                  <span className="text-[#59534b]">Guaranteed pure hydro-distillates (Arqiyat) and raw honey preserves without any steroids, NSAIDs, or synthetic binders.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl sm:rounded-2xl bg-white border border-[#e6dfd5] shadow-2xs hover:border-[#cde4d6] transition-colors">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#22623a] shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <strong className="text-[#1a1816] font-semibold">Direct Clinical Follow-up &amp; Regimen (طبی رہنمائی): </strong>
                  <span className="text-[#59534b]">Personal guidance on dietary restrictions (Parhez), dosage adjustments, and ongoing recovery check-ins.</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
              <button
                type="button"
                onClick={() =>
                  openConsultation({
                    mode: "WHATSAPP",
                    message:
                      "Assalam-o-Alaikum Hakim Sahib, I would like to consult with you regarding authentic herbal guidance for my health condition.",
                  })
                }
                className="px-6 py-3.5 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer group"
              >
                <Sparkles className="w-4 h-4 text-[#c59b27] shrink-0" />
                <span>Consult Hakim Sahib</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              <button
                type="button"
                onClick={() =>
                  openConsultation({
                    mode: "PHYSICAL",
                    message:
                      "Assalam-o-Alaikum Hakim Sahib, I would like to book an in-person consultation appointment at the Karachi clinic (Korangi Crossing).",
                  })
                }
                className="px-5 py-3.5 bg-white hover:bg-[#faf8f5] text-[#22623a] border border-[#22623a]/30 hover:border-[#22623a] text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#8c6a15] shrink-0" />
                <span>Book Clinic Appointment</span>
              </button>

              <Link
                href="/about"
                className="px-4 py-3.5 bg-transparent hover:bg-white/80 text-[#59534b] hover:text-[#22623a] text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center text-center"
              >
                Our 35-Year Story →
              </Link>
            </div>
          </Reveal>
        </div>

        {/* ─── 2. Four Clinical Trust Metrics Strip ─── */}
        <Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 bg-white p-4 sm:p-6 lg:p-7 rounded-2xl sm:rounded-3xl border border-[#e6dfd5] shadow-xs">
            {clinicalMetrics.map((metric, i) => {
              const Icon = metric.icon;
              const content = (
                <>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#eef7f1] text-[#22623a] flex items-center justify-center mx-auto mb-1 group-hover:scale-105 transition-transform">
                    <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                  </div>
                  <span className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#22623a] block tracking-tight">
                    {metric.value}
                  </span>
                  <span className="text-xs sm:text-sm text-[#1a1816] font-semibold block leading-tight">
                    {metric.label}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-[#8c6a15] font-medium block pt-0.5">
                    {metric.subLabel}
                  </span>
                </>
              );

              if ("href" in metric && metric.href) {
                return (
                  <a
                    key={i}
                    href={metric.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-center space-y-1 p-2 sm:p-3 rounded-xl sm:rounded-2xl hover:bg-[#faf8f5] transition-all group cursor-pointer border border-transparent hover:border-[#cde4d6]"
                    title="Click to view verified reviews on Google Maps"
                  >
                    {content}
                  </a>
                );
              }

              return (
                <div key={i} className="text-center space-y-1 p-2 sm:p-3">
                  {content}
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* ─── 3. In-Person Karachi Clinic Visit Card ─── */}
        <Reveal className="p-5 sm:p-8 lg:p-10 bg-white rounded-3xl border border-[#e6dfd5] shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">

            {/* Left: Location & Hours Details (7 cols) */}
            <div className="lg:col-span-7 space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eef7f1] border border-[#cde4d6] text-[#22623a] text-xs font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-[#c59b27]" />
                  <span>Physical Dispensary &amp; Matab in Karachi</span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#22623a] tracking-tight">
                    Visit Our Clinic for Pulse Diagnosis (Nabz)
                  </h3>
                  <p className="text-xs sm:text-sm text-[#59534b] leading-relaxed">
                    Prefer an in-person consultation? Visit Hakim Muhammad Tariq at our established Karachi dispensary at Korangi Crossing for on-the-spot pulse examination (<span className="font-medium text-[#22623a]">Nabz Shanasi</span>) and freshly compounded botanical remedies.
                  </p>
                </div>
              </div>

              {/* Two info cards: Location & Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Address Card */}
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e6dfd5] space-y-2 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[#22623a] font-bold text-xs uppercase tracking-wider">
                      <MapPin className="w-4 h-4 text-[#c59b27] shrink-0" />
                      <span>Clinic Location</span>
                    </div>
                    <p className="text-xs text-[#59534b] leading-relaxed">
                      {CLINIC_INFO.address}
                    </p>
                    <p className="text-[11px] text-[#7a7268]">
                      Near Korangi Crossing Road, Sector 31-B, Karachi.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[#e6dfd5]/60">
                    <a
                      href={CLINIC_INFO.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#22623a] hover:text-[#1b502e] hover:underline"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#8c6a15] shrink-0" />
                      <span>Open in Google Maps →</span>
                    </a>
                  </div>
                </div>

                {/* Visiting Hours Card */}
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e6dfd5] space-y-2 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[#22623a] font-bold text-xs uppercase tracking-wider">
                      <Clock className="w-4 h-4 text-[#c59b27] shrink-0" />
                      <span>Visiting Hours</span>
                    </div>
                    <div className="text-xs text-[#59534b] space-y-1">
                      <p>
                        <strong className="text-[#1a1816]">Mon – Sat:</strong> {CLINIC_INFO.timings}
                      </p>
                      <p className="text-[#8c6a15] font-semibold">
                        <strong className="text-[#1a1816]">Friday:</strong> {CLINIC_INFO.fridayTimings}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#e6dfd5]/60">
                    <p className="text-[11px] text-[#7a7268] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                      <span>Walk-ins welcome; prior slot advised.</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Landmark Accessibility Note */}
              <div className="p-3 bg-[#eef7f1] rounded-xl border border-[#cde4d6] text-xs text-[#22623a] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#22623a] shrink-0" />
                <span>
                  Convenient access from DHA Phase 7/8, Clifton, Malir, and Korangi Industrial Area.
                </span>
              </div>
            </div>

            {/* Right: Quick Action Booking Banner (5 cols) */}
            <div className="lg:col-span-5 bg-[#22623a] rounded-2xl sm:rounded-3xl p-6 sm:p-7 text-white flex flex-col justify-between space-y-4 shadow-lg border border-[#2d7648]/40 relative overflow-hidden">
              {/* Subtle ambient light */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-40 h-40 rounded-full bg-[#c59b27]/20 blur-2xl pointer-events-none" />

              <div className="space-y-3 relative z-10">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#143e23] text-[#c59b27] text-xs font-bold uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Reserve Consultation</span>
                </div>

                <h4 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  Book Clinic Appointment
                </h4>

                <p className="text-xs sm:text-sm text-[#f4eee5]/85 leading-relaxed">
                  Reserve your dedicated time slot with Hakim Muhammad Tariq to receive thorough pulse diagnosis without long waiting lines at our Karachi Matab.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 relative z-10">
                <button
                  type="button"
                  onClick={() =>
                    openConsultation({
                      mode: "PHYSICAL",
                      message:
                        "Assalam-o-Alaikum Hakim Sahib, I would like to book an in-person consultation appointment at the Karachi clinic (Korangi Crossing).",
                    })
                  }
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>Select Clinic Slot &amp; Book</span>
                </button>

                <a
                  href={`https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(
                    "Assalam-o-Alaikum Hakim Sahib, I would like to schedule an in-person clinic visit at your Korangi Crossing Matab in Karachi."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold rounded-xl border border-white/20 transition-all text-center"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                  <span>Direct WhatsApp Booking</span>
                </a>

                <a
                  href={`tel:${CLINIC_INFO.phone}`}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-transparent hover:bg-white/5 text-white/90 text-xs font-medium rounded-xl transition-all text-center"
                >
                  <Phone className="w-3.5 h-3.5 text-[#c59b27] shrink-0" />
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
