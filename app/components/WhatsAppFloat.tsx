"use client";

import React from "react";
import { CLINIC_INFO } from "@/app/data/products";
import { MessageCircle } from "lucide-react";

export default function WhatsAppFloat() {
  const whatsappUrl = `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(
    "Assalam-o-Alaikum Tameer-e-Sehat, I would like to inquire about herbal consultation and products."
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Hakim / Tameer-e-Sehat on WhatsApp"
      className="fixed bottom-6 left-6 z-40 group flex items-center gap-2.5 bg-[#123824] hover:bg-[#0d281a] text-white px-4 py-2.5 rounded-full shadow-lg border border-[#2a5a3d]/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#25D366]"></span>
      </span>
      <div className="w-5 h-5 flex items-center justify-center text-[#25D366]">
        <MessageCircle className="w-4 h-4 fill-[#25D366]" />
      </div>
      <div className="flex flex-col text-left">
        <span className="text-[10px] tracking-wider uppercase text-[#c59b27] font-semibold leading-none">
          Online Hakim
        </span>
        <span className="text-xs font-medium text-cream-50 leading-tight">
          Chat on WhatsApp
        </span>
      </div>
    </a>
  );
}
