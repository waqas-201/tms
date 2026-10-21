"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ProductSize, CLINIC_INFO } from "@/app/data/products";
import { useCart } from "@/app/context/CartContext";
import { getSafeProductImage, DEFAULT_PRODUCT_IMAGE } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  ShoppingBag,
  Heart,
  Check,
  Truck,
  ShieldCheck,
  ArrowRight,
  MessageCircle,
  Leaf,
  Snowflake,
  Flame,
  Scale,
} from "lucide-react";

interface ProductQuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductQuickViewModal({
  product,
  isOpen,
  onClose,
}: ProductQuickViewModalProps) {
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const [selectedSize, setSelectedSize] = useState<ProductSize>(() => {
    return product?.sizes && product.sizes.length > 0
      ? product.sizes[0]
      : { name: "Standard", weight: "250g", price: product?.price || 0 };
  });
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState(false);

  // Sync selected size when product changes
  useEffect(() => {
    if (product?.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    } else if (product) {
      setSelectedSize({ name: "Standard", weight: "250g", price: product.price });
    }
    setQuantity(1);
  }, [product]);

  const [imageSrc, setImageSrc] = useState(() =>
    getSafeProductImage(product?.image, DEFAULT_PRODUCT_IMAGE)
  );

  useEffect(() => {
    setImageSrc(getSafeProductImage(product?.image, DEFAULT_PRODUCT_IMAGE));
  }, [product?.image]);

  if (!product) return null;

  const isSaved = isInWishlist(product.id);
  const isAvailable =
    selectedSize.available !== undefined
      ? selectedSize.available > 0
      : selectedSize.isActive !== undefined
      ? selectedSize.isActive
      : product.inStock;
  const maxAvailable = selectedSize.available !== undefined ? selectedSize.available : 99;

  const calculatedDiscount =
    selectedSize.originalPrice && selectedSize.originalPrice > selectedSize.price
      ? Math.round(
          ((selectedSize.originalPrice - selectedSize.price) /
            selectedSize.originalPrice) *
            100
        )
      : product.discountPercentage;

  const handleAddToCart = () => {
    if (!isAvailable) return;
    addToCart(product, selectedSize, Math.min(quantity, maxAvailable));
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1000);
  };

  const directWhatsAppUrl = () => {
    const text = `*Assalam-o-Alaikum Tameer-e-Sehat,*\nI would like to order *${product.name}* (${selectedSize.weight}) × ${quantity} = ₨ ${(selectedSize.price * quantity).toLocaleString()}.\nPlease confirm delivery details.`;
    return `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  const renderMizajBadge = () => {
    if (!product.mizaj) return null;
    const mz = product.mizaj.toLowerCase();
    if (mz.includes("sard") || mz.includes("cool")) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-info bg-info-soft px-2.5 py-1 rounded-md border border-info-line font-medium">
          <Snowflake className="w-3.5 h-3.5 text-info" />
          <span>Mizaj: Sard (Cooling)</span>
        </span>
      );
    }
    if (mz.includes("garm") || mz.includes("warm") || mz.includes("haar")) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-warning bg-warning-soft px-2.5 py-1 rounded-md border border-warning-line font-medium">
          <Flame className="w-3.5 h-3.5 text-warning" />
          <span>Mizaj: Garm (Warming)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-neutral-700 bg-surface-sunken px-2.5 py-1 rounded-md border border-line font-medium">
        <Scale className="w-3.5 h-3.5 text-success" />
        <span>Mizaj: Mo&apos;tadil (Balanced)</span>
      </span>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-surface border-line shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Left Column: Product Image & Heritage Tags (5 cols) */}
          <div className="md:col-span-5 bg-surface-sunken/70 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-line/80">
            <div>
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white border border-line/70 shadow-2xs">
                <Image
                  src={imageSrc}
                  alt={product.name}
                  fill
                  onError={() => setImageSrc(DEFAULT_PRODUCT_IMAGE)}
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 320px"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                  {product.badge && (
                    <Badge variant="default" className="text-[10px] tracking-wider uppercase">
                      {product.badge}
                    </Badge>
                  )}
                  {calculatedDiscount && calculatedDiscount > 0 ? (
                    <Badge variant="gold" className="text-[10px] font-bold">
                      -{calculatedDiscount}%
                    </Badge>
                  ) : null}
                </div>
              </div>

              {/* Quick Mizaj Pill */}
              {renderMizajBadge() && (
                <div className="mt-3.5">
                  {renderMizajBadge()}
                </div>
              )}
            </div>

            {/* Heritage Trust Badges */}
            <div className="mt-5 pt-4 border-t border-line/70 space-y-2 text-[11px] text-ink-body">
              <div className="flex items-center gap-2">
                <Leaf className="w-3.5 h-3.5 text-success shrink-0" />
                <span>100% Pure Botanical Ingredients</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-ink shrink-0" />
                <span>Cash on Delivery Across Pakistan</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-secondary-text shrink-0" />
                <span>Formulated by Registered Tabib / Hakim</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Info & Purchase Controls (7 cols) */}
          <div className="md:col-span-7 p-6 sm:p-7 flex flex-col justify-between space-y-5 bg-white">
            <div className="space-y-3.5">
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary-text">
                  {product.categoryLabel}
                </span>
                <div className="flex items-center gap-1 text-ink-body bg-surface px-2 py-0.5 rounded-md border border-line/60">
                  <Star className="w-3.5 h-3.5 fill-brand-gold-600 text-secondary-text" />
                  <span className="text-[11px] font-bold text-ink">
                    {product.rating}
                  </span>
                  <span className="text-[10px] text-ink-subtle">
                    ({product.reviewCount})
                  </span>
                </div>
              </div>

              {/* Title & Urdu */}
              <div>
                <DialogTitle className="text-xl sm:text-2xl font-serif font-bold text-ink leading-snug">
                  {product.name}
                </DialogTitle>
                {product.urduName && (
                  <p className="font-urdu text-sm text-ink-muted font-normal mt-0.5" dir="rtl">
                    {product.urduName}
                  </p>
                )}
              </div>

              {/* Pricing & Stock Tag */}
              <div className="flex items-baseline gap-3 pt-0.5">
                <span className="text-2xl font-bold text-ink tracking-tight">
                  ₨ {selectedSize.price.toLocaleString()}
                </span>
                {selectedSize.originalPrice && selectedSize.originalPrice > selectedSize.price && (
                  <span className="text-xs text-ink-subtle line-through">
                    ₨ {selectedSize.originalPrice.toLocaleString()}
                  </span>
                )}
                {calculatedDiscount && calculatedDiscount > 0 && (
                  <span className="text-[10px] font-bold text-brand-gold-800 bg-brand-gold-600/10 px-2 py-0.5 rounded-full border border-brand-gold-600/30">
                    Save {calculatedDiscount}%
                  </span>
                )}
                {!isAvailable && (
                  <span className="text-[10px] font-semibold text-danger bg-danger-soft px-2 py-0.5 rounded-full border border-danger/20 ml-auto">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Short Purpose Description */}
              <p className="text-xs text-ink-body leading-relaxed line-clamp-3">
                {product.traditionalPurpose || product.shortDescription}
              </p>

              {/* Packaging Variant Picker */}
              {product.sizes && product.sizes.length > 1 && (
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                    Select Packaging Size:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((sz) => {
                      const isSelected = selectedSize.name === sz.name;
                      return (
                        <button
                          key={sz.name}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={`px-3 py-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                            isSelected
                              ? "bg-surface-inverse text-white border-ink font-semibold shadow-xs"
                              : "bg-surface text-neutral-700 border-line hover:border-line-strong hover:bg-surface-sunken"
                          }`}
                        >
                          <span className="font-semibold">{sz.weight}</span> · ₨ {sz.price.toLocaleString()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Stepper + Add to Cart + Wishlist */}
            <div className="space-y-3 pt-3 border-t border-line">
              <div className="flex items-center gap-2.5">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-line rounded-lg bg-surface overflow-hidden shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-xs text-ink-body hover:text-ink transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-2 text-xs font-bold text-ink min-w-[20px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(maxAvailable, quantity + 1))}
                    disabled={!isAvailable || quantity >= maxAvailable}
                    className="px-3 py-2 text-xs text-ink-body hover:text-ink transition-colors disabled:opacity-40 cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart CTA */}
                <button
                  onClick={handleAddToCart}
                  disabled={!isAvailable}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-98 ${
                    !isAvailable
                      ? "bg-line text-ink-muted"
                      : isAdded
                      ? "bg-success text-white"
                      : "bg-surface-inverse hover:bg-surface-inverse-hover text-white"
                  }`}
                >
                  {!isAvailable ? (
                    <span>Out of Stock</span>
                  ) : isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5 text-brand-gold-500" />
                      <span>Add to Bag · ₨ {(selectedSize.price * quantity).toLocaleString()}</span>
                    </>
                  )}
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-2.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                    isSaved
                      ? "bg-danger-soft border-danger/20 text-danger"
                      : "bg-surface border-line text-ink-muted hover:text-danger hover:bg-surface-sunken"
                  }`}
                  title={isSaved ? "Saved to Wishlist" : "Save to Wishlist"}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isSaved ? "fill-danger" : ""}`} />
                </button>
              </div>

              {/* Direct Links */}
              <div className="flex items-center justify-between pt-2 text-xs border-t border-line">
                <Link
                  href={`/products/${product.slug}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1 text-ink hover:text-secondary-text font-semibold transition-colors"
                >
                  <span>Full Remedy &amp; Hakim Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <a
                  href={directWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-success hover:text-success font-semibold"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Order</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
