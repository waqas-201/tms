"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Heart,
  Quote,
  Star,
  Stethoscope,
  TrendingUp,
  User,
  ArrowRight,
} from "lucide-react";
import Reveal from "./motion/Reveal";

export interface CaseStudy {
  id: string;
  patientInitials: string;
  patientAge: string;
  patientCity: string;
  chiefComplaint: string;
  duration: string;
  prescribedRegimen: string;
  clinicalOutcome: string;
  recoveryTimeline: string;
  quote: string;
}

export const CLINICAL_CASES: CaseStudy[] = [
  {
    id: "case-gerd",
    patientInitials: "T. M.",
    patientAge: "42 yrs, Male",
    patientCity: "Karachi (Gulshan)",
    chiefComplaint: "Severe Acid Reflux (GERD), Night Chest Burning & Gastric Heaviness",
    duration: "6+ Months on daily PPI antacids",
    prescribedRegimen: "Pure Distillates (Arq Makoh & Arq Kasni) + Classical Digestive Murabba course",
    clinicalOutcome: "Acid burning stopped completely by Day 10. Normal spicy food tolerated without PPIs.",
    recoveryTimeline: "14 Days for full symptom cessation",
    quote: "I was taking Omeprazole daily for months. Hakim Sahib's Arq course gave me permanent digestive relief without side effects.",
  },
  {
    id: "case-joints",
    patientInitials: "B. K.",
    patientAge: "58 yrs, Female",
    patientCity: "Lahore (DHA)",
    chiefComplaint: "Bilateral Knee Joint Friction, Crepitus & Difficulty in Stairs / Namaz",
    duration: "2 Years chronic stiffness",
    prescribedRegimen: "Cold-Pressed JointZen Massage Oil + Herbal Bone Vitality Powder",
    clinicalOutcome: "Knee friction significantly reduced. Able to climb home stairs and perform Namaz standing.",
    recoveryTimeline: "3 Weeks of regular application",
    quote: "The joint oil warmth and herbs gave my knees real lubrication. I can easily walk for 30 minutes every morning now.",
  },
  {
    id: "case-liver-heat",
    patientInitials: "A. R.",
    patientAge: "35 yrs, Male",
    patientCity: "Islamabad",
    chiefComplaint: "Sluggish Liver, Excessive Internal Body Heat (Garam Mizaj), Fatigue & Skin Dullness",
    duration: "4 Months post-typhoid weakness",
    prescribedRegimen: "Classical Herbal Liver Cleanse Distillates + Amla Vitamin C Preserve",
    clinicalOutcome: "Internal heat subsided, appetite restored, morning energy returned to normal baseline.",
    recoveryTimeline: "21 Days total course",
    quote: "My constant afternoon fatigue and heavy head feeling vanished. Genuine natural care at its finest.",
  },
];

export default function ClinicalOutcomesSection() {
  return (
    <section className="py-16 sm:py-20 bg-white border-b border-[#e6dfd5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Section Header */}
        <Reveal className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f0f7f3] border border-[#c5e4d1] text-[#138833] text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5 text-[#c59b27]" />
            <span>Documented Patient Recoveries</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl lg:text-[38px] font-bold text-[#138833] leading-tight">
            Real Clinical Outcomes & Recovery Cases
          </h2>

          <p className="text-xs sm:text-sm text-[#59534b] leading-relaxed">
            Discover how tailored natural regimens formulated by our Hakims help patients resolve long-standing chronic ailments safely.
          </p>
        </Reveal>

        {/* Case Study Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CLINICAL_CASES.map((cs, idx) => (
            <Reveal key={cs.id} delay={idx * 0.08} className="h-full">
              <div className="bg-[#faf8f5] rounded-2xl border border-[#e6dfd5] p-6 shadow-xs hover:shadow-luxury-hover transition-all duration-300 flex flex-col justify-between h-full space-y-5">
                <div className="space-y-4">
                  {/* Top Bar with Patient Meta */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#e6dfd5]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#138833] text-white flex items-center justify-center font-bold text-xs">
                        {cs.patientInitials}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-[#1a1816] block">
                          Patient {cs.patientInitials}
                        </span>
                        <span className="text-[11px] text-[#6a6660]">
                          {cs.patientAge} · {cs.patientCity}
                        </span>
                      </div>
                    </div>
                    <div className="flex text-[#c59b27]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>

                  {/* Chief Complaint */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#8c6a15] block">
                      Chief Complaint:
                    </span>
                    <h3 className="font-serif text-sm font-bold text-[#138833]">
                      {cs.chiefComplaint}
                    </h3>
                    <p className="text-[11px] text-[#7a7268]">
                      Prior Duration: {cs.duration}
                    </p>
                  </div>

                  {/* Prescribed Course */}
                  <div className="p-3 bg-white rounded-xl border border-[#e6dfd5] text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#138833] block">
                      Prescribed Botanical Protocol:
                    </span>
                    <p className="text-[11px] text-[#59534b]">
                      {cs.prescribedRegimen}
                    </p>
                  </div>

                  {/* Clinical Outcome */}
                  <div className="p-3 bg-[#e1f0e7]/70 rounded-xl border border-[#c5e4d1] text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-[#138833] font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified Outcome:</span>
                    </div>
                    <p className="text-[11px] text-[#1a1816] leading-relaxed">
                      {cs.clinicalOutcome}
                    </p>
                    <span className="text-[10px] font-semibold text-[#8c6a15] block pt-0.5">
                      ⏱ Recovery: {cs.recoveryTimeline}
                    </span>
                  </div>

                  {/* Patient Quote */}
                  <p className="text-xs italic text-[#59534b] leading-relaxed pt-1">
                    &ldquo;{cs.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-[#e6dfd5]">
                  <Link
                    href={`/consultation?concern=${encodeURIComponent(cs.chiefComplaint)}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#138833] hover:text-[#0f7229]"
                  >
                    <span>Request Similar Treatment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Bottom Callout */}
        <Reveal className="p-6 bg-[#faf8f5] rounded-2xl border border-[#e6dfd5] text-center space-y-3">
          <h3 className="font-serif text-lg font-bold text-[#138833]">
            Every recovery begins with an accurate assessment of your health
          </h3>
          <p className="text-xs sm:text-sm text-[#59534b] max-w-xl mx-auto">
            Speak directly with our clinical herbalist to determine which botanical therapies are best suited to your condition.
          </p>
          <div className="pt-2">
            <Link
              href="/consultation"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#138833] hover:bg-[#0f7229] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
            >
              <span>Start Your Health Evaluation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
