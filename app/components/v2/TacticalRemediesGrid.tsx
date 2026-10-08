"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ProductSize, CLINIC_INFO } from "@/app/data/products";
import { useCart } from "@/app/context/CartContext";
import ProductQuickViewModal from "@/app/components/ProductQuickViewModal";
import {
  ShoppingBag,
  Star,
  Check,
  ArrowRight,
  Sparkles,
  Loader2,
  MessageCircle,
  Eye,
  Zap,
} from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "All Remedies", urdu: "تمام ادویات" },
  { id: "arqiyat", label: "Distillates (Arq)", urdu: "عرقیات" },
  { id: "murabbajaat", label: "Preserves (Murabba)", urdu: "مربہ جات" },
  { id: "oils-marham", label: "Oils & Balms", urdu: "روغنیات" },
  { id: "herbs", label: "Single Herbs", urdu: "جڑی بوٹیاں" },
];

export default function TacticalRemediesGrid() {
  const [activeCat, setActiveCat] = useState<string>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, ProductSize>>({});
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

  const { addToCart, setIsCartOpen } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setProducts(json.data);
            // Default select first size for each product
            const defaultMap: Record<string, ProductSize> = {};
            json.data.forEach((p: Product) => {
              if (p.sizes && p.sizes.length > 0) {
                defaultMap[p.id] = p.sizes[0];
              }
            });
            setSelectedSizes(defaultMap);
          }
        }
      } catch (err) {
        console.error("Failed to load tactical remedies:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filteredProducts =
    activeCat === "all"
      ? products.slice(0, 8)
      : products.filter((p) => p.category === activeCat).slice(0, 8);

  const handleSizeSelect = (productId: string, size: ProductSize, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handle1TapCOD = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingId(product.id);

    const chosenSize =
      selectedSizes[product.id] ||
      (product.sizes && product.sizes.length > 0
        ? product.sizes[0]
        : { name: "Standard", weight: "250g", price: product.price });

    addToCart(product, chosenSize, 1);
    setIsCartOpen(true);

    setTimeout(() => {
      setAddingId(null);
    }, 600);
  };

  const getWhatsAppProductUrl = (product: Product) => {
    const chosenSize =
      selectedSizes[product.id] ||
      (product.sizes && product.sizes.length > 0 ? product.sizes[0] : null);

    const sizeText = chosenSize ? ` (${chosenSize.weight || chosenSize.name} - ₨ ${chosenSize.price})` : "";
    return `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(
      `Assalam-o-Alaikum Tameer-e-Sehat! I want to order "${product.name}"${sizeText} for Cash on Delivery.`
    )}`;
  };

  return (
    <>
      <section id="remedies-grid" className="py-12 sm:py-16 bg-white border-b border-[#E5EDE5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F5F0] border border-[#D1DEC9] text-[#0F2E1E] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#C86A4B]" />
                <span>Small-Batch Botanical Dispensary</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F2E1E]">
                Tactical Herbal Remedies
              </h2>
              <p className="text-xs sm:text-sm text-[#5A6860]">
                Select your required weight & order with 1-Tap Cash on Delivery or WhatsApp.
              </p>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0F2E1E] hover:text-[#C86A4B] transition-colors shrink-0 group"
            >
              <span>Explore All ({products.length || "150+"})</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map((cat) => {
              const active = activeCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCat(cat.id)}
                  type="button"
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? "bg-[#0F2E1E] text-white shadow-xs"
                      : "bg-[#FAF9F5] text-[#5A6860] hover:bg-[#F0F5F0] border border-[#E5EDE5]"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className="text-[11px] ml-1.5 opacity-80 font-serif">
                    ({cat.urdu})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-[#5A6860]">
              <Loader2 className="w-7 h-7 animate-spin text-[#0F2E1E]" />
              <span className="text-xs sm:text-sm">Loading dispensary stock...</span>
            </div>
          ) : (
            /* Tactical Cards Grid (2-Col Mobile / 4-Col Desktop) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {filteredProducts.map((product) => {
                const currentSize =
                  selectedSizes[product.id] ||
                  (product.sizes && product.sizes.length > 0
                    ? product.sizes[0]
                    : { name: "Standard", weight: "250g", price: product.price });

                const isAdding = addingId === product.id;

                return (
                  <div
                    key={product.id}
                    className="bg-[#FAF9F5] rounded-3xl border border-[#E5EDE5] hover:border-[#0F2E1E]/40 p-4 flex flex-col justify-between transition-all duration-300 group shadow-2xs hover:shadow-md"
                  >
                    <div className="space-y-3">
                      {/* Image Frame with Quick View */}
                      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-[#E5EDE5]">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">
                            🌿
                          </div>
                        )}

                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/95 text-[10px] font-bold text-[#0F2E1E] shadow-2xs">
                          100% Pure
                        </div>

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setQuickViewProduct(product);
                          }}
                          type="button"
                          className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white text-[#0F2E1E] flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer"
                          title="Quick View Info"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-1 text-[11px] text-[#C86A4B] font-bold mb-1">
                          <Star className="w-3 h-3 fill-[#C86A4B]" />
                          <span>5.0</span>
                          <span className="text-[#5A6860] font-normal">
                            ({product.reviewCount || 28} reviews)
                          </span>
                        </div>

                        <Link href={`/products/${product.slug}`} className="block">
                          <h3 className="font-serif text-sm sm:text-base font-bold text-[#0F2E1E] group-hover:text-[#0F2E1E] line-clamp-1">
                            {product.name}
                          </h3>
                          {product.urduName && (
                            <p className="text-xs text-[#C86A4B] font-serif line-clamp-1">
                              {product.urduName}
                            </p>
                          )}
                        </Link>
                      </div>

                      {/* Inline Weight Variant Selector Pills */}
                      {product.sizes && product.sizes.length > 1 && (
                        <div className="space-y-1">
                          <div className="text-[10px] uppercase font-bold text-[#5A6860]">
                            Select Packaging Weight:
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {product.sizes.map((s, idx) => {
                              const isSelected =
                                currentSize.name === s.name || currentSize.weight === s.weight;
                              return (
                                <button
                                  key={idx}
                                  onClick={(e) => handleSizeSelect(product.id, s, e)}
                                  type="button"
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                    isSelected
                                      ? "bg-[#0F2E1E] text-white"
                                      : "bg-white text-[#2D3A32] border border-[#E5EDE5] hover:bg-[#F0F5F0]"
                                  }`}
                                >
                                  {s.weight || s.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Price & Dual Quick Action CTAs */}
                    <div className="pt-3 mt-3 border-t border-[#E5EDE5] space-y-2">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <div className="text-base sm:text-lg font-bold text-[#0F2E1E]">
                            ₨ {currentSize.price.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-[#5A6860]">
                            {currentSize.weight || currentSize.name} · COD Available
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        {/* 1-Tap COD */}
                        <button
                          onClick={(e) => handle1TapCOD(product, e)}
                          type="button"
                          disabled={isAdding}
                          className="py-2 px-2 bg-[#0F2E1E] hover:bg-[#1E382B] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 shadow-2xs cursor-pointer"
                        >
                          {isAdding ? (
                            <Check className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5 text-[#E8AF57]" />
                              <span>1-Tap COD</span>
                            </>
                          )}
                        </button>

                        {/* WhatsApp Order */}
                        <a
                          href={getWhatsAppProductUrl(product)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-2 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 shadow-2xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-white" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

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
