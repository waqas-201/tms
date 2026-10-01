"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ProductSize } from "@/app/data/products";
import { useCart } from "@/app/context/CartContext";
import ProductQuickViewModal from "./ProductQuickViewModal";
import {
  ShoppingBag,
  Star,
  Eye,
  Heart,
  Check,
  Snowflake,
  Flame,
  Scale,
  Plus,
} from "lucide-react";

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
}

export default function ProductCard({
  product,
  viewMode = "grid",
}: ProductCardProps) {
  const { addToCart, isInWishlist, toggleWishlist } = useCart();

  // Active selected size variant (defaults to first size or standard fallback)
  const [selectedSize, setSelectedSize] = useState<ProductSize>(() => {
    return product.sizes && product.sizes.length > 0
      ? product.sizes[0]
      : { name: "Standard", weight: "250g", price: product.price };
  });

  // Sync state if product prop updates
  useEffect(() => {
    if (product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    } else {
      setSelectedSize({ name: "Standard", weight: "250g", price: product.price });
    }
  }, [product]);

  const [isAdded, setIsAdded] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const isSaved = isInWishlist(product.id);

  // Live stock check for active size variant
  const isAvailable =
    selectedSize.available !== undefined
      ? selectedSize.available > 0
      : selectedSize.isActive !== undefined
      ? selectedSize.isActive
      : product.inStock;

  const isLowStock =
    selectedSize.available !== undefined &&
    selectedSize.available > 0 &&
    selectedSize.available <= (selectedSize.lowStockThreshold || 5);

  // Dynamic discount calculation
  const calculatedDiscount =
    selectedSize.originalPrice && selectedSize.originalPrice > selectedSize.price
      ? Math.round(
          ((selectedSize.originalPrice - selectedSize.price) /
            selectedSize.originalPrice) *
            100
        )
      : product.discountPercentage;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAvailable) return;
    addToCart(product, selectedSize, 1);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1800);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  // Helper for Mizaj icon indicator
  const renderMizajIcon = () => {
    if (!product.mizaj) return null;
    const mz = product.mizaj.toLowerCase();
    if (mz.includes("sard") || mz.includes("cool")) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] text-sky-700 font-medium" title={`Mizaj: ${product.mizaj}`}>
          <Snowflake className="w-2.5 h-2.5 text-sky-500" />
          <span>Sard</span>
        </span>
      );
    }
    if (mz.includes("garm") || mz.includes("warm") || mz.includes("haar")) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-medium" title={`Mizaj: ${product.mizaj}`}>
          <Flame className="w-2.5 h-2.5 text-amber-500" />
          <span>Garm</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-stone-600 font-medium" title={`Mizaj: ${product.mizaj}`}>
        <Scale className="w-2.5 h-2.5 text-emerald-600" />
        <span>Mo&apos;tadil</span>
      </span>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST VIEW LAYOUT (Minimal Editorial Row)
  // ═══════════════════════════════════════════════════════════════════════════
  if (viewMode === "list") {
    return (
      <>
        <div className="group bg-white rounded-xl border border-stone-200/70 hover:border-stone-400/80 transition-all duration-300 p-4 sm:p-5 flex flex-col md:flex-row gap-5 items-start">
          {/* Image Thumbnail */}
          <div className="relative w-full md:w-44 aspect-square bg-[#F7F6F2] rounded-lg overflow-hidden shrink-0">
            <Link href={`/products/${product.slug}`} className="block w-full h-full">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover object-center group-hover:scale-103 transition-transform duration-500 ease-out"
                sizes="(max-width: 768px) 100vw, 180px"
              />
            </Link>

            {/* Badges */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
              {product.badge && (
                <span className="bg-[#14281D] text-white text-[9px] font-medium tracking-widest uppercase px-2 py-0.5 rounded shadow-2xs">
                  {product.badge}
                </span>
              )}
              {calculatedDiscount && calculatedDiscount > 0 ? (
                <span className="bg-[#9E7D3B] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs">
                  -{calculatedDiscount}%
                </span>
              ) : null}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={handleToggleWishlist}
              className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-xs transition-colors z-10 ${
                isSaved
                  ? "bg-white text-rose-500 shadow-2xs"
                  : "bg-white/80 text-stone-500 hover:text-rose-500 hover:bg-white"
              }`}
              title={isSaved ? "Saved" : "Save to Wishlist"}
              aria-label="Toggle Wishlist"
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-rose-500" : ""}`} />
            </button>
          </div>

          {/* Center Info */}
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-stone-400">
                {product.categoryLabel}
              </span>
              <span className="text-stone-300">•</span>
              <div className="flex items-center gap-1 text-stone-600 text-xs">
                <Star className="w-3 h-3 fill-[#9E7D3B] text-[#9E7D3B]" />
                <span className="font-semibold text-stone-800 text-[11px]">{product.rating}</span>
                <span className="text-stone-400 text-[10px]">({product.reviewCount})</span>
              </div>
              {renderMizajIcon() && (
                <>
                  <span className="text-stone-300">•</span>
                  {renderMizajIcon()}
                </>
              )}
            </div>

            <Link href={`/products/${product.slug}`} className="block group/title">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-serif text-lg font-semibold text-stone-900 group-hover/title:text-[#14281D] transition-colors leading-snug">
                  {product.name}
                </h3>
                {product.urduName && (
                  <span className="font-urdu text-sm text-stone-400 shrink-0 font-normal">
                    {product.urduName}
                  </span>
                )}
              </div>
            </Link>

            <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">
              {product.traditionalPurpose || product.shortDescription}
            </p>

            {/* Packaging Variant Pills */}
            {product.sizes && product.sizes.length > 1 && (
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">Size:</span>
                <div className="flex flex-wrap gap-1">
                  {product.sizes.map((sz) => {
                    const isSelected = selectedSize.name === sz.name;
                    return (
                      <button
                        key={sz.name}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedSize(sz);
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#14281D] text-white border-[#14281D] font-medium"
                            : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                        }`}
                      >
                        {sz.weight}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Pricing & Actions */}
          <div className="w-full md:w-44 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-stone-100 md:pl-5 flex flex-col justify-between self-stretch shrink-0 space-y-3">
            <div>
              <div className="text-lg font-bold text-stone-900">
                ₨ {selectedSize.price.toLocaleString()}
              </div>
              {selectedSize.originalPrice && selectedSize.originalPrice > selectedSize.price && (
                <div className="text-xs text-stone-400 line-through">
                  ₨ {selectedSize.originalPrice.toLocaleString()}
                </div>
              )}
              {isLowStock && (
                <span className="text-[10px] text-amber-700 font-medium block mt-0.5">
                  Only {selectedSize.available} left
                </span>
              )}
              {!isAvailable && (
                <span className="text-[10px] text-rose-600 font-medium block mt-0.5">
                  Out of Stock
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!isAvailable}
                className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium tracking-wider uppercase transition-all duration-200 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                  !isAvailable
                    ? "bg-stone-200 text-stone-500"
                    : isAdded
                    ? "bg-[#2d7648] text-white"
                    : "bg-[#14281D] hover:bg-[#0c1b13] text-white"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5 text-[#9E7D3B]" />
                    <span>Add to Bag</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleQuickView}
                className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <Eye className="w-3 h-3" />
                <span>Quick View</span>
              </button>
            </div>
          </div>
        </div>

        <ProductQuickViewModal
          product={product}
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
        />
      </>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GRID VIEW LAYOUT (Elite Minimalist Image-First Card)
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <>
      <div className="group bg-white rounded-xl border border-stone-200/60 hover:border-stone-300 hover:shadow-xs transition-all duration-300 flex flex-col overflow-hidden h-full">
        {/* Image Canvas */}
        <div className="relative block aspect-square w-full bg-[#F7F6F2] overflow-hidden">
          <Link href={`/products/${product.slug}`} className="block w-full h-full">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover object-center group-hover:scale-104 transition-transform duration-500 ease-out"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </Link>

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 pointer-events-none">
            {product.badge && (
              <span className="bg-[#14281D] text-white text-[9px] font-medium tracking-widest uppercase px-2 py-0.5 rounded shadow-2xs">
                {product.badge}
              </span>
            )}
            {calculatedDiscount && calculatedDiscount > 0 ? (
              <span className="bg-[#9E7D3B] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs">
                -{calculatedDiscount}%
              </span>
            ) : null}
          </div>

          {/* Top Right Floating Wishlist & Quick View */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
            <button
              onClick={handleToggleWishlist}
              className={`p-2 rounded-full backdrop-blur-xs transition-colors shadow-2xs cursor-pointer ${
                isSaved
                  ? "bg-white text-rose-500 shadow-xs"
                  : "bg-white/80 text-stone-500 hover:text-rose-500 hover:bg-white"
              }`}
              title={isSaved ? "Saved to Wishlist" : "Save to Wishlist"}
              aria-label="Toggle Wishlist"
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-rose-500" : ""}`} />
            </button>

            <button
              onClick={handleQuickView}
              className="p-2 rounded-full bg-white/80 hover:bg-white text-stone-700 shadow-2xs transition-all opacity-0 group-hover:opacity-100 hover:scale-105 cursor-pointer"
              title="Quick View"
              aria-label="Quick View"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card Details */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            {/* Category & Rating */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-stone-400 truncate">
                {product.categoryLabel}
              </span>
              <div className="flex items-center gap-1 text-stone-600 shrink-0">
                <Star className="w-2.5 h-2.5 fill-[#9E7D3B] text-[#9E7D3B]" />
                <span className="text-[10px] font-semibold text-stone-700">
                  {product.rating}
                </span>
                <span className="text-[9px] text-stone-400">
                  ({product.reviewCount})
                </span>
              </div>
            </div>

            {/* Product Title */}
            <Link href={`/products/${product.slug}`} className="block group/title">
              <div className="flex items-baseline justify-between gap-1.5">
                <h3 className="font-serif text-[15px] font-semibold text-stone-900 group-hover/title:text-[#14281D] transition-colors line-clamp-1 leading-snug">
                  {product.name}
                </h3>
                {product.urduName && (
                  <span className="font-urdu text-xs text-stone-400 shrink-0 font-normal">
                    {product.urduName}
                  </span>
                )}
              </div>
            </Link>

            {/* Short subtitle / purpose */}
            <p className="text-[11px] text-stone-500 line-clamp-1 leading-relaxed">
              {product.traditionalPurpose || product.shortDescription}
            </p>
          </div>

          {/* Size Pills & Pricing / Quick Add */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            {/* Minimal Size Pills if multiple */}
            {product.sizes && product.sizes.length > 1 ? (
              <div className="flex flex-wrap gap-1">
                {product.sizes.map((sz) => {
                  const isSelected = selectedSize.name === sz.name;
                  return (
                    <button
                      key={sz.name}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedSize(sz);
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#14281D] text-white border-[#14281D] font-medium"
                          : "bg-stone-50 text-stone-600 border-stone-200/80 hover:border-stone-400"
                      }`}
                    >
                      {sz.weight}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {/* Price & Add Action */}
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <div>
                <div className="text-base font-semibold text-stone-900 leading-none">
                  ₨ {selectedSize.price.toLocaleString()}
                </div>
                {selectedSize.originalPrice && selectedSize.originalPrice > selectedSize.price && (
                  <div className="text-[10px] text-stone-400 line-through mt-0.5">
                    ₨ {selectedSize.originalPrice.toLocaleString()}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!isAvailable}
                className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium tracking-wide uppercase transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                  !isAvailable
                    ? "bg-stone-200 text-stone-500"
                    : isAdded
                    ? "bg-[#2d7648] text-white"
                    : "bg-[#14281D] hover:bg-[#0c1b13] text-white"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ProductQuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}
