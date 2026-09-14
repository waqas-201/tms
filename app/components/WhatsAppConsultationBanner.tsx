"use client";

import React from "react";
import Link from "next/link";
import { CLINIC_INFO } from "@/app/data/products";
import { MessageCircle, Sparkles, Phone, ShieldCheck } from "lucide-react";

export default function WhatsAppConsultationBanner() {
  const whatsappConsultationUrl = `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(
    "Assalam-o-Alaikum Hakim Sahib, I would like to seek guidance regarding my health symptoms."
  )}`;

  return (
    <section className="py-16 bg-[#123824] text-white relative overflow-hidden">
      {/* Subtle background decorative shapes */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#1a4d33]/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#c59b27]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-[#0b1f14] rounded-2xl p-8 sm:p-12 border border-[#1a4d33] shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">

          {/* Left Content */}
          <div className="space-y-3 text-center lg:text-left max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-[#c59b27]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct Hakim Guidance</span>
            </span>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
              Have a Health Question?
            </h2>

            <p className="text-sm text-[#c59b27] font-serif italic">
              Speak directly with our Hakim about your symptoms and find the right natural remedy.
            </p>

            <p className="text-xs sm:text-sm text-[#f4eee5]/80 leading-relaxed pt-1">
              Whether you are dealing with knee pain, stomach gas, acidity, or low energy, we give you honest, friendly advice.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs text-[#f4eee5]/70">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#c59b27]" /> 100% Private & Confidential
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4 text-[#c59b27]" /> <span dir="ltr">Phone: {CLINIC_INFO.phoneFormatted}</span>
              </span>
            </div>
          </div>

          {/* Right Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3.5 w-full sm:w-auto shrink-0">
            <a
              href={whatsappConsultationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs sm:text-sm font-semibold rounded-md shadow-lg transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Message on WhatsApp</span>
            </a>

            <Link
              href="/consultation"
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1a4d33] hover:bg-[#256644] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-md border border-[#256644] transition-all text-center"
            >
              <span>Fill Consultation Form</span>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
