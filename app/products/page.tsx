"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PRODUCTS, CATEGORIES } from "@/app/data/products";
import { useLanguage } from "@/app/context/LanguageContext";
import ProductCard from "@/app/components/ProductCard";
import { Search, Sparkles, SlidersHorizontal, Truck, ShieldCheck } from "lucide-react";

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const { t, isUrdu } = useLanguage();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("featured");

  const filteredProducts = useMemo(() => {
    let list = [...PRODUCTS];

    // Category filter
    if (selectedCategory !== "all") {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.urduName.includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.benefits.some((b) => b.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === "price-low") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else {
      // featured
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return list;
  }, [selectedCategory, searchQuery, sortBy]);

  const activeCategoryInfo = CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <div className="bg-[#faf8f5]">
      {/* Header Banner */}
      <section className="relative py-14 sm:py-18 bg-[#123824] text-white border-b border-[#1a4d33] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#1a4d33]/50 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#c59b27]/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-[#c59b27]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isUrdu ? "مستند قرابادین و ادویہ سازی" : "Classical Botanical Pharmacopeia"}</span>
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            {isUrdu ? "یونانی دواخانہ و قرابادین" : "The Herbal Apothecary"}
          </h1>
          <p className="font-urdu text-lg sm:text-xl text-[#f4eee5]/90 font-medium" dir="rtl">
            مستند قرابادین و قدیم نسخہ جات · خالص یونانی ادویات و مربہ جات
          </p>
          <p className="text-xs sm:text-sm text-[#f4eee5]/80 max-w-xl mx-auto leading-relaxed">
            {isUrdu
              ? "ہمارے تمام مربہ جات، عرقات اور دردنوار روغنیات خالص جڑی بوٹیوں سے محدود دستکاری مقدار میں بغیر کیمیکل تیار کیے جاتے ہیں۔"
              : "Every preserve, distillate, and therapeutic oil is handcrafted in small batches using whole, unadulterated botanicals without synthetic chemicals."}
          </p>
        </div>
      </section>

      {/* Main Catalog View */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Search, Filter & Sort Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-[#e6dfd5] shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#6a6660] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchRemedies")}
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] placeholder-[#6a6660] focus:outline-none focus:border-[#123824] focus:bg-white transition-colors"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6a6660] flex items-center gap-1 shrink-0 font-medium">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isUrdu ? "ترتیب:" : "Sort:"}</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#123824] font-medium focus:outline-none focus:border-[#123824]"
            >
              <option value="featured">{isUrdu ? "نمایاں و مقبول ادویات" : "Featured & Best Sellers"}</option>
              <option value="rating">{isUrdu ? "اعلیٰ ترین درجہ بندی" : "Highest Rated"}</option>
              <option value="price-low">{isUrdu ? "قیمت: کم سے زیادہ" : "Price: Low to High"}</option>
              <option value="price-high">{isUrdu ? "قیمت: زیادہ سے کم" : "Price: High to Low"}</option>
            </select>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`text-xs px-4 py-2 rounded-full font-medium transition-all shrink-0 ${
              selectedCategory === "all"
                ? "bg-[#123824] text-white shadow-xs"
                : "bg-white text-[#59534b] border border-[#e6dfd5] hover:border-[#123824]"
            }`}
          >
            {isUrdu ? `تمام ادویات (${PRODUCTS.length})` : `All Formulations (${PRODUCTS.length})`}
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs px-4 py-2 rounded-full font-medium transition-all shrink-0 ${
                selectedCategory === cat.id
                  ? "bg-[#123824] text-white shadow-xs"
                  : "bg-white text-[#59534b] border border-[#e6dfd5] hover:border-[#123824]"
              }`}
            >
              <span>{isUrdu ? cat.urduName : cat.name.split(" ")[0]}</span>{" "}
              {!isUrdu && <span className="font-urdu text-[11px] opacity-80">({cat.urduName})</span>}
            </button>
          ))}
        </div>

        {/* Active Category Description Notice */}
        {activeCategoryInfo && (
          <div className="p-4 sm:p-5 bg-white rounded-xl border border-[#e6dfd5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-base font-bold text-[#123824]">
                  {activeCategoryInfo.name}
                </h2>
                <span className="font-urdu text-sm font-semibold text-[#c59b27]">
                  {activeCategoryInfo.urduName}
                </span>
              </div>
              <p className="text-xs text-[#59534b] max-w-2xl leading-relaxed">
                {activeCategoryInfo.description}
              </p>
            </div>
            <span className="text-xs font-semibold text-[#123824] bg-[#faf8f5] px-3 py-1.5 rounded border border-[#e6dfd5] self-start sm:self-auto shrink-0">
              {filteredProducts.length} {isUrdu ? "دستیاب" : "Available"}
            </span>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-xl border border-[#e6dfd5] p-8 space-y-3">
            <p className="text-sm font-medium text-[#123824]">
              {isUrdu ? "آپ کی تلاش کے مطابق کوئی دوا نہیں ملی۔" : "No formulations found matching your criteria."}
            </p>
            <p className="text-xs text-[#6a6660]">
              {isUrdu ? "براہِ کرم نیا لفظ تلاش کریں یا کوئی اور زمرہ منتخب کریں۔" : "Try resetting your search query or selecting another category."}
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="mt-2 inline-block px-4 py-2 bg-[#123824] text-white text-xs font-medium rounded-md"
            >
              {isUrdu ? "فلٹرز صاف کریں" : "Clear Filters"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Bottom Trust & Delivery Guarantee Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
          <div className="p-6 bg-white rounded-xl border border-[#e6dfd5] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#123824] text-[#c59b27] flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-bold text-[#123824]">
                {isUrdu ? "2,000 روپے سے زائد کے آرڈر پر مفت ترسیل" : "Free Shipping on Orders Above ₨ 2,000"}
              </h4>
              <p className="text-xs text-[#6a6660] mt-0.5">
                {isUrdu ? "پورے پاکستان میں تیز رفتار کیش آن ڈیلیوری سہولت۔" : "Pakistan-wide courier delivery with Cash on Delivery (COD) service."}
              </p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-xl border border-[#e6dfd5] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#123824] text-[#c59b27] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-bold text-[#123824]">
                {isUrdu ? "100% خالص نباتاتی و کیمیکل سے پاک" : "100% Herbal Purity & Authenticity"}
              </h4>
              <p className="text-xs text-[#6a6660] mt-0.5">
                {isUrdu ? "سٹیرائیڈ اور مصنوعی کیمیکلز سے مکمل پاک، روایتی طبی اصولوں پر تیار۔" : "Guaranteed chemical-free, steroid-free, and prepared under traditional Tibbi oversight."}
              </p>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-[#6a6660]">Loading apothecary...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
