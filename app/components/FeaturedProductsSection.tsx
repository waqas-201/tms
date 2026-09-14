"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PRODUCTS, CATEGORIES } from "@/app/data/products";
import { useLanguage } from "@/app/context/LanguageContext";
import ProductCard from "./ProductCard";
import Reveal from "./motion/Reveal";
import { ArrowRight, Sparkles } from "lucide-react";

export default function FeaturedProductsSection() {
  const { t, isUrdu } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredProducts =
    activeCategory === "all"
      ? PRODUCTS.slice(0, 8)
      : PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <section className="py-16 bg-[#faf8f5] border-b border-[#e6dfd5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Section Header */}
        <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#c59b27] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t("featuredBadge")}</span>
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#123824]">
              {t("featuredHeading")}
            </h2>
            <p className="text-xs sm:text-sm text-[#59534b]">
              {t("featuredSubtitle")}
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#123824] hover:text-[#c59b27] transition-colors self-start md:self-auto group"
          >
            <span>{isUrdu ? "تمام ادویات دیکھیں (16+)" : "View Full Apothecary (16+)"}</span>
            <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${isUrdu ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
          </Link>
        </Reveal>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveCategory("all")}
            className={`text-xs px-4 py-2 rounded-full font-medium transition-all shrink-0 ${
              activeCategory === "all"
                ? "bg-[#123824] text-white shadow-xs"
                : "bg-white text-[#59534b] border border-[#e6dfd5] hover:border-[#123824]"
            }`}
          >
            {isUrdu ? "تمام ادویات" : "All Formulations"}
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`text-xs px-4 py-2 rounded-full font-medium transition-all shrink-0 ${
                activeCategory === cat.id
                  ? "bg-[#123824] text-white shadow-xs"
                  : "bg-white text-[#59534b] border border-[#e6dfd5] hover:border-[#123824]"
              }`}
            >
              <span>{isUrdu ? cat.urduName : cat.name.split(" ")[0]}</span>{" "}
              {!isUrdu && <span className="font-urdu opacity-80 text-[11px]">({cat.urduName})</span>}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <Reveal key={product.id} delay={index * 0.06} className="h-full">
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
