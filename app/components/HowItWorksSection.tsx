"use client";

import React from "react";
import Link from "next/link";
import { CLINIC_INFO } from "@/app/data/products";
import { motion, useReducedMotion } from "framer-motion";
import Reveal from "./motion/Reveal";
import {
  MessageCircle,
  Stethoscope,
  HeartHandshake,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    num: "01",
    icon: MessageCircle,
    title: "Share Your Symptoms",
    description:
      "Send a quick WhatsApp message or fill our 2-minute online form. Describe what you are feeling — no appointment needed to start.",
    color: "bg-[#25D366]",
    textColor: "text-[#25D366]",
    borderColor: "border-[#25D366]/30",
  },
  {
    num: "02",
    icon: Stethoscope,
    title: "Hakim Reviews & Prescribes",
    description:
      "Our qualified Hakim reviews your symptoms, identifies the root imbalance, and prepares a personalized herbal treatment plan — usually within 24 hours.",
    color: "bg-[#22623a]",
    textColor: "text-[#22623a]",
    borderColor: "border-[#22623a]/30",
  },
  {
    num: "03",
    icon: HeartHandshake,
    title: "Recover with Ongoing Support",
    description:
      "Your remedies are delivered nationwide (COD available). Our team tracks your recovery via WhatsApp check-ins until you feel genuinely better.",
    color: "bg-[#c59b27]",
    textColor: "text-[#8c6a15]",
    borderColor: "border-[#c59b27]/30",
  },
];

export default function HowItWorksSection() {
  const reducedMotion = useReducedMotion();

  return (
    <section
      id="how-it-works"
      className="py-16 sm:py-20 lg:py-24 bg-white border-b border-[#e6dfd5]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">
        {/* Section Header */}
        <Reveal className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#8c6a15]">
            Simple 3-Step Process
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#22623a]">
            Getting Help is Effortless
          </h2>
          <p className="text-xs sm:text-sm text-[#59534b] leading-relaxed max-w-lg mx-auto">
            No long queues, no complicated registration. From your first message to your recovery — we keep it simple.
          </p>
        </Reveal>

        {/* Steps Flow */}
        <div className="relative max-w-4xl mx-auto">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-[52px] left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] h-[2px] bg-gradient-to-r from-[#25D366]/30 via-[#22623a]/30 to-[#c59b27]/30" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Reveal key={index} delay={index * 0.1}>
                  <motion.div
                    whileHover={
                      reducedMotion
                        ? undefined
                        : { y: -4, transition: { duration: 0.2 } }
                    }
                    className="relative text-center space-y-4 group"
                  >
                    {/* Step Circle */}
                    <div className="relative mx-auto w-[72px] h-[72px] sm:w-[84px] sm:h-[84px]">
                      <div
                        className={`absolute inset-0 rounded-full ${step.color}/10 group-hover:${step.color}/20 transition-colors duration-300`}
                      />
                      <div
                        className={`absolute inset-1 rounded-full bg-white border-2 ${step.borderColor} flex items-center justify-center group-hover:border-0 group-hover:${step.color} transition-all duration-300`}
                      >
                        <Icon
                          className={`w-7 h-7 sm:w-8 sm:h-8 ${step.textColor} group-hover:text-white transition-colors duration-300`}
                        />
                      </div>
                      {/* Step Number Badge */}
                      <span
                        className={`absolute -top-1 -right-1 w-6 h-6 rounded-full ${step.color} text-white text-[10px] font-bold flex items-center justify-center shadow-sm`}
                      >
                        {step.num}
                      </span>
                    </div>

                    {/* Step Content */}
                    <div className="space-y-2 px-2">
                      <h3 className="font-serif text-base sm:text-lg font-bold text-[#22623a]">
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-[13px] text-[#59534b] leading-relaxed max-w-xs mx-auto">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* CTA Row */}
        <Reveal className="text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-3">
            <a
              href={`https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(
                "Assalam-o-Alaikum Hakim Sahib, I would like to share my symptoms for a health review."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Start Step 1 — Message on WhatsApp</span>
            </a>
            <Link
              href="/consultation"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#22623a] hover:text-[#c59b27] transition-colors group"
            >
              <span>Or fill the online form</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
