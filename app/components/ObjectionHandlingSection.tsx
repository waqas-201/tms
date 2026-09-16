"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Reveal from "./motion/Reveal";
import { ChevronDown, ShieldCheck } from "lucide-react";

const objections = [
  {
    q: "Do herbal remedies actually work for chronic conditions?",
    a: "Unani medicine has over 2,000 years of clinical history across South Asia and the Middle East. Our Hakim prescribes formulations based on your individual body constitution (Mizaj), not generic advice. Over 150,000 patients have been treated at our clinic since 1990 — many after conventional treatments failed.",
  },
  {
    q: "Is this safe? Are there any side effects?",
    a: "Our remedies are made from pure botanical ingredients — hydro-distilled herbal waters (Arqiyat), natural fruit preserves (Murabba), and cold-pressed oils. Zero synthetic steroids, zero heavy metals, zero preservatives. Every formulation is prepared in small batches under direct Hakim supervision.",
  },
  {
    q: "I am not in Karachi. Can I still get treated?",
    a: "Absolutely. Our online WhatsApp consultation serves patients across all of Pakistan and internationally. Remedies are couriered to your doorstep with Cash on Delivery (COD) available nationwide. Recovery tracking happens remotely via WhatsApp check-ins with our clinical team.",
  },
  {
    q: "What if I have already tried everything and nothing worked?",
    a: "This is exactly where Unani medicine shines. Unlike symptom-suppressing drugs, we identify the root imbalance — whether it is excess body heat (Garam Mizaj), sluggish digestion, or toxin accumulation — and correct it naturally. Many of our most successful cases are patients who had exhausted all other options.",
  },
  {
    q: "How long does it take to see results?",
    a: "It depends on your condition, but many patients feel initial relief within 3–7 days. Acute issues like acidity and cough often improve within the first week. Chronic conditions like joint pain or liver detox typically follow a 21–30 day guided course. Your Hakim will set realistic expectations during your consultation.",
  },
  {
    q: "Is the consultation really free?",
    a: "Yes. Your initial symptom review and Hakim assessment are completely free with zero obligation. You only pay for the herbal remedies if you decide to proceed with the prescribed treatment plan. No hidden charges, no subscriptions.",
  },
];

export default function ObjectionHandlingSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const reducedMotion = useReducedMotion();

  return (
    <section id="faq" className="py-16 sm:py-20 lg:py-24 bg-white border-b border-[#e6dfd5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <Reveal className="text-center max-w-xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e2efe6] border border-[#cde4d6] text-[#22623a] text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#c59b27]" />
            <span>Honest Answers</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#22623a]">
            Questions You Might Have
          </h2>
          <p className="text-xs sm:text-sm text-[#59534b]">
            We believe in transparency. Here are the most common concerns — answered directly.
          </p>
        </Reveal>

        {/* FAQ Accordion */}
        <div className="space-y-2.5">
          {objections.map((item, index) => (
            <Reveal key={index} delay={index * 0.04}>
              <div
                className={`rounded-xl border transition-all duration-200 ${
                  openIndex === index
                    ? "bg-white border-[#22623a]/30 shadow-xs"
                    : "bg-white border-[#e6dfd5] hover:border-[#22623a]/20"
                }`}
              >
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left"
                  aria-expanded={openIndex === index}
                >
                  <span className="text-sm sm:text-[15px] font-semibold text-[#22623a] leading-snug pr-2">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#8c8a84] shrink-0 transition-transform duration-200 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {openIndex === index && (
                    <motion.div
                      initial={reducedMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-[13px] text-[#59534b] leading-relaxed border-t border-[#f4eee5] pt-3">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
