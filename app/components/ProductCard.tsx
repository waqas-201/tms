"use client";

import React, { useState } from "react";
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
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
}

export default function ProductCard({
  product,
  viewMode = "grid",
}: ProductCardProps) {
  const { addToCart, wishlist, toggleWishlist, isInWishlist } = useCart();
  const [selectedSize, setSelectedSize] = useState<ProductSize>(
    product.sizes[0] || { name: "Standard", weight: "250g", price: product.price }
  );
  const [isAdded, setIsAdded] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const isSaved = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  // ─── LIST VIEW LAYOUT ───
  if (viewMode === "list") {
    return (
      <>
        <div className="group bg-white rounded-2xl border border-[#e6dfd5] hover:border-[#22623a]/40 transition-all duration-300 shadow-xs hover:shadow-md p-4 sm:p-5 flex flex-col md:flex-row gap-5 items-start">
          {/* Product Image */}
          <div className="relative w-full md:w-52 aspect-square md:aspect-auto md:h-52 bg-[#f6f2ea] rounded-xl overflow-hidden shrink-0">
            <Link href={`/products/${product.slug}`} className="block w-full h-full">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                sizes="(max-width: 768px) 100vw, 220px"
              />
            </Link>

            {/* Top Badges */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
              {product.badge && (
                <span className="bg-[#22623a] text-white text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded shadow-xs">
                  {product.badge}
                </span>
              )}
              {product.discountPercentage && product.discountPercentage > 0 && (
                <span className="bg-[#c59b27] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                  -{product.discountPercentage}%
                </span>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={handleToggleWishlist}
              className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-xs transition-colors z-10 shadow-xs ${
                isSaved
                  ? "bg-white text-red-500"
                  : "bg-white/80 text-[#59534b] hover:text-red-500 hover:bg-white"
              }`}
              title={isSaved ? "Saved to Wishlist" : "Save to Wishlist"}
              aria-label="Toggle Wishlist"
            >
              <Heart className={`w-4 h-4 ${isSaved ? "fill-red-500" : ""}`} />
            </button>
          </div>

          {/* Product Details (Middle) */}
          <div className="flex-1 space-y-3 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#c59b27]">
                {product.categoryLabel}
              </span>
              <span className="text-[#a59f95]">•</span>
              <div className="flex items-center gap-1 text-[#c59b27] text-xs">
                <Star className="w-3.5 h-3.5 fill-[#c59b27]" />
                <span className="font-semibold text-[#1a1816]">{product.rating}</span>
                <span className="text-[#6a6660]">({product.reviewCount})</span>
              </div>
            </div>

            <Link href={`/products/${product.slug}`} className="block">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#22623a] group-hover:text-[#c59b27] transition-colors leading-snug">
                {product.name}
              </h3>
            </Link>

            <p className="text-xs text-[#59534b] leading-relaxed line-clamp-2">
              {product.traditionalPurpose}
            </p>

            {/* Key Benefit Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {product.benefits.slice(0, 2).map((b, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[11px] text-[#22623a] bg-[#f4f9f5] border border-[#d8ecde] px-2 py-0.5 rounded"
                >
                  <CheckCircle2 className="w-3 h-3 text-[#2d7648]" />
                  <span>{b}</span>
                </span>
              ))}
            </div>

            {/* Size Variants */}
            {product.sizes.length > 1 && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-[#6a6660] font-semibold">Sizes:</span>
                <div className="flex flex-wrap gap-1.5">
                  {product.sizes.map((sz) => {
                    const isSelected = selectedSize.name === sz.name;
                    return (
                      <button
                        key={sz.name}
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedSize(sz);
                        }}
                        className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                          isSelected
                            ? "bg-[#22623a] text-white border-[#22623a] font-medium"
                            : "bg-[#faf8f5] text-[#59534b] border-[#e6dfd5] hover:border-[#22623a]"
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

          {/* Pricing & CTA (Right) */}
          <div className="w-full md:w-48 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-[#f4eee5] md:pl-5 flex flex-col justify-between self-stretch shrink-0 space-y-3">
            <div>
              <div className="text-xl font-bold text-[#22623a]">
                ₨ {selectedSize.price.toLocaleString()}
              </div>
              {selectedSize.originalPrice && selectedSize.originalPrice > selectedSize.price && (
                <div className="text-xs text-[#7a7268] line-through">
                  ₨ {selectedSize.originalPrice.toLocaleString()}
                </div>
              )}
              <span className="text-[10px] text-[#2d7648] font-semibold flex items-center gap-1 mt-1">
                <Check className="w-3 h-3" /> Ready to Dispatch
              </span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all duration-200 active:scale-95 ${
                  isAdded
                    ? "bg-[#2d7648] text-white shadow-xs"
                    : "bg-[#22623a] hover:bg-[#1b502e] text-white shadow-xs hover:shadow-md"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5 text-[#c59b27]" />
                    <span>Add to Bag</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleQuickView}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-[#59534b] hover:text-[#22623a] bg-[#faf8f5] hover:bg-[#f0eae1] border border-[#e6dfd5] transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
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

  // ─── GRID VIEW LAYOUT (DEFAULT) ───
  return (
    <>
      <div className="group bg-white rounded-2xl border border-[#e6dfd5] hover:border-[#22623a]/40 transition-all duration-300 shadow-xs hover:shadow-luxury-hover hover:-translate-y-1 flex flex-col overflow-hidden">
        {/* Image Container */}
        <div className="relative block aspect-square w-full bg-[#f6f2ea] overflow-hidden">
          <Link href={`/products/${product.slug}`} className="block w-full h-full">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </Link>

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
            {product.badge && (
              <span className="bg-[#22623a] text-white text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded shadow-xs">
                {product.badge}
              </span>
            )}
            {product.discountPercentage && product.discountPercentage > 0 && (
              <span className="bg-[#c59b27] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                -{product.discountPercentage}%
              </span>
            )}
          </div>

          {/* Action Buttons Top Right: Wishlist & Quick View */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
            {/* Wishlist Button */}
            <button
              onClick={handleToggleWishlist}
              className={`p-2 rounded-full backdrop-blur-xs transition-colors shadow-xs ${
                isSaved
                  ? "bg-white text-red-500"
                  : "bg-white/85 text-[#59534b] hover:text-red-500 hover:bg-white"
              }`}
              title={isSaved ? "Saved to Wishlist" : "Save to Wishlist"}
              aria-label="Toggle Wishlist"
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-red-500" : ""}`} />
            </button>

            {/* Quick View Button on Hover */}
            <button
              onClick={handleQuickView}
              className="p-2 rounded-full bg-white/85 hover:bg-white text-[#22623a] shadow-xs transition-opacity opacity-0 group-hover:opacity-100"
              title="Quick View"
              aria-label="Quick View"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Product Content Details */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
          <div className="space-y-1.5">
            {/* Category & Rating */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-[11px] font-bold text-[#c59b27] uppercase tracking-wider">
                {product.categoryLabel}
              </span>
              <div className="flex items-center gap-1 text-[#c59b27]">
                <Star className="w-3.5 h-3.5 fill-[#c59b27]" />
                <span className="text-[11px] font-semibold text-[#59534b]">
                  {product.rating} ({product.reviewCount})
                </span>
              </div>
            </div>

            {/* Product Title */}
            <Link href={`/products/${product.slug}`} className="block">
              <h3 className="font-serif text-base font-bold text-[#22623a] group-hover:text-[#c59b27] transition-colors line-clamp-1 leading-snug">
                {product.name}
              </h3>
            </Link>

            {/* Short traditional purpose */}
            <p className="text-xs text-[#6a6660] line-clamp-2 leading-relaxed pt-0.5">
              {product.traditionalPurpose}
            </p>
          </div>

          {/* Size Selection Pills */}
          {product.sizes.length > 1 && (
            <div className="pt-0.5">
              <div className="flex flex-wrap gap-1.5">
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
                      className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                        isSelected
                          ? "bg-[#22623a] text-white border-[#22623a] font-medium"
                          : "bg-[#faf8f5] text-[#59534b] border-[#e6dfd5] hover:border-[#22623a]"
                      }`}
                    >
                      {sz.weight}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price & Add to Cart Footer */}
          <div className="pt-2.5 border-t border-[#f4eee5] flex items-center justify-between gap-2">
            <div>
              <div className="text-base font-bold text-[#22623a]">
                ₨ {selectedSize.price.toLocaleString()}
              </div>
              {selectedSize.originalPrice && selectedSize.originalPrice > selectedSize.price && (
                <div className="text-[11px] text-[#7a7268] line-through">
                  ₨ {selectedSize.originalPrice.toLocaleString()}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all duration-200 active:scale-95 ${
                isAdded
                  ? "bg-[#2d7648] text-white shadow-xs"
                  : "bg-[#22623a] hover:bg-[#1b502e] text-white shadow-xs hover:shadow-md"
              }`}
              aria-label={`Add ${product.name} to cart`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 text-[#c59b27]" />
                  <span>Add to Bag</span>
                </>
              )}
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
