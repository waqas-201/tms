"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import ConsultationModal from "./ConsultationModal";

export default function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  return (
    <>
      <section
        id="hero"
        className="relative bg-[#faf8f5] border-b border-[#e6dfd5] overflow-hidden py-8 sm:py-14 lg:py-16 xl:py-20 flex flex-col justify-center"
      >
        {/* Subtle background ambient glow */}
        <div className="absolute top-0 right-0 -mr-28 -mt-28 w-96 h-96 rounded-full bg-[#22623a]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-28 -mb-28 w-96 h-96 rounded-full bg-[#c59b27]/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">

            {/* ── Left Column: Value Proposition & Clear Actions ── */}
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full lg:col-span-7 flex flex-col items-start space-y-3.5 sm:space-y-6"
            >
              {/* Trust Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#f4eee5] border border-[#e6dfd5] text-[#22623a] text-[11px] sm:text-xs font-semibold tracking-wide shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#22623a] animate-pulse shrink-0" />
                <span className="sm:hidden">Classical Unani · Karachi Dispensary</span>
                <span className="hidden sm:inline">Classical Unani Herbal Care · Est. 1990</span>
                <span className="hidden sm:inline text-[#e6dfd5]">|</span>
                <span className="hidden sm:inline text-[#8c6a15] font-bold">100% Botanical</span>
              </div>

              {/* Headline & Subtitle */}
              <div className="space-y-2 sm:space-y-3.5 max-w-2xl">
                <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#22623a] leading-[1.15] tracking-tight">
                  Heal Naturally with a Trusted Hakim
                </h1>
                <p className="text-xs sm:text-base lg:text-lg text-[#59534b] leading-relaxed max-w-xl">
                  Personalized Unani consultations and handcrafted botanical remedies for chronic stomach, joint, liver, and vitality issues — 100% steroid-free.
                </p>
              </div>

              {/* CTAs */}
              <div className="pt-1 sm:pt-2 w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2.5 px-5 sm:px-7 py-3 sm:py-3.5 bg-[#22623a] hover:bg-[#1a4d2e] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 group w-full sm:w-auto cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#c59b27] shrink-0" />
                    <span>Consult Hakim Sahib</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
                  </button>

                  <a
                    href="#remedies"
                    className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 bg-white hover:bg-[#faf8f5] text-[#22623a] border border-[#e6dfd5] hover:border-[#22623a] text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs hover:shadow-sm w-full sm:w-auto text-center"
                  >
                    <span>Browse Remedies</span>
                    <ArrowRight className="w-4 h-4 text-[#8c6a15] shrink-0" />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* ── Right Column: Editorial Visual (Desktop Only: hidden lg:block) ── */}
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
              className="hidden lg:block lg:col-span-5 relative"
            >
              <div className="relative mx-auto max-w-md">
                {/* Image Container */}
                <div className="relative aspect-[4/4.2] rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-[#f6f2ea] w-full">
                  <Image
                    src="/images/Natures-Pharmacy-Floral-Bottle-with-Herbs-and-Medicine.jpg"
                    alt="Tameer-e-Sehat Classical Unani Herbal Medicine Pakistan"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#22623a]/40 via-transparent to-transparent" />
                </div>

                {/* Proof Badge */}
                <motion.div
                  initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-md rounded-2xl border border-[#e6dfd5] p-3.5 shadow-lg flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#22623a] text-[#c59b27] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#22623a]">Zero Steroids · 100% Herbal</span>
                      <span className="text-[#c59b27] text-xs font-bold">⭐ 5.0</span>
                    </div>
                    <p className="text-[11px] text-[#6a6660]">
                      Tameer-e-Sehat Clinic · Korangi, Karachi
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Universal Consultation Modal */}
      <ConsultationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialMode="WHATSAPP"
      />
    </>
  );
}
