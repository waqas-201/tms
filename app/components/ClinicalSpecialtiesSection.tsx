"use client";

import React, { useState } from "react";
import {
  Stethoscope,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Plus,
  Check,
} from "lucide-react";
import Reveal from "./motion/Reveal";
import { useConsultation } from "@/app/context/ConsultationContext";

const SYMPTOM_CHIPS = [
  "Stomach Acidity / Gas",
  "Joint & Knee Pain",
  "Fatty Liver / Body Heat",
  "Vitality & Energy",
  "Hair Fall & Scalp",
];

export default function ClinicalSpecialtiesSection() {
  const [problem, setProblem] = useState("");
  const { openConsultation } = useConsultation();

  const handleChipClick = (chip: string) => {
    setProblem((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return chip;
      if (trimmed.includes(chip)) {
        // Toggle off if already present
        return trimmed
          .replace(chip, "")
          .replace(/,\s*,/g, ",")
          .replace(/^,\s*|,\s*$/g, "")
          .trim();
      }
      return `${trimmed}, ${chip}`;
    });
  };

  const handleConsult = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    openConsultation({
      message: problem.trim() || undefined,
      mode: "WHATSAPP",
    });
  };

  return (
    <section
      id="specialties"
      className="py-12 sm:py-16 lg:py-20 bg-[#faf8f5] border-b border-[#e6dfd5]"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Section Header */}
        <Reveal className="text-center space-y-2.5 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4eee5] border border-[#e6dfd5] text-[#22623a] text-xs font-semibold">
            <Stethoscope className="w-3.5 h-3.5 text-[#c59b27]" />
            <span>Clinical Scope &amp; Consultation</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#22623a] leading-tight">
            What We Treat with Classical Unani
          </h2>

          <p className="text-xs sm:text-sm text-[#59534b] leading-relaxed">
            We treat the root constitutional imbalance (Mizaj) rather than masking symptoms. Type your symptoms or tap any condition below to initiate direct consultation with Hakim Sahib.
          </p>
        </Reveal>

        {/* Sleek Minimal Consultation Card */}
        <Reveal delay={0.1}>
          <div className="bg-white rounded-3xl border border-[#e6dfd5] shadow-sm hover:shadow-md transition-shadow p-5 sm:p-8 space-y-5">
            {/* Input & Primary Button */}
            <form onSubmit={handleConsult} className="space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch gap-2.5 sm:gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    placeholder="Describe your symptoms (e.g. stomach acidity, joint stiffness, liver heat)..."
                    className="w-full text-xs sm:text-sm px-4 py-3.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl sm:rounded-2xl text-[#1a1816] placeholder:text-[#8c827a] focus:outline-none focus:border-[#22623a] focus:bg-white transition-all pr-8"
                  />
                  {problem && (
                    <button
                      type="button"
                      onClick={() => setProblem("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs p-1 cursor-pointer"
                      aria-label="Clear input"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl sm:rounded-2xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 shrink-0 cursor-pointer group"
                >
                  <Sparkles className="w-4 h-4 text-[#c59b27] shrink-0" />
                  <span>Consult Hakim Sahib</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
                </button>
              </div>
            </form>

            {/* 4-5 Compact Tap-to-Add Symptom Chips */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs text-[#6a6660]">
                <span className="font-semibold text-[#59534b]">
                  Common conditions (tap to add):
                </span>
                <span className="text-[11px] text-[#8c6a15] font-medium hidden sm:inline">
                  Select one or more
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {SYMPTOM_CHIPS.map((chip) => {
                  const isSelected = problem.includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleChipClick(chip)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#22623a] text-white shadow-xs scale-102"
                          : "bg-[#f4eee5] hover:bg-[#e6dfd5] text-[#22623a] border border-[#e6dfd5]"
                      }`}
                    >
                      <span>{chip}</span>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-[#c59b27]" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-[#8c6a15]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reassurance Footer */}
            <div className="pt-3 border-t border-[#f4eee5] flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-[#59534b]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#22623a] shrink-0" />
                <span>
                  100% Free Initial Assessment · Confidential · Voice &amp; Reports Supported
                </span>
              </div>
              <div className="text-[11px] text-[#8c6a15] font-semibold">
                Instant WhatsApp &amp; Karachi Matab
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
