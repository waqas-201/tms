"use client";

import React from "react";
import { CLINIC_INFO } from "@/app/data/products";
import {
  MessageCircle,
  Sparkles,
  Phone,
  ShieldCheck,
  Mic,
  ArrowRight,
  Building2,
} from "lucide-react";
import Reveal from "./motion/Reveal";
import { useConsultation } from "@/app/context/ConsultationContext";

export default function WhatsAppConsultationBanner() {
  const whatsappConsult = useConsultation({ mode: "WHATSAPP" });
  const physicalConsult = useConsultation({ mode: "PHYSICAL" });

  return (
    <section
      id="whatsapp-consult"
      className="py-12 sm:py-16 lg:py-20 bg-primary text-white relative overflow-hidden"
    >
      {/* Subtle background decorative ambiance */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-brand-green-900/50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Reveal>
          <div className="bg-surface-inverse rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 border border-brand-green-900 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">

            {/* Left Content */}
            <div className="space-y-3 sm:space-y-4 text-center lg:text-left max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-green-900 border border-brand-green-600 text-xs font-bold text-brand-gold-500 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Zero Forms · 100% Free · Bila-Muawza</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                Direct Consultation with Hakeem Tahir Hameed
              </h2>

              <p className="text-xs sm:text-sm text-on-inverse/80 leading-relaxed">
                No complex clinical paperwork. Send an audio voice memo in Urdu/English or attach medical reports for an authentic Unani evaluation and personalized botanical guidance.
              </p>

              {/* Comfort Trust Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 pt-1 text-[11px] sm:text-xs text-on-inverse/85">
                <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  <Mic className="w-3.5 h-3.5 text-whatsapp" />
                  <span>Voice Notes Welcome</span>
                </span>
                <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-gold-500" />
                  <span>100% Confidential</span>
                </span>
                <a
                  href={`tel:${CLINIC_INFO.phone}`}
                  className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-brand-gold-500" />
                  <span dir="ltr">{CLINIC_INFO.phoneFormatted}</span>
                </a>
              </div>
            </div>

            {/* Right Action CTAs */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={() =>
                  whatsappConsult.openConsultation({
                    mode: "WHATSAPP",
                    message: "Assalam-o-Alaikum Hakeem Sahib, I would like to seek herbal guidance regarding my health symptoms.",
                  })
                }
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 bg-whatsapp hover:bg-whatsapp-hover text-on-whatsapp text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <MessageCircle className="w-4.5 h-4.5" />
                <span>Consult via WhatsApp / Voice</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  physicalConsult.openConsultation({
                    mode: "PHYSICAL",
                    message: "I would like to book an in-person consultation appointment at the Karachi clinic with Hakeem Tahir Hameed.",
                  })
                }
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-brand-green-900 hover:bg-brand-green-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl border border-brand-green-600 transition-all text-center hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-brand-gold-500" />
                <span>Book Karachi Clinic Visit</span>
              </button>
            </div>

          </div>
        </Reveal>
      </div>
    </section>
  );
}
