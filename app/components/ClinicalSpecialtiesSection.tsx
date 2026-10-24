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
      className="py-12 sm:py-16 lg:py-20 bg-surface border-b border-line"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Section Header */}
        <Reveal className="text-center space-y-2.5 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-sunken border border-line text-primary text-xs font-semibold">
            <Stethoscope className="w-3.5 h-3.5 text-secondary-text" />
            <span>Clinical Scope &amp; Consultation</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-primary leading-tight">
            What We Treat with Classical Unani
          </h2>

          <p className="text-xs sm:text-sm text-ink-body leading-relaxed">
            We treat the root constitutional imbalance (Mizaj) rather than masking symptoms. Type your symptoms or tap any condition below to initiate direct consultation with Hakeem Sahib.
          </p>
        </Reveal>

        {/* Sleek Minimal Consultation Card */}
        <Reveal delay={0.1}>
          <div className="bg-white rounded-3xl border border-line shadow-sm hover:shadow-md transition-shadow p-5 sm:p-8 space-y-5">
            {/* Input & Primary Button */}
            <form onSubmit={handleConsult} className="space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch gap-2.5 sm:gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    placeholder="Describe your symptoms (e.g. stomach acidity, joint stiffness, liver heat)..."
                    className="w-full text-xs sm:text-sm px-4 py-3.5 bg-surface border border-line rounded-xl sm:rounded-2xl text-ink placeholder:text-ink-subtle focus:outline-none focus:border-primary focus:bg-white transition-all pr-8"
                  />
                  {problem && (
                    <button
                      type="button"
                      onClick={() => setProblem("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink-body text-xs p-1 cursor-pointer"
                      aria-label="Clear input"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-brand-green-800 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl sm:rounded-2xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 shrink-0 cursor-pointer group"
                >
                  <Sparkles className="w-4 h-4 text-brand-gold-300 shrink-0" />
                  <span>Consult Hakeem Sahib</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
                </button>
              </div>
            </form>

            {/* 4-5 Compact Tap-to-Add Symptom Chips */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs text-ink-muted">
                <span className="font-semibold text-ink-body">
                  Common conditions (tap to add):
                </span>
                <span className="text-[11px] text-secondary-text font-medium hidden sm:inline">
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
                          ? "bg-primary text-white shadow-xs scale-102"
                          : "bg-surface-sunken hover:bg-line text-primary border border-line"
                      }`}
                    >
                      <span>{chip}</span>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-brand-gold-300" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-secondary-text" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reassurance Footer */}
            <div className="pt-3 border-t border-sand-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-ink-body">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span>
                  100% Free Initial Assessment · Confidential · Voice &amp; Reports Supported
                </span>
              </div>
              <div className="text-[11px] text-secondary-text font-semibold">
                Instant WhatsApp &amp; Karachi Matab
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
