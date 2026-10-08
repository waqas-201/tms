"use client";

import React from "react";
import Link from "next/link";
import {
  Stethoscope,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import Reveal from "@/app/components/motion/Reveal";
import { CLINICAL_SPECIALTIES } from "@/app/data/specialties";

export default function ClinicalSpecialtiesV2() {
  return (
    <section id="specialties" className="py-12 sm:py-16 lg:py-20 bg-[#faf8f5] border-b border-[#e6dfd5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">

        {/* Section Header */}
        <Reveal className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eef7f1] border border-[#cde4d6] text-[#22623a] text-xs font-semibold">
            <Stethoscope className="w-3.5 h-3.5 text-[#c59b27]" />
            <span>Clinical Treatments</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#22623a] leading-tight">
            Specialized Care for Chronic Concerns
          </h2>

          <p className="text-xs sm:text-sm text-[#59534b]">
            Root-cause Unani herbal formulations guided by 35+ years of verified clinical experience in Karachi.
          </p>
        </Reveal>

        {/* 6 Visual Department Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {CLINICAL_SPECIALTIES.map((spec, index) => {
            const Icon = spec.icon;
            return (
              <Reveal key={spec.id} delay={index * 0.04} className="h-full">
                <div className="bg-white rounded-2xl border border-[#e6dfd5] p-5 sm:p-6 shadow-xs hover:shadow-luxury-hover transition-all duration-300 flex flex-col justify-between h-full group hover:border-[#22623a]/40">
                  <div className="space-y-3.5">
                    {/* Top Row: Icon + Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#eef7f1] border border-[#cde4d6] text-[#22623a] flex items-center justify-center shrink-0 group-hover:bg-[#22623a] group-hover:text-white transition-colors duration-300">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#fdfbf3] text-[#8c6a15] border border-[#fbf3dc]">
                        {spec.badge}
                      </span>
                    </div>

                    {/* Titles */}
                    <div>
                      <h3 className="font-serif text-base sm:text-lg font-bold text-[#22623a] group-hover:text-[#1b502e] transition-colors">
                        {spec.title}
                      </h3>
                      <p className="text-xs text-[#8c6a15] font-serif pt-0.5">
                        {spec.urduTitle}
                      </p>
                      <p className="text-xs text-[#6a6660] mt-1 leading-relaxed line-clamp-2">
                        {spec.tagline}
                      </p>
                    </div>

                    {/* Key Symptom Micro-Pills */}
                    <div className="pt-2 border-t border-[#f4eee5] space-y-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#8c6a15] block">
                        Common Symptoms:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {spec.symptoms.map((symptom, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#faf8f5] border border-[#e6dfd5] text-[11px] text-[#59534b]"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5 text-[#22623a]" />
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Expected Recovery Timeline */}
                    <div className="p-2.5 bg-[#f4f9f5] rounded-xl border border-[#cde4d6]/60 text-xs flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#22623a]">Prescribed Course</span>
                      <span className="text-[11px] text-[#8c6a15] font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {spec.recoveryTimeline}
                      </span>
                    </div>
                  </div>

                  {/* Consultation Action */}
                  <div className="pt-4 border-t border-[#f4eee5] mt-3">
                    <Link
                      href={`/consultation?concern=${encodeURIComponent(spec.title)}`}
                      className="w-full py-2 px-3 bg-[#faf8f5] hover:bg-[#22623a] text-[#22623a] hover:text-white border border-[#e6dfd5] hover:border-[#22623a] rounded-xl text-xs font-bold transition-all flex items-center justify-between group/btn cursor-pointer"
                    >
                      <span>Consult for this Concern</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

      </div>
    </section>
  );
}
