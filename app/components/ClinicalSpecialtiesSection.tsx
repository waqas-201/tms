"use client";

import React, { useState } from "react";
import {
  Stethoscope,
  Activity,
  Flame,
  Zap,
  Wind,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import Reveal from "./motion/Reveal";
import ConsultationModal from "./ConsultationModal";

interface Specialty {
  id: string;
  title: string;
  urduTitle: string;
  icon: React.ComponentType<{ className?: string }>;
  symptoms: string[];
  description: string;
  consultPrompt: string;
}

const SPECIALTIES: Specialty[] = [
  {
    id: "digestion",
    title: "Digestive & Gut Disorders",
    urduTitle: "معدہ و نظام انہضام",
    icon: Flame,
    symptoms: ["Acid Reflux & Gas", "Chronic Constipation", "IBS / Bloating", "Indigestion"],
    description: "Restores stomach temperament (Mizaj) and organic digestion without synthetic antacids.",
    consultPrompt: "Assalam-o-Alaikum Hakim Sahib, I need herbal guidance regarding digestive issues (acidity, gas, bloating or stomach distress).",
  },
  {
    id: "joints",
    title: "Joints, Knees & Bones",
    urduTitle: "جوڑوں اور ہڈیوں کے امراض",
    icon: Activity,
    symptoms: ["Knee Stiffness", "Uric Acid & Gout", "Sciatica Pain", "Arthritis Ache"],
    description: "Botanical joint lubricants and natural anti-inflammatory herbal extracts for organic mobility.",
    consultPrompt: "Assalam-o-Alaikum Hakim Sahib, I am seeking Unani treatment for joint pain, knee stiffness, or uric acid.",
  },
  {
    id: "liver",
    title: "Liver & Metabolic Health",
    urduTitle: "جگر و میٹابولزم کی صحت",
    icon: ShieldCheck,
    symptoms: ["Fatty Liver (Grade 1/2)", "Internal Body Heat", "Jaundice Recovery", "Sluggish Digestion"],
    description: "Gentle herbal hydro-distillates (Arqiyat) to detoxify liver enzymes and clear excessive heat.",
    consultPrompt: "Assalam-o-Alaikum Hakim Sahib, I would like to consult regarding liver health, fatty liver, or internal body heat.",
  },
  {
    id: "vitality",
    title: "Vitality, Stamina & Energy",
    urduTitle: "قوت و جسمانی توانائی",
    icon: Zap,
    symptoms: ["Chronic Fatigue", "Physical Exhaustion", "Nervous Weakness", "Low Stamina"],
    description: "Restorative herbal formulations and fruit preserves (Murabbajaat) for long-term vitality.",
    consultPrompt: "Assalam-o-Alaikum Hakim Sahib, I would like to inquire about natural botanical tonics for energy and physical weakness.",
  },
  {
    id: "respiratory",
    title: "Respiratory & Chest Care",
    urduTitle: "سانس، کھانسی اور سینے کی تکالیف",
    icon: Wind,
    symptoms: ["Wet/Dry Cough", "Chest Phlegm / Balgham", "Seasonal Allergies", "Sinus Congestion"],
    description: "Time-tested Unani herbal syrups and decoctions that clear airways naturally without drowsiness.",
    consultPrompt: "Assalam-o-Alaikum Hakim Sahib, I am experiencing respiratory symptoms (cough, chest phlegm, or seasonal congestion).",
  },
  {
    id: "skin-hair",
    title: "Skin Purifying & Hair Care",
    urduTitle: "جلد و بالوں کا قدرتی علاج",
    icon: Sparkles,
    symptoms: ["Severe Hair Fall", "Persistent Dandruff", "Blood Impurities / Acne", "Skin Dryness"],
    description: "Herbal blood purifiers and pure botanical hair oils formulated for cellular restoration.",
    consultPrompt: "Assalam-o-Alaikum Hakim Sahib, I need herbal consultation regarding hair fall, dandruff, or skin issues.",
  },
];

export default function ClinicalSpecialtiesSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePrompt, setActivePrompt] = useState<string>("");

  const handleOpenConsultation = (prompt: string) => {
    setActivePrompt(prompt);
    setIsModalOpen(true);
  };

  return (
    <>
      <section
        id="specialties"
        className="py-10 sm:py-14 lg:py-18 bg-[#faf8f5] border-b border-[#e6dfd5]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">

          {/* Section Header: Clean & focused */}
          <Reveal className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4eee5] border border-[#e6dfd5] text-[#22623a] text-xs font-semibold">
              <Stethoscope className="w-3.5 h-3.5 text-[#c59b27]" />
              <span>Clinical Specialties &amp; Scope</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#22623a] leading-tight">
              What We Treat with Classical Unani
            </h2>
            <p className="text-xs sm:text-sm text-[#59534b] leading-relaxed">
              We treat the root constitutional imbalance (Mizaj) rather than masking symptoms. Tap any condition below to initiate direct consultation.
            </p>
          </Reveal>

          {/* 6 Core Treatment Specialties: 2-Column Mobile Micro-Grid, 3-Column Desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 lg:gap-6">
            {SPECIALTIES.map((item, index) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.id} delay={index * 0.03} className="h-full">
                  <button
                    type="button"
                    onClick={() => handleOpenConsultation(item.consultPrompt)}
                    className="w-full h-full text-left bg-white rounded-2xl border border-[#e6dfd5] hover:border-[#22623a]/50 p-3 sm:p-5 shadow-2xs hover:shadow-sm active:scale-[0.98] transition-all duration-200 flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="w-full space-y-2 sm:space-y-2.5">
                      {/* Top Row: Icon + Tap Cue */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#eef7f1] text-[#22623a] flex items-center justify-center shrink-0 group-hover:bg-[#22623a] group-hover:text-white transition-colors duration-200">
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#22623a] group-hover:text-[#1a4d2e]">
                          <span className="hidden sm:inline">Consult</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#c59b27] group-hover:translate-x-1 transition-transform shrink-0" />
                        </div>
                      </div>

                      {/* Titles */}
                      <div>
                        <h3 className="font-serif text-xs sm:text-base lg:text-lg font-bold text-[#22623a] group-hover:text-[#143e23] transition-colors leading-snug">
                          {item.title}
                        </h3>
                        <span className="text-[10px] sm:text-xs text-[#8c6a15] font-semibold block pt-0.5" dir="rtl">
                          {item.urduTitle}
                        </span>
                      </div>

                      {/* Description: Hidden on small mobile to prevent vertical bloating */}
                      <p className="hidden sm:block text-xs text-[#59534b] leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Symptom Tag Pills: 2 on mobile, all on tablet/desktop */}
                    <div className="pt-2.5 mt-2 border-t border-[#f4eee5] w-full">
                      <div className="flex flex-wrap gap-1 sm:gap-1.5">
                        {item.symptoms.map((sym, sIdx) => (
                          <span
                            key={sIdx}
                            className={`text-[9px] sm:text-[11px] px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-[#faf8f5] group-hover:bg-[#eef7f1] text-[#59534b] group-hover:text-[#22623a] border border-[#e6dfd5] font-medium transition-colors ${
                              sIdx >= 2 ? "hidden sm:inline-flex" : "inline-flex"
                            }`}
                          >
                            {sym}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                </Reveal>
              );
            })}
          </div>

          {/* Bottom Fast Triage Helper Strip */}
          <Reveal className="p-3.5 sm:p-4 rounded-2xl bg-[#eef7f1] border border-[#cde4d6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#22623a]">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <ShieldCheck className="w-4 h-4 text-[#22623a] shrink-0" />
              <span className="font-medium text-[11px] sm:text-xs">
                Not sure which category matches? Share your medical reports or record a voice note for Hakim Sahib.
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                handleOpenConsultation(
                  "Assalam-o-Alaikum Hakim Sahib, I would like to share my health details and medical reports for evaluation."
                )
              }
              className="text-[#22623a] hover:text-[#1b502e] font-bold inline-flex items-center gap-1.5 shrink-0 px-3.5 py-1.5 rounded-xl bg-white border border-[#cde4d6] hover:bg-[#faf8f5] transition-all cursor-pointer shadow-2xs text-[11px] sm:text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
              <span>Send Reports / Voice Note &rarr;</span>
            </button>
          </Reveal>

        </div>
      </section>

      {/* Universal Consultation Modal */}
      <ConsultationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialMessage={activePrompt}
        initialMode="WHATSAPP"
      />
    </>
  );
}
