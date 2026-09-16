"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ProductSize, CLINIC_INFO } from "@/app/data/products";
import { useCart } from "@/app/context/CartContext";
import {
  X,
  Star,
  ShoppingBag,
  Heart,
  Check,
  Truck,
  ShieldCheck,
  ArrowRight,
  MessageCircle,
  Leaf,
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
  if (!isOpen || !product) return null;

  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const [selectedSize, setSelectedSize] = useState<ProductSize>(
    product.sizes[0] || { name: "Standard", weight: "250g", price: product.price }
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState(false);

  const isSaved = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1200);
  };

  const directWhatsAppUrl = () => {
    const text = `*Assalam-o-Alaikum Tameer-e-Sehat,*\nI would like to order *${product.name}* (${selectedSize.weight}) × ${quantity} = ₨ ${(selectedSize.price * quantity).toLocaleString()}.\nPlease confirm dispatch details.`;
    return `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0c2417]/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Modal Dialog Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-3xl border border-[#e6dfd5] animate-scale-up">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 text-[#59534b] hover:text-[#22623a] hover:bg-[#faf8f5] shadow-xs transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
            {/* Left: Product Image & Badges (5 cols) */}
            <div className="md:col-span-5 bg-[#faf8f5] p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#e6dfd5]">
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white border border-[#e6dfd5] shadow-xs">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />

                {product.badge && (
                  <span className="absolute top-3 left-3 bg-[#22623a] text-white text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded shadow-xs">
                    {product.badge}
                  </span>
                )}

                {product.discountPercentage && product.discountPercentage > 0 && (
                  <span className="absolute top-3 right-3 bg-[#c59b27] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                    -{product.discountPercentage}%
                  </span>
                )}
              </div>

              {/* Quality Indicators */}
              <div className="mt-4 pt-4 border-t border-[#e6dfd5] space-y-2 text-[11px] text-[#59534b]">
                <div className="flex items-center gap-2">
                  <Leaf className="w-3.5 h-3.5 text-[#2d7648]" />
                  <span>100% Pure Botanical Ingredients</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-[#22623a]" />
                  <span>Cash on Delivery Across Pakistan</span>
                </div>
              </div>
            </div>

            {/* Right: Product Details & Buying Actions (7 cols) */}
            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                {/* Category & Rating */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#c59b27]">
                    {product.categoryLabel}
                  </span>
                  <div className="flex items-center gap-1 text-[#c59b27]">
                    <Star className="w-3.5 h-3.5 fill-[#c59b27]" />
                    <span className="text-[11px] font-medium text-[#59534b]">
                      {product.rating} ({product.reviewCount} reviews)
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#22623a] leading-snug">
                  {product.name}
                </h3>

                {/* Pricing */}
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl font-bold text-[#22623a]">
                    ₨ {selectedSize.price.toLocaleString()}
                  </span>
                  {selectedSize.originalPrice && selectedSize.originalPrice > selectedSize.price && (
                    <span className="text-xs text-[#7a7268] line-through">
                      ₨ {selectedSize.originalPrice.toLocaleString()}
                    </span>
                  )}
                  {product.discountPercentage && product.discountPercentage > 0 && (
                    <span className="text-[10px] font-bold text-[#c59b27] bg-[#fdfbf3] px-2 py-0.5 rounded border border-[#fbf3dc]">
                      Save {product.discountPercentage}%
                    </span>
                  )}
                </div>

                {/* Purpose */}
                <p className="text-xs text-[#59534b] leading-relaxed line-clamp-3">
                  {product.traditionalPurpose}
                </p>

                {/* Size Selector */}
                {product.sizes.length > 1 && (
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#22623a]">
                      Select Size:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((sz) => {
                        const isSelected = selectedSize.name === sz.name;
                        return (
                          <button
                            key={sz.name}
                            type="button"
                            onClick={() => setSelectedSize(sz)}
                            className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                              isSelected
                                ? "bg-[#22623a] text-white border-[#22623a] font-medium shadow-xs"
                                : "bg-[#faf8f5] text-[#59534b] border-[#e6dfd5] hover:border-[#22623a]"
                            }`}
                          >
                            <span className="font-semibold">{sz.weight}</span> · ₨ {sz.price}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Add to Cart & Wishlist Actions */}
              <div className="space-y-3 pt-3 border-t border-[#f4eee5]">
                <div className="flex items-center gap-3">
                  {/* Quantity */}
                  <div className="flex items-center border border-[#e6dfd5] rounded-lg bg-[#faf8f5] overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2.5 text-xs text-[#59534b] hover:text-[#22623a] transition-colors"
                      aria-label="Decrease"
                    >
                      -
                    </button>
                    <span className="px-2.5 text-xs font-bold text-[#1a1816]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2.5 text-xs text-[#59534b] hover:text-[#22623a] transition-colors"
                      aria-label="Increase"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-md ${
                      isAdded
                        ? "bg-[#2d7648] text-white"
                        : "bg-[#22623a] hover:bg-[#1b502e] text-white"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 text-[#c59b27]" />
                        <span>Add to Bag · ₨ {(selectedSize.price * quantity).toLocaleString()}</span>
                      </>
                    )}
                  </button>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-3 rounded-lg border transition-colors ${
                      isSaved
                        ? "bg-red-50 border-red-200 text-red-500"
                        : "bg-white border-[#e6dfd5] text-[#59534b] hover:text-red-500"
                    }`}
                    title={isSaved ? "Saved to Wishlist" : "Save to Wishlist"}
                    aria-label="Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? "fill-red-500" : ""}`} />
                  </button>
                </div>

                {/* Footer Navigation Link to Full PDP */}
                <div className="flex items-center justify-between pt-2 text-xs">
                  <Link
                    href={`/products/${product.slug}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 text-[#22623a] hover:text-[#c59b27] font-semibold transition-colors"
                  >
                    <span>View Complete Remedy & Hakim Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <a
                    href={directWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#25D366] font-medium hover:underline"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Order</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
