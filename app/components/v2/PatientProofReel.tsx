"use client";

import React from "react";
import { Star, CheckCircle2, ExternalLink, Sparkles } from "lucide-react";
import { CLINIC_INFO } from "@/app/data/products";

const REVIEWS = [
  {
    name: "Tariq Mahmood",
    city: "Karachi",
    concern: "4-Year Severe Acidity & Reflux",
    quote:
      "Hakim Tariq’s Arq Makoh & Kasni cured 4 years of chronic heartburn in 10 days. No need for daily antacids anymore.",
  },
  {
    name: "Rashida Begum",
    city: "Lahore",
    concern: "Knee Joint Stiffness & Pain",
    quote:
      "JointZen herbal oil relieved severe morning knee stiffness within 4 days. Climbing stairs is painless now.",
  },
  {
    name: "Dr. Farhan Ali",
    city: "Islamabad",
    concern: "Liver Heat & Digestion",
    quote:
      "You can immediately smell and feel the pure botanical distillation. Honest Unani medicine with zero adulteration.",
  },
  {
    name: "Samina K.",
    city: "Rawalpindi",
    concern: "Hair Fall & Scalp Health",
    quote:
      "HerboSilk scalp wash stopped excessive shedding in 3 weeks. 100% natural and gentle on sensitive roots.",
  },
];

export default function PatientProofReel() {
  return (
    <section className="py-12 sm:py-16 bg-[#FAF9F5] border-b border-[#E5EDE5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">

        {/* Header */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5EDE5] text-[#0F2E1E] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#C86A4B]" />
            <span>Verified Patient Outcomes</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F2E1E]">
            Real Recoveries Across Pakistan
          </h2>
          <p className="text-xs sm:text-sm text-[#5A6860]">
            Direct feedback from patients treated at Matab Tameer-e-Sehat.
          </p>
        </div>

        {/* 4 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {REVIEWS.map((r, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-3xl border border-[#E5EDE5] space-y-3 flex flex-col justify-between shadow-2xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#C86A4B] text-[#C86A4B]" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#FAF9F5] rounded-md border border-[#E5EDE5] text-[#C86A4B]">
                    {r.concern}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#2D3A32] italic leading-relaxed">
                  &ldquo;{r.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#F0F5F0] text-xs">
                <div className="font-bold text-[#0F2E1E]">
                  {r.name}
                  <span className="text-[10px] text-[#5A6860] font-normal ml-1">
                    ({r.city})
                  </span>
                </div>
                <span className="text-[10px] text-[#25D366] font-bold">
                  ✓ Verified
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Google Reviews Banner */}
        <div className="p-4 sm:p-5 bg-white rounded-3xl border-2 border-[#E5EDE5] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-xs">
          <div className="space-y-1">
            <div className="text-sm sm:text-base font-bold text-[#0F2E1E] flex items-center justify-center sm:justify-start gap-1.5">
              <Star className="w-4 h-4 fill-[#C86A4B] text-[#C86A4B]" />
              <span>5.0★ Google Verified Business Profile Rating</span>
            </div>
            <p className="text-xs text-[#5A6860]">
              Browse unedited patient reviews for Matab Tameer-e-Sehat Karachi.
            </p>
          </div>

          <a
            href={CLINIC_INFO.googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-[#FAF9F5] hover:bg-[#F0F5F0] text-[#0F2E1E] border border-[#E5EDE5] rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-colors shrink-0 cursor-pointer"
          >
            <span>View All Google Reviews</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#C86A4B]" />
          </a>
        </div>

      </div>
    </section>
  );
}
