"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Stethoscope,
  CheckCircle2,
} from "lucide-react";
import Reveal from "./motion/Reveal";
import { CLINICAL_SPECIALTIES, type Specialty } from "@/app/data/specialties";

export { CLINICAL_SPECIALTIES, type Specialty };

interface ClinicalSpecialtiesSectionProps {
  onSelectSpecialty?: (specialtyId: string) => void;
}

export default function ClinicalSpecialtiesSection({
  onSelectSpecialty,
}: ClinicalSpecialtiesSectionProps) {
  return (
    <section id="specialties" className="py-16 sm:py-20 lg:py-24 bg-[#faf8f5] border-b border-[#e6dfd5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">

        {/* Section Header */}
        <Reveal className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e2efe6] border border-[#cde4d6] text-[#22623a] text-xs font-semibold">
            <Stethoscope className="w-3.5 h-3.5 text-[#c59b27]" />
            <span>Clinical Treatments</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#22623a] leading-tight">
            Specialized Care for Chronic Conditions
          </h2>

          <p className="text-xs sm:text-sm text-[#59534b]">
            Target the root cause with customized Unani herbal formulations and certified Hakim oversight.
          </p>
        </Reveal>

        {/* 6 Specialized Clinical Department Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {CLINICAL_SPECIALTIES.map((spec, index) => {
            const Icon = spec.icon;
            return (
              <Reveal key={spec.id} delay={index * 0.04} className="h-full">
                <div className="bg-white rounded-2xl border border-[#e6dfd5] p-5 sm:p-6 shadow-xs hover:shadow-luxury-hover transition-all duration-300 flex flex-col justify-between h-full group hover:border-[#22623a]/40">
                  <div className="space-y-3.5">
                    {/* Top Header with Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#eef7f1] border border-[#cde4d6] text-[#22623a] flex items-center justify-center shrink-0 group-hover:bg-[#22623a] group-hover:text-white transition-colors duration-300">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#fdfbf3] text-[#8c6a15] border border-[#fbf3dc]">
                        {spec.badge}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-serif text-base font-bold text-[#22623a] group-hover:text-[#1b502e] transition-colors">
                        {spec.title}
                      </h3>
                      <p className="text-xs text-[#6a6660] mt-0.5 leading-relaxed">
                        {spec.tagline}
                      </p>
                    </div>

                    {/* Key Symptoms Treated */}
                    <div className="space-y-1.5 pt-2 border-t border-[#f4eee5]">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#8c6a15] block">
                        Symptoms Treated:
                      </span>
                      <ul className="space-y-1">
                        {spec.symptoms.map((symptom, i) => (
                          <li key={i} className="text-xs text-[#59534b] flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#22623a] shrink-0 mt-0.5" />
                            <span>{symptom}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Typical Treatment Protocol */}
                    <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#e6dfd5]/80 text-xs space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-[#22623a]">
                        <span>Prescribed Course</span>
                        <span className="text-[#8c6a15] font-semibold">⏱ {spec.recoveryTimeline}</span>
                      </div>
                      <p className="text-[11px] text-[#59534b] line-clamp-2">
                        {spec.treatmentCourse}
                      </p>
                    </div>
                  </div>

                  {/* Direct Consultation Action */}
                  <div className="pt-4 border-t border-[#f4eee5] mt-3">
                    <Link
                      href={`/consultation?concern=${encodeURIComponent(spec.title)}`}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#eef7f1] hover:bg-[#22623a] text-[#22623a] hover:text-white text-xs font-semibold rounded-xl border border-[#cde4d6] hover:border-[#22623a] transition-all duration-200 group/btn"
                    >
                      <span>Book Consultation</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <Reveal className="p-5 sm:p-7 bg-[#22623a] rounded-2xl text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[11px] uppercase tracking-widest font-semibold text-[#c59b27]">
              Not sure which category applies to you?
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
              Describe your symptoms directly to Hakim Sahib
            </h3>
            <p className="text-xs text-[#f4eee5]/80">
              Free preliminary review with zero obligation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <Link
              href="/consultation"
              className="w-full sm:w-auto px-6 py-2.5 bg-white hover:bg-[#faf8f5] text-[#22623a] text-xs font-bold tracking-wider uppercase rounded-xl transition-all shadow-md text-center"
            >
              Start Free Assessment
            </Link>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
