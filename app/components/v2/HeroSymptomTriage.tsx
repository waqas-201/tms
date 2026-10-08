"use client";

import React, { useState } from "react";
import {
  Activity,
  Shield,
  Sun,
  Sparkles,
  Wind,
  Heart,
  MessageCircle,
  ArrowRight,
  Star,
  CheckCircle2,
} from "lucide-react";
import { CLINIC_INFO } from "@/app/data/products";
import EmpathyDrawer, { SymptomDetail } from "./EmpathyDrawer";

export const SYMPTOMS_LIST: SymptomDetail[] = [
  {
    id: "gastro-digestive",
    icon: Activity,
    emoji: "🔥",
    title: "Stomach, Acid & Gas",
    urduTitle: "معدہ، تیزابیت اور گیس",
    hakimInsight:
      "Chronic acidity and bloating often stem from metabolic heat (Tezabiat) and weak gastric lining. Steam-distilled botanicals soothe the stomach without dependency.",
    recommendedRemedy: {
      name: "Arq Makoh & Kasni Duo",
      urduName: "عرق مکوہ و عرق کاسنی",
      description: "100% hydro-distilled cooling herbal extract for acid reflux and stomach inflammation.",
      price: 450,
      image: "https://ep7gbax6i7.ufs.sh/f/yUU8tpYcbLT87hfqAIgwHdn90vmz5SGcQPsZDj4Cb8I2OAtL",
      slug: "juniper-berries-whole-european-grade",
      id: "remedy-digestive",
    },
    recoveryTimeline: "Noticeable relief in 5–7 days",
    whatsappTopic: "Stomach Burning, Acidity & Gastric Relief",
  },
  {
    id: "joint-pain",
    icon: Shield,
    emoji: "🦵",
    title: "Joint, Knee & Back Pain",
    urduTitle: "جوڑوں اور گھٹنوں کا درد",
    hakimInsight:
      "Joint stiffness usually indicates reduced natural joint fluid and nerve inflammation. Cold-pressed therapeutic oils penetrate deep to restore mobility.",
    recommendedRemedy: {
      name: "JointZen Herbal Pain Oil",
      urduName: "جوائنٹ زین قدرتی درد تیل",
      description: "Classical unrefined botanical oil blend for fast knee, lumbar and sciatic relief.",
      price: 850,
      image: "https://ep7gbax6i7.ufs.sh/f/yUU8tpYcbLT87hfqAIgwHdn90vmz5SGcQPsZDj4Cb8I2OAtL",
      slug: "juniper-berries-whole-european-grade",
      id: "remedy-joints",
    },
    recoveryTimeline: "Relief within 3–5 days of massage",
    whatsappTopic: "Joint Pain & Knee Lubrication Treatment",
  },
  {
    id: "liver-metabolism",
    icon: Sun,
    emoji: "🌿",
    title: "Liver Heat & Detox",
    urduTitle: "جگر کی گرمی اور صفائی",
    hakimInsight:
      "A sluggish liver results in burning soles, poor digestion, and lethargy. Pure herbal steam extracts purge metabolic toxins naturally.",
    recommendedRemedy: {
      name: "Pure Arq Kasni (Steam Distilled)",
      urduName: "خالص عرق کاسنی",
      description: "Triple-filtered Chicory extract to normalize liver temperature and cleanse blood.",
      price: 350,
      image: "https://ep7gbax6i7.ufs.sh/f/yUU8tpYcbLT87hfqAIgwHdn90vmz5SGcQPsZDj4Cb8I2OAtL",
      slug: "juniper-berries-whole-european-grade",
      id: "remedy-liver",
    },
    recoveryTimeline: "Full detox course in 14–21 days",
    whatsappTopic: "Liver Heat & Natural Detoxification",
  },
  {
    id: "vitality-stamina",
    icon: Sparkles,
    emoji: "⚡",
    title: "Fatigue & Stamina",
    urduTitle: "جسمانی کمزوری اور تھکن",
    hakimInsight:
      "Chronic mental fog and fatigue are resolved through nutrient-dense fruit preserves and royal dry fruit tonics that nourish vital organs.",
    recommendedRemedy: {
      name: "Amla & Harar Honey Murabba",
      urduName: "مربہ آملہ و ہریڑ شہد والا",
      description: "Artisanal organic amla preserved in wild mountain honey for natural iron and energy.",
      price: 650,
      image: "https://ep7gbax6i7.ufs.sh/f/yUU8tpYcbLT87hfqAIgwHdn90vmz5SGcQPsZDj4Cb8I2OAtL",
      slug: "juniper-berries-whole-european-grade",
      id: "remedy-vitality",
    },
    recoveryTimeline: "Renewed energy in 7–10 days",
    whatsappTopic: "Physical Stamina & Daily Vitality",
  },
  {
    id: "skin-hair-care",
    icon: Heart,
    emoji: "💆",
    title: "Hair Fall & Scalp Care",
    urduTitle: "بالوں کا گرنا اور خشکی",
    hakimInsight:
      "Weak hair follicles need unrefined botanical nutrients. Amla, Reetha and Shikakai gently nourish roots without synthetic sulfates.",
    recommendedRemedy: {
      name: "HerboSilk Botanical Scalp Wash",
      urduName: "ہربل شیمپو و جڑی بوٹی واش",
      description: "100% steroid-free, sulfate-free scalp cleanser for hair density and root strength.",
      price: 550,
      image: "https://ep7gbax6i7.ufs.sh/f/yUU8tpYcbLT87hfqAIgwHdn90vmz5SGcQPsZDj4Cb8I2OAtL",
      slug: "juniper-berries-whole-european-grade",
      id: "remedy-hair",
    },
    recoveryTimeline: "Reduced shedding in 2–3 weeks",
    whatsappTopic: "Hair Fall & Scalp Health Consultation",
  },
  {
    id: "respiratory-allergies",
    icon: Wind,
    emoji: "🫁",
    title: "Cough & Seasonal Allergy",
    urduTitle: "کھانسی، نزلہ اور الرجی",
    hakimInsight:
      "Chest congestion and throat tickle respond rapidly to anti-inflammatory herb decoctions that soothe mucous membranes naturally.",
    recommendedRemedy: {
      name: "Wild Joshanda Tea Infusion",
      urduName: "قدرتی نباتاتی جوشاندہ",
      description: "Soothing non-drowsy botanical blend for stubborn dry cough and seasonal phlegm.",
      price: 400,
      image: "https://ep7gbax6i7.ufs.sh/f/yUU8tpYcbLT87hfqAIgwHdn90vmz5SGcQPsZDj4Cb8I2OAtL",
      slug: "juniper-berries-whole-european-grade",
      id: "remedy-cough",
    },
    recoveryTimeline: "Soothing relief in 24–48 hours",
    whatsappTopic: "Chest Congestion & Allergy Treatment",
  },
];

export default function HeroSymptomTriage() {
  const [selectedSymptom, setSelectedSymptom] = useState<SymptomDetail | null>(null);

  const whatsAppUrl = `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(
    "Assalam-o-Alaikum Hakim Sahib! I would like to discuss my health concerns and find the right herbal remedy."
  )}`;

  return (
    <>
      <section className="relative bg-[#faf8f5] pt-6 pb-10 sm:py-14 border-b border-[#e6dfd5] overflow-hidden">
        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#22623a]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[#c59b27]/5 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 w-full relative z-10 space-y-6 sm:space-y-8">

          {/* Trust Banner Micro-Pill */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f4eee5] border border-[#e6dfd5] text-[#22623a] text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#22623a] animate-pulse" />
              <span>Karachi Matab · Est. 1990</span>
              <span className="text-[#d7c9b8]">•</span>
              <span className="text-[#8c6a15] font-bold inline-flex items-center gap-1">
                <Star className="w-3 h-3 fill-[#c59b27] text-[#c59b27]" />
                5.0★ Google Verified
              </span>
            </div>
          </div>

          {/* User-Centric Empathetic Headline */}
          <div className="text-center space-y-2.5">
            <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold text-[#22623a] leading-[1.18] tracking-tight">
              Honest Natural Healing, <br className="hidden sm:inline" />
              Tailored to Your Body.
            </h1>
            <p className="text-xs sm:text-base text-[#59534b] max-w-lg mx-auto leading-relaxed">
              Classical Unani herbal remedies crafted pure without steroids or chemicals. Get personalized care directly from certified Hakim.
            </p>
          </div>

          {/* Quick Consultation CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#22623a] hover:bg-[#1a4d2e] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.98] group"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>Consult Hakim on WhatsApp</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href="#remedies-grid"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-[#f4eee5] text-[#22623a] border border-[#e6dfd5] text-xs sm:text-sm font-bold rounded-xl shadow-2xs transition-all active:scale-[0.98]"
            >
              <span>Browse Remedies</span>
              <ArrowRight className="w-4 h-4 text-[#8c6a15]" />
            </a>
          </div>

          {/* Symptom-First Fast Triage Header */}
          <div className="pt-4 sm:pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-[#22623a] tracking-wide uppercase">
                What are you experiencing?
              </span>
              <span className="text-[11px] text-[#8c6a15] font-semibold">
                Tap for instant remedy
              </span>
            </div>

            {/* 6 High-Intent Symptom Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {SYMPTOMS_LIST.map((symptom) => (
                <button
                  key={symptom.id}
                  onClick={() => setSelectedSymptom(symptom)}
                  type="button"
                  className="p-3 sm:p-3.5 bg-white hover:bg-[#f4f9f5] active:bg-[#eef7f1] border border-[#e6dfd5] hover:border-[#22623a]/40 rounded-xl text-left transition-all duration-200 shadow-2xs group flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg sm:text-xl">{symptom.emoji}</span>
                    <span className="text-[10px] text-[#8c6a15] font-bold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                      View →
                    </span>
                  </div>

                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#1e1c19] group-hover:text-[#22623a] transition-colors leading-snug">
                      {symptom.title}
                    </div>
                    <div className="text-[11px] text-[#8c6a15] font-serif pt-0.5 leading-tight">
                      {symptom.urduTitle}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Trust Badges Strip */}
          <div className="pt-2 flex items-center justify-around sm:justify-center sm:gap-8 text-[11px] sm:text-xs text-[#59534b] border-t border-[#e6dfd5]/60">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22623a]" />
              <span>100% Pure Herbal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22623a]" />
              <span>0% Chemicals & Steroids</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22623a]" />
              <span>COD Across Pakistan</span>
            </div>
          </div>

        </div>
      </section>

      {/* Instant Empathy Drawer / Bottom Sheet */}
      <EmpathyDrawer
        symptom={selectedSymptom}
        onClose={() => setSelectedSymptom(null)}
      />
    </>
  );
}
