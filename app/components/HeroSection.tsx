"use client";

import React from "react";
import Image from "next/image";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  MapPin,
  Clock,
  Truck,
  Award,
  CheckCircle2,
  Leaf,
  Star,
  Activity,
  Phone,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useConsultation } from "@/app/context/ConsultationContext";
import { CLINIC_INFO } from "@/app/data/products";

// Compact Visual Condition Triage Cards (Icon + 2-3 words)
const CONDITION_CARDS = [
  {
    icon: "🌿",
    title: "Gastric & Digestion",
    concern: "Stomach, Gas & Acid Relief",
  },
  {
    icon: "🦴",
    title: "Joint & Knee Pain",
    concern: "Joint, Knee & Back Pain",
  },
  {
    icon: "⚡",
    title: "Fatty Liver & Heat",
    concern: "Fatty Liver & Body Heat",
  },
  {
    icon: "🩸",
    title: "Energy & Vitality",
    concern: "Energy, Stamina & Vitality",
  },
  {
    icon: "🍯",
    title: "Herbal Murabba",
    concern: "Pure Murabbajaat & Tonics",
  },
  {
    icon: "🛡️",
    title: "Immunity & Detox",
    concern: "Immune Health & Detoxification",
  },
];

export default function HeroSection() {
  const { openConsultation } = useConsultation();
  const reducedMotion = useReducedMotion();

  const handleConditionClick = (condition: (typeof CONDITION_CARDS)[number]) => {
    openConsultation({
      mode: "WHATSAPP",
      concern: condition.concern,
      message: `Assalam-o-Alaikum Hakim Sahib, I would like consultation and remedy guidance for: ${condition.title} (${condition.concern}).`,
    });
  };

  return (
    <section
      id="hero"
      className="relative bg-[#faf8f5] border-b border-[#e6dfd5] overflow-hidden min-h-[calc(100dvh-3.5rem)] sm:min-h-[calc(100dvh-4rem)] lg:min-h-0 flex flex-col justify-center py-4 sm:py-8 lg:py-14"
    >
      {/* Heritage background ambient glows */}
      <div className="absolute top-0 right-0 -mr-28 -mt-28 w-96 h-96 rounded-full bg-[#22623a]/6 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-28 -mb-28 w-96 h-96 rounded-full bg-[#c59b27]/6 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#22623a_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.025] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 my-auto">
        {/* ── Top Clinic Trust & Availability Bar (Desktop only) ── */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="hidden lg:block mb-5 sm:mb-6"
        >
          <div className="inline-flex flex-wrap items-center gap-2 sm:gap-3 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#f4eee5]/95 border border-[#e6dfd5] text-[11px] sm:text-xs text-[#59534b] shadow-2xs backdrop-blur-xs">
            <span className="inline-flex items-center gap-2 font-semibold text-[#22623a]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22623a]" />
              </span>
              Hakim Muhammad Tariq Mahmood Available Today
            </span>

            <span className="text-[#d8cfc4] hidden sm:inline">•</span>

            <span className="hidden sm:inline-flex items-center gap-1.5 text-[#59534b]">
              <MapPin className="w-3 h-3 text-[#c59b27] shrink-0" />
              <span>Matab Korangi, Karachi</span>
            </span>

            <span className="text-[#d8cfc4] hidden md:inline">•</span>

            <span className="hidden md:inline-flex items-center gap-1.5 text-[#8c6a15] font-medium">
              <Truck className="w-3 h-3 text-[#c59b27] shrink-0" />
              <span>Pakistan-Wide Courier</span>
            </span>
          </div>
        </motion.div>

        {/* ── Main Two-Column Hero Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          {/* ── Left Column: Value Proposition & Compact Visual Triage ── */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="w-full lg:col-span-7 flex flex-col items-start space-y-3.5 sm:space-y-4 lg:space-y-5"
          >
            {/* Heritage Lineage Pill (Urdu removed, compact) */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f4eee5] border border-[#e6dfd5] text-[11px] sm:text-xs font-semibold text-[#8c6a15] tracking-wider uppercase shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22623a]" />
              <span className="text-[#22623a] font-bold">Matab Tameer-e-Sehat</span>
              <span className="text-[#d8cfc4]">·</span>
              <span className="text-[#8c6a15] font-medium">Est. 1990</span>
            </div>

            {/* Punchy 1-Line Headline & Concise 1-Line Subtitle */}
            <div className="space-y-1.5 sm:space-y-2.5 max-w-2xl">
              <h1 className="font-serif text-2xl sm:text-4xl lg:text-[44px] xl:text-[48px] font-bold text-[#22623a] leading-[1.15] sm:leading-[1.18] tracking-tight">
                Classical Unani Healing &amp; Botanical Care
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-[#59534b] leading-relaxed max-w-xl">
                Personalized consultations &amp; pure herbal remedies for chronic health.
              </p>
            </div>

            {/* Two Action Buttons */}
            <div className="w-full sm:w-auto">
              <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() =>
                    openConsultation({
                      mode: "WHATSAPP",
                      message:
                        "Assalam-o-Alaikum Hakim Muhammad Tariq Mahmood Sahib, I would like to consult with you regarding authentic herbal guidance for my health.",
                    })
                  }
                  className="inline-flex items-center justify-center gap-1.5 sm:gap-2.5 px-3 sm:px-8 py-3 sm:py-4 bg-[#22623a] hover:bg-[#1a4d2e] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 group w-full sm:w-auto cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c59b27] shrink-0" />
                  <span className="truncate">Consult Hakim Sahib</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform shrink-0 hidden sm:inline" />
                </button>

                <a
                  href="#remedies"
                  className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-7 py-3 sm:py-4 bg-white hover:bg-[#faf8f5] text-[#22623a] border border-[#e6dfd5] hover:border-[#22623a] text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs hover:shadow-sm w-full sm:w-auto text-center"
                >
                  <span className="truncate">Browse Remedies</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8c6a15] shrink-0" />
                </a>
              </div>

              {/* Direct clinic telephone micro-text (Desktop only) */}
              <div className="hidden lg:flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#7a7268] pt-2">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#22623a]" />
                  <span>
                    Direct Matab:{" "}
                    <a
                      href={`tel:${CLINIC_INFO.phone.replace(/[^0-9]/g, "")}`}
                      className="font-semibold text-[#22623a] hover:underline"
                    >
                      {CLINIC_INFO.phone}
                    </a>
                  </span>
                </span>
                <span className="text-[#d8cfc4]">•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#c59b27]" />
                  <span>Mon–Sat 10am–9pm</span>
                </span>
              </div>
            </div>

            {/* Visual Condition Triage Cards (Icon + 2-3 words) */}
            <div className="pt-1 sm:pt-2 w-full space-y-2 sm:space-y-2.5">
              <div className="hidden lg:flex items-center justify-between">
                <span className="text-xs font-semibold text-[#6a6660] uppercase tracking-wider">
                  Select Your Health Concern:
                </span>
                <span className="text-[11px] text-[#8c6a15] font-medium hidden sm:inline">
                  Instant WhatsApp Consultation
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 w-full">
                {CONDITION_CARDS.map((card) => (
                  <button
                    key={card.title}
                    type="button"
                    onClick={() => handleConditionClick(card)}
                    className="group relative flex items-center gap-2 sm:gap-2.5 p-2 sm:p-3 rounded-xl bg-white hover:bg-[#f4eee5] border border-[#e6dfd5] hover:border-[#22623a] transition-all hover:shadow-xs text-left cursor-pointer active:scale-[0.98]"
                    title={`Consult Hakim Muhammad Tariq Mahmood regarding ${card.concern}`}
                  >
                    <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#faf8f5] group-hover:bg-white text-sm sm:text-base flex items-center justify-center shrink-0 border border-[#e6dfd5]/60 transition-colors">
                      {card.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] sm:text-[13px] font-semibold text-[#1a1816] group-hover:text-[#22623a] truncate transition-colors leading-tight">
                        {card.title}
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-[#8c6a15] font-medium flex items-center gap-0.5 opacity-80 group-hover:opacity-100 mt-0.5">
                        <span>Consult</span>
                        <span className="text-[9px]">→</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Clinical Trust & Safety Checkmarks (Desktop only) */}
            <div className="hidden lg:flex pt-1 flex-wrap items-center gap-4 text-xs text-[#59534b]">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#22623a] shrink-0" />
                Zero Steroids or Synthetics
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#c59b27] shrink-0" />
                Licensed Physical Matab
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Truck className="w-4 h-4 text-[#22623a] shrink-0" />
                Cash on Delivery Available
              </span>
            </div>
          </motion.div>

          {/* ── Right Column: Authentic Hakim Muhammad Tariq Mahmood Authority Card (Desktop only) ── */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="hidden lg:block lg:col-span-5 relative mt-4 lg:mt-0"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Authentic Hakim Authority Card Frame */}
              <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-gradient-to-b from-[#f7f3ec] to-[#ece5d8] p-3 sm:p-3.5">
                {/* Visual Imagery Container with Portrait */}
                <div className="relative aspect-[4/4.3] sm:aspect-[4/4.2] rounded-2xl overflow-hidden bg-[#22623a]/10 shadow-inner group">
                  <Image
                    src="/images/2-scaled.png"
                    alt="Hakim Muhammad Tariq Mahmood - Senior Tibbi Physician at Matab Tameer-e-Sehat Karachi"
                    fill
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-102"
                    priority
                    sizes="(max-width: 1024px) 100vw, 480px"
                  />

                  {/* Gradient overlay for high contrast text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#143e23] via-[#22623a]/30 to-transparent" />

                  {/* Top-Right Floating Est. 1990 Badge */}
                  <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-md rounded-xl border border-[#e6dfd5] px-3 py-1.5 shadow-md flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#c59b27]" />
                    <span className="text-[11px] font-bold text-[#22623a] uppercase tracking-wide">
                      Est. 1990
                    </span>
                  </div>

                  {/* Top-Left Floating 100% Botanical Badge */}
                  <div className="absolute top-3.5 left-3.5 bg-[#22623a]/90 backdrop-blur-md text-white rounded-xl border border-white/20 px-3 py-1.5 shadow-md flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-[#c59b27]" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      100% Botanical
                    </span>
                  </div>

                  {/* Bottom Portrait Info Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 text-white space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#c59b27] text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider shadow-xs">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified Chief Physician</span>
                    </div>

                    <h3 className="font-serif text-lg sm:text-xl font-bold text-white tracking-tight leading-tight">
                      Hakim Muhammad Tariq Mahmood
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#f4eee5]/95">
                      <span>35+ Years Lineage</span>
                      <span className="text-[#c59b27]">•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#c59b27]" />
                        <span>Matab Korangi, Karachi</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sub-Card: Direct Verification & Rating Badge */}
                <div className="mt-3 p-3 bg-white/95 rounded-2xl border border-[#e6dfd5] shadow-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22623a]" />
                    </span>
                    <span className="text-xs font-semibold text-[#22623a]">
                      Daily Clinical Consultations
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#8c6a15] shrink-0">
                    <Star className="w-3.5 h-3.5 fill-[#c59b27] text-[#c59b27]" />
                    <span>5.0 Verified Reviews</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Bottom Hero Metric & Proof Strip (Desktop only) ── */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="hidden lg:block mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-[#e6dfd5]/80"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {/* Metric 1 */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#f4eee5]/70 border border-[#e6dfd5]/80 hover:bg-[#f4eee5] transition-colors">
              <div className="flex items-center gap-2 text-[#22623a] font-serif font-bold text-xl sm:text-2xl lg:text-3xl">
                <span>35+ Years</span>
                <Award className="w-4 h-4 text-[#c59b27] shrink-0" />
              </div>
              <div className="text-xs sm:text-sm font-semibold text-[#22623a] mt-0.5">
                Heritage &amp; Experience
              </div>
              <p className="text-[11px] sm:text-xs text-[#6a6660] mt-0.5">
                Matab Korangi Since 1990
              </p>
            </div>

            {/* Metric 2 */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#f4eee5]/70 border border-[#e6dfd5]/80 hover:bg-[#f4eee5] transition-colors">
              <div className="flex items-center gap-2 text-[#22623a] font-serif font-bold text-xl sm:text-2xl lg:text-3xl">
                <span>150,000+</span>
                <Activity className="w-4 h-4 text-[#22623a] shrink-0" />
              </div>
              <div className="text-xs sm:text-sm font-semibold text-[#22623a] mt-0.5">
                Patients Treated
              </div>
              <p className="text-[11px] sm:text-xs text-[#6a6660] mt-0.5">
                Across Pakistan &amp; Abroad
              </p>
            </div>

            {/* Metric 3 */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#f4eee5]/70 border border-[#e6dfd5]/80 hover:bg-[#f4eee5] transition-colors">
              <div className="flex items-center gap-2 text-[#22623a] font-serif font-bold text-xl sm:text-2xl lg:text-3xl">
                <span>100%</span>
                <Leaf className="w-4 h-4 text-[#22623a] shrink-0" />
              </div>
              <div className="text-xs sm:text-sm font-semibold text-[#22623a] mt-0.5">
                Botanical Remedies
              </div>
              <p className="text-[11px] sm:text-xs text-[#6a6660] mt-0.5">
                Zero Steroids or Chemicals
              </p>
            </div>

            {/* Metric 4 */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#f4eee5]/70 border border-[#e6dfd5]/80 hover:bg-[#f4eee5] transition-colors">
              <div className="flex items-center gap-2 text-[#22623a] font-serif font-bold text-xl sm:text-2xl lg:text-3xl">
                <span>Pakistan-Wide</span>
                <Truck className="w-4 h-4 text-[#c59b27] shrink-0" />
              </div>
              <div className="text-xs sm:text-sm font-semibold text-[#22623a] mt-0.5">
                Courier Delivery
              </div>
              <p className="text-[11px] sm:text-xs text-[#6a6660] mt-0.5">
                Dispatched from Karachi Matab
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

