"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Product, CategoryInfo } from "@/app/data/products";
import ProductCard from "./ProductCard";
import Reveal from "./motion/Reveal";
import ConsultationModal from "./ConsultationModal";
import { ArrowRight, Stethoscope, ShieldCheck, Loader2, Sparkles } from "lucide-react";

export default function PrescribedRemediesSection() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);

  useEffect(() => {
    async function loadRemediesData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
        ]);

        if (prodRes.ok) {
          const json = await prodRes.json();
          if (json.success && Array.isArray(json.data)) {
            setProductsList(json.data);
          }
        }

        if (catRes.ok) {
          const catJson = await catRes.json();
          if (catJson.success && Array.isArray(catJson.data)) {
            setCategoriesList(catJson.data);
          }
        }
      } catch (err) {
        console.error("Failed to load remedies live products:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadRemediesData();
  }, []);

  // Filter categories to only those with active products available
  const availableCategories = categoriesList.filter((cat) =>
    productsList.some((p) => p.category === cat.id)
  );

  // Curate core remedies (max 6 to keep scannable ratio)
  const curatedProducts =
    activeCategory === "all"
      ? productsList.slice(0, 6)
      : productsList.filter((p) => p.category === activeCategory).slice(0, 6);

  return (
    <>
      <section id="remedies" className="py-12 sm:py-18 lg:py-22 bg-white border-b border-[#e6dfd5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">

          {/* Section Header */}
          <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eef7f1] border border-[#cde4d6] text-[#22623a] text-xs font-semibold">
                <Stethoscope className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>Apothecary Dispensary</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#22623a] leading-tight">
                Physician-Formulated Remedies
              </h2>
              <p className="text-xs sm:text-sm text-[#59534b]">
                Pure hydro-distillates (Arqiyat), fruit preserves (Murabbajaat), and medicinal oils prepared in clean small batches.
              </p>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-[#faf8f5] hover:bg-[#eef7f1] border border-[#cde4d6] text-[#22623a] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs shrink-0 self-start sm:self-auto group"
            >
              <span>View All Remedies</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Reveal>

          {/* Category Filter Tabs (Only categories with active products) */}
          {availableCategories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={`text-xs px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold transition-all shrink-0 cursor-pointer ${
                  activeCategory === "all"
                    ? "bg-[#22623a] text-white shadow-xs"
                    : "bg-[#faf8f5] text-[#59534b] border border-[#e6dfd5] hover:border-[#22623a]"
                }`}
              >
                All Formulations
              </button>
              {availableCategories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`text-xs px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold transition-all shrink-0 cursor-pointer ${
                    activeCategory === cat.id
                      ? "bg-[#22623a] text-white shadow-xs"
                      : "bg-[#faf8f5] text-[#59534b] border border-[#e6dfd5] hover:border-[#22623a]"
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* 6 Curated Products Grid: 2-column mobile, 3-column desktop */}
          {isLoading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 text-[#22623a] animate-spin mx-auto mb-2" />
              <p className="text-xs text-[#7a7268]">Loading physician formulations...</p>
            </div>
          ) : curatedProducts.length === 0 ? (
            <div className="py-12 bg-[#faf8f5] rounded-2xl border border-[#e6dfd5] text-center p-6 space-y-3">
              <p className="text-xs text-[#59534b]">No formulations found for this category.</p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#22623a] hover:underline"
              >
                <span>Explore Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {curatedProducts.map((product, index) => (
                <Reveal key={product.id} delay={index * 0.04} className="h-full">
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          )}

          {/* Subtle Custom Formulation Callout Strip with Universal Modal Trigger */}
          <div className="p-3.5 sm:p-5 rounded-2xl bg-[#faf8f5] border border-[#e6dfd5] flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs text-[#59534b]">
            <div className="flex items-center gap-2.5 text-center sm:text-left">
              <ShieldCheck className="w-4 h-4 text-[#22623a] shrink-0" />
              <span>Need a custom dosage or specific formulation prepared for your condition?</span>
            </div>
            <button
              type="button"
              onClick={() => setIsConsultModalOpen(true)}
              className="text-[#22623a] hover:text-[#1b502e] font-bold inline-flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-lg bg-white border border-[#cde4d6] hover:bg-[#eef7f1] transition-all cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
              <span>Consult for Custom Formulation &rarr;</span>
            </button>
          </div>

        </div>
      </section>

      {/* Universal Consultation Modal */}
      <ConsultationModal
        isOpen={isConsultModalOpen}
        onClose={() => setIsConsultModalOpen(false)}
        initialMessage="I would like to inquire about a custom herbal formulation and dosage for my health condition."
        initialMode="WHATSAPP"
      />
    </>
  );
}
