"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  NUSKHA_CATEGORIES,
  NUSKHA_PREPARATION_TYPES,
  INITIAL_NUSKHAJAAT,
  Nuskha,
  calculateNuskhaPrice,
} from "@/app/data/nuskhajaat";
import { useCart } from "@/app/context/CartContext";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  Leaf,
  Scale,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Clock,
  HeartHandshake,
  MessageCircle,
  HelpCircle,
  X,
  PackageCheck,
  ChevronRight,
} from "lucide-react";

export default function NuskhajaatPage() {
  const { addNuskhaToCart } = useCart();
  const [nuskhajaat, setNuskhajaat] = useState<Nuskha[]>(INITIAL_NUSKHAJAAT);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPrepType, setSelectedPrepType] = useState("all");
  const [sortBy, setSortBy] = useState<"featured" | "rating" | "ingredients">("featured");

  // Fetch from API on mount
  useEffect(() => {
    async function loadNuskhajaat() {
      try {
        const res = await fetch("/api/nuskhajaat");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && json.data.length > 0) {
            setNuskhajaat(json.data);
          }
        }
      } catch (err) {
        console.warn("Could not fetch from /api/nuskhajaat, using static data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadNuskhajaat();
  }, []);

  // Filter & Search Logic
  const filteredNuskhajaat = useMemo(() => {
    return nuskhajaat.filter((nuskha) => {
      // Category filter
      if (selectedCategory !== "all" && nuskha.category !== selectedCategory) {
        return false;
      }
      // Preparation format filter
      if (
        selectedPrepType !== "all" &&
        nuskha.preparationType.toLowerCase() !== selectedPrepType.toLowerCase()
      ) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = nuskha.title.toLowerCase().includes(q);
        const matchesUrdu = nuskha.urduTitle.includes(q);
        const matchesDesc = nuskha.shortDescription.toLowerCase().includes(q);
        const matchesCategory = nuskha.categoryLabel.toLowerCase().includes(q);
        const matchesMizaj = nuskha.mizaj?.toLowerCase().includes(q);
        const matchesIngredients = nuskha.ingredients.some(
          (ing) =>
            ing.name.toLowerCase().includes(q) ||
            ing.urduName.includes(q) ||
            (ing.role && ing.role.toLowerCase().includes(q))
        );

        if (
          !matchesTitle &&
          !matchesUrdu &&
          !matchesDesc &&
          !matchesCategory &&
          !matchesMizaj &&
          !matchesIngredients
        ) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "rating") {
        return b.rating - a.rating;
      }
      if (sortBy === "ingredients") {
        return b.ingredients.length - a.ingredients.length;
      }
      // featured default
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
  }, [nuskhajaat, selectedCategory, selectedPrepType, searchQuery, sortBy]);

  // Quick Add handler for complete default formulation
  const handleQuickAdd = (nuskha: Nuskha) => {
    const defaultPricing = calculateNuskhaPrice(
      nuskha,
      {},
      1.0,
      nuskha.preparationType === "Majun" ? "Majun" : "Safoof"
    );

    const ingredientsSummary = nuskha.ingredients
      .map((ing) => `${ing.name} (${ing.defaultQuantity}${ing.unit === "grams" ? "g" : ing.unit})`)
      .join(", ");

    addNuskhaToCart(nuskha, {
      courseDuration: "30 Days Standard Supply",
      preparationFormat:
        nuskha.preparationType === "Majun"
          ? "Traditional Majun (Honey Base)"
          : "Freshly Ground Ready Safoof",
      finalPrice: defaultPricing.finalPrice,
      totalWeightGrams: defaultPricing.totalWeightGrams,
      ingredientsSummary,
      quantity: 1,
    });
  };

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* ─── 1. HERO & CLINICAL APOTHECARY BANNER ─── */}
      <section className="relative bg-[#1b4329] text-[#f4eee5] overflow-hidden border-b border-[#143e23]">
        {/* Subtle background ornamentation */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#c59b27_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#11351e] border border-[#c59b27]/30 text-[#c59b27] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Classical Herbal Compounding · نسخہ جات و مرکبات</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
              Authentic Nuskhajaat &amp; Custom Herbal Formulas
            </h1>

            <p className="text-sm sm:text-base text-[#ded8ce] leading-relaxed">
              Traditional Unani compound remedies crafted from whole, premium medicinal herbs.
              Order our complete classic formulations or <strong>customize individual herbs, exact gram weights, and preparation formats</strong> to match your specific health needs.
            </p>

            {/* Value Pillars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
              <div className="flex items-center gap-2 bg-[#11351e]/60 p-2.5 rounded-xl border border-[#143e23]">
                <Scale className="w-4 h-4 text-[#c59b27] shrink-0" />
                <span className="font-medium text-[#f4eee5]">Customizable Grams</span>
              </div>
              <div className="flex items-center gap-2 bg-[#11351e]/60 p-2.5 rounded-xl border border-[#143e23]">
                <Leaf className="w-4 h-4 text-[#c59b27] shrink-0" />
                <span className="font-medium text-[#f4eee5]">100% Pure Whole Herbs</span>
              </div>
              <div className="flex items-center gap-2 bg-[#11351e]/60 p-2.5 rounded-xl border border-[#143e23]">
                <PackageCheck className="w-4 h-4 text-[#c59b27] shrink-0" />
                <span className="font-medium text-[#f4eee5]">Fresh Compounding</span>
              </div>
              <div className="flex items-center gap-2 bg-[#11351e]/60 p-2.5 rounded-xl border border-[#143e23]">
                <ShieldCheck className="w-4 h-4 text-[#c59b27] shrink-0" />
                <span className="font-medium text-[#f4eee5]">Hakim-Supervised</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. SEARCH & FILTER CONTROLS ─── */}
      <section className="sticky top-[60px] sm:top-[69px] z-30 bg-white/95 backdrop-blur-md border-b border-[#e6dfd5] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
          {/* Top row: Search input + Format filter + Sorting */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#7a7268] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by nuskha name, herb (e.g. Saunf), or condition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs sm:text-sm font-medium text-[#1a1816] placeholder-[#8a8276] focus:outline-none focus:border-[#22623a] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a7268] hover:text-[#1a1816]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Preparation Format Selector & Sorting */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <div className="flex items-center gap-1.5 text-xs text-[#59534b] shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#22623a]" />
                <span className="font-semibold hidden md:inline">Format:</span>
              </div>

              <select
                value={selectedPrepType}
                onChange={(e) => setSelectedPrepType(e.target.value)}
                className="px-2.5 py-1.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-xs font-semibold text-[#22623a] focus:outline-none focus:border-[#22623a]"
              >
                <option value="all">All Formats</option>
                {NUSKHA_PREPARATION_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label} ({type.urduLabel})
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-xs font-semibold text-[#59534b] focus:outline-none focus:border-[#22623a]"
              >
                <option value="featured">Sort: Featured</option>
                <option value="rating">Sort: Highest Rated</option>
                <option value="ingredients">Sort: Most Ingredients</option>
              </select>
            </div>
          </div>

          {/* Bottom row: Category Horizontal Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === "all"
                  ? "bg-[#22623a] text-white shadow-xs"
                  : "bg-[#faf8f5] text-[#59534b] hover:bg-[#ede6dc] border border-[#e6dfd5]"
              }`}
            >
              All Formulations ({nuskhajaat.length})
            </button>

            {NUSKHA_CATEGORIES.map((cat) => {
              const count = nuskhajaat.filter((n) => n.category === cat.id).length;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#22623a] text-white shadow-xs"
                      : "bg-[#faf8f5] text-[#59534b] hover:bg-[#ede6dc] border border-[#e6dfd5]"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? "bg-white/20 text-white" : "bg-[#e6dfd5] text-[#59534b]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 3. NUSKHA COMPOUND CATALOG GRID ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Results count & active query notice */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs sm:text-sm text-[#59534b]">
            Showing <strong className="text-[#22623a]">{filteredNuskhajaat.length}</strong> classical compound formulations
          </p>

          {(selectedCategory !== "all" || selectedPrepType !== "all" || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSelectedPrepType("all");
                setSearchQuery("");
              }}
              className="text-xs text-[#8c6a15] hover:text-[#22623a] font-semibold underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear filters</span>
            </button>
          )}
        </div>

        {/* Empty state */}
        {filteredNuskhajaat.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e6dfd5] p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#f4eee5] flex items-center justify-center mx-auto text-[#7a7268]">
              <Leaf className="w-8 h-8 opacity-40" />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#22623a]">
              No Formulations Match Your Search
            </h3>
            <p className="text-xs sm:text-sm text-[#7a7268] max-w-md mx-auto">
              We couldn&apos;t find any compound remedies matching your filter criteria. Try searching for individual herbs like &quot;Saunf&quot;, &quot;Sonth&quot;, or select &quot;All Formulations&quot;.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSelectedPrepType("all");
                setSearchQuery("");
              }}
              className="px-5 py-2.5 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-bold uppercase rounded-xl transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredNuskhajaat.map((nuskha) => {
              // Calculate default starting price
              const defaultPricing = calculateNuskhaPrice(
                nuskha,
                {},
                1.0,
                nuskha.preparationType === "Majun" ? "Majun" : "Safoof"
              );

              return (
                <div
                  key={nuskha.id}
                  className="bg-white rounded-2xl border border-[#e6dfd5] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group"
                >
                  {/* Image Container with Badges */}
                  <div className="relative h-52 sm:h-56 bg-[#f4eee5] overflow-hidden">
                    <Image
                      src={nuskha.image}
                      alt={nuskha.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/10" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                      <span className="px-2.5 py-1 bg-[#22623a]/90 backdrop-blur-xs text-white text-[11px] font-bold uppercase tracking-wider rounded-lg border border-white/20 shadow-xs">
                        {nuskha.badge || nuskha.categoryLabel}
                      </span>

                      <span className="px-2.5 py-1 bg-white/95 backdrop-blur-xs text-[#22623a] text-[11px] font-bold rounded-lg border border-[#e6dfd5] shadow-xs">
                        {nuskha.preparationType}
                      </span>
                    </div>

                    {/* Bottom Title on Image */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="font-serif text-lg font-bold line-clamp-1">
                          {nuskha.title}
                        </h3>
                        <span className="font-serif text-sm text-[#f6d77e] font-semibold shrink-0" dir="rtl">
                          {nuskha.urduTitle}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    {/* Short Description & Mizaj Tag */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-xs text-[#7a7268]">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#faf8f5] border border-[#e6dfd5] rounded text-[11px] font-semibold text-[#59534b]">
                          <span>Mizaj:</span>
                          <strong className="text-[#22623a]">{nuskha.mizaj}</strong>
                        </span>
                        <span>·</span>
                        <span>{nuskha.ingredients.length} Herbs</span>
                      </div>

                      <p className="text-xs text-[#59534b] line-clamp-2 leading-relaxed">
                        {nuskha.shortDescription}
                      </p>
                    </div>

                    {/* Key Ingredients Pill List */}
                    <div className="space-y-1.5 pt-2 border-t border-[#f4eee5]">
                      <div className="flex items-center justify-between text-[11px] text-[#7a7268]">
                        <span className="font-semibold text-[#22623a] flex items-center gap-1">
                          <Leaf className="w-3 h-3 text-[#2d7648]" />
                          Included Pure Herbs:
                        </span>
                        <span>{defaultPricing.totalWeightGrams}g Total</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {nuskha.ingredients.slice(0, 4).map((ing) => (
                          <span
                            key={ing.id || ing.name}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f4f9f5] border border-[#d8ecde] text-[#22623a] rounded-md text-[11px] font-medium"
                          >
                            <span>{ing.name}</span>
                            <span className="text-[10px] text-[#59534b]">({ing.defaultQuantity}g)</span>
                          </span>
                        ))}
                        {nuskha.ingredients.length > 4 && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-[#faf8f5] border border-[#e6dfd5] text-[#59534b] rounded-md text-[10px] font-semibold">
                            +{nuskha.ingredients.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Benefits Checklist */}
                    <div className="space-y-1 pt-2 border-t border-[#f4eee5] text-xs text-[#59534b]">
                      {nuskha.benefits.slice(0, 2).map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 line-clamp-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2d7648] shrink-0 mt-0.5" />
                          <span className="truncate">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    {/* Price & Action Buttons */}
                    <div className="pt-3 border-t border-[#e6dfd5] space-y-3">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-[#7a7268] font-bold block">
                            Starting Supply:
                          </span>
                          <span className="text-lg font-bold text-[#22623a]">
                            ₨ {defaultPricing.finalPrice.toLocaleString()}
                          </span>
                        </div>

                        <span className="text-[11px] text-[#7a7268]">
                          30 Days (~{defaultPricing.totalWeightGrams}g)
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {/* Interactive Customizer Button */}
                        <Link
                          href={`/nuskhajaat/${nuskha.slug}`}
                          className="flex items-center justify-center gap-1.5 py-2.5 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-xs"
                        >
                          <Scale className="w-3.5 h-3.5 text-[#c59b27]" />
                          <span>Customize</span>
                        </Link>

                        {/* Quick Order Complete Formula */}
                        <button
                          onClick={() => handleQuickAdd(nuskha)}
                          className="flex items-center justify-center gap-1 py-2.5 bg-[#f4f9f5] hover:bg-[#d8ecde] text-[#22623a] border border-[#d8ecde] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                        >
                          <span>+ Quick Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ─── 4. HOW CUSTOM COMPOUNDING WORKS SECTION ─── */}
      <section className="bg-white border-t border-[#e6dfd5] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#c59b27] uppercase tracking-widest">
              Unani Pharmacy Standard
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#22623a]">
              How Nuskhajaat Compounding Works
            </h2>
            <p className="text-xs sm:text-sm text-[#59534b]">
              We believe in full transparency and tailored herbal medicine. Every compound is prepared with clinical integrity according to classical Unani Tibb principles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 bg-[#faf8f5] rounded-2xl border border-[#e6dfd5] space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-[#22623a] text-[#c59b27] font-bold text-base flex items-center justify-center">
                1
              </div>
              <h3 className="text-sm font-serif font-bold text-[#22623a]">
                Choose Classical Formula
              </h3>
              <p className="text-xs text-[#59534b] leading-relaxed">
                Select from time-tested digestive carminatives, joint relief blends, vital tonics, or respiratory decoctions.
              </p>
            </div>

            <div className="p-6 bg-[#faf8f5] rounded-2xl border border-[#e6dfd5] space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-[#22623a] text-[#c59b27] font-bold text-base flex items-center justify-center">
                2
              </div>
              <h3 className="text-sm font-serif font-bold text-[#22623a]">
                Tailor Herb Weights (Grams)
              </h3>
              <p className="text-xs text-[#59534b] leading-relaxed">
                Use our interactive customizer to increase, decrease, or omit individual herbs. Pricing updates automatically on-the-go.
              </p>
            </div>

            <div className="p-6 bg-[#faf8f5] rounded-2xl border border-[#e6dfd5] space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-[#22623a] text-[#c59b27] font-bold text-base flex items-center justify-center">
                3
              </div>
              <h3 className="text-sm font-serif font-bold text-[#22623a]">
                Select Preparation Format
              </h3>
              <p className="text-xs text-[#59534b] leading-relaxed">
                Choose ready-to-consume ultra-fine Safoof powder, raw unground herbs for boiling, or herbal Majun paste with wild honey.
              </p>
            </div>

            <div className="p-6 bg-[#faf8f5] rounded-2xl border border-[#e6dfd5] space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-[#22623a] text-[#c59b27] font-bold text-base flex items-center justify-center">
                4
              </div>
              <h3 className="text-sm font-serif font-bold text-[#22623a]">
                Freshly Compounded &amp; Shipped
              </h3>
              <p className="text-xs text-[#59534b] leading-relaxed">
                Our dispensary hand-sorts, cleans, grinds, and packages your remedy, dispatched nationwide with Cash on Delivery.
              </p>
            </div>
          </div>

          {/* Need help banner */}
          <div className="bg-[#f4f9f5] border border-[#d8ecde] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#22623a]">
                Unsure which Nuskha is right for your Mizaj (Temperament)?
              </h3>
              <p className="text-xs sm:text-sm text-[#59534b]">
                Speak directly with our experienced Hakim for personalized guidance and custom dosage.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/consultation"
                className="px-5 py-2.5 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-bold uppercase rounded-xl transition-colors shadow-xs"
              >
                Free Consultation
              </Link>
              <a
                href="https://wa.me/923332247909?text=Assalam-o-Alaikum%20Hakim%20Sahib,%20I%20need%20advice%20regarding%20a%20Nuskha%20formulation."
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>WhatsApp Hakim</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
