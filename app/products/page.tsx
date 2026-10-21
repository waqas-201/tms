"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Product, CategoryInfo } from "@/app/data/products";
import ProductCard from "@/app/components/ProductCard";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
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
  Home,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  Sliders,
  Filter,
  Leaf,
  Package,
  Sprout,
  Activity,
  Droplets,
  Sun,
  Flame,
} from "lucide-react";


const VISUAL_CATEGORIES = [
  {
    id: "all",
    label: "All Remedies",
    subtitle: "Full Dispensary",
    slug: "all",
    icon: Sparkles,
    bgGradient: "bg-success-soft text-ink",
    badge: null,
    type: "all",
  },
  {
    id: "herbs",
    label: "Herbs",
    subtitle: "Pure Botanicals",
    slug: "herbs-seeds",
    icon: Leaf,
    bgGradient: "bg-success-soft text-success",
    badge: "Botanical",
    type: "category",
  },
  {
    id: "deals",
    label: "Deals",
    subtitle: "Special Offers",
    slug: "deals",
    icon: Sparkles,
    bgGradient: "bg-warning-soft text-warning",
    badge: "50% OFF",
    highlight: true,
    type: "deals",
  },
  {
    id: "murabba",
    label: "Murabba",
    subtitle: "Preserves",
    slug: "murabbajaat",
    icon: Package,
    bgGradient: "bg-warning-soft text-warning",
    badge: null,
    type: "category",
  },
  {
    id: "spices",
    label: "Spices",
    subtitle: "Aromatic",
    slug: "spices",
    icon: Flame,
    bgGradient: "bg-danger-soft text-danger",
    badge: null,
    type: "category",
  },
  {
    id: "seeds",
    label: "Seeds",
    subtitle: "Organic Grains",
    slug: "seeds",
    icon: Sprout,
    bgGradient: "bg-success-soft text-success",
    badge: null,
    type: "category",
  },
  {
    id: "health-collections",
    label: "Health Blends",
    subtitle: "Targeted Care",
    slug: "health-collections",
    icon: Activity,
    bgGradient: "bg-info-soft text-info",
    badge: "Curated",
    type: "category",
  },
  {
    id: "oils-marham",
    label: "Oils & Balms",
    subtitle: "Therapeutic",
    slug: "oils-marham",
    icon: Droplets,
    bgGradient: "bg-sand-100 text-neutral-800",
    badge: null,
    type: "category",
  },
  {
    id: "dry-fruits",
    label: "Dry Fruits",
    subtitle: "Vitality Nuts",
    slug: "dry-fruits",
    icon: Sun,
    bgGradient: "bg-warning-soft text-warning",
    badge: null,
    type: "category",
  },
];

const RATING_OPTIONS = [
  { id: "all", label: "All Ratings", min: 0 },
  { id: "4.8", label: "4.8★ & Above", min: 4.8 },
  { id: "4.5", label: "4.5★ & Above", min: 4.5 },
  { id: "4.0", label: "4.0★ & Above", min: 4.0 },
];

const DEFAULT_MAX_PRICE = 5000;

function getPaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount = 1
): (number | string)[] {
  const totalPageNumbers = siblingCount * 2 + 5;

  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, "...", totalPages];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + 1 + i
    );
    return [1, "...", ...rightRange];
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [1, "...", ...middleRange, "...", totalPages];
  }

  return Array.from({ length: totalPages }, (_, i) => i + 1);
}

function ProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const catalogTopRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Dynamic Data State
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);

  // Compute dynamic max price from catalog
  const maxCatalogPrice = useMemo(() => {
    if (productsList.length === 0) return DEFAULT_MAX_PRICE;
    const max = Math.max(...productsList.map((p) => p.price || 0));
    return Math.max(Math.ceil(max / 500) * 500, 1000);
  }, [productsList]);

  // Initial URL Parameter hydration
  const initialMin = Number(searchParams.get("minPrice")) || 0;
  const initialMax = Number(searchParams.get("maxPrice")) || DEFAULT_MAX_PRICE;
  const initialPage = Math.max(1, Number(searchParams.get("page")) || 1);
  const initialPageSize =
    Number(searchParams.get("pageSize")) ||
    Number(searchParams.get("limit")) ||
    24;

  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || "all"
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialMin,
    initialMax,
  ]);
  const [selectedRating, setSelectedRating] = useState<string>(
    searchParams.get("rating") || "all"
  );
  const [inStockOnly, setInStockOnly] = useState<boolean>(
    searchParams.get("inStock") === "true"
  );
  const [onSaleOnly, setOnSaleOnly] = useState<boolean>(
    searchParams.get("onSale") === "true"
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
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;
  const hasCustomMaxPrice = useRef(Boolean(searchParams.get("maxPrice")));

  // Fetch Live Database Products & Categories
  useEffect(() => {
    async function loadCatalog() {
      try {
        setIsLoading(true);
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
        ]);

        if (prodRes.ok) {
          const prodJson = await prodRes.json();
          if (prodJson.success && Array.isArray(prodJson.data)) {
            setProductsList(prodJson.data);
          }
        }

        if (catRes.ok) {
          const catJson = await catRes.json();
          if (catJson.success && Array.isArray(catJson.data)) {
            setCategoriesList(catJson.data);
          }
        }
      } catch (err) {
        console.error("Failed to load catalog products:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCatalog();
  }, []);

  // Sync price slider range bounds when maxCatalogPrice initializes from database
  useEffect(() => {
    if (!hasCustomMaxPrice.current && maxCatalogPrice > DEFAULT_MAX_PRICE) {
      setPriceRange((prev) => {
        if (prev[1] === maxCatalogPrice) return prev;
        return [prev[0], maxCatalogPrice];
      });
    }
  }, [maxCatalogPrice]);

  const isPriceFiltered =
    priceRange[0] > 0 ||
    (hasCustomMaxPrice.current && priceRange[1] < maxCatalogPrice);

  // Update URL Query Parameters on Filter Change (avoids loop and preserves params)
  const updateUrlParams = useCallback(
    (params: Record<string, string | number | boolean | null>) => {
      const current = new URLSearchParams(searchParamsRef.current.toString());
      Object.entries(params).forEach(([key, val]) => {
        if (val === null || val === "" || val === "all" || val === false) {
          current.delete(key);
        } else {
          current.set(key, String(val));
        }
      });
      const newQuery = current.toString();
      const currentQuery = searchParamsRef.current.toString();
      if (newQuery !== currentQuery) {
        router.replace(`${pathname}${newQuery ? `?${newQuery}` : ""}`, { scroll: false });
      }
    },
    [pathname, router]
  );

  // Keep currentPage in sync when URL page param changes externally (e.g. browser back/forward button)
  useEffect(() => {
    const pageFromUrl = Math.max(1, Number(searchParams.get("page")) || 1);
    setCurrentPage((prev) => (prev !== pageFromUrl ? pageFromUrl : prev));
  }, [searchParams]);

  // Track previous filter state to only reset page to 1 when filters actually change
  const prevFiltersRef = useRef({
    category: selectedCategory,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    rating: selectedRating,
    inStock: inStockOnly,
    onSale: onSaleOnly,
    search: searchQuery,
    sort: sortBy,
    pageSize,
  });

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const prev = prevFiltersRef.current;
    const isInitialPriceSync =
      !hasCustomMaxPrice.current &&
      prev.minPrice === 0 &&
      priceRange[0] === 0 &&
      prev.maxPrice === DEFAULT_MAX_PRICE &&
      priceRange[1] === maxCatalogPrice;

    const filtersChanged =
      prev.category !== selectedCategory ||
      prev.minPrice !== priceRange[0] ||
      (prev.maxPrice !== priceRange[1] && !isInitialPriceSync) ||
      prev.rating !== selectedRating ||
      prev.inStock !== inStockOnly ||
      prev.onSale !== onSaleOnly ||
      prev.search !== searchQuery ||
      prev.sort !== sortBy ||
      prev.pageSize !== pageSize;

    prevFiltersRef.current = {
      category: selectedCategory,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      rating: selectedRating,
      inStock: inStockOnly,
      onSale: onSaleOnly,
      search: searchQuery,
      sort: sortBy,
      pageSize,
    };

    if (filtersChanged) {
      setCurrentPage(1);
    }
  }, [
    selectedCategory,
    priceRange[0],
    priceRange[1],
    selectedRating,
    inStockOnly,
    onSaleOnly,
    searchQuery,
    sortBy,
    pageSize,
    maxCatalogPrice,
  ]);

  // Sync state changes to URL
  useEffect(() => {
    updateUrlParams({
      category: selectedCategory !== "all" ? selectedCategory : null,
      minPrice: priceRange[0] > 0 ? priceRange[0] : null,
      maxPrice:
        hasCustomMaxPrice.current && priceRange[1] < maxCatalogPrice
          ? priceRange[1]
          : null,
      rating: selectedRating !== "all" ? selectedRating : null,
      inStock: inStockOnly ? "true" : null,
      onSale: onSaleOnly ? "true" : null,
      q: searchQuery.trim() || null,
      sort: sortBy !== "featured" ? sortBy : null,
      view: viewMode !== "grid" ? viewMode : null,
      page: currentPage > 1 ? currentPage : null,
      pageSize: pageSize !== 24 ? pageSize : null,
    });
  }, [
    selectedCategory,
    priceRange,
    maxCatalogPrice,
    selectedRating,
    inStockOnly,
    onSaleOnly,
    searchQuery,
    sortBy,
    viewMode,
    currentPage,
    pageSize,
    updateUrlParams,
  ]);

  // Product Filtering Engine
  const filteredProducts = useMemo(() => {
    return productsList
      .filter((product) => {
        // 1. Category Filter
        if (selectedCategory !== "all") {
          const cat = (product.category || "").toLowerCase();
          const catId = ((product as any).categoryId || "").toLowerCase();
          const catLabel = (product.categoryLabel || "").toLowerCase();
          const prodName = (product.name || "").toLowerCase();

          let catMatch =
            cat === selectedCategory.toLowerCase() ||
            catId === selectedCategory.toLowerCase() ||
            catLabel === selectedCategory.toLowerCase();

          if (!catMatch) {
            if (selectedCategory === "spices") {
              catMatch =
                cat.includes("spice") ||
                catLabel.includes("spice") ||
                prodName.includes("spice") ||
                prodName.includes("clove") ||
                prodName.includes("cardamom") ||
                prodName.includes("cinnamon") ||
                prodName.includes("saffron") ||
                prodName.includes("zafran") ||
                prodName.includes("laung") ||
                prodName.includes("darchini") ||
                prodName.includes("elaichi") ||
                prodName.includes("black pepper") ||
                prodName.includes("ginger") ||
                prodName.includes("turmeric") ||
                prodName.includes("haldi");
            } else if (selectedCategory === "seeds") {
              catMatch =
                cat === "seeds" ||
                catLabel === "seeds" ||
                prodName.includes("seed") ||
                prodName.includes("tukhm") ||
                prodName.includes("kalonji") ||
                prodName.includes("chia") ||
                prodName.includes("flax") ||
                prodName.includes("methi") ||
                prodName.includes("fenugreek") ||
                prodName.includes("ispaghol") ||
                prodName.includes("psyllium") ||
                prodName.includes("tukhmaria");
            } else if (selectedCategory === "dry-fruits") {
              catMatch =
                cat.includes("dry-fruit") ||
                cat.includes("nut") ||
                catLabel.includes("dry fruit") ||
                catLabel.includes("nuts") ||
                cat === "teas-vitality" ||
                prodName.includes("almond") ||
                prodName.includes("badam") ||
                prodName.includes("pista") ||
                prodName.includes("pistachio") ||
                prodName.includes("walnut") ||
                prodName.includes("akhrot") ||
                prodName.includes("cashew") ||
                prodName.includes("kaju") ||
                prodName.includes("anzaar") ||
                prodName.includes("fig") ||
                prodName.includes("shahi") ||
                prodName.includes("majun");
            } else if (selectedCategory === "herbs-seeds" || selectedCategory === "herbs") {
              catMatch =
                cat.includes("herb") ||
                catId.includes("herb") ||
                catLabel.includes("herb") ||
                cat.includes("seeds");
            } else if (selectedCategory === "murabbajaat" || selectedCategory === "murabba") {
              catMatch =
                cat.includes("murabba") ||
                catId.includes("murabba") ||
                catLabel.includes("murabba") ||
                prodName.includes("murabba");
            } else if (selectedCategory === "oils-marham" || selectedCategory === "oils") {
              catMatch =
                cat.includes("oil") ||
                cat.includes("marham") ||
                catId.includes("oil") ||
                catLabel.includes("oil") ||
                catLabel.includes("marham") ||
                prodName.includes("oil") ||
                prodName.includes("roghan") ||
                prodName.includes("marham");
            }
          }

          if (!catMatch) return false;
        }

        // 2. Price Range (Dynamic Min to Max Slider)
        const price = product.price;
        if (price < priceRange[0] || price > priceRange[1]) return false;

        // 3. Rating Filter
        if (selectedRating !== "all") {
          const ratingObj = RATING_OPTIONS.find((r) => r.id === selectedRating);
          if (ratingObj && (product.rating || 5) < ratingObj.min) return false;
        }

        // 4. In-Stock Filter
        if (inStockOnly && !product.inStock) return false;

        // 5. On-Sale Filter
        if (
          onSaleOnly &&
          (!product.discountPercentage || product.discountPercentage <= 0)
        )
          return false;

        // 6. Free-form Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const searchable = `${product.name} ${product.urduName || ""} ${
            product.categoryLabel || ""
          } ${product.traditionalPurpose || ""} ${product.shortDescription || ""} ${
            product.ingredients?.map((i) => i.name).join(" ") || ""
          }`.toLowerCase();
          if (!searchable.includes(q)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "price-low":
            return a.price - b.price;
          case "price-high":
            return b.price - a.price;
          case "rating":
            return (b.rating || 0) - (a.rating || 0);
          case "discount":
            return (b.discountPercentage || 0) - (a.discountPercentage || 0);
          case "name-asc":
            return a.name.localeCompare(b.name);
          case "featured":
          default:
            return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        }
      });
  }, [
    productsList,
    selectedCategory,
    priceRange,
    selectedRating,
    inStockOnly,
    onSaleOnly,
    searchQuery,
    sortBy,
  ]);

  // Active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (isPriceFiltered) count++;
    if (selectedRating !== "all") count++;
    if (inStockOnly) count++;
    if (onSaleOnly) count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [
    selectedCategory,
    isPriceFiltered,
    selectedRating,
    inStockOnly,
    onSaleOnly,
    searchQuery,
  ]);

  const hasActiveFilters = activeFiltersCount > 0;

  // Pagination Math & Slicing
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredProducts.length);

  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, startIndex, endIndex]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === safePage) return;
    setCurrentPage(newPage);
    if (catalogTopRef.current) {
      catalogTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 380, behavior: "smooth" });
    }
  };

  const clearAllFilters = () => {
    hasCustomMaxPrice.current = false;
    setSelectedCategory("all");
    setPriceRange([0, maxCatalogPrice]);
    setSelectedRating("all");
    setInStockOnly(false);
    setOnSaleOnly(false);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const isCategoryAvatarActive = useCallback(
    (catItem: (typeof VISUAL_CATEGORIES)[0]) => {
      if (catItem.type === "deals") {
        return onSaleOnly;
      }
      if (catItem.type === "all") {
        return selectedCategory === "all" && !onSaleOnly;
      }
      return (
        (selectedCategory === catItem.slug ||
          selectedCategory === catItem.id) &&
        !onSaleOnly
      );
    },
    [selectedCategory, onSaleOnly]
  );

  const handleCategoryAvatarClick = useCallback(
    (catItem: (typeof VISUAL_CATEGORIES)[0]) => {
      setCurrentPage(1);
      if (catItem.type === "deals") {
        setOnSaleOnly(true);
        setSelectedCategory("all");
      } else if (catItem.type === "all") {
        setSelectedCategory("all");
        setOnSaleOnly(false);
      } else {
        setSelectedCategory(catItem.slug);
        setOnSaleOnly(false);
      }
    },
    []
  );

  // Human-readable labels for active filter pills
  const matchedVisualCat = VISUAL_CATEGORIES.find(
    (v) => v.slug === selectedCategory || v.id === selectedCategory
  );
  const matchedDbCat = categoriesList.find(
    (c) => c.id === selectedCategory || c.slug === selectedCategory
  );
  const activeCategoryInfo = matchedDbCat
    ? { name: matchedDbCat.name }
    : matchedVisualCat
    ? { name: matchedVisualCat.label }
    : null;
  const activeRatingInfo = RATING_OPTIONS.find((r) => r.id === selectedRating);

  // Recommended products for zero results fallback
  const recommendedProducts = useMemo(() => {
    return productsList.filter((p) => p.featured).slice(0, 4);
  }, [productsList]);

  // Streamlined Filter Controls: 1. Price Range (Slider) -> 2. Rating -> 3. Availability
  const renderFilterSections = () => (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          1. PRICE RANGE (INTERACTIVE DUAL SLIDER IN RANGE)
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink">
            <SlidersHorizontal className="w-3.5 h-3.5 text-secondary-text" />
            <span>Price Range</span>
          </div>
          {isPriceFiltered && (
            <button
              onClick={() => {
                hasCustomMaxPrice.current = false;
                setPriceRange([0, maxCatalogPrice]);
              }}
              className="text-[10px] text-ink-subtle hover:text-danger transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {/* Dynamic Price Display */}
        <div className="flex items-center justify-between text-xs font-semibold text-ink bg-surface/80 px-3 py-2 rounded-xl border border-line/60">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-ink-subtle font-medium">Min</span>
            <span className="text-ink">₨ {priceRange[0].toLocaleString()}</span>
          </div>
          <span className="text-ink-subtle font-light">—</span>
          <div className="flex flex-col text-right">
            <span className="text-[9px] uppercase tracking-wider text-ink-subtle font-medium">Max</span>
            <span className="text-ink">₨ {priceRange[1].toLocaleString()}</span>
          </div>
        </div>

        {/* Dual Range Track & Thumbs */}
        <div className="pt-2 px-1">
          <div className="relative h-5 flex items-center">
            {/* Background Rail */}
            <div className="absolute w-full h-1.5 bg-line/80 rounded-full" />

            {/* Active Range Fill */}
            <div
              className="absolute h-1.5 bg-surface-inverse rounded-full transition-all"
              style={{
                left: `${Math.min(100, Math.max(0, (priceRange[0] / maxCatalogPrice) * 100))}%`,
                right: `${Math.min(100, Math.max(0, 100 - (priceRange[1] / maxCatalogPrice) * 100))}%`,
              }}
            />

            {/* Left Thumb (Min Price) */}
            <input
              type="range"
              min={0}
              max={maxCatalogPrice}
              step={50}
              value={priceRange[0]}
              onChange={(e) => {
                const val = Math.min(Number(e.target.value), priceRange[1] - 50);
                setPriceRange([val, priceRange[1]]);
              }}
              className="absolute w-full appearance-none bg-transparent pointer-events-none z-20 cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-surface-inverse [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-surface-inverse [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
              aria-label="Minimum price"
            />

            {/* Right Thumb (Max Price) */}
            <input
              type="range"
              min={0}
              max={maxCatalogPrice}
              step={50}
              value={priceRange[1]}
              onChange={(e) => {
                hasCustomMaxPrice.current = true;
                const val = Math.max(Number(e.target.value), priceRange[0] + 50);
                setPriceRange([priceRange[0], val]);
              }}
              className="absolute w-full appearance-none bg-transparent pointer-events-none z-20 cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-surface-inverse [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-surface-inverse [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
              aria-label="Maximum price"
            />
          </div>

          <div className="flex justify-between text-[10px] text-ink-subtle font-medium mt-1">
            <span>₨ 0</span>
            <span>₨ {maxCatalogPrice.toLocaleString()}+</span>
          </div>
        </div>
      </div>

      <div className="h-px bg-surface-sunken" />

      {/* ─────────────────────────────────────────────────────────────
          2. CUSTOMER RATING
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink">
            <Star className="w-3.5 h-3.5 text-secondary-text fill-brand-gold-600" />
            <span>Customer Rating</span>
          </div>
          {selectedRating !== "all" && (
            <button
              onClick={() => setSelectedRating("all")}
              className="text-[10px] text-ink-subtle hover:text-danger transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="space-y-1">
          {RATING_OPTIONS.map((ro) => {
            const isSelected = selectedRating === ro.id;
            return (
              <button
                key={ro.id}
                type="button"
                onClick={() => setSelectedRating(isSelected ? "all" : ro.id)}
                className={`group w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-surface-inverse/5 text-ink font-semibold"
                    : "text-ink-body hover:bg-surface hover:text-ink"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? "border-ink bg-surface-inverse"
                        : "border-line-strong group-hover:border-line-strong bg-white"
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-brand-gold-600" />}
                  </div>
                  {ro.id === "all" ? (
                    <span className="text-xs">All Ratings</span>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs">
                      <div className="flex items-center text-secondary-text">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= Math.floor(ro.min)
                                ? "fill-brand-gold-600 text-secondary-text"
                                : "text-ink-subtle fill-ink"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-neutral-700 text-[11px] font-medium">{ro.label}</span>
                    </div>
                  )}
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-secondary-text" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-surface-sunken" />

      {/* ─────────────────────────────────────────────────────────────
          3. AVAILABILITY & OFFERS
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink">
          <ShieldCheck className="w-3.5 h-3.5 text-secondary-text" />
          <span>Availability</span>
        </div>

        <div className="space-y-2">
          {/* In Stock Only */}
          <label className="flex items-center justify-between py-1 px-1 rounded-md hover:bg-surface cursor-pointer transition-colors group">
            <span className="text-xs text-neutral-700 group-hover:text-ink font-medium">
              In Stock Only
            </span>
            <div className="relative inline-flex items-center">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-line-strong after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-surface-inverse" />
            </div>
          </label>

          {/* On Sale / Special Discounts */}
          <label className="flex items-center justify-between py-1 px-1 rounded-md hover:bg-surface cursor-pointer transition-colors group">
            <span className="text-xs text-neutral-700 group-hover:text-ink font-medium">
              On Sale / Deals
            </span>
            <div className="relative inline-flex items-center">
              <input
                type="checkbox"
                checked={onSaleOnly}
                onChange={(e) => setOnSaleOnly(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-line-strong after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-brand-gold-600" />
            </div>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface text-ink">
      {/* ═══════════════════════════════════════════════════════════════════════
          1. HEADER BANNER & BREADCRUMBS
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-line/80 pt-8 pb-6 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-ink-muted" aria-label="Breadcrumb">
            <Link
              href="/"
              className="flex items-center gap-1 hover:text-ink transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-ink-subtle" />
            <span className="font-semibold text-ink">Apothecary Catalog</span>
          </nav>

          {/* Title and Heritage Subtitle */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] sm:text-xs uppercase font-semibold tracking-[0.2em] text-secondary-text">
                Natural Herbal Formulations · Karachi Dispensary
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-ink tracking-tight mt-1">
                Classical Herbal Remedies &amp; Tonics
              </h1>
              <p className="text-xs sm:text-sm text-ink-muted font-light mt-1 max-w-2xl leading-relaxed">
                Handcrafted herbal preserves, extracts, oils, and botanical compounds formulated according to time-tested natural standards.
              </p>
            </div>

            {/* Quick Guarantees */}
            <div className="hidden lg:flex items-center gap-4 text-xs text-ink-body bg-surface px-4 py-2.5 rounded-xl border border-line/70">
              <div className="flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-success" />
                <span>100% Botanical</span>
              </div>
              <span className="text-ink-subtle">|</span>
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-ink" />
                <span>COD Nationwide</span>
              </div>
              <span className="text-ink-subtle">|</span>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-secondary-text" />
                <span>Expert Formulated</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          1.5 APOTHECARY VISUAL CATEGORY AVATAR NAVIGATION STRIP
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-line/80 py-5 sm:py-6 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-secondary-text" />
              <h2 className="text-xs font-semibold text-ink uppercase tracking-wider">
                Featured Botanical Categories
              </h2>
            </div>
            <span className="text-[11px] text-ink-subtle hidden sm:inline">
              Click any category to filter catalog
            </span>
          </div>

          {/* Horizontal Scrolling Avatar Ribbon */}
          <div className="overflow-x-auto scrollbar-none pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex items-center gap-4 sm:gap-6 md:gap-7 min-w-max lg:justify-between py-1">
              {VISUAL_CATEGORIES.map((cat) => {
                const isActive = isCategoryAvatarActive(cat);
                const IconComponent = cat.icon;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryAvatarClick(cat)}
                    className="flex flex-col items-center gap-2 group cursor-pointer text-center transition-all duration-200 focus:outline-none"
                  >
                    {/* Circle Avatar with Icon */}
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center relative transition-all duration-300 ${
                        isActive
                          ? "bg-surface-inverse text-white shadow-md ring-2 ring-offset-2 ring-brand-gold-600 scale-105"
                          : "bg-surface text-neutral-700 border border-line/80 hover:border-brand-gold-600/60 hover:bg-surface-sunken hover:scale-105 shadow-2xs"
                      }`}
                    >
                      <IconComponent
                        className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
                          isActive
                            ? "text-brand-gold-500"
                            : "text-ink-body group-hover:text-ink"
                        }`}
                      />

                      {/* Floating Badge Tag */}
                      {cat.badge && (
                        <span
                          className={`absolute -top-1.5 -right-1 px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold tracking-tight shadow-xs ${
                            cat.highlight
                              ? "bg-danger text-white animate-pulse"
                              : "bg-brand-gold-800 text-white"
                          }`}
                        >
                          {cat.badge}
                        </span>
                      )}
                    </div>

                    {/* Labels */}
                    <div className="flex flex-col items-center max-w-[76px] sm:max-w-[92px]">
                      <span
                        className={`text-xs font-medium leading-tight truncate transition-colors ${
                          isActive
                            ? "text-ink font-bold"
                            : "text-neutral-800 group-hover:text-ink"
                        }`}
                      >
                        {cat.label}
                      </span>
                      <span className="text-[10px] text-ink-subtle font-normal leading-tight truncate hidden sm:block">
                        {cat.subtitle}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          2. MAIN CATALOG (STREAMLINED SIDEBAR + PRODUCT GRID)
      ═══════════════════════════════════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ─────────────────────────────────────────────────────────────────
              DESKTOP STREAMLINED SIDEBAR (3 cols on lg)
          ───────────────────────────────────────────────────────────────── */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-24 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-line/80 shadow-2xs">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-line">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-secondary-text" />
                  <h2 className="font-serif text-sm font-bold text-ink">
                    Filter Catalog
                  </h2>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-[11px] text-danger hover:text-danger font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Simplified Filter Sections in Custom Order */}
              {renderFilterSections()}
            </div>
          </aside>

          {/* ─────────────────────────────────────────────────────────────────
              CATALOG CONTENT AREA (9 cols on lg, 12 cols on mobile)
          ───────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-9 space-y-6">
            <div ref={catalogTopRef} className="scroll-mt-28" />

            {/* Top Controls: Search, Sort, View Toggle, and Mobile Filter Trigger */}
            <div className="bg-white p-4 rounded-2xl border border-line/80 shadow-2xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Mobile Filter Sheet Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-sunken text-neutral-800 text-xs font-semibold border border-line transition-colors cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5 text-secondary-text" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 min-w-4 flex items-center justify-center">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </button>

                {/* Search Bar */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by herb, botanical name, condition..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8.5 pr-8 py-2 text-xs bg-surface border border-line rounded-xl text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-1 focus:ring-primary focus:border-ink focus:bg-white transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-neutral-700 cursor-pointer"
                      aria-label="Clear search"
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
                    className="appearance-none bg-surface hover:bg-white border border-line text-neutral-800 text-xs font-medium pl-3 pr-7 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
                  >
                    <option value="featured">Sort: Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="discount">Biggest Discount</option>
                    <option value="name-asc">Alphabetical (A–Z)</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-ink-subtle absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Grid / List Layout Switcher */}
                <div className="hidden sm:flex items-center bg-surface-sunken p-0.5 rounded-xl border border-line shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === "grid"
                        ? "bg-white text-ink shadow-2xs font-semibold"
                        : "text-ink-muted hover:text-ink"
                    }`}
                    title="Grid View"
                    aria-label="Grid View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === "list"
                        ? "bg-white text-ink shadow-2xs font-semibold"
                        : "text-ink-muted hover:text-ink"
                    }`}
                    title="List View"
                    aria-label="List View"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Active Filter Chips Ribbon (Animated with Framer Motion) */}
              <AnimatePresence>
                {hasActiveFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-line text-xs overflow-hidden"
                  >
                    <span className="text-[11px] text-ink-subtle font-medium mr-1">
                      Active Filters:
                    </span>

                    {selectedCategory !== "all" && activeCategoryInfo && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-sunken text-neutral-800 text-[11px] font-medium">
                        <span>Category: {activeCategoryInfo.name}</span>
                        <button
                          onClick={() => setSelectedCategory("all")}
                          className="text-ink-subtle hover:text-danger ml-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}

                    {isPriceFiltered && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-sunken text-neutral-800 text-[11px] font-medium">
                        <span>
                          Price: ₨ {priceRange[0].toLocaleString()} – ₨ {priceRange[1].toLocaleString()}
                        </span>
                        <button
                          onClick={() => {
                            hasCustomMaxPrice.current = false;
                            setPriceRange([0, maxCatalogPrice]);
                          }}
                          className="text-ink-subtle hover:text-danger ml-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}

                    {selectedRating !== "all" && activeRatingInfo && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-sunken text-neutral-800 text-[11px] font-medium">
                        <span>Rating: {activeRatingInfo.label}</span>
                        <button
                          onClick={() => setSelectedRating("all")}
                          className="text-ink-subtle hover:text-danger ml-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}

                    {inStockOnly && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-sunken text-neutral-800 text-[11px] font-medium">
                        <span>In Stock Only</span>
                        <button
                          onClick={() => setInStockOnly(false)}
                          className="text-ink-subtle hover:text-danger ml-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}

                    {onSaleOnly && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-sunken text-neutral-800 text-[11px] font-medium">
                        <span>On Sale</span>
                        <button
                          onClick={() => setOnSaleOnly(false)}
                          className="text-ink-subtle hover:text-danger ml-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}

                    {searchQuery && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-sunken text-neutral-800 text-[11px] font-medium">
                        <span>&ldquo;{searchQuery}&rdquo;</span>
                        <button
                          onClick={() => setSearchQuery("")}
                          className="text-ink-subtle hover:text-danger ml-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}

                    <button
                      onClick={clearAllFilters}
                      className="text-[11px] text-danger hover:underline font-semibold ml-auto cursor-pointer"
                    >
                      Clear all
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Results Count & Items Per Page Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-ink-muted bg-white/60 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-line/70 shadow-2xs">
              <div className="flex items-center gap-2">
                <span>
                  Showing{" "}
                  <span className="font-semibold text-ink">
                    {filteredProducts.length > 0 ? startIndex + 1 : 0}–{endIndex}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-ink">
                    {filteredProducts.length}
                  </span>{" "}
                  remedies
                </span>
                {totalPages > 1 && (
                  <span className="text-ink-subtle font-medium">
                    (Page {safePage} of {totalPages})
                  </span>
                )}
              </div>

              {/* Items Per Page Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-ink-subtle font-medium">Per page:</span>
                <div className="flex items-center gap-1 bg-surface-sunken p-0.5 rounded-lg border border-line">
                  {[12, 24, 36, 48].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setPageSize(size);
                        setCurrentPage(1);
                      }}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                        pageSize === size
                          ? "bg-white text-ink shadow-2xs"
                          : "text-ink-muted hover:text-ink"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Grid / List Content */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="bg-white rounded-2xl border border-line/80 p-4 space-y-3 animate-pulse"
                  >
                    <div className="aspect-square bg-surface-sunken rounded-xl w-full" />
                    <div className="h-3 bg-surface-sunken rounded w-1/3" />
                    <div className="h-4 bg-line rounded w-3/4" />
                    <div className="h-3 bg-surface-sunken rounded w-1/2" />
                    <div className="h-10 bg-surface-sunken rounded-xl w-full mt-4" />
                  </div>
                ))}
              </div>
            ) : paginatedProducts.length > 0 ? (
              <>
                <motion.div
                  layout
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch"
                      : "flex flex-col gap-4"
                  }
                >
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      viewMode={viewMode}
                    />
                  ))}
                </motion.div>

                {/* Apothecary Classical Pagination Controls */}
                {totalPages > 1 && (
                  <div className="pt-6 pb-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-line/80 mt-8">
                    <div className="text-xs text-ink-muted order-2 sm:order-1">
                      Showing{" "}
                      <span className="font-semibold text-ink">
                        {startIndex + 1}–{endIndex}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-ink">
                        {filteredProducts.length}
                      </span>{" "}
                      remedies · Page{" "}
                      <span className="font-semibold text-ink">
                        {safePage}
                      </span>{" "}
                      of {totalPages}
                    </div>

                    <nav
                      className="flex items-center gap-1.5 order-1 sm:order-2"
                      aria-label="Apothecary Catalog Pagination"
                    >
                      {/* First Page */}
                      <button
                        type="button"
                        onClick={() => handlePageChange(1)}
                        disabled={safePage <= 1}
                        className="hidden sm:inline-flex items-center justify-center w-8 h-8 rounded-xl border border-line bg-white text-ink-body hover:bg-surface hover:text-ink disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-2xs"
                        aria-label="First page"
                        title="First page"
                      >
                        <ChevronsLeft className="w-3.5 h-3.5" />
                      </button>

                      {/* Previous Page */}
                      <button
                        type="button"
                        onClick={() => handlePageChange(safePage - 1)}
                        disabled={safePage <= 1}
                        className="inline-flex items-center gap-1 px-3 h-8 rounded-xl border border-line bg-white text-neutral-700 hover:bg-surface hover:text-ink disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">Prev</span>
                      </button>

                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {getPaginationRange(safePage, totalPages).map((page, idx) => {
                          if (page === "...") {
                            return (
                              <span
                                key={`dots-${idx}`}
                                className="w-8 h-8 flex items-center justify-center text-xs text-ink-subtle font-medium select-none"
                              >
                                •••
                              </span>
                            );
                          }

                          const pageNum = Number(page);
                          const isActive = pageNum === safePage;

                          return (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() => handlePageChange(pageNum)}
                              className={`w-8 h-8 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                                isActive
                                  ? "bg-surface-inverse text-white shadow-md ring-1 ring-brand-gold-600"
                                  : "bg-white text-neutral-700 border border-line hover:bg-surface hover:border-line-strong hover:text-ink shadow-2xs"
                              }`}
                              aria-current={isActive ? "page" : undefined}
                              aria-label={`Page ${pageNum}`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      {/* Next Page */}
                      <button
                        type="button"
                        onClick={() => handlePageChange(safePage + 1)}
                        disabled={safePage >= totalPages}
                        className="inline-flex items-center gap-1 px-3 h-8 rounded-xl border border-line bg-white text-neutral-700 hover:bg-surface hover:text-ink disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                        aria-label="Next page"
                      >
                        <span className="hidden xs:inline">Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      {/* Last Page */}
                      <button
                        type="button"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={safePage >= totalPages}
                        className="hidden sm:inline-flex items-center justify-center w-8 h-8 rounded-xl border border-line bg-white text-ink-body hover:bg-surface hover:text-ink disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-2xs"
                        aria-label="Last page"
                        title="Last page"
                      >
                        <ChevronsRight className="w-3.5 h-3.5" />
                      </button>
                    </nav>
                  </div>
                )}
              </>
            ) : (
              /* Zero Results State */
              <div className="bg-white rounded-2xl border border-line/80 p-8 sm:p-14 text-center max-w-xl mx-auto space-y-5 shadow-2xs">
                <div className="w-14 h-14 rounded-full bg-surface-sunken text-ink-subtle flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6 text-ink-subtle" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-serif text-xl font-bold text-ink">
                    No matching remedies found
                  </h3>
                  <p className="text-xs text-ink-muted max-w-md mx-auto leading-relaxed">
                    We couldn&apos;t find any remedies matching your selected combination. Try adjusting the price slider or clearing some filters.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-inverse hover:bg-surface-inverse-hover text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>

                {recommendedProducts.length > 0 && (
                  <div className="pt-8 border-t border-line text-left space-y-3">
                    <div className="text-xs uppercase tracking-wider font-semibold text-ink-subtle">
                      Recommended Apothecary Formulations:
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
          </div>
        </div>
      </main>

      {/* ═══════════════════════════════════════════════════════════════════════
          3. MOBILE SLIDE-OVER FILTER SHEET
      ═══════════════════════════════════════════════════════════════════════ */}
      <Sheet open={isFilterDrawerOpen} onOpenChange={setIsFilterDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col h-full bg-surface border-line">
          <SheetHeader className="p-5 border-b border-line/80 bg-white">
            <div className="flex items-center justify-between pr-6">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-secondary-text" />
                <SheetTitle className="text-base font-serif font-bold text-ink">
                  Filter Catalog
                </SheetTitle>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-danger hover:text-danger font-medium flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
            <SheetDescription className="text-xs text-ink-muted">
              Refine by price range, customer rating, or availability.
            </SheetDescription>
          </SheetHeader>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-line/80 shadow-2xs">
              {renderFilterSections()}
            </div>
          </div>

          {/* Drawer Sticky Footer */}
          <div className="p-4 border-t border-line bg-white flex items-center gap-3 shadow-lg">
            <button
              type="button"
              onClick={clearAllFilters}
              className="w-1/3 py-3 text-xs font-semibold text-ink-body hover:text-ink border border-line rounded-xl transition-colors cursor-pointer"
            >
              Reset All
            </button>
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(false)}
              className="flex-1 py-3 text-xs font-semibold uppercase tracking-wider bg-surface-inverse hover:bg-surface-inverse-hover text-white rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Show {filteredProducts.length} Remedies
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-ink border-t-transparent animate-spin" />
            <span className="text-xs uppercase tracking-[0.2em] text-ink-muted font-medium">
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
