"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/app/data/products";
import { useCart } from "@/app/context/CartContext";
import ProductQuickViewModal from "@/app/components/ProductQuickViewModal";
import Reveal from "@/app/components/motion/Reveal";
import {
  ShoppingBag,
  Star,
  Plus,
  Check,
  ArrowRight,
  Sparkles,
  Loader2,
  Eye,
  ShieldCheck,
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
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

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
      ? products.slice(0, 8)
      : products.filter((p) => p.category === activeTab).slice(0, 8);

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

  const handleQuickView = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  return (
    <>
      <section id="remedies-grid" className="py-12 sm:py-16 lg:py-20 bg-white border-b border-[#e6dfd5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">

          {/* Section Header */}
          <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eef7f1] border border-[#cde4d6] text-[#22623a] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>Small-Batch Dispensary</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#22623a] leading-tight">
                Physician-Formulated Remedies
              </h2>
              <p className="text-xs sm:text-sm text-[#59534b]">
                Handcrafted pure steam distillates (Arqiyat) and fruit preserves prepared without steroids or artificial preservatives.
              </p>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#faf8f5] hover:bg-[#eef7f1] border border-[#cde4d6] text-[#22623a] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs shrink-0 self-start md:self-auto group"
            >
              <span>View All ({products.length || "150+"})</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Reveal>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#22623a] text-white shadow-xs"
                      : "bg-[#faf8f5] text-[#59534b] hover:bg-[#f4eee5] border border-[#e6dfd5]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[11px] ml-1.5 opacity-80 font-serif">
                    ({tab.urdu})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-[#6a6660]">
              <Loader2 className="w-7 h-7 animate-spin text-[#22623a]" />
              <span className="text-xs sm:text-sm">Loading fresh dispensary stock...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {filteredProducts.map((product) => {
                const isCurrentlyAdding = addingId === product.id;
                const displayPrice = product.sizes?.[0]?.price || product.price;
                const originalPrice = product.sizes?.[0]?.originalPrice || product.originalPrice;
                const hasDiscount = originalPrice && originalPrice > displayPrice;

                return (
                  <div
                    key={product.id}
                    className="bg-[#faf8f5] rounded-2xl border border-[#e6dfd5] hover:border-[#22623a]/40 p-3 sm:p-4 flex flex-col justify-between transition-all duration-300 group shadow-2xs hover:shadow-luxury-hover"
                  >
                    <Link href={`/products/${product.slug}`} className="space-y-3 block">
                      {/* Product Visual Container */}
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white border border-[#e6dfd5]/60">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#f4eee5] text-[#6a6660] text-sm">
                            🌿
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          <span className="px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-[9px] sm:text-[10px] font-bold text-[#22623a] border border-[#e6dfd5]/80 shadow-2xs">
                            100% Pure
                          </span>
                          {hasDiscount && (
                            <span className="px-2 py-0.5 rounded-md bg-[#c59b27] text-white text-[9px] sm:text-[10px] font-bold shadow-2xs">
                              Save ₨ {(originalPrice! - displayPrice).toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Quick View Button on Image */}
                        <button
                          onClick={(e) => handleQuickView(product, e)}
                          type="button"
                          className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#22623a] flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 cursor-pointer"
                          aria-label={`Quick view ${product.name}`}
                          title="Quick View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Product Info */}
                      <div className="space-y-1">
                        {/* Rating */}
                        <div className="flex items-center gap-1 text-[11px] text-[#8c6a15]">
                          <Star className="w-3 h-3 fill-[#c59b27] text-[#c59b27]" />
                          <span className="font-bold">5.0</span>
                          <span className="text-[#6a6660]">({product.reviewCount || 24})</span>
                        </div>

                        {/* English Title */}
                        <h3 className="font-serif text-xs sm:text-sm font-bold text-[#1e1c19] group-hover:text-[#22623a] transition-colors line-clamp-1">
                          {product.name}
                        </h3>

                        {/* Urdu Subtitle */}
                        {product.urduName && (
                          <p className="text-[11px] text-[#8c6a15] font-serif line-clamp-1">
                            {product.urduName}
                          </p>
                        )}
                      </div>
                    </Link>

                    {/* Price & Quick Add Button */}
                    <div className="pt-3 mt-2 border-t border-[#e6dfd5] flex items-center justify-between gap-2">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xs sm:text-sm font-bold text-[#22623a]">
                            ₨ {displayPrice.toLocaleString()}
                          </span>
                          {hasDiscount && (
                            <span className="text-[10px] text-[#6a6660] line-through">
                              ₨ {originalPrice!.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#6a6660]">
                          {product.sizes?.[0]?.weight || "Standard"}
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        type="button"
                        disabled={isCurrentlyAdding}
                        className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          isCurrentlyAdding
                            ? "bg-[#22623a] text-white"
                            : "bg-white hover:bg-[#22623a] text-[#22623a] hover:text-white border border-[#cde4d6] active:scale-95 shadow-2xs hover:shadow-xs"
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

          {/* Delivery & Assurance Banner */}
          <div className="p-4 rounded-2xl bg-[#f4eee5] border border-[#e6dfd5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#59534b]">
            <div className="flex items-center gap-2 font-semibold text-[#22623a]">
              <ShieldCheck className="w-4 h-4 text-[#22623a]" />
              <span>Free Nationwide Delivery on orders above ₨ 2,000</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[#8c6a15] font-bold">
              <span>✓ Cash on Delivery</span>
              <span>•</span>
              <span>✓ Sterile Packaging</span>
              <span>•</span>
              <span>✓ Direct Clinic Support</span>
            </div>
          </div>

        </div>
      </section>

      {/* Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </>
  );
}
