"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CLINIC_INFO } from "@/app/data/products";
import {
  ArrowRight,
  ShieldCheck,
  Award,
  MessageCircle,
  Building2,
  Calendar,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  X,
  Stethoscope,
  Leaf,
  Activity,
  HeartPulse,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import ConsultationModal from "./ConsultationModal";

interface SymptomChip {
  id: string;
  label: string;
  query: string;
  categorySlug?: string;
}

const SYMPTOM_CHIPS: SymptomChip[] = [
  { id: "stomach", label: "Stomach & Digestion", query: "Stomach, Gas, Acidity and Digestion issues", categorySlug: "murabbajaat" },
  { id: "joints", label: "Joint & Back Pain", query: "Joint, Sciatica and Muscular pain", categorySlug: "oils" },
  { id: "liver", label: "Liver & Detox", query: "Liver, Jaundice and Body Detoxification", categorySlug: "arqiyat" },
  { id: "skin", label: "Skin & Hair Care", query: "Skin Allergies, Acne and Hair Health", categorySlug: "skin-hair" },
  { id: "vitality", label: "Vitality & Stamina", query: "General Weakness, Vitality and Energy", categorySlug: "majoon" },
  { id: "respiratory", label: "Cough & Respiration", query: "Chronic Cough, Phlegm and Chest Congestion", categorySlug: "syrups" },
];

export default function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState<SymptomChip | null>(null);
  const reducedMotion = useReducedMotion();

  const generateWhatsAppForSymptom = (symptomText?: string) => {
    const text = symptomText
      ? `*Assalam-o-Alaikum Hakim Sahib!*\n\nI would like to consult regarding treatment for: *${symptomText}*.\n\n_Please guide me on the diagnosis and herbal prescription._`
      : `*Assalam-o-Alaikum Hakim Sahib!*\n\nI would like to consult with you regarding herbal treatment options.\n\n_Please guide me on how to proceed._`;
    return `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  const handleSymptomClick = (symptom: SymptomChip) => {
    if (selectedSymptom?.id === symptom.id) {
      setSelectedSymptom(null);
    } else {
      setSelectedSymptom(symptom);
    }
  };

  // Stagger container variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.04,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" },
    },
  };

  return (
    <>
      <section
        id="hero"
        className="relative bg-[#faf8f5] border-b border-[#e6dfd5] overflow-hidden min-h-[calc(100dvh-64px)] sm:min-h-[calc(100dvh-98px)] lg:min-h-[calc(100dvh-100px)] flex flex-col justify-center py-6 sm:py-8 lg:py-10"
      >
        {/* Subtle animated ambient orbs */}
        <motion.div
          animate={
            reducedMotion
              ? undefined
              : {
                  scale: [1, 1.08, 1],
                  opacity: [0.05, 0.08, 0.05],
                }
          }
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-[#22623a] blur-3xl pointer-events-none"
        />
        <motion.div
          animate={
            reducedMotion
              ? undefined
              : {
                  scale: [1, 1.12, 1],
                  opacity: [0.05, 0.09, 0.05],
                }
          }
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-[#c59b27] blur-3xl pointer-events-none"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">

            {/* ── Left Column: Headline, Symptom Chips, CTAs & Stats (7 cols) ── */}
            <motion.div
              variants={reducedMotion ? undefined : containerVariants}
              initial={reducedMotion ? false : "hidden"}
              animate="visible"
              className="lg:col-span-7 space-y-4 sm:space-y-5"
            >
              {/* Heritage & Google Rating Badges */}
              <motion.div
                variants={reducedMotion ? undefined : itemVariants}
                className="flex flex-wrap items-center gap-2"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f4eee5] border border-[#e6dfd5] text-[#22623a] text-[11px] sm:text-xs font-medium tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-[#c59b27] animate-pulse" />
                  <span className="font-semibold">Classical Unani Herbal Care · Est. 1990</span>
                </div>

                <a
                  href="#community-reviews"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e6dfd5] text-[#1a1816] text-[11px] font-semibold hover:border-[#22623a] transition-all hover:shadow-xs hover:-translate-y-0.5"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                  </svg>
                  <span className="text-[#c59b27] font-bold">5.0★</span>
                  <span className="text-[#59534b]">Google Verified Business</span>
                </a>
              </motion.div>

              {/* Primary Headline */}
              <motion.div
                variants={reducedMotion ? undefined : itemVariants}
                className="space-y-2.5"
              >
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-[52px] font-bold text-[#22623a] leading-[1.12] tracking-tight">
                  Heal Naturally with a Trusted Hakim
                </h1>
                <p className="text-sm sm:text-base text-[#59534b] leading-relaxed max-w-xl">
                  Classical Unani consultations and handcrafted botanical remedies for stomach, joints, liver, skin & vitality — zero steroids, 100% herbal. Consult online or visit our Karachi clinic.
                </p>
              </motion.div>

              {/* ── Interactive Symptom Concern Chips ── */}
              <motion.div
                variants={reducedMotion ? undefined : itemVariants}
                className="space-y-2 pt-1"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-[#6a6660]">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#22623a]" />
                    Select a health concern for targeted care:
                  </span>
                  {selectedSymptom && (
                    <button
                      type="button"
                      onClick={() => setSelectedSymptom(null)}
                      className="text-rose-600 hover:underline text-[10px] font-semibold"
                    >
                      Clear selection
                    </button>
                  )}
                </div>

                {/* Chip Pill Buttons */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {SYMPTOM_CHIPS.map((symptom) => {
                    const isSelected = selectedSymptom?.id === symptom.id;
                    return (
                      <button
                        key={symptom.id}
                        type="button"
                        onClick={() => handleSymptomClick(symptom)}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-[#22623a] text-white shadow-xs scale-105"
                            : "bg-white text-[#4a4640] border border-[#e6dfd5] hover:border-[#22623a] hover:bg-[#faf8f5]"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-[#c59b27]" : "bg-[#22623a]/40"}`} />
                        <span>{symptom.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Animated Smart Dual Action Drawer */}
                <AnimatePresence>
                  {selectedSymptom && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -4 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -4 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden pt-1"
                    >
                      <div className="p-3 bg-gradient-to-r from-emerald-50/80 via-white to-[#faf8f5] border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-[#22623a] text-white flex items-center justify-center shrink-0">
                            <HeartPulse className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#22623a] truncate">
                              Targeted Care: {selectedSymptom.label}
                            </p>
                            <p className="text-[10px] text-[#6a6660] truncate">
                              Browse physician-prepared remedies or consult directly.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href="#remedies"
                            className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-[#22623a] border border-[#cde4d6] rounded-xl text-[11px] font-bold transition-all"
                          >
                            Browse Remedies
                          </a>
                          <a
                            href={generateWhatsAppForSymptom(selectedSymptom.query)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>Consult on WhatsApp</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => setSelectedSymptom(null)}
                            className="p-1.5 text-[#6a6660] hover:text-rose-600 rounded-lg hover:bg-white"
                            title="Close"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* ── Primary Dual CTA Cards ── */}
              <motion.div
                variants={reducedMotion ? undefined : itemVariants}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1"
              >
                {/* WhatsApp Telehealth */}
                <motion.div
                  whileHover={reducedMotion ? undefined : { y: -3, transition: { duration: 0.2 } }}
                  className="bg-white border border-[#e6dfd5] rounded-2xl p-4 shadow-xs space-y-3 hover:border-[#25D366]/60 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#25D366]/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#1a1816]">Online Consult</h3>
                      <p className="text-[10px] text-[#6a6660]">All Pakistan & abroad</p>
                    </div>
                  </div>
                  <a
                    href={generateWhatsAppForSymptom()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs hover:shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Start WhatsApp Now</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                  <p className="text-[9px] text-center text-[#7a7268]">
                    2–4 hr response on working days
                  </p>
                </motion.div>

                {/* Clinic Visit */}
                <motion.div
                  whileHover={reducedMotion ? undefined : { y: -3, transition: { duration: 0.2 } }}
                  className="bg-white border border-[#e6dfd5] rounded-2xl p-4 shadow-xs space-y-3 hover:border-[#22623a]/60 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#8c6a15]/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Building2 className="w-4 h-4 text-[#8c6a15]" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#1a1816]">Karachi Clinic</h3>
                      <p className="text-[10px] text-[#6a6660]">In-person diagnosis</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#22623a] hover:bg-[#1b502e] text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs hover:shadow-sm"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#c59b27]" />
                    <span>Book Appointment</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  <p className="text-[9px] text-center text-[#7a7268]">
                    Korangi Crossing · Mon–Sat 10AM–9PM
                  </p>
                </motion.div>
              </motion.div>

              {/* ── Subtle Apothecary Dispensary Quick Strip ── */}
              <motion.div
                variants={reducedMotion ? undefined : itemVariants}
                className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-gradient-to-r from-[#faf8f5] via-white to-[#faf8f5] border border-[#e6dfd5] shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#22623a]/10 text-[#22623a] flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
                  </div>
                  <div className="text-xs text-[#59534b]">
                    <span className="font-bold text-[#1a1816]">Apothecary Dispensary:</span> Pure Murabba, Arqiyat, Majoon & Herbal Oils
                  </div>
                </div>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#22623a] hover:text-[#1a4d2e] hover:underline"
                >
                  <span>Explore Remedies</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>

              {/* ── Social Proof Metrics Row ── */}
              <motion.div
                variants={reducedMotion ? undefined : itemVariants}
                className="flex items-center gap-6 sm:gap-8 pt-1"
              >
                <div className="flex items-center gap-2">
                  <div className="text-lg sm:text-xl font-serif font-bold text-[#22623a]">35+</div>
                  <div className="text-[10px] sm:text-[11px] text-[#6a6660] leading-tight">Years<br className="hidden sm:block" /> Experience</div>
                </div>
                <div className="w-px h-8 bg-[#e6dfd5]" />
                <a
                  href={CLINIC_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 group cursor-pointer hover:opacity-85 transition-all"
                  title="View verified patient reviews for Matab Tameer-e-sehat on Google"
                >
                  <div className="text-lg sm:text-xl font-serif font-bold text-[#22623a] group-hover:underline">150K+</div>
                  <div className="text-[10px] sm:text-[11px] text-[#6a6660] leading-tight flex items-center gap-0.5">
                    <span>Patients<br className="hidden sm:block" /> Treated</span>
                    <ExternalLink className="w-2.5 h-2.5 text-[#c59b27] opacity-60 group-hover:opacity-100 hidden sm:inline shrink-0" />
                  </div>
                </a>
                <div className="w-px h-8 bg-[#e6dfd5]" />
                <div className="flex items-center gap-2">
                  <div className="text-lg sm:text-xl font-serif font-bold text-[#22623a]">100%</div>
                  <div className="text-[10px] sm:text-[11px] text-[#6a6660] leading-tight">Steroid<br className="hidden sm:block" /> Free</div>
                </div>
              </motion.div>
            </motion.div>

            {/* ── Right Column: Editorial Visual (5 cols) ── */}
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-none">
                {/* Main Image */}
                <div className="relative aspect-[4/4.4] lg:aspect-[4/4.6] rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-[#f6f2ea] max-h-[460px] w-full">
                  <Image
                    src="/images/Natures-Pharmacy-Floral-Bottle-with-Herbs-and-Medicine.jpg"
                    alt="Tameer-e-Sehat Herbal Clinic & Natural Remedies Pakistan"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#22623a]/80 via-transparent to-transparent" />

                  {/* Floating Clinic Card */}
                  <motion.div
                    initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="absolute bottom-3.5 left-3.5 right-3.5 sm:bottom-4 sm:left-4 sm:right-4 p-3 sm:p-3.5 bg-white/95 backdrop-blur-xs rounded-2xl border border-[#e6dfd5] shadow-lg"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#22623a] text-[#c59b27] flex items-center justify-center shrink-0 shadow-xs">
                        <Award className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] sm:text-xs font-bold text-[#22623a] truncate">
                          Tameer-e-Sehat Herbal Clinic
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-[#6a6660] truncate">
                          Korangi, Karachi · Est. 1990 · Hakim Prescribed
                        </p>
                      </div>
                      <a
                        href={`https://wa.me/${CLINIC_INFO.whatsappNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 sm:p-2 bg-[#25D366] text-white rounded-xl hover:bg-[#1EBE5D] transition-all hover:scale-105 shadow-xs shrink-0"
                        aria-label="Direct WhatsApp"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </a>
                    </div>
                  </motion.div>
                </div>

                {/* Floating Trust Badge Top-Left: Zero Steroids & Pure Formulations */}
                <motion.div
                  animate={
                    reducedMotion
                      ? undefined
                      : {
                          y: [0, -4, 0],
                        }
                  }
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 flex items-center gap-2 pl-2.5 pr-3.5 py-2 rounded-full bg-white/95 backdrop-blur-md border border-[#e6dfd5] shadow-lg shadow-[#22623a]/10"
                >
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#eef7f1] border border-[#cde4d6] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#22623a]" />
                  </span>
                  <div className="leading-none">
                    <span className="block text-[11px] sm:text-xs font-bold text-[#22623a] tracking-tight">
                      Zero Steroids · 100% Herbal
                    </span>
                    <span className="block text-[9px] sm:text-[10px] text-[#8c8a84] mt-0.5">
                      Pure Botanical Formulations
                    </span>
                  </div>
                </motion.div>

                {/* Floating Rating Seal Top-Right */}
                <motion.div
                  animate={
                    reducedMotion
                      ? undefined
                      : {
                          y: [0, 4, 0],
                        }
                  }
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#e6dfd5] shadow-lg shadow-[#22623a]/10"
                >
                  <span className="text-[#c59b27] font-bold text-xs">⭐ 5.0</span>
                  <span className="text-[10px] font-semibold text-[#1a1816]">Google Rating</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Consultation Modal */}
      <ConsultationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
