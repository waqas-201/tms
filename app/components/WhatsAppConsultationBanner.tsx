"use client";

import React, { useState } from "react";
import { CLINIC_INFO } from "@/app/data/products";
import {
  MessageCircle,
  Sparkles,
  Phone,
  ShieldCheck,
  Mic,
  ArrowRight,
  Building2,
  Calendar,
} from "lucide-react";
import Reveal from "./motion/Reveal";
import ConsultationModal from "./ConsultationModal";

export default function WhatsAppConsultationBanner() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"WHATSAPP" | "PHYSICAL">("WHATSAPP");

  return (
    <>
      <section
        id="whatsapp-consult"
        className="py-12 sm:py-16 lg:py-20 bg-[#22623a] text-white relative overflow-hidden"
      >
        {/* Subtle background decorative ambiance */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#143e23]/50 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#c59b27]/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Reveal>
            <div className="bg-[#0b1f14] rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 border border-[#143e23] shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">

              {/* Left Content */}
              <div className="space-y-3 sm:space-y-4 text-center lg:text-left max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#143e23] border border-[#2d7648] text-xs font-bold text-[#c59b27] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Zero Forms · 100% Free · Bila-Muawza</span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                  Direct Consultation with Hakim Muhammad Tariq
                </h2>

                <p className="text-xs sm:text-sm text-[#f4eee5]/80 leading-relaxed">
                  No complex clinical paperwork. Send an audio voice memo in Urdu/English or attach medical reports for an authentic Unani evaluation and personalized botanical guidance.
                </p>

                {/* Comfort Trust Badges */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 pt-1 text-[11px] sm:text-xs text-[#f4eee5]/85">
                  <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                    <Mic className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>Voice Notes Welcome</span>
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#c59b27]" />
                    <span>100% Confidential</span>
                  </span>
                  <a
                    href={`tel:${CLINIC_INFO.phone}`}
                    className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#c59b27]" />
                    <span dir="ltr">{CLINIC_INFO.phoneFormatted}</span>
                  </a>
                </div>
              </div>

              {/* Right Action CTAs */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setModalMode("WHATSAPP");
                    setIsModalOpen(true);
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <MessageCircle className="w-4.5 h-4.5" />
                  <span>Consult via WhatsApp / Voice</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setModalMode("PHYSICAL");
                    setIsModalOpen(true);
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#143e23] hover:bg-[#2d7648] text-white text-xs font-bold uppercase tracking-wider rounded-xl border border-[#2d7648] transition-all text-center hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-[#c59b27]" />
                  <span>Book Karachi Clinic Visit</span>
                </button>
              </div>

            </div>
          </Reveal>
        </div>
      </section>

      {/* Universal Consultation Modal */}
      <ConsultationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialMessage={
          modalMode === "PHYSICAL"
            ? "I would like to book an in-person consultation appointment at the Karachi clinic with Hakim Muhammad Tariq."
            : "Assalam-o-Alaikum Hakim Sahib, I would like to seek herbal guidance regarding my health symptoms."
        }
        initialMode={modalMode}
      />
    </>
  );
}
