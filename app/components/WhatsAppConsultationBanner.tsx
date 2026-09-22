"use client";

import React from "react";
import Link from "next/link";
import { CLINIC_INFO } from "@/app/data/products";
import { MessageCircle, Sparkles, Phone, ShieldCheck, Mic, ArrowRight } from "lucide-react";
import Reveal from "./motion/Reveal";

export default function WhatsAppConsultationBanner() {
  const whatsappConsultationUrl = `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(
    "Assalam-o-Alaikum Hakim Sahib, I would like to seek herbal guidance regarding my health symptoms."
  )}`;

  return (
    <section id="whatsapp-consult" className="py-16 sm:py-20 lg:py-24 bg-[#22623a] text-white relative overflow-hidden">
      {/* Subtle background decorative shapes */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#143e23]/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#c59b27]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Reveal>
          <div className="bg-[#0b1f14] rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#143e23] shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">

            {/* Left Content */}
            <div className="space-y-3.5 text-center lg:text-left max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#143e23] border border-[#2d7648] text-xs font-bold text-[#c59b27] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Zero Forms · 100% Free · Bila-Muawza</span>
              </span>

              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                Direct Consultation with Hakim Muhammad Tariq
              </h2>

              <p className="text-xs sm:text-sm text-[#f4eee5]/80 leading-relaxed">
                No complex clinical forms or typing essays. Send an audio voice note or pictures of medical reports directly on WhatsApp for an authentic Unani evaluation.
              </p>

              {/* Comfort Trust Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 text-xs text-[#f4eee5]/85">
                <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  <Mic className="w-3.5 h-3.5 text-[#25D366]" /> Voice Notes Welcome
                </span>
                <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#c59b27]" /> 100% Confidential
                </span>
                <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  <Phone className="w-3.5 h-3.5 text-[#c59b27]" /> <span dir="ltr">{CLINIC_INFO.phoneFormatted}</span>
                </span>
              </div>
            </div>

            {/* Right Action CTAs */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto shrink-0">
              <a
                href={whatsappConsultationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageCircle className="w-4.5 h-4.5" />
                <span>Open WhatsApp Chat</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <Link
                href="/consultation"
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#143e23] hover:bg-[#2d7648] text-white text-xs font-bold uppercase tracking-wider rounded-xl border border-[#2d7648] transition-all text-center hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>2-Tap Health Diagnostic Hub</span>
              </Link>
            </div>

          </div>
        </Reveal>
      </div>
    </section>
  );
}
