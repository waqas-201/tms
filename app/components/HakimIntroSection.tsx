"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight, BookOpen, Heart, Activity } from "lucide-react";
import Reveal from "./motion/Reveal";

export default function HakimIntroSection() {
  return (
    <section className="py-16 bg-white border-b border-[#e6dfd5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left: Hakim & Laboratory Imagery (5 cols) */}
          <Reveal className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-xl bg-[#f6f2ea] border border-[#e6dfd5]">
              <Image
                src="/images/2-scaled.png"
                alt="Tameer-e-Sehat Herbal Medicine Preparation"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#22623a]/60 via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-[10px] tracking-widest uppercase font-semibold text-[#c59b27] block mb-1">
                  Handcrafted Herbal Care
                </span>
                <p className="font-serif text-base font-semibold leading-snug">
                  &ldquo;True healing happens when we understand your body and help it recover naturally using gentle, pure remedies.&rdquo;
                </p>
              </div>
            </div>

            {/* Accent Floating Card */}
            <div className="absolute -bottom-6 -right-6 hidden sm:flex items-center gap-3 bg-[#faf8f5] p-4 rounded-xl border border-[#e6dfd5] shadow-lg max-w-xs">
              <div className="w-10 h-10 rounded-full bg-[#22623a]/10 text-[#22623a] flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-[#22623a] block">Personalized Care</span>
                <span className="text-[#6a6660] text-[11px]">Matched to your personal symptoms and lifestyle</span>
              </div>
            </div>
          </Reveal>

          {/* Right: The Philosophy & Authority (7 cols) */}
          <Reveal className="lg:col-span-7 space-y-6 lg:pl-6">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#c59b27] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Our Healing Approach</span>
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#22623a] leading-tight">
                Helping Your Body Heal with Nature
              </h2>
            </div>

            <p className="text-sm text-[#59534b] leading-relaxed">
              We believe your body is designed to stay healthy when given the right natural nourishment. When daily stress, heavy diet, or weather changes make you feel sluggish or sick, gentle herbs can help you get back on track.
            </p>

            <p className="text-sm text-[#59534b] leading-relaxed">
              At Tameer-e-Sehat, our certified Hakims bring over 35 years of clinical experience. We handcraft pure herbal waters (Arq), sweet fruit preserves (Murabba), and soothing joint oils that work gently with your body.
            </p>

            {/* 3 Core Philosophical Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-[#faf8f5] border border-[#e6dfd5] space-y-1.5">
                <div className="w-8 h-8 rounded-md bg-[#22623a]/10 text-[#22623a] flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <h4 className="font-serif text-sm font-semibold text-[#22623a]">
                  Personal Attention
                </h4>
                <p className="text-[11px] text-[#6a6660] leading-normal">
                  Listening to your specific symptoms before suggesting any remedy.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#faf8f5] border border-[#e6dfd5] space-y-1.5">
                <div className="w-8 h-8 rounded-md bg-[#22623a]/10 text-[#22623a] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="font-serif text-sm font-semibold text-[#22623a]">
                  100% Pure Herbs
                </h4>
                <p className="text-[11px] text-[#6a6660] leading-normal">
                  Real plants, natural mountain honey, and pure oils without chemicals.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#faf8f5] border border-[#e6dfd5] space-y-1.5">
                <div className="w-8 h-8 rounded-md bg-[#22623a]/10 text-[#22623a] flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </div>
                <h4 className="font-serif text-sm font-semibold text-[#22623a]">
                  Root Cause Relief
                </h4>
                <p className="text-[11px] text-[#6a6660] leading-normal">
                  Treating why you feel sick instead of just hiding your symptoms.
                </p>
              </div>
            </div>

            {/* Action link */}
            <div className="pt-4 flex items-center gap-4">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#22623a] hover:text-[#c59b27] transition-colors group"
              >
                <span>Read Our Full Story & Heritage</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
