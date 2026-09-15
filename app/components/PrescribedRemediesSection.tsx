"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PRODUCTS, CATEGORIES, Product } from "@/app/data/products";
import ProductCard from "./ProductCard";
import Reveal from "./motion/Reveal";
import { ArrowRight, Sparkles, Stethoscope, ShieldCheck, Flame } from "lucide-react";

export default function PrescribedRemediesSection() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Curate core remedies (max 6 to keep clean 30% ratio)
  const curatedProducts =
    activeCategory === "all"
      ? PRODUCTS.slice(0, 6)
      : PRODUCTS.filter((p) => p.category === activeCategory).slice(0, 6);

  return (
    <section id="apothecary-remedies" className="py-16 sm:py-20 bg-[#faf8f5] border-b border-[#e6dfd5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Section Header */}
        <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0f7f3] border border-[#c5e4d1] text-[#138833] text-xs font-semibold">
              <Stethoscope className="w-3.5 h-3.5 text-[#c59b27]" />
              <span>Apothecary & Clinical Dispensary (30% Botanical Formulations)</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#138833] leading-tight">
              Physician-Formulated Herbal Remedies
            </h2>
            <p className="text-xs sm:text-sm text-[#59534b] leading-relaxed">
              Every distillate (Arq), preserve (Murabba), and oil is prepared in small batches under strict laboratory hygienic standards using pure mountain herbs and wild honey.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#c5e4d1] hover:bg-[#f0f7f3] text-[#138833] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs shrink-0 self-start md:self-auto group"
          >
            <span>Explore All Remedies</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Reveal>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveCategory("all")}
            className={`text-xs px-4 py-2 rounded-full font-bold transition-all shrink-0 ${
              activeCategory === "all"
                ? "bg-[#138833] text-white shadow-xs"
                : "bg-white text-[#59534b] border border-[#e6dfd5] hover:border-[#138833]"
            }`}
          >
            All Formulations
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`text-xs px-4 py-2 rounded-full font-semibold transition-all shrink-0 ${
                activeCategory === cat.id
                  ? "bg-[#138833] text-white shadow-xs"
                  : "bg-white text-[#59534b] border border-[#e6dfd5] hover:border-[#138833]"
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* 6 Curated Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {curatedProducts.map((product, index) => (
            <Reveal key={product.id} delay={index * 0.05} className="h-full">
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>

        {/* Subtle Assurance Strip */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e6dfd5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#59534b]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#138833] shrink-0" />
            <span>Need a custom dosage or specific formulation prepared for your condition?</span>
          </div>
          <Link
            href="/consultation"
            className="text-[#138833] hover:text-[#0f7229] font-bold inline-flex items-center gap-1 shrink-0"
          >
            <span>Ask Hakim Sahib for Customized Preparation &rarr;</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
