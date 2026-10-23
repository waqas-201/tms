"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ProductSize } from "@/app/data/products";
import { useCart } from "@/app/context/CartContext";
import ProductQuickViewModal from "./ProductQuickViewModal";
import { getSafeProductImage, DEFAULT_PRODUCT_IMAGE } from "@/lib/utils";
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

  const [imageSrc, setImageSrc] = useState(() =>
    getSafeProductImage(product.image, DEFAULT_PRODUCT_IMAGE)
  );

  useEffect(() => {
    setImageSrc(getSafeProductImage(product.image, DEFAULT_PRODUCT_IMAGE));
  }, [product.image]);

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
        <span className="inline-flex items-center gap-1 text-[10px] text-info font-medium" title={`Mizaj: ${product.mizaj}`}>
          <Snowflake className="w-2.5 h-2.5 text-info" />
          <span>Sard</span>
        </span>
      );
    }
    if (mz.includes("garm") || mz.includes("warm") || mz.includes("haar")) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] text-warning font-medium" title={`Mizaj: ${product.mizaj}`}>
          <Flame className="w-2.5 h-2.5 text-warning" />
          <span>Garm</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-ink-body font-medium" title={`Mizaj: ${product.mizaj}`}>
        <Scale className="w-2.5 h-2.5 text-success" />
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
        <div className="group bg-white rounded-xl border border-line/70 hover:border-line-strong/80 transition-all duration-300 p-4 sm:p-5 flex flex-col md:flex-row gap-5 items-start">
          {/* Image Thumbnail */}
          <div className="relative w-full md:w-44 aspect-square bg-surface rounded-lg overflow-hidden shrink-0">
            <Link href={`/products/${product.slug}`} tabIndex={-1} aria-hidden="true" className="block w-full h-full">
              <Image
                src={imageSrc}
                alt={product.name}
                fill
                onError={() => setImageSrc(DEFAULT_PRODUCT_IMAGE)}
                className="object-cover object-center group-hover:scale-103 transition-transform duration-500 ease-out"
                sizes="(max-width: 768px) 100vw, 180px"
              />
            </Link>

            {/* Badges */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
              {product.badge && (
                <span className="bg-surface-inverse text-white text-[9px] font-medium tracking-widest uppercase px-2 py-0.5 rounded shadow-2xs">
                  {product.badge}
                </span>
              )}
              {calculatedDiscount && calculatedDiscount > 0 ? (
                <span className="bg-brand-gold-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs">
                  -{calculatedDiscount}%
                </span>
              ) : null}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={handleToggleWishlist}
              className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-xs transition-colors z-10 ${
                isSaved
                  ? "bg-white text-danger shadow-2xs"
                  : "bg-white/80 text-ink-muted hover:text-danger hover:bg-white"
              }`}
              title={isSaved ? "Saved" : "Save to Wishlist"}
              aria-label="Toggle Wishlist"
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-danger" : ""}`} />
            </button>
          </div>

          {/* Center Info */}
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-ink-subtle">
                {product.categoryLabel}
              </span>
              <span className="text-ink-subtle">•</span>
              <div className="flex items-center gap-1 text-ink-body text-xs">
                <Star className="w-3 h-3 fill-brand-gold-600 text-secondary-text" />
                <span className="font-semibold text-neutral-800 text-[11px]">{product.rating}</span>
                <span className="text-ink-subtle text-[10px]">({product.reviewCount})</span>
              </div>
              {renderMizajIcon() && (
                <>
                  <span className="text-ink-subtle">•</span>
                  {renderMizajIcon()}
                </>
              )}
            </div>

            <Link href={`/products/${product.slug}`} className="block group/title">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-serif text-lg font-semibold text-ink group-hover/title:text-ink transition-colors leading-snug">
                  {product.name}
                </h3>
                {product.urduName && (
                  <span className="font-urdu text-sm text-ink-subtle shrink-0 font-normal">
                    {product.urduName}
                  </span>
                )}
              </div>
            </Link>

            <p className="text-xs text-ink-muted leading-relaxed line-clamp-2">
              {product.traditionalPurpose || product.shortDescription}
            </p>

            {/* Packaging Variant Pills */}
            {product.sizes && product.sizes.length > 1 && (
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] uppercase tracking-wider text-ink-subtle font-medium">Size:</span>
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
                            ? "bg-surface-inverse text-white border-ink font-medium"
                            : "bg-white text-ink-body border-line hover:border-line-strong"
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
          <div className="w-full md:w-44 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-line md:pl-5 flex flex-col justify-between self-stretch shrink-0 space-y-3">
            <div>
              <div className="text-lg font-bold text-ink">
                ₨ {selectedSize.price.toLocaleString()}
              </div>
              {selectedSize.originalPrice && selectedSize.originalPrice > selectedSize.price && (
                <div className="text-xs text-ink-subtle line-through">
                  ₨ {selectedSize.originalPrice.toLocaleString()}
                </div>
              )}
              {isLowStock && (
                <span className="text-[10px] text-warning font-medium block mt-0.5">
                  Only {selectedSize.available} left
                </span>
              )}
              {!isAvailable && (
                <span className="text-[10px] text-danger font-medium block mt-0.5">
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
                    ? "bg-line text-ink-muted"
                    : isAdded
                    ? "bg-brand-green-600 text-white"
                    : "bg-surface-inverse hover:bg-surface-inverse-hover text-white"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5 text-brand-gold-500" />
                    <span>Add to Bag</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleQuickView}
                className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium text-ink-body hover:text-ink bg-surface hover:bg-surface-sunken transition-colors cursor-pointer"
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
      <div className="group bg-white rounded-xl sm:rounded-2xl border border-line hover:border-primary/40 hover:shadow-sm transition-all duration-300 flex flex-col overflow-hidden h-full">
        {/* Image Canvas */}
        <div className="relative block aspect-square w-full bg-surface overflow-hidden">
          <Link href={`/products/${product.slug}`} tabIndex={-1} aria-hidden="true" className="block w-full h-full">
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              onError={() => setImageSrc(DEFAULT_PRODUCT_IMAGE)}
              className="object-cover object-center group-hover:scale-104 transition-transform duration-500 ease-out"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </Link>

          {/* Top Badges */}
          <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 flex flex-col gap-1 z-10 pointer-events-none">
            {product.badge && (
              <span className="bg-primary text-white text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md shadow-2xs">
                {product.badge}
              </span>
            )}
            {calculatedDiscount && calculatedDiscount > 0 ? (
              <span className="bg-secondary text-on-secondary text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-2xs">
                -{calculatedDiscount}%
              </span>
            ) : null}
          </div>

          {/* Top Right Floating Wishlist & Quick View */}
          <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 flex flex-col gap-1.5 z-10">
            <button
              onClick={handleToggleWishlist}
              className={`p-1.5 sm:p-2 rounded-full backdrop-blur-xs transition-colors shadow-2xs cursor-pointer ${
                isSaved
                  ? "bg-white text-danger shadow-xs"
                  : "bg-white/85 text-ink-muted hover:text-danger hover:bg-white"
              }`}
              title={isSaved ? "Saved to Wishlist" : "Save to Wishlist"}
              aria-label="Toggle Wishlist"
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-danger" : ""}`} />
            </button>

            <button
              onClick={handleQuickView}
              className="p-1.5 sm:p-2 rounded-full bg-white/85 hover:bg-white text-primary shadow-2xs transition-all opacity-0 group-hover:opacity-100 hover:scale-105 cursor-pointer"
              title="Quick View"
              aria-label="Quick View"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card Details */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
          <div className="space-y-1">
            {/* Category & Rating */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary-text truncate">
                {product.categoryLabel}
              </span>
              <div className="flex items-center gap-1 text-ink-body shrink-0">
                <Star className="w-2.5 h-2.5 fill-brand-gold-500 text-secondary-text" />
                <span className="text-[9px] sm:text-[10px] font-bold text-ink">
                  {product.rating}
                </span>
                <span className="text-[10px] text-ink-body">
                  ({product.reviewCount})
                </span>
              </div>
            </div>

            {/* Product Title */}
            <Link href={`/products/${product.slug}`} className="block group/title">
              <div className="flex items-baseline justify-between gap-1">
                <h3 className="font-serif text-[13px] sm:text-[15px] font-bold text-primary group-hover/title:text-primary transition-colors line-clamp-1 leading-snug">
                  {product.name}
                </h3>
                {product.urduName && (
                  <span className="font-urdu text-[11px] sm:text-xs text-secondary-text shrink-0 font-normal hidden sm:inline">
                    {product.urduName}
                  </span>
                )}
              </div>
            </Link>

            {/* Short subtitle / purpose */}
            <p className="text-[10px] sm:text-[11px] text-ink-body line-clamp-1 leading-relaxed">
              {product.traditionalPurpose || product.shortDescription}
            </p>
          </div>

          {/* Size Pills & Pricing / Quick Add */}
          <div className="space-y-2 pt-1.5 sm:pt-2 border-t border-sand-100">
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
                      className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-primary text-white border-primary font-semibold"
                          : "bg-surface text-ink-body border-line hover:border-primary"
                      }`}
                    >
                      {sz.weight}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {/* Price & Add Action */}
            <div className="flex items-center justify-between gap-1.5 pt-0.5">
              <div>
                <div className="text-[13px] sm:text-base font-bold text-ink leading-none">
                  ₨ {selectedSize.price.toLocaleString()}
                </div>
                {selectedSize.originalPrice && selectedSize.originalPrice > selectedSize.price && (
                  <div className="text-[9px] sm:text-[10px] text-secondary-text line-through mt-0.5">
                    ₨ {selectedSize.originalPrice.toLocaleString()}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!isAvailable}
                className={`flex items-center justify-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold tracking-wide uppercase transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                  !isAvailable
                    ? "bg-line text-ink-subtle"
                    : isAdded
                    ? "bg-primary text-white shadow-xs"
                    : "bg-primary hover:bg-brand-green-800 text-white shadow-2xs hover:shadow-xs"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-3 h-3 text-brand-gold-300" />
                    <span className="hidden sm:inline">Added</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3 text-brand-gold-300" />
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
