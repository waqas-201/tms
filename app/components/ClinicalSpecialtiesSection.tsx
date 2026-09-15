"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  Shield,
  Sun,
  Sparkles,
  Wind,
  Heart,
  ArrowRight,
  Stethoscope,
  CheckCircle2,
} from "lucide-react";
import Reveal from "./motion/Reveal";

export interface Specialty {
  id: string;
  title: string;
  urduTitle: string;
  tagline: string;
  icon: any;
  symptoms: string[];
  treatmentCourse: string;
  recoveryTimeline: string;
  badge: string;
}

export const CLINICAL_SPECIALTIES: Specialty[] = [
  {
    id: "gastro-digestive",
    title: "Gastrointestinal & Acidity Clinic",
    urduTitle: "معدہ اور نظام انہضام",
    tagline: "Chronic acidity, burning, gas, constipation, and IBS recovery.",
    icon: Activity,
    symptoms: [
      "Stomach burning (Heartburn / GERD)",
      "Chronic gas & bloating after meals",
      "IBS & irregular bowel movements",
      "Sour belching & heavy digestion",
    ],
    treatmentCourse: "Steam Distillates (Arq Makoh & Kasni) + Digestion Preserves (Harar Murabba)",
    recoveryTimeline: "Noticeable relief in 7–14 days",
    badge: "Most Consulted",
  },
  {
    id: "joint-pain",
    title: "Joint, Knee & Spine Recovery",
    urduTitle: "جوڑوں، گھٹنوں اور کمر کا درد",
    tagline: "Natural pain relief and lubrication for stiff knees, backache, and arthritis.",
    icon: Shield,
    symptoms: [
      "Knee joint friction & difficulty climbing stairs",
      "Chronic lower backache & stiffness",
      "Morning muscle fatigue & joint swelling",
      "Sciatica & nerve tenderness",
    ],
    treatmentCourse: "Cold-Pressed Herbal Joint Oil (JointZen) + Herbal Vitality Mix",
    recoveryTimeline: "Soothing relief in 3–5 days",
    badge: "High Patient Rating",
  },
  {
    id: "liver-metabolism",
    title: "Liver Health & Metabolic Detox",
    urduTitle: "جگر کی صفائی اور گرمی کا علاج",
    tagline: "Clear liver heat, reduce sluggishness, and restore pure vitality.",
    icon: Sun,
    symptoms: [
      "Sluggish liver & fatty liver tendencies",
      "Excessive internal body heat (Garam Mizaj)",
      "Loss of natural appetite & morning nausea",
      "Skin dullness & dark eye circles",
    ],
    treatmentCourse: "Classical Steam Extracts (Arq Kasni & Makoh) + Blood Cleansers",
    recoveryTimeline: "Detox course 21–30 days",
    badge: "Classic Tibbi Care",
  },
  {
    id: "vitality-stamina",
    title: "Vitality, Energy & Brain Focus",
    urduTitle: "جسمانی توانائی اور دماغی طاقت",
    tagline: "Overcome chronic exhaustion, mental fatigue, and low physical stamina.",
    icon: Sparkles,
    symptoms: [
      "Constant tiredness & afternoon energy crashes",
      "Brain fog & poor mental concentration",
      "General physical weakness in working adults",
      "Post-illness nutritional recovery",
    ],
    treatmentCourse: "Shahi Dry Fruit & Vitality Mix (Almonds, Walnuts, Gond Kateera) + Amla Preserve",
    recoveryTimeline: "Sustained stamina in 10–14 days",
    badge: "100% Natural Nourishment",
  },
  {
    id: "respiratory-allergies",
    title: "Chest, Cough & Seasonal Allergies",
    urduTitle: "نزلہ، زکام، کھانسی اور الرجی",
    tagline: "Natural bronchial clearance, soothing dry coughs, and allergy resilience.",
    icon: Wind,
    symptoms: [
      "Chronic throat tickle & dry persistent cough",
      "Seasonal chest congestion & thick phlegm",
      "Weather change morning sneezing",
      "Pollution & dust sensitivity",
    ],
    treatmentCourse: "Wild Herbal Tea Infusion + Soothing Chest Extracts",
    recoveryTimeline: "Breathing comfort in 24–48 hours",
    badge: "Gentle & Non-Drowsy",
  },
  {
    id: "skin-hair-care",
    title: "Scalp, Hair Fall & Skin Health",
    urduTitle: "بالوں کا گرنا اور جلدی امراض",
    tagline: "Chemical-free herbal hair strengthening and skin barrier nourishment.",
    icon: Heart,
    symptoms: [
      "Excessive hair fall & weak hair roots",
      "Stubborn scalp dandruff & itching",
      "Dry skin patches & irritation",
      "Premature thinning and lack of hair shine",
    ],
    treatmentCourse: "Shikakai & Amla Wash (Herbo Silk) + Pure Almond Scalp Nourisher",
    recoveryTimeline: "Root strength improved in 3 weeks",
    badge: "Zero Chemicals/Steroids",
  },
];

interface ClinicalSpecialtiesSectionProps {
  onSelectSpecialty?: (specialtyId: string) => void;
}

export default function ClinicalSpecialtiesSection({
  onSelectSpecialty,
}: ClinicalSpecialtiesSectionProps) {
  return (
    <section id="specialties" className="py-16 sm:py-20 bg-[#faf8f5] border-b border-[#e6dfd5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Section Header */}
        <Reveal className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e1f0e7] border border-[#c5e4d1] text-[#138833] text-xs font-semibold tracking-wide">
            <Stethoscope className="w-3.5 h-3.5 text-[#c59b27]" />
            <span>Clinical Specializations & Treatments</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl lg:text-[38px] font-bold text-[#138833] leading-tight">
            What We Treat at Tameer-e-Sehat
          </h2>

          <p className="text-xs sm:text-sm text-[#59534b] leading-relaxed">
            Every consultation is handled by qualified Tibbi practitioners with over 35 years of clinical expertise. We identify the root cause behind your discomfort and tailor gentle, authentic herbal regimens.
          </p>
        </Reveal>

        {/* 6 Specialized Clinical Department Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CLINICAL_SPECIALTIES.map((spec, index) => {
            const Icon = spec.icon;
            return (
              <Reveal key={spec.id} delay={index * 0.05} className="h-full">
                <div className="bg-white rounded-2xl border border-[#e6dfd5] p-6 shadow-xs hover:shadow-luxury-hover transition-all duration-300 flex flex-col justify-between h-full group hover:border-[#138833]/40">
                  <div className="space-y-4">
                    {/* Top Header with Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#f0f7f3] border border-[#c5e4d1] text-[#138833] flex items-center justify-center shrink-0 group-hover:bg-[#138833] group-hover:text-white transition-colors duration-300">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#fdfbf3] text-[#8c6a15] border border-[#fbf3dc]">
                        {spec.badge}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#138833] group-hover:text-[#0f7229] transition-colors">
                        {spec.title}
                      </h3>
                      <p className="text-xs text-[#6a6660] mt-1 leading-relaxed">
                        {spec.tagline}
                      </p>
                    </div>

                    {/* Key Symptoms Treated */}
                    <div className="space-y-2 pt-2 border-t border-[#f4eee5]">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#8c6a15] block">
                        Common Symptoms We Treat:
                      </span>
                      <ul className="space-y-1.5">
                        {spec.symptoms.map((symptom, i) => (
                          <li key={i} className="text-xs text-[#59534b] flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#138833] shrink-0 mt-0.5" />
                            <span>{symptom}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Typical Treatment Protocol */}
                    <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#e6dfd5]/80 text-xs space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#138833] tracking-wider block">
                        Prescribed Course:
                      </span>
                      <p className="text-[11px] text-[#59534b] line-clamp-2">
                        {spec.treatmentCourse}
                      </p>
                      <p className="text-[10px] text-[#8c6a15] font-semibold pt-1">
                        ⏱ {spec.recoveryTimeline}
                      </p>
                    </div>
                  </div>

                  {/* Direct Consultation Action */}
                  <div className="pt-5 border-t border-[#f4eee5] mt-4">
                    <Link
                      href={`/consultation?concern=${encodeURIComponent(spec.title)}`}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#f0f7f3] hover:bg-[#138833] text-[#138833] hover:text-white text-xs font-semibold rounded-xl border border-[#c5e4d1] hover:border-[#138833] transition-all duration-200 group/btn"
                    >
                      <span>Book Consultation for This</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <Reveal className="p-6 sm:p-8 bg-[#138833] rounded-2xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[11px] uppercase tracking-widest font-semibold text-[#c59b27]">
              Not sure which department applies to you?
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
              Tell Hakim Sahib directly about your symptoms
            </h3>
            <p className="text-xs sm:text-sm text-[#f4eee5]/80">
              Personalized symptom assessment with zero obligation. Free preliminary medical review.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <Link
              href="/consultation"
              className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-[#faf8f5] text-[#138833] text-xs font-bold tracking-wider uppercase rounded-xl transition-all shadow-md text-center"
            >
              Start Free Assessment
            </Link>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
