"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import Reveal from "./motion/Reveal";
import {
  Pill,
  Ban,
  Clock,
  Frown,
  ArrowRight,
  HeartPulse,
} from "lucide-react";

const painPoints = [
  {
    icon: Pill,
    title: "Antacids & painkillers only mask symptoms",
    detail:
      "They suppress the pain temporarily but never address the root cause — so the problem keeps returning, cycle after cycle.",
  },
  {
    icon: Ban,
    title: "Steroids & chemicals creating new problems",
    detail:
      "Synthetic medications bring side effects: weakened immunity, digestive damage, dependency — turning one problem into three.",
  },
  {
    icon: Clock,
    title: "Months of appointments with no real answers",
    detail:
      "Short consultation windows, rushed prescriptions, and generic advice that ignores your unique body constitution.",
  },
  {
    icon: Frown,
    title: "Wasted money on treatments that never worked",
    detail:
      "Expensive supplements, fad diets, and miracle products — all promise results, none deliver lasting relief.",
  },
];

export default function ProblemAgitationSection() {
  const reducedMotion = useReducedMotion();

  return (
    <section
      id="problem-agitation"
      className="relative py-16 sm:py-20 lg:py-24 bg-[#123a24] text-white overflow-hidden"
    >
      {/* Subtle texture */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#c59b27]/[0.07] blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#0b2416]/80 blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10 sm:space-y-12">
        {/* Section Header */}
        <Reveal className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c59b27]/15 border border-[#c59b27]/40 text-[#e8c76a] text-xs font-semibold">
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Sound Familiar?</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
            Most chronic treatments fail because they treat the symptom — not the cause.
          </h2>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-xl mx-auto">
            If you have been struggling with recurring acidity, joint stiffness, low energy, or persistent allergies despite trying multiple treatments — the issue is not your body. It is the approach.
          </p>
        </Reveal>

        {/* Pain Point Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-4xl mx-auto">
          {painPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <Reveal key={index} delay={index * 0.06}>
                <motion.div
                  whileHover={
                    reducedMotion
                      ? undefined
                      : { y: -3, transition: { duration: 0.2 } }
                  }
                  className="flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl bg-[#0b2416]/80 border border-white/10 hover:border-[#c59b27]/50 hover:shadow-lg transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#c59b27]/15 border border-[#c59b27]/30 flex items-center justify-center shrink-0 group-hover:bg-[#c59b27] group-hover:text-white transition-colors duration-200">
                    <Icon className="w-4.5 h-4.5 text-[#e8c76a] group-hover:text-white transition-colors duration-200" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-[#f4eee5] leading-snug">
                      {point.title}
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed">
                      {point.detail}
                    </p>
                  </div>
                </motion.div>
              </Reveal>
            );
          })}
        </div>

        {/* Bridge to Solution */}
        <Reveal className="text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-[2px] bg-[#c59b27] mx-auto rounded-full" />
          <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
            There is a better, time-tested approach.
          </h3>
          <p className="text-xs text-white/70 leading-relaxed">
            Unani medicine does not chase symptoms. It identifies the root imbalance in your body — and restores harmony with pure, natural herbs.
          </p>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e8c76a] hover:text-white transition-colors group"
          >
            <span>See how it works</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
