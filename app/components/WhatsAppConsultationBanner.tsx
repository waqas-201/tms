"use client";

import React from "react";
import Link from "next/link";
import { CLINIC_INFO } from "@/app/data/products";
import { MessageCircle, Sparkles, Phone, ShieldCheck, Clock } from "lucide-react";
import Reveal from "./motion/Reveal";

export default function WhatsAppConsultationBanner() {
  const whatsappConsultationUrl = `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(
    "Assalam-o-Alaikum Hakim Sahib, I would like to seek guidance regarding my health symptoms."
  )}`;

  return (
    <section id="whatsapp-consult" className="py-16 sm:py-20 lg:py-24 bg-[#22623a] text-white relative overflow-hidden">
      {/* Subtle background decorative shapes */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#143e23]/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#c59b27]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Reveal>
          <div className="bg-[#0b1f14] rounded-2xl p-6 sm:p-8 border border-[#143e23] shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6">

            {/* Left Content */}
            <div className="space-y-3 text-center lg:text-left max-w-xl">
              <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-[#c59b27]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Direct Hakim Guidance</span>
              </span>

              <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight">
                Get Your Free Consultation Today
              </h2>

              <p className="text-xs sm:text-sm text-[#f4eee5]/80 max-w-md">
                One honest assessment from a qualified Hakim — zero steroids, zero
                obligation, and a clear herbal recovery plan tailor-made for your body.
              </p>

              {/* Urgency Chip — limited daily review slots */}
              <div className="inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-[#c59b27]/15 border border-[#c59b27]/40 text-[#c59b27]">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-[11px] font-semibold">
                  Limited daily review slots — on first-come basis today
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 text-xs text-[#f4eee5]/70">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#c59b27]" /> 100% Private
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#c59b27]" /> <span dir="ltr">{CLINIC_INFO.phoneFormatted}</span>
                </span>
              </div>
            </div>

            {/* Right Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto shrink-0">
              <a
                href={whatsappConsultationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageCircle className="w-4.5 h-4.5" />
                <span>Start Free Consultation</span>
              </a>

              <Link
                href="/consultation"
                className="flex items-center justify-center gap-2 px-5 py-3 bg-[#143e23] hover:bg-[#2d7648] text-white text-xs font-semibold uppercase tracking-wider rounded-xl border border-[#2d7648] transition-all text-center hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Fill Consultation Form</span>
              </Link>
            </div>

          </div>
        </Reveal>
      </div>
    </section>
  );
}