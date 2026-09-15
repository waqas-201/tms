"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CLINIC_INFO, CONSULTATION_AREAS } from "@/app/data/products";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  MessageCircle,
  Video,
  Building2,
  Clock,
  Users,
  ChevronRight,
} from "lucide-react";
import ConsultationModal from "./ConsultationModal";

const QUICK_CONCERNS = [
  "Stomach, Gas & Acidity (Digestion)",
  "Joint, Knee & Back Pain",
  "Liver Detox & Body Heat",
  "Fatigue, Energy & Brain Focus",
  "Chest, Cough & Allergies",
  "Hair Fall & Skin Issues",
];

export default function HeroSection() {
  const [consultMode, setConsultMode] = useState<"ONLINE" | "PHYSICAL">("ONLINE");
  const [selectedConcern, setSelectedConcern] = useState(QUICK_CONCERNS[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const generateQuickWhatsApp = () => {
    const text = `*Assalam-o-Alaikum Hakim Sahib!*\n\nI would like to consult about: *${selectedConcern}*\n\n_Please guide me on treatment options._`;
    return `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <>
      <section className="relative bg-[#faf8f5] border-b border-[#e6dfd5] overflow-hidden py-8 sm:py-10 lg:py-12 xl:py-14">
        {/* Subtle ambient orbs */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-[#138833]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-[#c59b27]/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">

            {/* ── Left Column: Headline, CTAs & Stats (7 cols) ── */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              {/* Heritage Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f4eee5] border border-[#e6dfd5] text-[#138833] text-[11px] sm:text-xs font-medium tracking-wide">
                <span className="w-2 h-2 rounded-full bg-[#c59b27]" />
                <span className="font-semibold">Personalized Hakim Consultation & Herbal Clinic</span>
                <span className="text-[#6a6660]">·</span>
                <span>Since 1990, Karachi</span>
              </div>

              {/* Primary Headline */}
              <div className="space-y-2">
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-[52px] font-bold text-[#138833] leading-[1.12] tracking-tight">
                  Natural Healing, Expert Hakim Guidance &amp;{" "}
                  <span className="italic font-normal text-[#1b993e]">
                    Pure Herbal Care.
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-[#8c6a15] font-serif italic">
                  Personalized Unani Tibb consultations for the whole family — online or at our Karachi clinic.
                </p>
              </div>

              {/* Value paragraph */}
              <p className="text-xs sm:text-sm lg:text-[15px] text-[#59534b] leading-relaxed max-w-xl">
                Tell our experienced Hakim about your symptoms. Receive a tailored herbal prescription, dietary guidance, and ongoing follow-up care — with zero synthetic drugs or steroids.
              </p>

              {/* ── Consultation Quick-Start Card ── */}
              <div className="bg-white border border-[#e6dfd5] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                {/* Mode Tabs */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConsultMode("ONLINE")}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
                      consultMode === "ONLINE"
                        ? "bg-[#138833] text-white shadow-xs"
                        : "bg-[#faf8f5] text-[#59534b] border border-[#e6dfd5] hover:border-[#138833]"
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Online WhatsApp Consult</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultMode("PHYSICAL")}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
                      consultMode === "PHYSICAL"
                        ? "bg-[#8c6a15] text-white shadow-xs"
                        : "bg-[#faf8f5] text-[#59534b] border border-[#e6dfd5] hover:border-[#8c6a15]"
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>In-Person Karachi Clinic</span>
                  </button>
                </div>

                {/* Quick Concern Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-[#8c6a15] tracking-widest">
                    What is your health concern?
                  </label>
                  <select
                    value={selectedConcern}
                    onChange={(e) => setSelectedConcern(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#138833]"
                  >
                    {QUICK_CONCERNS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic Action Button */}
                {consultMode === "ONLINE" ? (
                  <a
                    href={generateQuickWhatsApp()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Start WhatsApp Consultation Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#138833] hover:bg-[#0f7229] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Book Clinic Appointment Slot</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {consultMode === "ONLINE" && (
                  <p className="text-[10px] text-center text-[#7a7268]">
                    <Clock className="w-3 h-3 inline-block mr-1 text-[#138833]" />
                    Hakim responds within 2–4 hrs on working days · Patients across Pakistan &amp; Abroad
                  </p>
                )}
                {consultMode === "PHYSICAL" && (
                  <p className="text-[10px] text-center text-[#7a7268]">
                    <Clock className="w-3 h-3 inline-block mr-1 text-[#138833]" />
                    Korangi Crossing, Karachi · Mon–Sat 10AM–9PM · Friday 3PM–9PM
                  </p>
                )}
              </div>

              {/* Social Proof Metrics Row */}
              <div className="pt-2 border-t border-[#e6dfd5] grid grid-cols-3 gap-3 sm:gap-6">
                <div>
                  <div className="text-lg sm:text-2xl font-serif font-bold text-[#138833]">35+</div>
                  <div className="text-[10px] sm:text-xs text-[#6a6660]">Years Clinical Expertise</div>
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-serif font-bold text-[#138833]">150K+</div>
                  <div className="text-[10px] sm:text-xs text-[#6a6660]">Patients Treated</div>
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-serif font-bold text-[#138833]">100%</div>
                  <div className="text-[10px] sm:text-xs text-[#6a6660]">Chemical & Steroid Free</div>
                </div>
              </div>
            </div>

            {/* ── Right Column: Editorial Visual (5 cols) ── */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-none">
                {/* Main Image */}
                <div className="relative aspect-[4/4.4] lg:aspect-[4/4.6] rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-[#f6f2ea] max-h-[440px] w-full">
                  <Image
                    src="/images/Natures-Pharmacy-Floral-Bottle-with-Herbs-and-Medicine.jpg"
                    alt="Tameer-e-Sehat Herbal Clinic & Natural Remedies Pakistan"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#138833]/80 via-transparent to-transparent" />

                  {/* Floating Clinic Card */}
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 sm:bottom-4 sm:left-4 sm:right-4 p-3 sm:p-3.5 bg-white/95 backdrop-blur-xs rounded-xl border border-[#e6dfd5] shadow-lg">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#138833] text-[#c59b27] flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] sm:text-xs font-semibold text-[#138833] truncate">
                          Tameer-e-Sehat Herbal Clinic
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-[#6a6660] truncate">
                          Korangi, Karachi · Est. 1990
                        </p>
                      </div>
                      <a
                        href={`https://wa.me/${CLINIC_INFO.whatsappNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 sm:p-2 bg-[#25D366] text-white rounded-full hover:bg-[#1EBE5D] transition-colors shadow-xs shrink-0"
                        aria-label="Direct WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Floating Trust Badge */}
                <div className="animate-float absolute -top-3 -left-3 sm:-top-4 sm:-left-4 bg-[#138833] text-white p-2.5 sm:p-3 rounded-xl shadow-xl border border-[#1b993e]/40 flex items-center gap-2.5 max-w-[190px]">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#c59b27] shrink-0" />
                  <div className="text-[10px] sm:text-[11px] leading-tight">
                    <span className="font-bold block text-white">Free Consultation</span>
                    <span className="text-[#f4eee5]/80 text-[9px] sm:text-[10px]">No Obligation Symptom Review</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Universal Consultation Modal */}
      <ConsultationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultConcern={selectedConcern}
      />
    </>
  );
}
