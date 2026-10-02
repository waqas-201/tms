"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ProductSize, CLINIC_INFO } from "@/app/data/products";
import { useCart } from "@/app/context/CartContext";
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
        <span className="inline-flex items-center gap-1 text-[11px] text-sky-800 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100 font-medium">
          <Snowflake className="w-3.5 h-3.5 text-sky-500" />
          <span>Mizaj: Sard (Cooling)</span>
        </span>
      );
    }
    if (mz.includes("garm") || mz.includes("warm") || mz.includes("haar")) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100 font-medium">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>Mizaj: Garm (Warming)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-stone-700 bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200 font-medium">
        <Scale className="w-3.5 h-3.5 text-emerald-600" />
        <span>Mizaj: Mo&apos;tadil (Balanced)</span>
      </span>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-[#FAF9F6] border-stone-200 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Left Column: Product Image & Heritage Tags (5 cols) */}
          <div className="md:col-span-5 bg-[#F5F2EB]/70 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-stone-200/80">
            <div>
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white border border-stone-200/70 shadow-2xs">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
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
            <div className="mt-5 pt-4 border-t border-stone-200/70 space-y-2 text-[11px] text-stone-600">
              <div className="flex items-center gap-2">
                <Leaf className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>100% Pure Botanical Ingredients</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-[#14281D] shrink-0" />
                <span>Cash on Delivery Across Pakistan</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#9E7D3B] shrink-0" />
                <span>Formulated by Registered Tabib / Hakim</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Info & Purchase Controls (7 cols) */}
          <div className="md:col-span-7 p-6 sm:p-7 flex flex-col justify-between space-y-5 bg-white">
            <div className="space-y-3.5">
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9E7D3B]">
                  {product.categoryLabel}
                </span>
                <div className="flex items-center gap-1 text-stone-600 bg-stone-50 px-2 py-0.5 rounded-md border border-stone-200/60">
                  <Star className="w-3.5 h-3.5 fill-[#9E7D3B] text-[#9E7D3B]" />
                  <span className="text-[11px] font-bold text-stone-900">
                    {product.rating}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    ({product.reviewCount})
                  </span>
                </div>
              </div>

              {/* Title & Urdu */}
              <div>
                <DialogTitle className="text-xl sm:text-2xl font-serif font-bold text-stone-900 leading-snug">
                  {product.name}
                </DialogTitle>
                {product.urduName && (
                  <p className="font-urdu text-sm text-stone-500 font-normal mt-0.5" dir="rtl">
                    {product.urduName}
                  </p>
                )}
              </div>

              {/* Pricing & Stock Tag */}
              <div className="flex items-baseline gap-3 pt-0.5">
                <span className="text-2xl font-bold text-stone-900 tracking-tight">
                  ₨ {selectedSize.price.toLocaleString()}
                </span>
                {selectedSize.originalPrice && selectedSize.originalPrice > selectedSize.price && (
                  <span className="text-xs text-stone-400 line-through">
                    ₨ {selectedSize.originalPrice.toLocaleString()}
                  </span>
                )}
                {calculatedDiscount && calculatedDiscount > 0 && (
                  <span className="text-[10px] font-bold text-[#9E7D3B] bg-[#9E7D3B]/10 px-2 py-0.5 rounded-full border border-[#9E7D3B]/30">
                    Save {calculatedDiscount}%
                  </span>
                )}
                {!isAvailable && (
                  <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 ml-auto">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Short Purpose Description */}
              <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                {product.traditionalPurpose || product.shortDescription}
              </p>

              {/* Packaging Variant Picker */}
              {product.sizes && product.sizes.length > 1 && (
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500">
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
                              ? "bg-[#14281D] text-white border-[#14281D] font-semibold shadow-xs"
                              : "bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400 hover:bg-stone-100"
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
            <div className="space-y-3 pt-3 border-t border-stone-100">
              <div className="flex items-center gap-2.5">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50 overflow-hidden shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-xs text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-2 text-xs font-bold text-stone-900 min-w-[20px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(maxAvailable, quantity + 1))}
                    disabled={!isAvailable || quantity >= maxAvailable}
                    className="px-3 py-2 text-xs text-stone-600 hover:text-stone-900 transition-colors disabled:opacity-40 cursor-pointer"
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
                      ? "bg-stone-200 text-stone-500"
                      : isAdded
                      ? "bg-emerald-700 text-white"
                      : "bg-[#14281D] hover:bg-[#0c1b13] text-white"
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
                      <ShoppingBag className="w-3.5 h-3.5 text-[#9E7D3B]" />
                      <span>Add to Bag · ₨ {(selectedSize.price * quantity).toLocaleString()}</span>
                    </>
                  )}
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-2.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                    isSaved
                      ? "bg-rose-50 border-rose-200 text-rose-500"
                      : "bg-stone-50 border-stone-200 text-stone-500 hover:text-rose-500 hover:bg-stone-100"
                  }`}
                  title={isSaved ? "Saved to Wishlist" : "Save to Wishlist"}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isSaved ? "fill-rose-500" : ""}`} />
                </button>
              </div>

              {/* Direct Links */}
              <div className="flex items-center justify-between pt-2 text-xs border-t border-stone-100">
                <Link
                  href={`/products/${product.slug}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1 text-[#14281D] hover:text-[#9E7D3B] font-semibold transition-colors"
                >
                  <span>Full Remedy &amp; Hakim Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <a
                  href={directWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold"
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
