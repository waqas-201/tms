"use client";

import React from "react";
import { CLINIC_INFO } from "@/app/data/products";
import { MessageCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export default function WhatsAppFloat() {
  const reducedMotion = useReducedMotion();
  const whatsappUrl = `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(
    "Assalam-o-Alaikum Tameer-e-Sehat, I would like to inquire about herbal consultation and products."
  )}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Hakim / Tameer-e-Sehat on WhatsApp"
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      whileHover={reducedMotion ? {} : { scale: 1.04, y: -2 }}
      whileTap={reducedMotion ? {} : { scale: 0.96 }}
      className="hidden md:flex fixed bottom-6 right-6 z-40 group items-center gap-2.5 bg-primary hover:bg-brand-green-900 text-white px-4 py-2.5 rounded-full shadow-lg border border-brand-green-600/50 transition-colors animate-pulse-ring"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-whatsapp opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-whatsapp"></span>
      </span>
      <div className="w-5 h-5 flex items-center justify-center text-whatsapp group-hover:rotate-12 transition-transform duration-300">
        <MessageCircle className="w-4 h-4 fill-whatsapp" />
      </div>
      <div className="flex flex-col text-left">
        <span className="text-[10px] tracking-wider uppercase text-brand-gold-200 font-semibold leading-none">
          Online Hakim
        </span>
        <span className="text-xs font-medium text-on-primary leading-tight">
          Chat on WhatsApp
        </span>
      </div>
    </motion.a>
  );
}
