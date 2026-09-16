"use client";

import React from "react";
import { Leaf, ShieldCheck, UserCheck, Truck } from "lucide-react";
import Reveal from "./motion/Reveal";
import { motion, useReducedMotion } from "framer-motion";

export default function TrustPillarsSection() {
  const reducedMotion = useReducedMotion();
  const pillars = [
    {
      icon: Leaf,
      title: "100% Pure Herbs",
      description: "Organic botanical ingredients with zero steroids or chemicals.",
    },
    {
      icon: UserCheck,
      title: "35+ Yrs Hakim Pedigree",
      description: "Formulated and prescribed by qualified Unani practitioners.",
    },
    {
      icon: ShieldCheck,
      title: "Confidential Care",
      description: "Private symptom review tailored to your health and lifestyle.",
    },
    {
      icon: Truck,
      title: "Nationwide Delivery",
      description: "Fast Cash on Delivery (COD) across Karachi and all Pakistan.",
    },
  ];

  return (
    <section
      id="trust-pillars"
      className="py-14 sm:py-18 bg-white border-b border-[#e6dfd5]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        <Reveal className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#8c6a15]">
            Why Choose Us
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#22623a]">
            Clinical Excellence You Can Trust
          </h2>
          <p className="text-xs sm:text-sm text-[#59534b]">
            Authentic Eastern medicine backed by clean laboratory standards.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <Reveal
                key={pillar.title}
                delay={index * 0.05}
                className="h-full"
              >
                <motion.div
                  whileHover={reducedMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}
                  className="h-full p-5 rounded-2xl bg-[#faf8f5] border border-[#e6dfd5] space-y-3 flex flex-col justify-between hover:border-[#22623a]/40 hover:shadow-xs transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#22623a] text-[#c59b27] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif text-sm font-bold text-[#22623a]">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-[#59534b] leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
