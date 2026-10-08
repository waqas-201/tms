"use client";

import React from "react";
import { Star, CheckCircle2, Quote, ExternalLink, Sparkles } from "lucide-react";
import { CLINIC_INFO } from "@/app/data/products";

const RECOVERY_STORIES = [
  {
    id: 1,
    patient: "Tariq Mahmood",
    city: "Karachi",
    concern: "Chronic Stomach Acidity & GERD",
    story:
      "Suffered from severe acid reflux for 4 years. Hakim Sahib's Arq Makoh & Kasni combination gave me complete comfort within 10 days.",
    rating: 5,
    verified: true,
  },
  {
    id: 2,
    patient: "Rashida Begum",
    city: "Lahore",
    concern: "Knee Joint Pain & Walking Difficulty",
    story:
      "The JointZen massage oil and herbal capsules relieved knee stiffness. I can now climb stairs comfortably without throbbing pain.",
    rating: 5,
    verified: true,
  },
  {
    id: 3,
    patient: "Dr. Farhan Ali",
    city: "Islamabad",
    concern: "Liver Heat & Digestion",
    story:
      "Authentic pure distillates. You can smell and feel the botanical purity. Rare to find this level of honesty in traditional medicine.",
    rating: 5,
    verified: true,
  },
  {
    id: 4,
    patient: "Samina K.",
    city: "Rawalpindi",
    concern: "Hair Thinning & Scalp Dandruff",
    story:
      "HerboSilk scalp wash stopped my excessive hair shedding in 3 weeks. 100% natural and gentle on sensitive scalps.",
    rating: 5,
    verified: true,
  },
];

export default function PatientStories() {
  return (
    <section className="py-10 sm:py-16 bg-white border-b border-[#e6dfd5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">

        {/* Section Header */}
        <div className="text-center space-y-1.5 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#fcf6e6] border border-[#fbf3dc] text-[#8c6a15] text-[11px] font-semibold">
            <Sparkles className="w-3 h-3 text-[#c59b27]" />
            <span>Real Patient Outcomes</span>
          </div>
          <h2 className="font-serif text-xl sm:text-3xl font-bold text-[#22623a]">
            Verified Recovery Stories
          </h2>
          <p className="text-xs sm:text-sm text-[#59534b]">
            Honest clinical feedback from patients treated across Pakistan.
          </p>
        </div>

        {/* Stories Horizontal Snap List / 2-Col Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          {RECOVERY_STORIES.map((item) => (
            <div
              key={item.id}
              className="bg-[#faf8f5] p-4 sm:p-5 rounded-2xl border border-[#e6dfd5] space-y-2.5 flex flex-col justify-between shadow-2xs"
            >
              <div className="space-y-2">
                {/* Rating & Concern Tag */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3.5 h-3.5 fill-[#c59b27] text-[#c59b27]"
                      />
                    ))}
                  </div>

                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-white rounded-md border border-[#e6dfd5] text-[#8c6a15]">
                    {item.concern}
                  </span>
                </div>

                {/* Testimonial Quote */}
                <p className="text-xs sm:text-sm text-[#1e1c19] italic leading-relaxed">
                  &ldquo;{item.story}&rdquo;
                </p>
              </div>

              {/* Patient Meta */}
              <div className="flex items-center justify-between pt-2 border-t border-[#e6dfd5] text-xs">
                <div className="font-bold text-[#22623a]">
                  {item.patient}
                  <span className="text-[10px] text-[#6a6660] font-normal ml-1">
                    ({item.city})
                  </span>
                </div>

                <div className="inline-flex items-center gap-1 text-[10px] text-[#22623a] font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified Patient</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Google Reviews Trust Bar */}
        <div className="p-3.5 bg-[#f4eee5] rounded-2xl border border-[#e6dfd5] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="space-y-0.5">
            <div className="text-xs sm:text-sm font-bold text-[#22623a] flex items-center justify-center sm:justify-start gap-1.5">
              <Star className="w-4 h-4 fill-[#c59b27] text-[#c59b27]" />
              <span>5.0★ Rating on Google Business Profile</span>
            </div>
            <p className="text-[11px] text-[#59534b]">
              Read full unedited patient reviews for Matab Tameer-e-Sehat Karachi.
            </p>
          </div>

          <a
            href={CLINIC_INFO.googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white hover:bg-[#faf8f5] text-[#22623a] border border-[#e6dfd5] rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
          >
            <span>View All Google Reviews</span>
            <ExternalLink className="w-3 h-3 text-[#8c6a15]" />
          </a>
        </div>

      </div>
    </section>
  );
}
