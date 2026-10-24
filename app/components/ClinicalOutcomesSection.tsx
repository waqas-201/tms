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
    quote: "I was taking Omeprazole daily for months. Hakeem Sahib's Arq course gave me permanent digestive relief without side effects.",
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
    <section
      id="clinical-outcomes"
      className="py-16 sm:py-20 lg:py-24 bg-white border-b border-line"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">

        {/* Section Header */}
        <Reveal className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green-50 border border-brand-green-200 text-primary text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5 text-secondary-text" />
            <span>Documented Recoveries</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-primary leading-tight">
            Patient Recovery Stories
          </h2>

          <p className="text-xs sm:text-sm text-ink-body">
            Documented cases of patients who resolved chronic ailments with tailored Unani herbal courses.
          </p>
        </Reveal>

        {/* Case Study Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {CLINICAL_CASES.map((cs, idx) => (
            <Reveal key={cs.id} delay={idx * 0.05} className="h-full">
              <div className="bg-surface rounded-2xl border border-line p-5 sm:p-6 shadow-xs hover:shadow-luxury-hover transition-all duration-300 flex flex-col justify-between h-full space-y-4">
                <div className="space-y-3.5">
                  {/* Top Bar with Patient Meta */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-line">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                        {cs.patientInitials}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-ink block">
                          Patient {cs.patientInitials}
                        </span>
                        <span className="text-[11px] text-ink-muted">
                          {cs.patientAge} · {cs.patientCity}
                        </span>
                      </div>
                    </div>
                    <div className="flex text-secondary-text">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>

                  {/* Chief Complaint */}
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-secondary-text block">
                      Chief Complaint:
                    </span>
                    <h3 className="font-serif text-xs sm:text-sm font-bold text-primary">
                      {cs.chiefComplaint}
                    </h3>
                    <p className="text-[10px] text-ink-subtle">
                      Prior Duration: {cs.duration}
                    </p>
                  </div>

                  {/* Prescribed Course */}
                  <div className="p-2.5 bg-white rounded-xl border border-line text-xs space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-primary block">
                      Prescribed Course:
                    </span>
                    <p className="text-[11px] text-ink-body">
                      {cs.prescribedRegimen}
                    </p>
                  </div>

                  {/* Clinical Outcome */}
                  <div className="p-2.5 bg-brand-green-100/70 rounded-xl border border-brand-green-200 text-xs space-y-0.5">
                    <div className="flex items-center justify-between text-primary font-bold text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified Outcome:</span>
                      </div>
                      <span className="text-[10px] font-semibold text-secondary-text">
                        ⏱ {cs.recoveryTimeline}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink leading-relaxed pt-0.5">
                      {cs.clinicalOutcome}
                    </p>
                  </div>

                  {/* Patient Quote */}
                  <p className="text-xs italic text-ink-body leading-relaxed">
                    &ldquo;{cs.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-2.5 border-t border-line">
                  <Link
                    href={`/consultation?concern=${encodeURIComponent(cs.chiefComplaint)}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-primary hover:text-primary"
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
        <Reveal className="p-5 sm:p-6 bg-surface rounded-2xl border border-line text-center space-y-2.5">
          <h3 className="font-serif text-base sm:text-lg font-bold text-primary">
            Get a Personalized Assessment for Your Condition
          </h3>
          <p className="text-xs text-ink-body max-w-md mx-auto">
            Speak with our clinical herbalist to determine the right natural formulation for you.
          </p>
          <div className="pt-1">
            <Link
              href="/consultation"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-brand-green-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
            >
              <span>Start Free Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
