"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/app/data/products";
import { useCart } from "@/app/context/CartContext";
import {
  ShoppingBag,
  Star,
  Plus,
  Check,
  ArrowRight,
  Sparkles,
  Loader2,
} from "lucide-react";

const CATEGORY_TABS = [
  { id: "all", label: "All Remedies", urdu: "تمام ادویات" },
  { id: "arqiyat", label: "Distillates (Arq)", urdu: "عرقیات" },
  { id: "murabbajaat", label: "Preserves (Murabba)", urdu: "مربہ جات" },
  { id: "oils-marham", label: "Oils & Balms", urdu: "روغنیات" },
  { id: "herbs", label: "Botanicals", urdu: "جڑی بوٹیاں" },
];

export default function CuratedRemediesGrid() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [addingId, setAddingId] = useState<string | null>(null);

  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchRemedies() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setProducts(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to load remedies:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRemedies();
  }, []);

  const filteredProducts =
    activeTab === "all"
      ? products.slice(0, 6)
      : products.filter((p) => p.category === activeTab).slice(0, 6);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingId(product.id);
    const chosenSize =
      product.sizes && product.sizes.length > 0
        ? product.sizes[0]
        : { name: "Standard", weight: "250g", price: product.price };

    addToCart(product, chosenSize, 1);

    setTimeout(() => {
      setAddingId(null);
    }, 800);
  };

  return (
    <section id="remedies-grid" className="py-10 sm:py-16 bg-white border-b border-[#e6dfd5]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#eef7f1] border border-[#cde4d6] text-[#22623a] text-[11px] font-semibold">
              <Sparkles className="w-3 h-3 text-[#c59b27]" />
              <span>Small-Batch Dispensary</span>
            </div>
            <h2 className="font-serif text-xl sm:text-3xl font-bold text-[#22623a]">
              Physician-Formulated Remedies
            </h2>
            <p className="text-xs sm:text-sm text-[#59534b]">
              Handcrafted in sterile batches using 100% natural, unadulterated ingredients.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#22623a] hover:text-[#1a4d2e] underline-offset-4 hover:underline shrink-0"
          >
            <span>View All ({products.length || "150+"})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Category Scroll Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-[#22623a] text-white shadow-2xs"
                    : "bg-[#faf8f5] text-[#59534b] hover:bg-[#f4eee5] border border-[#e6dfd5]"
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] ml-1 opacity-80 font-serif">
                  ({tab.urdu})
                </span>
              </button>
            );
          })}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#6a6660]">
            <Loader2 className="w-6 h-6 animate-spin text-[#22623a]" />
            <span className="text-xs">Loading fresh dispensary stock...</span>
          </div>
        ) : (
          /* 2-Column Mobile Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
            {filteredProducts.map((product) => {
              const isCurrentlyAdding = addingId === product.id;
              const displayPrice = product.sizes?.[0]?.price || product.price;

              return (
                <div
                  key={product.id}
                  className="bg-[#faf8f5] rounded-2xl border border-[#e6dfd5] hover:border-[#22623a]/40 p-3 sm:p-4 flex flex-col justify-between transition-all duration-200 group shadow-2xs hover:shadow-xs"
                >
                  <Link href={`/products/${product.slug}`} className="space-y-2.5 block">
                    {/* Remedy Thumbnail */}
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white border border-[#e6dfd5]/60">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#f4eee5] text-[#6a6660] text-xs">
                          🌿
                        </div>
                      )}

                      {/* Pure Unani Tag */}
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[9px] font-bold text-[#22623a] border border-[#e6dfd5]/60 shadow-2xs">
                        100% Pure
                      </div>
                    </div>

                    {/* Titles */}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-[10px] text-[#8c6a15]">
                        <Star className="w-3 h-3 fill-[#c59b27] text-[#c59b27]" />
                        <span className="font-bold">5.0</span>
                        <span className="text-[#6a6660]">({product.reviewCount || 24})</span>
                      </div>

                      <h3 className="font-serif text-xs sm:text-sm font-bold text-[#1e1c19] group-hover:text-[#22623a] transition-colors line-clamp-1">
                        {product.name}
                      </h3>

                      {product.urduName && (
                        <p className="text-[11px] text-[#8c6a15] font-serif line-clamp-1">
                          {product.urduName}
                        </p>
                      )}
                    </div>
                  </Link>

                  {/* Price & Quick Add Button */}
                  <div className="pt-2.5 mt-2 border-t border-[#e6dfd5] flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-[#22623a]">
                        ₨ {displayPrice.toLocaleString()}
                      </div>
                      <div className="text-[9px] text-[#6a6660]">
                        {product.sizes?.[0]?.weight || "Standard"}
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      type="button"
                      disabled={isCurrentlyAdding}
                      className={`p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                        isCurrentlyAdding
                          ? "bg-[#22623a] text-white"
                          : "bg-white hover:bg-[#22623a] text-[#22623a] hover:text-white border border-[#cde4d6] active:scale-95"
                      }`}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      {isCurrentlyAdding ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Free Shipping Reassurance Micro-Banner */}
        <div className="p-3 rounded-xl bg-[#f4eee5] border border-[#e6dfd5] flex items-center justify-between text-xs text-[#59534b]">
          <span className="font-semibold text-[#22623a]">
            🚚 Free Delivery on orders above ₨ 2,000
          </span>
          <span className="text-[11px] text-[#8c6a15] font-bold">
            Cash on Delivery
          </span>
        </div>

      </div>
    </section>
  );
}
