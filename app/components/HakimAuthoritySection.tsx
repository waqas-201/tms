"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CLINIC_INFO } from "@/app/data/products";
import {
  Award,
  BookOpen,
  CheckCircle2,
  FileText,
  HeartHandshake,
  ShieldCheck,
  Stethoscope,
  Users,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Reveal from "./motion/Reveal";

export default function HakimAuthoritySection() {
  const clinicalMetrics = [
    { value: "35+", label: "Years Clinical Experience in Karachi", icon: Award },
    {
      value: "150K+",
      label: "Patients Evaluated & Treated",
      icon: Users,
      href: CLINIC_INFO.googleMapsUrl,
      subLabel: "Verified Reviews ↗",
    },
    { value: "100%", label: "Pure Botanical Herbal Extracts", icon: ShieldCheck },
    { value: "0%", label: "Steroids, Chemicals or Additives", icon: Stethoscope },
  ];

  const journeySteps = [
    {
      num: "01",
      title: "Symptom Assessment",
      desc: "We analyze digestion, Mizaj (temperament), and root causes instead of suppressing superficial symptoms.",
    },
    {
      num: "02",
      title: "Hakim Clinical Review",
      desc: "Certified Unani practitioners evaluate your case history and pulse diagnostics.",
    },
    {
      num: "03",
      title: "Herbal Formulation",
      desc: "Pure steam distillates (Arq), wild honey conserves (Murabba), and cold-pressed oils prepared for your body.",
    },
    {
      num: "04",
      title: "Recovery Tracking",
      desc: "Direct WhatsApp support, dietary advice, and follow-up guidance until balance is restored.",
    },
  ];

  return (
    <section
      id="hakim-authority"
      className="py-16 sm:py-20 lg:py-24 bg-[#faf8f5] border-b border-[#e6dfd5]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-14">

        {/* Top Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left: Hakim Portrait visual (5 cols) */}
          <Reveal className="lg:col-span-5 relative">
            <div className="relative aspect-[4/4.8] rounded-3xl overflow-hidden shadow-xl border-2 border-[#e6dfd5] bg-[#f6f2ea]">
              <Image
                src="/images/2-scaled.png"
                alt="Hakim of Tameer-e-Sehat"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#22623a]/90 via-[#22623a]/20 to-transparent" />

              <div className="absolute bottom-5 left-5 right-5 text-white space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#c59b27] text-white text-[10px] font-bold uppercase tracking-wider">
                  <Award className="w-3 h-3" />
                  <span>Certified Tibbi Lineage</span>
                </div>
                <h3 className="font-serif text-lg sm:text-xl font-bold">
                  Hakim Muhammad Tariq
                </h3>
                <p className="text-xs text-[#f4eee5]/90 leading-snug">
                  Senior Tibbi Consultant & Master Herbalist · Serving Karachi Since 1990
                </p>
              </div>
            </div>

            {/* Overlapping Floating Badge */}
            <div className="absolute -bottom-4 -right-3 sm:-bottom-5 sm:-right-5 bg-white p-3.5 rounded-2xl border border-[#cde4d6] shadow-xl max-w-[210px]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#eef7f1] text-[#22623a] flex items-center justify-center shrink-0">
                  <HeartHandshake className="w-4.5 h-4.5" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-[#22623a] block">Est. 1990</span>
                  <span className="text-[#6a6660] text-[11px]">35+ Years of Trust</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right: Clinical Pedigree & Philosophy (7 cols) */}
          <Reveal delay={0.08} className="lg:col-span-7 space-y-5 lg:pl-2">
            <div className="space-y-1.5">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#8c6a15] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Our Clinical Heritage</span>
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#22623a] leading-tight">
                Authentic Eastern Healing, Rooted in Science
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-[#59534b] leading-relaxed">
              We identify internal temperamental imbalances (Mizaj) and restore organ harmony rather than temporarily suppressing symptoms with synthetic chemicals.
            </p>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#e6dfd5]">
                <CheckCircle2 className="w-4 h-4 text-[#22623a] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-[#1a1816]">Individualized Botanical Care: </strong>
                  <span className="text-[#6a6660]">Formulations customized for your age, digestion, and lifestyle.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#e6dfd5]">
                <CheckCircle2 className="w-4 h-4 text-[#22623a] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-[#1a1816]">Zero Synthetic Steroids: </strong>
                  <span className="text-[#6a6660]">Clean laboratory distillation guarantees 100% natural, safe ingredients.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#e6dfd5]">
                <CheckCircle2 className="w-4 h-4 text-[#22623a] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-[#1a1816]">Continuous WhatsApp Guidance: </strong>
                  <span className="text-[#6a6660]">Direct access to our clinic team throughout your recovery.</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3 items-center">
              <Link
                href="/consultation"
                className="px-5 py-2.5 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <span>Consult with Hakim</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/about"
                className="px-5 py-2.5 bg-white hover:bg-[#faf8f5] text-[#22623a] border border-[#cde4d6] text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
              >
                Our Story
              </Link>
            </div>
          </Reveal>
        </div>

        {/* 4 Trust Numbers Grid */}
        <Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 bg-white p-5 sm:p-6 rounded-2xl border border-[#e6dfd5] shadow-xs">
            {clinicalMetrics.map((metric, i) => {
              const Icon = metric.icon;
              const content = (
                <>
                  <div className="w-9 h-9 rounded-xl bg-[#eef7f1] text-[#22623a] flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-[#22623a] block">
                    {metric.value}
                  </span>
                  <span className="text-[11px] text-[#6a6660] font-medium block leading-tight">
                    {metric.label}
                  </span>
                  {"subLabel" in metric && metric.subLabel && (
                    <span className="text-[10px] text-[#8c6a15] font-semibold block pt-0.5">
                      {metric.subLabel}
                    </span>
                  )}
                </>
              );

              if ("href" in metric && metric.href) {
                return (
                  <a
                    key={i}
                    href={metric.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-center space-y-1.5 p-2 rounded-xl hover:bg-[#faf8f5] transition-all group cursor-pointer border border-transparent hover:border-[#cde4d6]"
                    title="Click to view verified reviews on Google"
                  >
                    {content}
                  </a>
                );
              }

              return (
                <div key={i} className="text-center space-y-1.5 p-2">
                  {content}
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* 4-Step Patient Care Journey */}
        <Reveal className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#8c6a15]">
              Care Journey
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#22623a]">
              4 Steps to Natural Recovery
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {journeySteps.map((step) => (
              <div
                key={step.num}
                className="bg-white rounded-2xl p-5 border border-[#e6dfd5] shadow-xs hover:shadow-luxury-hover transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-xl font-bold text-[#c59b27]">
                      {step.num}
                    </span>
                    <div className="w-2 h-2 rounded-full bg-[#22623a]" />
                  </div>
                  <h4 className="font-serif text-sm font-bold text-[#22623a]">
                    {step.title}
                  </h4>
                  <p className="text-xs text-[#59534b] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

      </div>
    </section>
  );
}
