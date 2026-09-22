"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CLINIC_INFO } from "@/app/data/products";
import {
  ArrowRight,
  MessageCircle,
  Calendar,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import ConsultationModal from "./ConsultationModal";

export default function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  const whatsAppUrl = `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(
    "Assalam-o-Alaikum Hakim Sahib! I would like to consult with you regarding herbal treatment options."
  )}`;

  return (
    <>
      <section
        id="hero"
        className="relative bg-[#faf8f5] border-b border-[#e6dfd5] overflow-hidden min-h-[calc(100dvh-64px)] sm:min-h-[calc(100dvh-98px)] lg:min-h-[calc(100dvh-100px)] flex flex-col justify-center py-8 sm:py-12 lg:py-16"
      >
        {/* Subtle background ambient glow */}
        <div className="absolute top-0 right-0 -mr-28 -mt-28 w-96 h-96 rounded-full bg-[#22623a]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-28 -mb-28 w-96 h-96 rounded-full bg-[#c59b27]/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* ── Left Column: Value Proposition & Clear Actions (7 cols) ── */}
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="lg:col-span-7 space-y-6 sm:space-y-7"
            >
              {/* Single Unified Trust Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f4eee5] border border-[#e6dfd5] text-[#22623a] text-xs font-semibold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-[#22623a] animate-pulse" />
                <span>Classical Unani Herbal Care · Est. 1990</span>
                <span className="text-[#e6dfd5]">|</span>
                <span className="text-[#8c6a15] font-bold">5.0★ Google Verified</span>
              </div>

              {/* Main Headline & Subtitle */}
              <div className="space-y-3 sm:space-y-4">
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#22623a] leading-[1.12] tracking-tight">
                  Heal Naturally with a Trusted Hakim
                </h1>
                <p className="text-base sm:text-lg text-[#59534b] leading-relaxed max-w-xl">
                  Personalized Unani consultations and handcrafted botanical remedies for chronic stomach, joint, liver, and vitality issues — 100% pure herbal and steroid-free.
                </p>
              </div>

              {/* Goal-Focused CTAs */}
              <div className="space-y-3 pt-1">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Primary WhatsApp Action */}
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#22623a] hover:bg-[#1a4d2e] text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 group"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    <span>Consult on WhatsApp</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>

                  {/* Secondary Browse Remedies Action */}
                  <a
                    href="#remedies"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-[#faf8f5] text-[#22623a] border border-[#e6dfd5] hover:border-[#22623a] text-sm font-bold rounded-xl transition-all shadow-xs hover:shadow-sm"
                  >
                    <span>Browse Remedies</span>
                    <ArrowRight className="w-4 h-4 text-[#8c6a15]" />
                  </a>
                </div>

                {/* Sub-CTA Note & Clinic Booking Link */}
                <div className="flex items-center gap-2 text-xs text-[#6a6660]">
                  <span>Fast 2–4 hr response on WhatsApp.</span>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="text-[#22623a] font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#8c6a15]" />
                    <span>Book Karachi Clinic Visit</span>
                  </button>
                </div>
              </div>

              {/* Clean 3-Metric Stats Strip */}
              <div className="pt-4 border-t border-[#e6dfd5] flex items-center gap-6 sm:gap-10">
                <div>
                  <p className="text-xl sm:text-2xl font-serif font-bold text-[#22623a]">35+</p>
                  <p className="text-xs text-[#6a6660]">Years Experience</p>
                </div>
                <div className="w-px h-8 bg-[#e6dfd5]" />
                <a
                  href={CLINIC_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group cursor-pointer"
                  title="View verified reviews on Google"
                >
                  <div className="flex items-center gap-1">
                    <p className="text-xl sm:text-2xl font-serif font-bold text-[#22623a] group-hover:underline">150K+</p>
                    <ExternalLink className="w-3 h-3 text-[#8c6a15] opacity-70 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-[#6a6660]">Patients Treated</p>
                </a>
                <div className="w-px h-8 bg-[#e6dfd5]" />
                <div>
                  <p className="text-xl sm:text-2xl font-serif font-bold text-[#22623a]">100%</p>
                  <p className="text-xs text-[#6a6660]">Steroid-Free</p>
                </div>
              </div>
            </motion.div>

            {/* ── Right Column: Editorial Visual with Single Proof Badge (5 cols) ── */}
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-none">
                {/* Image Container */}
                <div className="relative aspect-[4/4.5] rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-[#f6f2ea] w-full">
                  <Image
                    src="/images/Natures-Pharmacy-Floral-Bottle-with-Herbs-and-Medicine.jpg"
                    alt="Tameer-e-Sehat Classical Unani Herbal Medicine Pakistan"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#22623a]/50 via-transparent to-transparent" />
                </div>

                {/* Single Clean Floating Proof Badge */}
                <motion.div
                  initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="absolute -bottom-4 -left-3 sm:-bottom-5 sm:-left-4 right-3 sm:right-auto bg-white/95 backdrop-blur-md rounded-2xl border border-[#e6dfd5] p-3.5 sm:px-4 sm:py-3 shadow-lg flex items-center gap-3"
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

      {/* In-person Clinic Consultation Modal */}
      <ConsultationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
