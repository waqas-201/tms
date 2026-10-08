"use client";

import React from "react";
import { Star, CheckCircle2, Quote, ExternalLink, Sparkles } from "lucide-react";
import { CLINIC_INFO } from "@/app/data/products";
import Reveal from "@/app/components/motion/Reveal";

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
    <section className="py-12 sm:py-16 lg:py-20 bg-white border-b border-[#e6dfd5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">

        {/* Section Header */}
        <Reveal className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fcf6e6] border border-[#fbf3dc] text-[#8c6a15] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
            <span>Real Patient Outcomes</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#22623a]">
            Verified Recovery Stories
          </h2>
          <p className="text-xs sm:text-sm text-[#59534b]">
            Direct clinical feedback and experiences from patients across Pakistan.
          </p>
        </Reveal>

        {/* Stories 2-Col Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {RECOVERY_STORIES.map((item, idx) => (
            <Reveal key={item.id} delay={idx * 0.05} className="h-full">
              <div className="bg-[#faf8f5] p-5 sm:p-6 rounded-2xl border border-[#e6dfd5] space-y-3 flex flex-col justify-between h-full shadow-2xs hover:shadow-xs transition-shadow">
                <div className="space-y-2.5">
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

                    <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-white rounded-md border border-[#e6dfd5] text-[#8c6a15]">
                      {item.concern}
                    </span>
                  </div>

                  {/* Testimonial Quote */}
                  <p className="text-xs sm:text-sm text-[#1e1c19] italic leading-relaxed">
                    &ldquo;{item.story}&rdquo;
                  </p>
                </div>

                {/* Patient Meta */}
                <div className="flex items-center justify-between pt-3 border-t border-[#e6dfd5] text-xs">
                  <div className="font-bold text-[#22623a]">
                    {item.patient}
                    <span className="text-[11px] text-[#6a6660] font-normal ml-1">
                      ({item.city})
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1 text-[11px] text-[#22623a] font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Patient</span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Google Reviews Trust Bar */}
        <Reveal delay={0.2}>
          <div className="p-4 sm:p-5 bg-[#f4eee5] rounded-2xl border border-[#e6dfd5] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <div className="text-sm sm:text-base font-bold text-[#22623a] flex items-center justify-center sm:justify-start gap-1.5">
                <Star className="w-4 h-4 fill-[#c59b27] text-[#c59b27]" />
                <span>5.0★ Rating on Official Google Business Profile</span>
              </div>
              <p className="text-xs text-[#59534b]">
                Read full unedited patient reviews for Matab Tameer-e-Sehat Karachi.
              </p>
            </div>

            <a
              href={CLINIC_INFO.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-white hover:bg-[#faf8f5] text-[#22623a] border border-[#e6dfd5] hover:border-[#22623a] rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-2xs transition-all shrink-0 cursor-pointer"
            >
              <span>View All Google Reviews</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#8c6a15]" />
            </a>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
