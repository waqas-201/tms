"use client";

import React from "react";
import Link from "next/link";
import { CLINIC_INFO } from "@/app/data/products";
import { ClipboardList, Stethoscope, PackageCheck, MessageCircle } from "lucide-react";
import Reveal from "./motion/Reveal";

export default function ConsultationProcessSection() {
  const steps = [
    {
      number: "01",
      icon: ClipboardList,
      title: "Fill Short Form",
      description: "Tell us about your health concerns, symptoms, and how long you have felt this way.",
    },
    {
      number: "02",
      icon: Stethoscope,
      title: "Hakim's Review",
      description: "Our experienced Hakim reviews your health details carefully to find the root cause.",
    },
    {
      number: "03",
      icon: MessageCircle,
      title: "Personal Advice",
      description: "Get customized food guidance, daily habits, and the right herbal recommendations via WhatsApp.",
    },
    {
      number: "04",
      icon: PackageCheck,
      title: "Doorstep Delivery",
      description: "Freshly prepared herbal remedies are packed cleanly and delivered to your home with Cash on Delivery.",
    },
  ];

  return (
    <section className="py-16 bg-[#f4eee5] border-b border-[#e6dfd5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <Reveal className="text-center max-w-2xl mx-auto space-y-2 mb-14">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#c59b27]">
            Simple Process
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#22623a]">
            How Online Herbal Consultation Works
          </h2>
          <p className="text-xs sm:text-sm text-[#59534b]">
            Four simple steps from sharing your symptoms to receiving fresh remedies at home.
          </p>
        </Reveal>

        {/* 4 Step Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Reveal
                key={step.number}
                delay={index * 0.06}
                className="h-full"
              >
                <div
                  className="relative h-full bg-white rounded-xl p-6 border border-[#e6dfd5] shadow-xs hover:shadow-luxury-hover transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Step indicator */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-lg bg-[#22623a] text-[#c59b27] flex items-center justify-center shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-serif text-xl font-bold text-[#d7c9b8]">
                      {step.number}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-serif text-base font-bold text-[#22623a]">
                      {step.title}
                    </h3>
                    <p className="text-xs text-[#59534b] leading-relaxed pt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Action Callout Bar */}
        <Reveal className="mt-12 bg-white rounded-xl p-6 sm:p-8 border border-[#e6dfd5] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-serif text-base sm:text-lg font-bold text-[#22623a]">
              Want to speak with an experienced Hakim?
            </h4>
            <p className="text-xs text-[#6a6660]">
              Free initial symptom review · Fast reply within 2 to 4 hours on working days.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              href="/consultation"
              className="w-full sm:w-auto text-center px-6 py-3 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-semibold tracking-wider uppercase rounded-md transition-colors shadow-xs"
            >
              Start Free Consultation
            </Link>
            <a
              href={`https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(
                "Assalam-o-Alaikum, I want to book an online consultation with the Hakim."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold rounded-md transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
