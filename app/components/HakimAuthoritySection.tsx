"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
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
} from "lucide-react";
import Reveal from "./motion/Reveal";

export default function HakimAuthoritySection() {
  const clinicalMetrics = [
    { value: "35+", label: "Years of Clinical Practice in Karachi", icon: Award },
    { value: "150,000+", label: "Patients Evaluated & Treated", icon: Users },
    { value: "100%", label: "Pure Botanical & Herbal Formulations", icon: ShieldCheck },
    { value: "0%", label: "Steroids, Chemicals or Additives", icon: Stethoscope },
  ];

  const journeySteps = [
    {
      num: "01",
      title: "Comprehensive Symptom Assessment",
      desc: "We analyze your digestion, temperament (Mizaj), sleep, and root causes instead of suppressing superficial symptoms.",
    },
    {
      num: "02",
      title: "Qualified Hakim Review",
      desc: "Certified Tibbi practitioners with decades of pulse and clinical experience evaluate your case history.",
    },
    {
      num: "03",
      title: "Handcrafted Herbal Regimen",
      desc: "Pure steam distillates (Arq), wild honey conserves (Murabba), and cold-pressed oils customized to your body.",
    },
    {
      num: "04",
      title: "Ongoing Recovery Tracking",
      desc: "Continuous WhatsApp guidance, dietary modifications, and bi-weekly recovery check-ins until health is restored.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-[#faf8f5] border-b border-[#e6dfd5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* Top Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Hakim Portrait / Laboratory visual (5 cols) */}
          <Reveal className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-2 border-[#e6dfd5] bg-[#f6f2ea]">
              <Image
                src="/images/2-scaled.png"
                alt="Hakim of Tameer-e-Sehat"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#138833]/90 via-[#138833]/20 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c59b27] text-white text-[10px] font-bold uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5" />
                  <span>Certified Tibbi Lineage</span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold">
                  Hakim Muhammad Tariq
                </h3>
                <p className="text-xs text-[#f4eee5]/90 leading-snug">
                  Senior Tibbi Consultant & Master Herbalist with over three decades of clinical service in Karachi.
                </p>
              </div>
            </div>

            {/* Overlapping Floating Badge */}
            <div className="absolute -bottom-5 -right-4 sm:-bottom-6 sm:-right-6 bg-white p-4 rounded-2xl border border-[#c5e4d1] shadow-xl max-w-[240px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#f0f7f3] text-[#138833] flex items-center justify-center shrink-0">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-[#138833] block">Since 1990</span>
                  <span className="text-[#6a6660] text-[11px]">35+ Years of Trust</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right: Clinical Pedigree & Philosophy (7 cols) */}
          <Reveal delay={0.1} className="lg:col-span-7 space-y-6 lg:pl-4">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#8c6a15] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Our Clinical Heritage</span>
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl lg:text-[38px] font-bold text-[#138833] leading-tight">
                Authentic Eastern Medicine Meets Modern Clinical Rigor
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-[#59534b] leading-relaxed">
              At Tameer-e-Sehat, we treat human health as an integrated system. Unlike conventional approaches that focus merely on temporarily muting symptoms with synthetic chemicals, classical Unani Tibb identifies your internal imbalance (Mizaj) and gently restores natural organ balance.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-[#e6dfd5]">
                <CheckCircle2 className="w-4 h-4 text-[#138833] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-[#1a1816] block">Individualized Botanical Prescriptions:</strong>
                  <span className="text-[#6a6660]">Every patient receives recommendations customized for their age, lifestyle, digestion, and climate.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-[#e6dfd5]">
                <CheckCircle2 className="w-4 h-4 text-[#138833] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-[#1a1816] block">Zero Heavy Metals or Synthetic Steroids:</strong>
                  <span className="text-[#6a6660]">Strict laboratory distillation standards ensure pure, safe, food-grade botanical ingredients.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-[#e6dfd5]">
                <CheckCircle2 className="w-4 h-4 text-[#138833] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-[#1a1816] block">Continuous WhatsApp Telehealth Care:</strong>
                  <span className="text-[#6a6660]">Patients stay directly connected to the clinic team throughout their recovery period.</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <Link
                href="/consultation"
                className="px-6 py-3 bg-[#138833] hover:bg-[#0f7229] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <span>Consult with Hakim Today</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/about"
                className="px-6 py-3 bg-white hover:bg-[#faf8f5] text-[#138833] border border-[#c5e4d1] text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
              >
                Learn Our Full History
              </Link>
            </div>
          </Reveal>
        </div>

        {/* 4 Trust Numbers Grid */}
        <Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#e6dfd5] shadow-xs">
            {clinicalMetrics.map((metric, i) => {
              const Icon = metric.icon;
              return (
                <div key={i} className="text-center space-y-2 p-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f0f7f3] text-[#138833] flex items-center justify-center mx-auto">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-serif text-2xl sm:text-4xl font-bold text-[#138833] block">
                    {metric.value}
                  </span>
                  <span className="text-xs text-[#6a6660] font-medium block">
                    {metric.label}
                  </span>
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* 4-Step Patient Care Journey */}
        <Reveal className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#8c6a15]">
              Structured Healthcare
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#138833]">
              Your 4-Step Clinical Journey to Healing
            </h3>
            <p className="text-xs sm:text-sm text-[#59534b]">
              From first intake to sustained recovery, here is how our clinical process works.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {journeySteps.map((step) => (
              <div
                key={step.num}
                className="bg-white rounded-2xl p-6 border border-[#e6dfd5] shadow-xs hover:shadow-luxury-hover transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-2xl font-bold text-[#c59b27]">
                      {step.num}
                    </span>
                    <div className="w-2 h-2 rounded-full bg-[#138833]" />
                  </div>
                  <h4 className="font-serif text-base font-bold text-[#138833]">
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
