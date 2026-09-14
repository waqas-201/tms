"use client";

import React from "react";
import { Leaf, ShieldCheck, UserCheck, Truck } from "lucide-react";
import Reveal from "./motion/Reveal";

export default function TrustPillarsSection() {
  const pillars = [
    {
      icon: Leaf,
      title: "100% Pure Herbs",
      description: "Clean, natural herbs sourced fresh from trusted organic farms with zero chemical additives.",
    },
    {
      icon: UserCheck,
      title: "Experienced Hakim",
      description: "Carefully formulated by qualified practitioners with 35+ years of clinical experience in Karachi.",
    },
    {
      icon: ShieldCheck,
      title: "Private & Confidential",
      description: "Safe, respectful advice focused on your specific health concerns and daily lifestyle.",
    },
    {
      icon: Truck,
      title: "Cash on Delivery",
      description: "Fast, reliable delivery across Pakistan. Pay comfortably in cash when your parcel arrives.",
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-[#e6dfd5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <Reveal className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#c59b27]">
            Why Choose Us
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#123824]">
            Why Families Across Pakistan Trust Us
          </h2>
          <p className="text-xs sm:text-sm text-[#59534b]">
            Honest herbal medicine requires high quality, clean preparation, and genuine care for the patient.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <Reveal
                key={pillar.title}
                delay={index * 0.07}
                className="h-full"
              >
                <div
                  className="h-full p-6 rounded-xl bg-[#faf8f5] border border-[#e6dfd5] space-y-3 flex flex-col justify-between"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#123824] text-[#c59b27] flex items-center justify-center shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-serif text-base font-bold text-[#123824]">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-[#59534b] leading-relaxed pt-1">
                      {pillar.description}
                    </p>
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
