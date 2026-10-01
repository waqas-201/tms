"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Product, CategoryInfo } from "@/app/data/products";
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
  Star,
  Flame,
  Snowflake,
  Scale,
  ChevronDown,
  Home,
  ChevronRight,
  ArrowUpDown,
  ShoppingBag,
  Sliders,
} from "lucide-react";

// Health concern mappings to product indications & botanicals
const HEALTH_CONCERNS = [
  { id: "all", name: "All Health Concerns" },
  {
    id: "digestion",
    name: "Digestion, Acidity & Stomach",
    keywords: [
      "stomach",
      "acidity",
      "digestion",
      "constipation",
      "gas",
      "gerd",
      "gut",
      "bel",
      "bael",
      "harar",
      "reflux",
      "hazim",
      "pait",
      "qabz",
    ],
  },
  {
    id: "joints",
    name: "Joint Pain, Arthritis & Bones",
    keywords: [
      "joint",
      "knee",
      "pain",
      "arthritis",
      "backache",
      "stiffness",
      "bone",
      "baans",
      "bamboo",
      "roghan",
      "suranjan",
      "jor",
      "dard",
    ],
  },
  {
    id: "liver",
    name: "Liver Detox & Body Heat",
    keywords: [
      "liver",
      "heat",
      "detox",
      "jaundice",
      "cooling",
      "fatty",
      "makoh",
      "kasni",
      "chicory",
      "afsanteen",
      "jigar",
      "garmi",
    ],
  },
  {
    id: "vitality",
    name: "Daily Energy, Brain & Stamina",
    keywords: [
      "energy",
      "vitality",
      "stamina",
      "memory",
      "brain",
      "weakness",
      "nuts",
      "maghaz",
      "almond",
      "shahi",
      "taqat",
      "dimagh",
    ],
  },
  {
    id: "respiratory",
    name: "Cough, Sinus & Chest Care",
    keywords: [
      "cough",
      "throat",
      "allergy",
      "sinus",
      "chest",
      "mucus",
      "asthma",
      "juniper",
      "arar",
      "khansi",
      "nazla",
      "zukam",
    ],
  },
  {
    id: "skin-hair",
    name: "Skin Repair & Hair Strength",
    keywords: [
      "skin",
      "burns",
      "cracked",
      "heels",
      "hair",
      "scalp",
      "dandruff",
      "shampoo",
      "marham",
      "shikakai",
      "baal",
      "jild",
    ],
  },
  {
    id: "heart-mood",
    name: "Heart Strength & Mood Tonic",
    keywords: [
      "heart",
      "mood",
      "palpitation",
      "apple",
      "behi",
      "quince",
      "safarjal",
      "carrot",
      "gajar",
      "dil",
      "ghabrahath",
    ],
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
    label: "Cooling (Sard / Mohtadil)",
    icon: Snowflake,
    keywords: ["cooling", "cold", "sard", "hydrating", "soothing"],
  },
  {
    id: "warm",
    label: "Warm & Invigorating (Garm)",
    icon: Flame,
    keywords: ["warm", "garm", "bitter", "clearing", "invigorating"],
  },
  {
    id: "balanced",
    label: "Balanced (Mo'tadil)",
    icon: Scale,
    keywords: ["balanced", "mo'tadil", "mohtadil", "nourishing", "energizing", "gentle"],
  },
];

const RATING_OPTIONS = [
  { id: "all", label: "All Ratings", min: 0 },
  { id: "4.8", label: "4.8★ & Above", min: 4.8 },
  { id: "4.9", label: "4.9★ & Above", min: 4.9 },
  { id: "5.0", label: "5.0★ Perfect Score", min: 5.0 },
];

function ProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Initial State hydrated from URL query parameters (Two-way sync)
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || "all"
  );
  const [selectedConcern, setSelectedConcern] = useState<string>(
    searchParams.get("concern") || "all"
  );
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>(
    searchParams.get("price") || "all"
  );
  const [selectedMizaj, setSelectedMizaj] = useState<string>(
    searchParams.get("mizaj") || "all"
  );
  const [selectedRating, setSelectedRating] = useState<string>(
    searchParams.get("rating") || "all"
  );
  const [inStockOnly, setInStockOnly] = useState<boolean>(
    searchParams.get("inStock") === "true"
  );
  const [onSaleOnly, setOnSaleOnly] = useState<boolean>(
    searchParams.get("onSale") === "true"
  );
  const [bestSellersOnly, setBestSellersOnly] = useState<boolean>(
    searchParams.get("featured") === "true"
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get("q") || ""
  );
  const [sortBy, setSortBy] = useState<string>(
    searchParams.get("sort") || "featured"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">(
    (searchParams.get("view") as "grid" | "list") || "grid"
  );

  // Live Database Catalog
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Fetch live products & categories from API
  useEffect(() => {
    async function loadCatalog() {
      setIsLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
        ]);

        if (prodRes.ok) {
          const prodData = await prodRes.json();
          if (prodData.success && Array.isArray(prodData.data)) {
            setProductsList(prodData.data);
          }
        }

        if (catRes.ok) {
          const catData = await catRes.json();
          if (catData.success && Array.isArray(catData.data)) {
            setCategoriesList(catData.data);
          }
        }
      } catch (err) {
        console.error("Failed to load live apothecary catalog:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCatalog();
  }, []);

  // Synchronize filter changes back into URL query params (Two-way synchronization)
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();

    if (selectedCategory && selectedCategory !== "all") {
      params.set("category", selectedCategory);
    }
    if (selectedConcern && selectedConcern !== "all") {
      params.set("concern", selectedConcern);
    }
    if (selectedPriceRange && selectedPriceRange !== "all") {
      params.set("price", selectedPriceRange);
    }
    if (selectedMizaj && selectedMizaj !== "all") {
      params.set("mizaj", selectedMizaj);
    }
    if (selectedRating && selectedRating !== "all") {
      params.set("rating", selectedRating);
    }
    if (inStockOnly) {
      params.set("inStock", "true");
    }
    if (onSaleOnly) {
      params.set("onSale", "true");
    }
    if (bestSellersOnly) {
      params.set("featured", "true");
    }
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }
    if (sortBy !== "featured") {
      params.set("sort", sortBy);
    }
    if (viewMode !== "grid") {
      params.set("view", viewMode);
    }

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(newUrl, { scroll: false });
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
    viewMode,
    pathname,
    router,
  ]);

  useEffect(() => {
    updateUrlParams();
  }, [updateUrlParams]);

  // Dynamic Filtering Logic across multi-dimensions
  const filteredProducts = useMemo(() => {
    let list = [...productsList];

    // 1. Category / Formulation
    if (selectedCategory !== "all") {
      const activeCat = categoriesList.find(
        (c) => c.id === selectedCategory || c.slug === selectedCategory
      );
      list = list.filter((p) => {
        const catMatch =
          p.category === selectedCategory ||
          p.categoryId === selectedCategory ||
          (activeCat &&
            (p.category === activeCat.id ||
              p.category === activeCat.slug ||
              p.categoryId === activeCat.id ||
              p.categoryId === activeCat.slug));
        return Boolean(catMatch);
      });
    }

    // 2. Health Concern
    if (selectedConcern !== "all") {
      const concern = HEALTH_CONCERNS.find((c) => c.id === selectedConcern);
      if (concern && concern.keywords) {
        list = list.filter((p) => {
          const content = `${p.name} ${p.shortDescription} ${p.fullDescription} ${p.traditionalPurpose} ${(p.benefits || []).join(" ")} ${p.badge || ""}`.toLowerCase();
          return concern.keywords.some((kw) => content.includes(kw));
        });
      }
    }

    // 3. Price Range
    if (selectedPriceRange !== "all") {
      const range = PRICE_RANGES.find((r) => r.id === selectedPriceRange);
      if (range) {
        list = list.filter((p) => p.price >= range.min && p.price <= range.max);
      }
    }

    // 4. Mizaj / Temperament
    if (selectedMizaj !== "all") {
      const mizajObj = MIZAJ_OPTIONS.find((m) => m.id === selectedMizaj);
      if (mizajObj && mizajObj.keywords) {
        list = list.filter((p) => {
          const mText = (p.mizaj || "").toLowerCase();
          return mizajObj.keywords.some((kw) => mText.includes(kw));
        });
      }
    }

    // 5. Customer Rating
    if (selectedRating !== "all") {
      const ratingObj = RATING_OPTIONS.find((r) => r.id === selectedRating);
      if (ratingObj) {
        list = list.filter((p) => (p.rating || 5.0) >= ratingObj.min);
      }
    }

    // 6. In Stock Only
    if (inStockOnly) {
      list = list.filter((p) => p.inStock);
    }

    // 7. On Sale / Discounted
    if (onSaleOnly) {
      list = list.filter(
        (p) =>
          (p.discountPercentage && p.discountPercentage > 0) ||
          (p.originalPrice && p.originalPrice > p.price)
      );
    }

    // 8. Best Sellers & Featured
    if (bestSellersOnly) {
      list = list.filter(
        (p) => p.featured || (p.badge && p.badge.toLowerCase().includes("best"))
      );
    }

    // 9. Full text search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.urduName && p.urduName.includes(q)) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.traditionalPurpose.toLowerCase().includes(q) ||
          (p.mizaj && p.mizaj.toLowerCase().includes(q)) ||
          (p.benefits && p.benefits.some((b) => b.toLowerCase().includes(q))) ||
          (p.ingredients &&
            p.ingredients.some(
              (ing) =>
                ing.name.toLowerCase().includes(q) ||
                (ing.urdu && ing.urdu.includes(q))
            ))
      );
    }

    // Sorting Modes
    if (sortBy === "price-low") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    } else if (sortBy === "name-asc") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "discount") {
      list.sort(
        (a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0)
      );
    } else {
      // Default: Featured first, then newest
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return list;
  }, [
    productsList,
    categoriesList,
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

  // Recommended remedies for zero-result fallback
  const recommendedProducts = useMemo(() => {
    return productsList
      .filter((p) => p.inStock)
      .sort(
        (a, b) =>
          (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating
      )
      .slice(0, 4);
  }, [productsList]);

  // Information objects for active tags
  const activeCategoryInfo = categoriesList.find(
    (c) => c.id === selectedCategory || c.slug === selectedCategory
  );
  const activeConcernInfo = HEALTH_CONCERNS.find(
    (c) => c.id === selectedConcern
  );
  const activePriceInfo = PRICE_RANGES.find((r) => r.id === selectedPriceRange);
  const activeMizajInfo = MIZAJ_OPTIONS.find((m) => m.id === selectedMizaj);
  const activeRatingInfo = RATING_OPTIONS.find((r) => r.id === selectedRating);

  // Active filters count
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
    <div className="bg-[#FAF9F6] min-h-screen text-stone-900 selection:bg-[#14281D] selection:text-white pb-20">
      {/* ═══════════════════════════════════════════════════════════════════════
          1. EDITORIAL APOTHECARY HERO BANNER
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative bg-[#14281D] text-white pt-8 pb-10 sm:pt-12 sm:pb-14 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-1.5 text-xs text-stone-400 mb-4 tracking-wide">
            <Link
              href="/"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-stone-600" />
            <span className="text-[#9E7D3B] font-medium">The Apothecary</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-3xl space-y-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-semibold text-[#9E7D3B]">
                <Sparkles className="w-3 h-3" />
                <span>Tameer-e-Sehat Classical Formulary</span>
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white leading-tight">
                Authentic Herbal Remedies
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed max-w-2xl pt-1">
                Handcrafted in Karachi under licensed Hakim supervision using classical Unani hydro-distillation, pure wildcrafted botanicals, and raw mountain honey.
              </p>
            </div>

            {/* Guarantees Badges */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 text-[11px] text-stone-300">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xs font-light">
                <Truck className="w-3.5 h-3.5 text-[#9E7D3B]" /> Free Delivery over ₨ 2,000
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xs font-light">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Botanical Purity
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          2. HORIZONTAL FLOATING / STICKY FILTER BAR
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-30 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-stone-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Left: Quick Dropdown Filters */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              {/* Formulations Filter Dropdown */}
              <div className="relative shrink-0">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-white border border-stone-200/90 text-stone-800 text-xs font-medium pl-3 pr-8 py-2 rounded-lg hover:border-stone-400 focus:outline-none focus:ring-1 focus:ring-[#14281D] transition-colors cursor-pointer"
                >
                  <option value="all">All Formulations ({productsList.length})</option>
                  {categoriesList.map((cat) => (
                    <option key={cat.id} value={cat.slug || cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Health Concern Filter Dropdown */}
              <div className="relative shrink-0">
                <select
                  value={selectedConcern}
                  onChange={(e) => setSelectedConcern(e.target.value)}
                  className="appearance-none bg-white border border-stone-200/90 text-stone-800 text-xs font-medium pl-3 pr-8 py-2 rounded-lg hover:border-stone-400 focus:outline-none focus:ring-1 focus:ring-[#14281D] transition-colors cursor-pointer"
                >
                  {HEALTH_CONCERNS.map((hc) => (
                    <option key={hc.id} value={hc.id}>
                      {hc.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Deep Filters Drawer Trigger */}
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(true)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  activeFilterCount > 0
                    ? "bg-[#14281D] text-white border-[#14281D]"
                    : "bg-white text-stone-700 border-stone-200/90 hover:border-stone-400"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#9E7D3B] text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Reset All Action */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="shrink-0 text-stone-500 hover:text-stone-900 text-xs font-medium flex items-center gap-1 px-2 py-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Right: Search, Sorting & View Toggle */}
            <div className="flex items-center gap-2.5 justify-between md:justify-end">
              {/* Minimal Search Input */}
              <div className="relative flex-1 md:w-56">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search botanical, condition..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-8 py-1.5 text-xs bg-white border border-stone-200/90 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#14281D] focus:border-[#14281D] transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Sort By Dropdown */}
              <div className="relative shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-stone-200/90 text-stone-800 text-xs font-medium pl-3 pr-7 py-1.5 rounded-lg hover:border-stone-400 focus:outline-none focus:ring-1 focus:ring-[#14281D] transition-colors cursor-pointer"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="discount">Biggest Discount</option>
                  <option value="name-asc">Alphabetical (A–Z)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* View Layout Toggle */}
              <div className="hidden sm:flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-white text-stone-900 shadow-2xs"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                  title="Grid View"
                  aria-label="Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    viewMode === "list"
                      ? "bg-white text-stone-900 shadow-2xs"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                  title="List View"
                  aria-label="List View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Badges Ribbon */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2.5 mt-2 border-t border-stone-200/60 text-xs">
              <span className="text-[11px] text-stone-400 font-medium mr-1">Active:</span>

              {selectedCategory !== "all" && activeCategoryInfo && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-stone-200 text-stone-800 text-[11px]">
                  {activeCategoryInfo.name}
                  <button onClick={() => setSelectedCategory("all")} className="hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedConcern !== "all" && activeConcernInfo && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-stone-200 text-stone-800 text-[11px]">
                  {activeConcernInfo.name}
                  <button onClick={() => setSelectedConcern("all")} className="hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedPriceRange !== "all" && activePriceInfo && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-stone-200 text-stone-800 text-[11px]">
                  {activePriceInfo.label}
                  <button onClick={() => setSelectedPriceRange("all")} className="hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedMizaj !== "all" && activeMizajInfo && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-stone-200 text-stone-800 text-[11px]">
                  {activeMizajInfo.label}
                  <button onClick={() => setSelectedMizaj("all")} className="hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedRating !== "all" && activeRatingInfo && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-stone-200 text-stone-800 text-[11px]">
                  {activeRatingInfo.label}
                  <button onClick={() => setSelectedRating("all")} className="hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {inStockOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-stone-200 text-stone-800 text-[11px]">
                  In Stock Only
                  <button onClick={() => setInStockOnly(false)} className="hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {onSaleOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-stone-200 text-stone-800 text-[11px]">
                  On Sale
                  <button onClick={() => setOnSaleOnly(false)} className="hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {bestSellersOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-stone-200 text-stone-800 text-[11px]">
                  Featured &amp; Best Sellers
                  <button onClick={() => setBestSellersOnly(false)} className="hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-stone-200 text-stone-800 text-[11px]">
                  &ldquo;{searchQuery}&rdquo;
                  <button onClick={() => setSearchQuery("")} className="hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          3. FULL-WIDTH EDITORIAL PRODUCT GRID
      ═══════════════════════════════════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Count Bar */}
        <div className="flex items-center justify-between pb-6 text-xs text-stone-500 font-light">
          <div>
            Showing <span className="font-semibold text-stone-900">{filteredProducts.length}</span> of {productsList.length} classical remedies
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="bg-white rounded-xl border border-stone-200/60 p-4 space-y-3 animate-pulse"
              >
                <div className="aspect-square bg-stone-100 rounded-lg w-full" />
                <div className="h-3 bg-stone-100 rounded w-1/3" />
                <div className="h-4 bg-stone-200 rounded w-3/4" />
                <div className="h-3 bg-stone-100 rounded w-1/2" />
                <div className="h-8 bg-stone-100 rounded-lg w-full mt-4" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          /* Products Grid / List */
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 items-stretch"
                : "flex flex-col gap-4"
            }
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          /* Zero Results Fallback */
          <div className="bg-white rounded-2xl border border-stone-200/80 p-8 sm:p-14 text-center max-w-2xl mx-auto space-y-6">
            <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6 text-stone-400" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-normal text-stone-900">
                No matching remedies found
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                We couldn&apos;t find any remedies matching your selected combination. Try clearing some filters or searching with a different term.
              </p>
            </div>

            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#14281D] hover:bg-[#0c1b13] text-white text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>

            {recommendedProducts.length > 0 && (
              <div className="pt-8 border-t border-stone-100 text-left">
                <div className="text-xs uppercase tracking-widest text-stone-400 font-medium mb-4">
                  Recommended Herbal Formulations
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recommendedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} viewMode="grid" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ═══════════════════════════════════════════════════════════════════════
          4. SLIDE-OVER FILTER SHEET (Off-canvas Deep Filter Drawer)
      ═══════════════════════════════════════════════════════════════════════ */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsFilterDrawerOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#9E7D3B]" />
                <h2 className="font-serif text-lg font-semibold text-stone-900">
                  Refine Formulation Catalog
                </h2>
              </div>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                aria-label="Close Filter Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 custom-scrollbar text-stone-800">
              {/* 1. Health Concern */}
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Target Health Concern
                </div>
                <div className="space-y-1.5">
                  {HEALTH_CONCERNS.map((hc) => {
                    const isSelected = selectedConcern === hc.id;
                    return (
                      <button
                        key={hc.id}
                        type="button"
                        onClick={() => setSelectedConcern(hc.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-[#14281D] text-white font-medium shadow-xs"
                            : "bg-stone-50 hover:bg-stone-100 text-stone-700"
                        }`}
                      >
                        <span>{hc.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#9E7D3B]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Formulation / Category */}
              <div className="space-y-3 pt-3 border-t border-stone-100">
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Classical Formulation Category
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("all")}
                    className={`text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer ${
                      selectedCategory === "all"
                        ? "bg-[#14281D] text-white font-medium shadow-xs"
                        : "bg-stone-50 hover:bg-stone-100 text-stone-700"
                    }`}
                  >
                    <span>All ({productsList.length})</span>
                    {selectedCategory === "all" && <Check className="w-3 h-3 text-[#9E7D3B]" />}
                  </button>
                  {categoriesList.map((cat) => {
                    const isSelected =
                      selectedCategory === cat.id || selectedCategory === cat.slug;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.slug || cat.id)}
                        className={`text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-[#14281D] text-white font-medium shadow-xs"
                            : "bg-stone-50 hover:bg-stone-100 text-stone-700"
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        {isSelected && <Check className="w-3 h-3 text-[#9E7D3B]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Unani Temperament (Mizaj) */}
              <div className="space-y-3 pt-3 border-t border-stone-100">
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Unani Energetic Mizaj (Temperament)
                </div>
                <div className="space-y-1.5">
                  {MIZAJ_OPTIONS.map((mz) => {
                    const isSelected = selectedMizaj === mz.id;
                    const Icon = mz.icon;
                    return (
                      <button
                        key={mz.id}
                        type="button"
                        onClick={() => setSelectedMizaj(mz.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-[#14281D] text-white font-medium shadow-xs"
                            : "bg-stone-50 hover:bg-stone-100 text-stone-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {Icon && <Icon className="w-3.5 h-3.5 text-[#9E7D3B]" />}
                          <span>{mz.label}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#9E7D3B]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Price Filter */}
              <div className="space-y-3 pt-3 border-t border-stone-100">
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Price Range
                </div>
                <div className="space-y-1.5">
                  {PRICE_RANGES.map((pr) => {
                    const isSelected = selectedPriceRange === pr.id;
                    return (
                      <button
                        key={pr.id}
                        type="button"
                        onClick={() => setSelectedPriceRange(pr.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-[#14281D] text-white font-medium shadow-xs"
                            : "bg-stone-50 hover:bg-stone-100 text-stone-700"
                        }`}
                      >
                        <span>{pr.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#9E7D3B]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Minimum Rating */}
              <div className="space-y-3 pt-3 border-t border-stone-100">
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Customer Score
                </div>
                <div className="space-y-1.5">
                  {RATING_OPTIONS.map((ro) => {
                    const isSelected = selectedRating === ro.id;
                    return (
                      <button
                        key={ro.id}
                        type="button"
                        onClick={() => setSelectedRating(ro.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-[#14281D] text-white font-medium shadow-xs"
                            : "bg-stone-50 hover:bg-stone-100 text-stone-700"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 fill-[#9E7D3B] text-[#9E7D3B]" />
                          <span>{ro.label}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#9E7D3B]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6. Availability & Offers */}
              <div className="space-y-3 pt-3 border-t border-stone-100">
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Availability &amp; Badges
                </div>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 hover:bg-stone-100 cursor-pointer transition-colors text-xs text-stone-700">
                    <span>In Stock Only</span>
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="w-4 h-4 rounded border-stone-300 text-[#14281D] focus:ring-[#14281D]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 hover:bg-stone-100 cursor-pointer transition-colors text-xs text-stone-700">
                    <span>On Sale / Discounted</span>
                    <input
                      type="checkbox"
                      checked={onSaleOnly}
                      onChange={(e) => setOnSaleOnly(e.target.checked)}
                      className="w-4 h-4 rounded border-stone-300 text-[#14281D] focus:ring-[#14281D]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 hover:bg-stone-100 cursor-pointer transition-colors text-xs text-stone-700">
                    <span>Featured &amp; Best Sellers</span>
                    <input
                      type="checkbox"
                      checked={bestSellersOnly}
                      onChange={(e) => setBestSellersOnly(e.target.checked)}
                      className="w-4 h-4 rounded border-stone-300 text-[#14281D] focus:ring-[#14281D]"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Drawer Bottom Bar */}
            <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center gap-3">
              <button
                type="button"
                onClick={clearAllFilters}
                className="w-1/3 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 border border-stone-200 rounded-xl transition-colors cursor-pointer"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-1 py-2.5 text-xs font-semibold bg-[#14281D] hover:bg-[#0c1b13] text-white rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Show {filteredProducts.length} Remedies
              </button>
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
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#14281D] border-t-transparent animate-spin" />
            <span className="text-xs text-stone-500 uppercase tracking-widest font-medium">
              Loading Apothecary...
            </span>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
