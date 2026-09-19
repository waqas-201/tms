"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PRODUCTS, CATEGORIES, Product } from "@/app/data/products";
import ProductCard from "@/app/components/ProductCard";
import {
  Search,
  Sparkles,
  SlidersHorizontal,
  Truck,
  ShieldCheck,
  LayoutGrid,
  List,
  X,
  RotateCcw,
  Check,
  Stethoscope,
  Filter,
  Package,
} from "lucide-react";

// Health concern mappings to product IDs or categories
const HEALTH_CONCERNS = [
  { id: "all", name: "All Health Concerns" },
  {
    id: "digestion",
    name: "Digestion, Acidity & Stomach",
    keywords: ["stomach", "acidity", "digestion", "constipation", "gas", "gerd", "gut"],
  },
  {
    id: "joints",
    name: "Joint Pain, Arthritis & Bones",
    keywords: ["joint", "knee", "pain", "arthritis", "backache", "stiffness"],
  },
  {
    id: "liver",
    name: "Liver Detox & Body Heat (Mizaj)",
    keywords: ["liver", "heat", "detox", "jaundice", "cooling", "fatty"],
  },
  {
    id: "vitality",
    name: "Daily Energy, Brain & Stamina",
    keywords: ["energy", "vitality", "stamina", "memory", "brain", "weakness"],
  },
  {
    id: "respiratory",
    name: "Cough, Sinus & Allergies",
    keywords: ["cough", "throat", "allergy", "sinus", "chest", "mucus", "asthma"],
  },
  {
    id: "skin-hair",
    name: "Skin Care, Heels & Hair Growth",
    keywords: ["skin", "burns", "cracked", "heels", "hair", "scalp", "dandruff"],
  },
];

const PRICE_RANGES = [
  { id: "all", label: "All Prices" },
  { id: "under-1000", label: "Under ₨ 1,000", min: 0, max: 1000 },
  { id: "1000-2000", label: "₨ 1,000 – ₨ 2,000", min: 1000, max: 2000 },
  { id: "over-2000", label: "₨ 2,000 & Above", min: 2000, max: 99999 },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";

  // Products from API
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadLiveProducts() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setProductsList(data.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch live products catalog:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadLiveProducts();
  }, []);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedConcern, setSelectedConcern] = useState<string>("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("all");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Compute filtered & sorted product list
  const filteredProducts = useMemo(() => {
    let list = [...productsList];

    // Category filter
    if (selectedCategory !== "all") {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // Health concern filter
    if (selectedConcern !== "all") {
      const concern = HEALTH_CONCERNS.find((c) => c.id === selectedConcern);
      if (concern && concern.keywords) {
        list = list.filter((p) => {
          const content = `${p.name} ${p.shortDescription} ${p.traditionalPurpose} ${p.benefits.join(" ")}`.toLowerCase();
          return concern.keywords.some((kw) => content.includes(kw));
        });
      }
    }

    // Price range filter
    if (selectedPriceRange !== "all") {
      const range = PRICE_RANGES.find((r) => r.id === selectedPriceRange);
      if (range) {
        list = list.filter((p) => p.price >= range.min! && p.price <= range.max!);
      }
    }

    // In stock only filter
    if (inStockOnly) {
      list = list.filter((p) => p.inStock);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.traditionalPurpose.toLowerCase().includes(q) ||
          p.benefits.some((b) => b.toLowerCase().includes(q)) ||
          p.ingredients.some((ing) => ing.name.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === "price-low") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    } else if (sortBy === "name-asc") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // featured
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return list;
  }, [
    selectedCategory,
    selectedConcern,
    selectedPriceRange,
    inStockOnly,
    searchQuery,
    sortBy,
  ]);

  const activeCategoryInfo = CATEGORIES.find((c) => c.id === selectedCategory);
  const activeConcernInfo = HEALTH_CONCERNS.find((c) => c.id === selectedConcern);
  const activePriceInfo = PRICE_RANGES.find((r) => r.id === selectedPriceRange);

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedConcern !== "all" ||
    selectedPriceRange !== "all" ||
    inStockOnly ||
    searchQuery.trim() !== "";

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSelectedConcern("all");
    setSelectedPriceRange("all");
    setInStockOnly(false);
    setSearchQuery("");
  };

  return (
    <div className="bg-[#faf8f5] min-h-screen">
      {/* ─── 1. HEADER BANNER ─── */}
      <section className="relative py-12 sm:py-16 bg-[#1a4a2c] text-white border-b border-[#143e23] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#143e23]/60 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#c59b27]/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-3 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-[#c59b27]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tameer-e-Sehat Apothecary</span>
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Herbal Remedies &amp; Classical Formulations
          </h1>
          <p className="text-xs sm:text-sm text-[#f4eee5]/80 max-w-2xl mx-auto leading-relaxed">
            Prepared under licensed Hakim supervision using pure botanicals, fresh honey, and traditional hydro-distillation. Zero synthetic steroids, zero heavy metals.
          </p>

          <div className="inline-flex items-center gap-4 pt-2 text-[11px] text-[#e8c76a] font-semibold">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" /> Free Courier Delivery Above ₨ 2,000
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Cash on Delivery (COD) Nationwide
            </span>
          </div>
        </div>
      </section>

      {/* ─── 2. MAIN CATALOG BODY ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ─── A. DESKTOP FILTER SIDEBAR (3 cols on lg) ─── */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24">
            <div className="bg-white rounded-2xl border border-[#e6dfd5] p-5 shadow-xs space-y-6">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#f4eee5]">
                <div className="flex items-center gap-2 text-[#22623a] font-bold text-sm">
                  <Filter className="w-4 h-4 text-[#c59b27]" />
                  <span>Filter Remedies</span>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-[11px] font-semibold text-[#8c6a15] hover:text-[#22623a] flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* 1. Health Concern Facet */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-[#22623a] uppercase tracking-wider block flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-[#c59b27]" />
                  <span>By Health Concern</span>
                </label>
                <div className="space-y-1">
                  {HEALTH_CONCERNS.map((concern) => {
                    const isSelected = selectedConcern === concern.id;
                    return (
                      <button
                        key={concern.id}
                        onClick={() => setSelectedConcern(concern.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                          isSelected
                            ? "bg-[#22623a] text-white font-semibold"
                            : "text-[#59534b] hover:bg-[#faf8f5] hover:text-[#22623a]"
                        }`}
                      >
                        <span className="truncate pr-2">{concern.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Category Facet */}
              <div className="space-y-2.5 pt-4 border-t border-[#f4eee5]">
                <label className="text-xs font-bold text-[#22623a] uppercase tracking-wider block flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-[#c59b27]" />
                  <span>By Formulation Type</span>
                </label>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                      selectedCategory === "all"
                        ? "bg-[#22623a] text-white font-semibold"
                        : "text-[#59534b] hover:bg-[#faf8f5] hover:text-[#22623a]"
                    }`}
                  >
                    <span>All Formulations</span>
                    <span className={`text-[10px] ${selectedCategory === "all" ? "text-white/80" : "text-[#7a7268]"}`}>
                      {productsList.length}
                    </span>
                  </button>

                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    const count = productsList.filter((p) => p.category === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                          isSelected
                            ? "bg-[#22623a] text-white font-semibold"
                            : "text-[#59534b] hover:bg-[#faf8f5] hover:text-[#22623a]"
                        }`}
                      >
                        <span className="truncate pr-2">{cat.name}</span>
                        <span className={`text-[10px] ${isSelected ? "text-white/80" : "text-[#7a7268]"}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Price Range Facet */}
              <div className="space-y-2.5 pt-4 border-t border-[#f4eee5]">
                <label className="text-xs font-bold text-[#22623a] uppercase tracking-wider block">
                  Price Range
                </label>
                <div className="space-y-1">
                  {PRICE_RANGES.map((range) => {
                    const isSelected = selectedPriceRange === range.id;
                    return (
                      <button
                        key={range.id}
                        onClick={() => setSelectedPriceRange(range.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                          isSelected
                            ? "bg-[#22623a] text-white font-semibold"
                            : "text-[#59534b] hover:bg-[#faf8f5] hover:text-[#22623a]"
                        }`}
                      >
                        <span>{range.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. In Stock Checkbox */}
              <div className="pt-4 border-t border-[#f4eee5]">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[#22623a] font-medium">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-[#22623a] focus:ring-[#22623a] border-[#e6dfd5]"
                  />
                  <span>Show In-Stock Only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* ─── B. MAIN PRODUCTS STREAM (9 cols on lg) ─── */}
          <main className="lg:col-span-9 space-y-6">

            {/* Top Toolbar: Search, Sort, View Toggle & Mobile Filter Trigger */}
            <div className="bg-white rounded-2xl border border-[#e6dfd5] p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#7a7268] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search remedies, preserves, herbs, ingredients..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] placeholder-[#7a7268] focus:outline-none focus:border-[#22623a] focus:bg-white transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a7268] hover:text-[#22623a]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Right Controls: Sort & Views */}
              <div className="flex items-center gap-2 justify-between sm:justify-end">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs font-semibold text-[#22623a]"
                >
                  <Filter className="w-3.5 h-3.5 text-[#c59b27]" />
                  <span>Filters {hasActiveFilters ? "(Active)" : ""}</span>
                </button>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-1.5 text-xs text-[#59534b]">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#7a7268] hidden sm:block" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-xs px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#22623a] font-semibold focus:outline-none focus:border-[#22623a]"
                  >
                    <option value="featured">Featured &amp; Best Sellers</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                  </select>
                </div>

                {/* Grid / List View Toggle */}
                <div className="flex items-center border border-[#e6dfd5] rounded-xl bg-[#faf8f5] p-0.5">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === "grid"
                        ? "bg-white text-[#22623a] shadow-2xs font-bold"
                        : "text-[#7a7268] hover:text-[#22623a]"
                    }`}
                    title="Grid View"
                    aria-label="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === "list"
                        ? "bg-white text-[#22623a] shadow-2xs font-bold"
                        : "text-[#7a7268] hover:text-[#22623a]"
                    }`}
                    title="List View"
                    aria-label="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filter Chips Bar */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7a7268]">
                  Active Filters:
                </span>

                {selectedCategory !== "all" && activeCategoryInfo && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#22623a] text-white rounded-full text-xs font-semibold shadow-xs">
                    <span>Type: {activeCategoryInfo.name}</span>
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className="hover:text-[#c59b27]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedConcern !== "all" && activeConcernInfo && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#22623a] text-white rounded-full text-xs font-semibold shadow-xs">
                    <span>Concern: {activeConcernInfo.name}</span>
                    <button
                      onClick={() => setSelectedConcern("all")}
                      className="hover:text-[#c59b27]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedPriceRange !== "all" && activePriceInfo && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#22623a] text-white rounded-full text-xs font-semibold shadow-xs">
                    <span>{activePriceInfo.label}</span>
                    <button
                      onClick={() => setSelectedPriceRange("all")}
                      className="hover:text-[#c59b27]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {inStockOnly && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#22623a] text-white rounded-full text-xs font-semibold shadow-xs">
                    <span>In-Stock Only</span>
                    <button
                      onClick={() => setInStockOnly(false)}
                      className="hover:text-[#c59b27]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#22623a] text-white rounded-full text-xs font-semibold shadow-xs">
                    <span>&quot;{searchQuery}&quot;</span>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="hover:text-[#c59b27]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  onClick={clearAllFilters}
                  className="text-xs font-semibold text-[#8c6a15] hover:text-[#22623a] underline underline-offset-2 ml-2"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Results Count Banner */}
            <div className="flex items-center justify-between text-xs text-[#59534b] px-1">
              <span>
                Showing <strong>{filteredProducts.length}</strong> natural remedies
              </span>
              <span className="text-[11px] text-[#2d7648] font-semibold">
                ✓ Prepared Fresh in Karachi Clinic
              </span>
            </div>

            {/* ─── Products List / Grid ─── */}
            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-[#e6dfd5] p-8 space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#faf8f5] border border-[#e6dfd5] flex items-center justify-center text-[#7a7268]">
                  <Search className="w-6 h-6 opacity-40" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="font-serif text-lg font-bold text-[#22623a]">
                    No remedies found matching your criteria
                  </h3>
                  <p className="text-xs text-[#59534b]">
                    Try adjusting your filters, clearing your search query, or selecting another health concern.
                  </p>
                </div>
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#22623a] text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-xs hover:bg-[#1b502e] transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} viewMode="grid" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} viewMode="list" />
                ))}
              </div>
            )}

            {/* Bottom Guarantee Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
              <div className="p-5 bg-white rounded-2xl border border-[#e6dfd5] shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#22623a]/10 text-[#22623a] flex items-center justify-center shrink-0">
                  <Truck className="w-6 h-6 text-[#22623a]" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#22623a]">
                    Free Delivery on Orders Above ₨ 2,000
                  </h4>
                  <p className="text-xs text-[#59534b] mt-0.5">
                    Fast courier delivery across all of Pakistan with Cash on Delivery (COD).
                  </p>
                </div>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-[#e6dfd5] shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#22623a]/10 text-[#22623a] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-[#c59b27]" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#22623a]">
                    100% Purity &amp; Quality Guarantee
                  </h4>
                  <p className="text-xs text-[#59534b] mt-0.5">
                    Traditional formulas made with pure herbs, zero chemical steroids, and authentic methods.
                  </p>
                </div>
              </div>
            </div>

          </main>
        </div>
      </div>

      {/* ─── C. MOBILE SLIDE-OVER FILTER DRAWER ─── */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className="fixed inset-0 bg-[#0c2417]/50 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-white shadow-2xl flex flex-col h-full border-l border-[#e6dfd5]">
              {/* Drawer Header */}
              <div className="p-4 border-b border-[#e6dfd5] flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-[#22623a]">
                  <Filter className="w-4 h-4 text-[#c59b27]" />
                  <span>Filter Remedies</span>
                </div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1.5 rounded-full text-[#7a7268] hover:text-[#22623a]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Health Concerns */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#22623a] uppercase tracking-wider block">
                    Health Concern
                  </span>
                  <div className="space-y-1">
                    {HEALTH_CONCERNS.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedConcern(c.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex justify-between ${
                          selectedConcern === c.id
                            ? "bg-[#22623a] text-white font-semibold"
                            : "text-[#59534b] hover:bg-[#faf8f5]"
                        }`}
                      >
                        <span>{c.name}</span>
                        {selectedConcern === c.id && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Formulations */}
                <div className="space-y-2 pt-4 border-t border-[#f4eee5]">
                  <span className="text-xs font-bold text-[#22623a] uppercase tracking-wider block">
                    Formulation Type
                  </span>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex justify-between ${
                        selectedCategory === "all"
                          ? "bg-[#22623a] text-white font-semibold"
                          : "text-[#59534b] hover:bg-[#faf8f5]"
                      }`}
                    >
                      <span>All Types</span>
                      <span className="text-[10px] opacity-75">{productsList.length}</span>
                    </button>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex justify-between ${
                          selectedCategory === cat.id
                            ? "bg-[#22623a] text-white font-semibold"
                            : "text-[#59534b] hover:bg-[#faf8f5]"
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className="text-[10px] opacity-75">
                          {productsList.filter((p) => p.category === cat.id).length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-2 pt-4 border-t border-[#f4eee5]">
                  <span className="text-xs font-bold text-[#22623a] uppercase tracking-wider block">
                    Price Range
                  </span>
                  <div className="space-y-1">
                    {PRICE_RANGES.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setSelectedPriceRange(r.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex justify-between ${
                          selectedPriceRange === r.id
                            ? "bg-[#22623a] text-white font-semibold"
                            : "text-[#59534b] hover:bg-[#faf8f5]"
                        }`}
                      >
                        <span>{r.label}</span>
                        {selectedPriceRange === r.id && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* In stock */}
                <div className="pt-4 border-t border-[#f4eee5]">
                  <label className="flex items-center gap-2 text-xs font-medium text-[#22623a]">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-[#22623a]"
                    />
                    <span>In-Stock Only</span>
                  </label>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-[#e6dfd5] bg-[#faf8f5] flex gap-3">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 py-2.5 bg-white border border-[#e6dfd5] text-[#59534b] text-xs font-semibold rounded-xl"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 py-2.5 bg-[#22623a] text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-xs"
                >
                  Show ({filteredProducts.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center text-xs text-[#59534b] bg-[#faf8f5] min-h-[50vh] flex items-center justify-center">
          Loading Apothecary Remedies...
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
