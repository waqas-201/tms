"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
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
  Star,
  Flame,
  Snowflake,
  Scale,
  Percent,
  ChevronRight,
  Home,
  CheckCircle2,
} from "lucide-react";

// Health concern mappings to product content
const HEALTH_CONCERNS = [
  { id: "all", name: "All Health Concerns" },
  {
    id: "digestion",
    name: "Digestion, Acidity & Stomach",
    keywords: ["stomach", "acidity", "digestion", "constipation", "gas", "gerd", "gut", "bel", "bael", "harar", "reflux"],
  },
  {
    id: "joints",
    name: "Joint Pain, Arthritis & Bones",
    keywords: ["joint", "knee", "pain", "arthritis", "backache", "stiffness", "bone", "baans", "bamboo", "roghan", "suranjan"],
  },
  {
    id: "liver",
    name: "Liver Detox & Body Heat",
    keywords: ["liver", "heat", "detox", "jaundice", "cooling", "fatty", "makoh", "kasni", "chicory", "afsanteen"],
  },
  {
    id: "vitality",
    name: "Daily Energy, Brain & Stamina",
    keywords: ["energy", "vitality", "stamina", "memory", "brain", "weakness", "nuts", "maghaz", "almond", "shahi"],
  },
  {
    id: "respiratory",
    name: "Cough, Sinus & Chest",
    keywords: ["cough", "throat", "allergy", "sinus", "chest", "mucus", "asthma", "juniper", "arar"],
  },
  {
    id: "skin-hair",
    name: "Skin Repair & Hair Care",
    keywords: ["skin", "burns", "cracked", "heels", "hair", "scalp", "dandruff", "shampoo", "marham", "shikakai"],
  },
  {
    id: "heart-mood",
    name: "Heart Strength & Mood Tonic",
    keywords: ["heart", "mood", "palpitation", "apple", "behi", "quince", "safarjal", "carrot", "gajar"],
  },
];

const PRICE_RANGES = [
  { id: "all", label: "All Prices", min: 0, max: 99999 },
  { id: "under-300", label: "Under ₨ 300", min: 0, max: 300 },
  { id: "300-500", label: "₨ 300 – ₨ 500", min: 300, max: 500 },
  { id: "500-1000", label: "₨ 500 – ₨ 1,000", min: 500, max: 1000 },
  { id: "over-1000", label: "₨ 1,000 & Above", min: 1000, max: 99999 },
];

const MIZAJ_OPTIONS = [
  { id: "all", label: "All Temperaments" },
  {
    id: "cooling",
    label: "Cooling & Hydrating",
    icon: Snowflake,
    keywords: ["cooling", "cold", "sard", "hydrating", "soothing"],
  },
  {
    id: "warm",
    label: "Warm & Invigorating",
    icon: Flame,
    keywords: ["warm", "garm", "bitter", "clearing", "invigorating"],
  },
  {
    id: "balanced",
    label: "Balanced (Mohtadil)",
    icon: Scale,
    keywords: ["balanced", "mohtadil", "nourishing", "energizing", "refreshing", "gentle", "nutrient"],
  },
];

const RATING_OPTIONS = [
  { id: "all", label: "All Ratings", min: 0 },
  { id: "4.8", label: "4.8★ & Above", min: 4.8 },
  { id: "4.9", label: "4.9★ & Above", min: 4.9 },
  { id: "5.0", label: "5.0★ Perfect Score", min: 5.0 },
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
  const [selectedMizaj, setSelectedMizaj] = useState<string>("all");
  const [selectedRating, setSelectedRating] = useState<string>("all");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [onSaleOnly, setOnSaleOnly] = useState<boolean>(false);
  const [bestSellersOnly, setBestSellersOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Compute filtered & sorted product list
  const filteredProducts = useMemo(() => {
    let list = [...productsList];

    // 1. Category filter
    if (selectedCategory !== "all") {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // 2. Health concern filter
    if (selectedConcern !== "all") {
      const concern = HEALTH_CONCERNS.find((c) => c.id === selectedConcern);
      if (concern && concern.keywords) {
        list = list.filter((p) => {
          const content = `${p.name} ${p.shortDescription} ${p.traditionalPurpose} ${p.benefits.join(" ")} ${p.badge || ""}`.toLowerCase();
          return concern.keywords.some((kw) => content.includes(kw));
        });
      }
    }

    // 3. Price range filter
    if (selectedPriceRange !== "all") {
      const range = PRICE_RANGES.find((r) => r.id === selectedPriceRange);
      if (range) {
        list = list.filter((p) => p.price >= range.min && p.price <= range.max);
      }
    }

    // 4. Mizaj / Temperament filter
    if (selectedMizaj !== "all") {
      const mizajObj = MIZAJ_OPTIONS.find((m) => m.id === selectedMizaj);
      if (mizajObj && mizajObj.keywords) {
        list = list.filter((p) => {
          const mText = (p.mizaj || "").toLowerCase();
          return mizajObj.keywords.some((kw) => mText.includes(kw));
        });
      }
    }

    // 5. Customer Rating filter
    if (selectedRating !== "all") {
      const ratingObj = RATING_OPTIONS.find((r) => r.id === selectedRating);
      if (ratingObj) {
        list = list.filter((p) => p.rating >= ratingObj.min);
      }
    }

    // 6. In stock only filter
    if (inStockOnly) {
      list = list.filter((p) => p.inStock);
    }

    // 7. On Sale filter
    if (onSaleOnly) {
      list = list.filter((p) => p.discountPercentage && p.discountPercentage > 0);
    }

    // 8. Best Sellers & Featured filter
    if (bestSellersOnly) {
      list = list.filter((p) => p.featured || (p.badge && p.badge.toLowerCase().includes("best")));
    }

    // 9. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.traditionalPurpose.toLowerCase().includes(q) ||
          (p.mizaj && p.mizaj.toLowerCase().includes(q)) ||
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
    } else if (sortBy === "discount") {
      list.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
    } else {
      // featured & best seller default
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return list;
  }, [
    selectedCategory,
    selectedConcern,
    selectedPriceRange,
    selectedMizaj,
    selectedRating,
    inStockOnly,
    onSaleOnly,
    bestSellersOnly,
    searchQuery,
    sortBy,
  ]);

  const activeCategoryInfo = CATEGORIES.find((c) => c.id === selectedCategory);
  const activeConcernInfo = HEALTH_CONCERNS.find((c) => c.id === selectedConcern);
  const activePriceInfo = PRICE_RANGES.find((r) => r.id === selectedPriceRange);
  const activeMizajInfo = MIZAJ_OPTIONS.find((m) => m.id === selectedMizaj);
  const activeRatingInfo = RATING_OPTIONS.find((r) => r.id === selectedRating);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (selectedConcern !== "all") count++;
    if (selectedPriceRange !== "all") count++;
    if (selectedMizaj !== "all") count++;
    if (selectedRating !== "all") count++;
    if (inStockOnly) count++;
    if (onSaleOnly) count++;
    if (bestSellersOnly) count++;
    if (searchQuery.trim() !== "") count++;
    return count;
  }, [
    selectedCategory,
    selectedConcern,
    selectedPriceRange,
    selectedMizaj,
    selectedRating,
    inStockOnly,
    onSaleOnly,
    bestSellersOnly,
    searchQuery,
  ]);

  const hasActiveFilters = activeFilterCount > 0;

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSelectedConcern("all");
    setSelectedPriceRange("all");
    setSelectedMizaj("all");
    setSelectedRating("all");
    setInStockOnly(false);
    setOnSaleOnly(false);
    setBestSellersOnly(false);
    setSearchQuery("");
  };

  return (
    <div className="bg-[#faf8f5] min-h-screen">
      {/* ─── 1. COMPACT APOTHECARY HERO BANNER ─── */}
      <section className="relative py-6 sm:py-8 bg-[#11351e] text-white border-b border-[#143e23] overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#1b502e]/60 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#c59b27]/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb navigation */}
          <div className="flex items-center gap-2 text-xs text-[#e3ded6] mb-3">
            <Link href="/" className="hover:text-[#c59b27] flex items-center gap-1 transition-colors">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-[#a59f95]" />
            <span className="text-[#c59b27] font-semibold">Shop Herbal Remedies</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-semibold text-[#c59b27]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tameer-e-Sehat Apothecary</span>
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mt-1 leading-tight">
                Classical Herbal Remedies &amp; Formulations
              </h1>
              <p className="text-xs sm:text-sm text-[#f4eee5]/80 max-w-2xl mt-1 leading-relaxed">
                Hand-prepared under licensed Hakim supervision in Karachi using clean botanicals, pure honey, and classical hydro-distillation.
              </p>
            </div>

            {/* Quick Guarantees Badge Group */}
            <div className="flex flex-wrap items-center gap-2 shrink-0 text-[11px]">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-xs rounded-lg border border-white/15 text-[#e8c76a] font-medium">
                <Truck className="w-3.5 h-3.5" /> Free Delivery over ₨ 2,000
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-xs rounded-lg border border-white/15 text-white font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#c59b27]" /> 100% Pure &amp; Lab-Clean
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. QUICK CATEGORY PILLS STRIP (HORIZONTAL 1-CLICK BAR) ─── */}
      <div className="bg-white border-b border-[#e6dfd5] sticky top-14 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`shrink-0 text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all ${
                selectedCategory === "all"
                  ? "bg-[#22623a] text-white shadow-xs"
                  : "bg-[#faf8f5] text-[#59534b] border border-[#e6dfd5] hover:border-[#22623a] hover:text-[#22623a]"
              }`}
            >
              All Remedies ({PRODUCTS.length})
            </button>

            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const count = PRODUCTS.filter((p) => p.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#22623a] text-white shadow-xs"
                      : "bg-[#faf8f5] text-[#59534b] border border-[#e6dfd5] hover:border-[#22623a] hover:text-[#22623a]"
                  }`}
                >
                  <span>{cat.name}</span>
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
      </div>

      {/* ─── 3. MAIN CATALOG BODY ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">

          {/* ─── A. DESKTOP FILTER SIDEBAR (INDEPENDENTLY SCROLLABLE STICKY PANEL) ─── */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-28 max-h-[calc(100vh-8rem)]">
            <div className="bg-white rounded-2xl border border-[#e6dfd5] shadow-xs flex flex-col max-h-[calc(100vh-8rem)] overflow-hidden">

              {/* Sidebar Header (Fixed at top of panel) */}
              <div className="p-4 pb-3 border-b border-[#f4eee5] flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center gap-2 text-[#22623a] font-bold text-sm">
                  <Filter className="w-4 h-4 text-[#c59b27]" />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#c59b27] text-[#22623a] text-[10px] font-bold flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
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

              {/* Sidebar Scrollable Body */}
              <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-5 custom-scrollbar">

                {/* 1. Health Concern Facet */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#22623a] uppercase tracking-wider flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-[#c59b27]" />
                    <span>Health Concern</span>
                  </label>
                  <div className="space-y-1">
                    {HEALTH_CONCERNS.map((concern) => {
                      const isSelected = selectedConcern === concern.id;
                      return (
                        <button
                          key={concern.id}
                          onClick={() => setSelectedConcern(concern.id)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                            isSelected
                              ? "bg-[#22623a] text-white font-semibold shadow-2xs"
                              : "text-[#59534b] hover:bg-[#faf8f5] hover:text-[#22623a]"
                          }`}
                        >
                          <span className="truncate pr-2">{concern.name}</span>
                          {isSelected && <Check className="w-3 h-3 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Category / Formulation Type */}
                <div className="space-y-2 pt-3.5 border-t border-[#f4eee5]">
                  <label className="text-xs font-bold text-[#22623a] uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-[#c59b27]" />
                    <span>Formulation</span>
                  </label>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                        selectedCategory === "all"
                          ? "bg-[#22623a] text-white font-semibold shadow-2xs"
                          : "text-[#59534b] hover:bg-[#faf8f5] hover:text-[#22623a]"
                      }`}
                    >
                      <span>All Formulations</span>
                      <span className={`text-[10px] ${selectedCategory === "all" ? "text-white/80" : "text-[#7a7268]"}`}>
                        {PRODUCTS.length}
                      </span>
                    </button>

                    {CATEGORIES.map((cat) => {
                      const isSelected = selectedCategory === cat.id;
                      const count = PRODUCTS.filter((p) => p.category === cat.id).length;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                            isSelected
                              ? "bg-[#22623a] text-white font-semibold shadow-2xs"
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
                <div className="space-y-2 pt-3.5 border-t border-[#f4eee5]">
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
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                            isSelected
                              ? "bg-[#22623a] text-white font-semibold shadow-2xs"
                              : "text-[#59534b] hover:bg-[#faf8f5] hover:text-[#22623a]"
                          }`}
                        >
                          <span>{range.label}</span>
                          {isSelected && <Check className="w-3 h-3 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Mizaj / Temperament Facet */}
                <div className="space-y-2 pt-3.5 border-t border-[#f4eee5]">
                  <label className="text-xs font-bold text-[#22623a] uppercase tracking-wider block">
                    Herbal Mizaj (Temperament)
                  </label>
                  <div className="space-y-1">
                    {MIZAJ_OPTIONS.map((mizaj) => {
                      const isSelected = selectedMizaj === mizaj.id;
                      const Icon = mizaj.icon;
                      return (
                        <button
                          key={mizaj.id}
                          onClick={() => setSelectedMizaj(mizaj.id)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                            isSelected
                              ? "bg-[#22623a] text-white font-semibold shadow-2xs"
                              : "text-[#59534b] hover:bg-[#faf8f5] hover:text-[#22623a]"
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            {Icon && <Icon className="w-3 h-3 text-[#c59b27]" />}
                            <span>{mizaj.label}</span>
                          </span>
                          {isSelected && <Check className="w-3 h-3 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Customer Rating Facet */}
                <div className="space-y-2 pt-3.5 border-t border-[#f4eee5]">
                  <label className="text-xs font-bold text-[#22623a] uppercase tracking-wider block">
                    Customer Rating
                  </label>
                  <div className="space-y-1">
                    {RATING_OPTIONS.map((r) => {
                      const isSelected = selectedRating === r.id;
                      return (
                        <button
                          key={r.id}
                          onClick={() => setSelectedRating(r.id)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                            isSelected
                              ? "bg-[#22623a] text-white font-semibold shadow-2xs"
                              : "text-[#59534b] hover:bg-[#faf8f5] hover:text-[#22623a]"
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-[#c59b27] text-[#c59b27]" />
                            <span>{r.label}</span>
                          </span>
                          {isSelected && <Check className="w-3 h-3 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 6. Quick Toggles (Stock & Specials) */}
                <div className="space-y-2.5 pt-3.5 border-t border-[#f4eee5]">
                  <label className="text-xs font-bold text-[#22623a] uppercase tracking-wider block">
                    Special Offers &amp; Status
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[#22623a] font-medium hover:text-[#1b502e]">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-[#22623a] focus:ring-[#22623a] border-[#e6dfd5]"
                    />
                    <span>Show In-Stock Only</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[#22623a] font-medium hover:text-[#1b502e]">
                    <input
                      type="checkbox"
                      checked={onSaleOnly}
                      onChange={(e) => setOnSaleOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-[#22623a] focus:ring-[#22623a] border-[#e6dfd5]"
                    />
                    <span className="flex items-center gap-1">
                      <Percent className="w-3 h-3 text-[#c59b27]" />
                      <span>On Sale / Discounted</span>
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[#22623a] font-medium hover:text-[#1b502e]">
                    <input
                      type="checkbox"
                      checked={bestSellersOnly}
                      onChange={(e) => setBestSellersOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-[#22623a] focus:ring-[#22623a] border-[#e6dfd5]"
                    />
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#c59b27]" />
                      <span>Best Sellers &amp; Featured</span>
                    </span>
                  </label>
                </div>

              </div>

              {/* Sidebar Footer Reset button if active */}
              {hasActiveFilters && (
                <div className="p-3 bg-[#faf8f5] border-t border-[#f4eee5] shrink-0">
                  <button
                    onClick={clearAllFilters}
                    className="w-full py-2 bg-white border border-[#e6dfd5] text-[#22623a] text-xs font-semibold rounded-xl hover:bg-[#f0eae1] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Filters</span>
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* ─── B. MAIN PRODUCTS STREAM (9 cols on lg) ─── */}
          <main className="lg:col-span-9 space-y-5">

            {/* Top Toolbar: Search, Sort, View Toggle & Mobile Filter Trigger */}
            <div className="bg-white rounded-2xl border border-[#e6dfd5] p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#7a7268] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search remedies, herbs, ingredients, or symptoms..."
                  className="w-full pl-10 pr-4 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] placeholder-[#7a7268] focus:outline-none focus:border-[#22623a] focus:bg-white transition-colors"
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
                  className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-[#22623a] text-white rounded-xl text-xs font-semibold shadow-xs active:scale-98"
                >
                  <Filter className="w-3.5 h-3.5 text-[#c59b27]" />
                  <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}</span>
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
                    <option value="discount">Biggest Discount</option>
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
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7a7268]">
                  Active:
                </span>

                {selectedCategory !== "all" && activeCategoryInfo && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#22623a] text-white rounded-full text-xs font-semibold shadow-2xs">
                    <span>Type: {activeCategoryInfo.name}</span>
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className="hover:text-[#c59b27]"
                      aria-label="Remove category filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedConcern !== "all" && activeConcernInfo && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#22623a] text-white rounded-full text-xs font-semibold shadow-2xs">
                    <span>Concern: {activeConcernInfo.name}</span>
                    <button
                      onClick={() => setSelectedConcern("all")}
                      className="hover:text-[#c59b27]"
                      aria-label="Remove concern filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedPriceRange !== "all" && activePriceInfo && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#22623a] text-white rounded-full text-xs font-semibold shadow-2xs">
                    <span>{activePriceInfo.label}</span>
                    <button
                      onClick={() => setSelectedPriceRange("all")}
                      className="hover:text-[#c59b27]"
                      aria-label="Remove price filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedMizaj !== "all" && activeMizajInfo && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#22623a] text-white rounded-full text-xs font-semibold shadow-2xs">
                    <span>Mizaj: {activeMizajInfo.label}</span>
                    <button
                      onClick={() => setSelectedMizaj("all")}
                      className="hover:text-[#c59b27]"
                      aria-label="Remove mizaj filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedRating !== "all" && activeRatingInfo && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#22623a] text-white rounded-full text-xs font-semibold shadow-2xs">
                    <span>{activeRatingInfo.label}</span>
                    <button
                      onClick={() => setSelectedRating("all")}
                      className="hover:text-[#c59b27]"
                      aria-label="Remove rating filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {inStockOnly && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#22623a] text-white rounded-full text-xs font-semibold shadow-2xs">
                    <span>In-Stock Only</span>
                    <button
                      onClick={() => setInStockOnly(false)}
                      className="hover:text-[#c59b27]"
                      aria-label="Remove in stock filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {onSaleOnly && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#22623a] text-white rounded-full text-xs font-semibold shadow-2xs">
                    <span>On Sale</span>
                    <button
                      onClick={() => setOnSaleOnly(false)}
                      className="hover:text-[#c59b27]"
                      aria-label="Remove on sale filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {bestSellersOnly && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#22623a] text-white rounded-full text-xs font-semibold shadow-2xs">
                    <span>Best Sellers</span>
                    <button
                      onClick={() => setBestSellersOnly(false)}
                      className="hover:text-[#c59b27]"
                      aria-label="Remove best sellers filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#22623a] text-white rounded-full text-xs font-semibold shadow-2xs">
                    <span>&quot;{searchQuery}&quot;</span>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="hover:text-[#c59b27]"
                      aria-label="Remove search query filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  onClick={clearAllFilters}
                  className="text-xs font-semibold text-[#8c6a15] hover:text-[#22623a] underline underline-offset-2 ml-1"
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
              <span className="text-[11px] text-[#2d7648] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Direct from Karachi Dispensary
              </span>
            </div>

            {/* ─── Products List / Grid ─── */}
            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-[#e6dfd5] p-8 space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#faf8f5] border border-[#e6dfd5] flex items-center justify-center text-[#7a7268]">
                  <Search className="w-6 h-6 opacity-40" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="font-serif text-lg font-bold text-[#22623a]">
                    No remedies found matching your filters
                  </h3>
                  <p className="text-xs text-[#59534b]">
                    Try adjusting your criteria, clearing search keywords, or selecting another health concern.
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6">
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

            {/* Bottom Trust & Guarantee Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#e6dfd5] shadow-xs flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#22623a]/10 text-[#22623a] flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-[#22623a]" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#22623a]">
                    Free Delivery Nationwide
                  </h4>
                  <p className="text-xs text-[#59534b] mt-0.5">
                    Orders above ₨ 2,000 qualify for free courier dispatch with Cash on Delivery (COD).
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#e6dfd5] shadow-xs flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#22623a]/10 text-[#22623a] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#c59b27]" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#22623a]">
                    100% Botanical Authenticity
                  </h4>
                  <p className="text-xs text-[#59534b] mt-0.5">
                    Traditional formulas made with fresh herbs, zero synthetic steroids, and pure methods.
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
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#c59b27] text-[#22623a] text-[10px] font-bold flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1.5 rounded-full text-[#7a7268] hover:text-[#22623a]"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">

                {/* 1. Health Concerns */}
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

                {/* 2. Formulation Types */}
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

                {/* 3. Price Range */}
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

                {/* 4. Mizaj / Temperament */}
                <div className="space-y-2 pt-4 border-t border-[#f4eee5]">
                  <span className="text-xs font-bold text-[#22623a] uppercase tracking-wider block">
                    Herbal Mizaj (Temperament)
                  </span>
                  <div className="space-y-1">
                    {MIZAJ_OPTIONS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMizaj(m.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex justify-between ${
                          selectedMizaj === m.id
                            ? "bg-[#22623a] text-white font-semibold"
                            : "text-[#59534b] hover:bg-[#faf8f5]"
                        }`}
                      >
                        <span>{m.label}</span>
                        {selectedMizaj === m.id && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Rating Filter */}
                <div className="space-y-2 pt-4 border-t border-[#f4eee5]">
                  <span className="text-xs font-bold text-[#22623a] uppercase tracking-wider block">
                    Customer Rating
                  </span>
                  <div className="space-y-1">
                    {RATING_OPTIONS.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setSelectedRating(r.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex justify-between ${
                          selectedRating === r.id
                            ? "bg-[#22623a] text-white font-semibold"
                            : "text-[#59534b] hover:bg-[#faf8f5]"
                        }`}
                      >
                        <span>{r.label}</span>
                        {selectedRating === r.id && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. Special Toggles */}
                <div className="space-y-2.5 pt-4 border-t border-[#f4eee5]">
                  <span className="text-xs font-bold text-[#22623a] uppercase tracking-wider block">
                    Availability &amp; Offers
                  </span>
                  <label className="flex items-center gap-2 text-xs font-medium text-[#22623a]">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-[#22623a]"
                    />
                    <span>In-Stock Only</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-[#22623a]">
                    <input
                      type="checkbox"
                      checked={onSaleOnly}
                      onChange={(e) => setOnSaleOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-[#22623a]"
                    />
                    <span>On Sale / Discounted</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-[#22623a]">
                    <input
                      type="checkbox"
                      checked={bestSellersOnly}
                      onChange={(e) => setBestSellersOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-[#22623a]"
                    />
                    <span>Best Sellers &amp; Featured</span>
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
