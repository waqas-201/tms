"use client";

import React, { useState } from "react";
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
import ConsultationModal from "./ConsultationModal";

export default function HakimAuthoritySection() {
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [consultModalMode, setConsultModalMode] = useState<"WHATSAPP" | "PHYSICAL">("WHATSAPP");

  const clinicalMetrics = [
    { value: "35+", label: "Years Clinical Experience in Karachi", icon: Award },
    {
      value: "150K+",
      label: "Patients Evaluated & Treated",
      icon: Users,
      href: CLINIC_INFO.googleMapsUrl,
      subLabel: "Verified Reviews ↗",
    },
    { value: "100%", label: "Pure Botanical Herbal Extracts", icon: ShieldCheck },
    { value: "0%", label: "Steroids, Chemicals or Additives", icon: Stethoscope },
  ];

  return (
    <>
      <section
        id="hakim-authority"
        className="py-12 sm:py-18 lg:py-22 bg-[#faf8f5] border-b border-[#e6dfd5]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">

          {/* ─── 1. Hakim Clinical Pedigree & Philosophy ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">

            {/* Desktop Full Portrait Visual / Mobile Compact Hero Badge */}
            <Reveal className="lg:col-span-5 relative">
              {/* Desktop Portrait View */}
              <div className="hidden lg:block relative aspect-[4/4.8] rounded-3xl overflow-hidden shadow-xl border-2 border-[#e6dfd5] bg-[#f6f2ea]">
                <Image
                  src="/images/2-scaled.png"
                  alt="Hakim Muhammad Tariq - Tameer-e-Sehat"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 450px"
                  priority={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#22623a]/90 via-[#22623a]/20 to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 text-white space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#c59b27] text-white text-[10px] font-bold uppercase tracking-wider">
                    <Award className="w-3 h-3" />
                    <span>Certified Tibbi Lineage</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold">
                    Hakim Muhammad Tariq
                  </h3>
                  <p className="text-xs text-[#f4eee5]/90 leading-snug">
                    Senior Tibbi Consultant & Master Herbalist · Serving Karachi Since 1990
                  </p>
                </div>
              </div>

              {/* Mobile Compact Avatar & Credentials Card */}
              <div className="block lg:hidden bg-white p-4 rounded-2xl border border-[#e6dfd5] shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-[#cde4d6] bg-[#eef7f1]">
                    <Image
                      src="/images/2-scaled.png"
                      alt="Hakim Muhammad Tariq"
                      fill
                      className="object-cover object-top"
                      sizes="64px"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#eef7f1] text-[#22623a] text-[10px] font-bold">
                      <Award className="w-3 h-3 text-[#c59b27]" />
                      <span>Est. 1990 · 35+ Yrs</span>
                    </div>
                    <h3 className="font-serif text-base font-bold text-[#22623a] truncate mt-0.5">
                      Hakim Muhammad Tariq
                    </h3>
                    <p className="text-[11px] text-[#6a6660] truncate">
                      Senior Tibbi Consultant & Master Herbalist
                    </p>
                  </div>
                </div>
              </div>

              {/* Overlapping Floating Trust Seal for Desktop */}
              <div className="hidden lg:block absolute -bottom-4 -right-3 sm:-bottom-5 sm:-right-5 bg-white p-3.5 rounded-2xl border border-[#cde4d6] shadow-xl max-w-[210px]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#eef7f1] text-[#22623a] flex items-center justify-center shrink-0">
                    <HeartHandshake className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-[#22623a] block">Est. 1990</span>
                    <span className="text-[#6a6660] text-[11px]">35+ Years of Trust</span>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Clinical Heritage & Philosophy Info */}
            <Reveal delay={0.06} className="lg:col-span-7 space-y-4 sm:space-y-5 lg:pl-2">
              <div className="space-y-1.5">
                <span className="text-xs uppercase tracking-widest font-semibold text-[#8c6a15] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Clinical Lineage &amp; Pedigree</span>
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#22623a] leading-tight">
                  Authentic Eastern Healing, Rooted in Pure Herbs
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-[#59534b] leading-relaxed">
                We identify internal temperamental imbalances (Mizaj) and restore organic harmony rather than temporarily masking symptoms with synthetic compounds.
              </p>

              {/* 3 Core Clinical Standards */}
              <div className="space-y-2 pt-1">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#e6dfd5]">
                  <CheckCircle2 className="w-4 h-4 text-[#22623a] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="text-[#1a1816]">Individualized Botanical Care: </strong>
                    <span className="text-[#6a6660]">Customized formulations adjusted for your specific digestion, age, and Mizaj.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#e6dfd5]">
                  <CheckCircle2 className="w-4 h-4 text-[#22623a] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="text-[#1a1816]">Zero Synthetic Steroids: </strong>
                    <span className="text-[#6a6660]">Pure hydro-distillates and herbal preserves guaranteed 100% natural and non-habit forming.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#e6dfd5]">
                  <CheckCircle2 className="w-4 h-4 text-[#22623a] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="text-[#1a1816]">Direct WhatsApp Follow-up: </strong>
                    <span className="text-[#6a6660]">Continuous guidance, dosage titration, and dietary advice throughout your recovery.</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-wrap gap-2.5 sm:gap-3 items-center">
                <button
                  type="button"
                  onClick={() => {
                    setConsultModalMode("WHATSAPP");
                    setIsConsultModalOpen(true);
                  }}
                  className="px-5 py-2.5 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
                  <span>Consult Hakim Sahib</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <Link
                  href="/about"
                  className="px-4 py-2.5 bg-white hover:bg-[#faf8f5] text-[#22623a] border border-[#cde4d6] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all"
                >
                  Our 35-Year Story
                </Link>
              </div>
            </Reveal>
          </div>

          {/* ─── 2. Four Clinical Trust Metrics Strip ─── */}
          <Reveal>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5 bg-white p-4 sm:p-6 rounded-2xl border border-[#e6dfd5] shadow-xs">
              {clinicalMetrics.map((metric, i) => {
                const Icon = metric.icon;
                const content = (
                  <>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#eef7f1] text-[#22623a] flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </div>
                    <span className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-[#22623a] block">
                      {metric.value}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-[#6a6660] font-medium block leading-tight">
                      {metric.label}
                    </span>
                    {"subLabel" in metric && metric.subLabel && (
                      <span className="text-[9px] sm:text-[10px] text-[#8c6a15] font-semibold block pt-0.5">
                        {metric.subLabel}
                      </span>
                    )}
                  </>
                );

                if ("href" in metric && metric.href) {
                  return (
                    <a
                      key={i}
                      href={metric.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-center space-y-1 p-2 rounded-xl hover:bg-[#faf8f5] transition-all group cursor-pointer border border-transparent hover:border-[#cde4d6]"
                      title="Click to view verified reviews on Google"
                    >
                      {content}
                    </a>
                  );
                }

                return (
                  <div key={i} className="text-center space-y-1 p-2">
                    {content}
                  </div>
                );
              })}
            </div>
          </Reveal>

          {/* ─── 3. In-Person Karachi Clinic Visit Card ─── */}
          <Reveal className="p-5 sm:p-8 lg:p-10 bg-white rounded-3xl border border-[#e6dfd5] shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">

              {/* Left: Location & Hours Details (7 cols) */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eef7f1] border border-[#cde4d6] text-[#22623a] text-xs font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-[#c59b27]" />
                  <span>Physical Dispensary &amp; Matab in Karachi</span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-[#22623a]">
                    Visit Our Clinic for Pulse Diagnosis (Nabz)
                  </h3>
                  <p className="text-xs sm:text-sm text-[#59534b]">
                    Prefer an in-person consultation? Visit Hakim Muhammad Tariq at our established Korangi clinic in Karachi for on-the-spot pulse examination and freshly compounded botanical remedies.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Address Card */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-[#faf8f5] border border-[#e6dfd5] space-y-1.5">
                    <div className="flex items-center gap-2 text-[#22623a] font-bold text-xs">
                      <MapPin className="w-4 h-4 text-[#c59b27]" />
                      <span>Clinic Location</span>
                    </div>
                    <p className="text-xs text-[#59534b] leading-relaxed">
                      {CLINIC_INFO.address}
                    </p>
                    <a
                      href={CLINIC_INFO.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#22623a] hover:underline pt-0.5"
                    >
                      <Navigation className="w-3 h-3 text-[#8c6a15]" />
                      <span>Open in Google Maps →</span>
                    </a>
                  </div>

                  {/* Visiting Hours Card */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-[#faf8f5] border border-[#e6dfd5] space-y-1.5">
                    <div className="flex items-center gap-2 text-[#22623a] font-bold text-xs">
                      <Clock className="w-4 h-4 text-[#c59b27]" />
                      <span>Visiting Hours</span>
                    </div>
                    <p className="text-xs text-[#59534b]">
                      <strong>Mon – Sat:</strong> {CLINIC_INFO.timings}
                    </p>
                    <p className="text-xs text-[#8c6a15] font-semibold">
                      <strong>Friday:</strong> {CLINIC_INFO.fridayTimings}
                    </p>
                    <p className="text-[10px] text-[#7a7268]">Walk-ins welcome; prior booking advised.</p>
                  </div>
                </div>
              </div>

              {/* Right: Quick Action Booking Banner (5 cols) */}
              <div className="lg:col-span-5 bg-[#22623a] rounded-2xl p-5 sm:p-6 text-white space-y-3.5 shadow-md">
                <div className="flex items-center gap-2 text-[#c59b27] text-xs font-bold uppercase tracking-wider">
                  <Calendar className="w-4 h-4" />
                  <span>Reserve Consultation</span>
                </div>

                <h4 className="font-serif text-lg font-bold text-white">
                  Book In-Person Time Slot
                </h4>

                <p className="text-xs text-[#f4eee5]/85 leading-relaxed">
                  Reserve your dedicated consultation slot to avoid waiting lines at the Karachi Matab dispensary.
                </p>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setConsultModalMode("PHYSICAL");
                      setIsConsultModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Select Clinic Slot &amp; Book</span>
                  </button>

                  <a
                    href={`https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(
                      "Assalam-o-Alaikum Hakim Sahib, I would like to schedule an in-person clinic visit in Karachi."
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-all text-center"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>Direct WhatsApp Booking</span>
                  </a>

                  <a
                    href={`tel:${CLINIC_INFO.phone}`}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-transparent hover:bg-white/5 text-white/90 text-xs font-medium rounded-xl transition-all text-center"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#c59b27]" />
                    <span>Call Clinic: {CLINIC_INFO.phoneFormatted}</span>
                  </a>
                </div>
              </div>

            </div>
          </Reveal>

        </div>
      </section>

      {/* Universal Consultation Modal */}
      <ConsultationModal
        isOpen={isConsultModalOpen}
        onClose={() => setIsConsultModalOpen(false)}
        initialMessage={
          consultModalMode === "PHYSICAL"
            ? "I would like to book an in-person consultation appointment at the Karachi clinic with Hakim Muhammad Tariq."
            : "I would like to consult with Hakim Muhammad Tariq regarding authentic herbal guidance for my health condition."
        }
        initialMode={consultModalMode}
      />
    </>
  );
}
