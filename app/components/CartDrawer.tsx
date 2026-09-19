"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { PRODUCTS } from "@/app/data/products";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  MessageSquare,
  Tag,
  Check,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export default function CartDrawer() {
  const {
    cart,
    addToCart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    shippingFee,
    discountAmount,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    freeShippingThreshold,
    remainingForFreeShipping,
    generateWhatsAppOrderUrl,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  // Cross-sell recommendations: products not in cart
  const cartProductIds = cart.map((i) => i.product.id);
  const crossSellProducts = PRODUCTS.filter((p) => !cartProductIds.includes(p.id)).slice(0, 2);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const result = applyCoupon(couponInput);
    setCouponFeedback(result);
    if (result.success) {
      setCouponInput("");
      setTimeout(() => setCouponFeedback(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-[#0c2417]/50 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Slide-Over Drawer */}
      <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
        <div className="w-screen max-w-md bg-[#faf8f5] shadow-2xl flex flex-col h-full border-l border-[#e6dfd5]">

          {/* 1. Header */}
          <div className="p-5 border-b border-[#e6dfd5] bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#22623a]/10 flex items-center justify-center text-[#22623a]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-serif font-bold text-[#22623a]">
                  Your Shopping Bag
                </h2>
                <p className="text-xs text-[#7a7268]">
                  {cart.length === 0
                    ? "Bag is empty"
                    : `${cart.reduce((s, i) => s + i.quantity, 0)} ${
                        cart.reduce((s, i) => s + i.quantity, 0) === 1 ? "remedy" : "remedies"
                      }`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full text-[#7a7268] hover:text-[#22623a] hover:bg-[#faf8f5] transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2. Free Shipping Progress Meter */}
          {cart.length > 0 && (
            <div className="bg-[#f4f9f5] border-b border-[#d8ecde] p-4 text-xs">
              <div className="flex items-center justify-between mb-1.5 font-bold text-[#22623a]">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#2d7648]" />
                  <span>
                    {remainingForFreeShipping > 0
                      ? `Add ₨ ${remainingForFreeShipping.toLocaleString()} more for FREE Delivery`
                      : "🎉 You have qualified for FREE Courier Delivery!"}
                  </span>
                </div>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#d8ecde] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2d7648] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* 3. Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#f4eee5] flex items-center justify-center text-[#7a7268]">
                  <ShoppingBag className="w-8 h-8 opacity-40" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#22623a]">
                    Your bag is empty
                  </h3>
                  <p className="text-xs text-[#6a6660] max-w-xs">
                    Explore our natural Unani remedies, herbal waters, and fruit preserves.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-xs"
                >
                  <Link href="/products" onClick={() => setIsCartOpen(false)}>
                    Browse Remedies
                  </Link>
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={`${item.product.id}-${item.selectedSize.name}`}
                      className="flex gap-3.5 p-3.5 bg-white rounded-2xl border border-[#e6dfd5] shadow-xs"
                    >
                      <div className="relative w-18 h-18 bg-[#f6f2ea] rounded-xl overflow-hidden shrink-0">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={
                                item.customDetails
                                  ? `/nuskhajaat/${item.customDetails.nuskhaSlug}`
                                  : `/products/${item.product.slug}`
                              }
                              onClick={() => setIsCartOpen(false)}
                              className="text-xs font-bold text-[#22623a] hover:text-[#c59b27] line-clamp-1 transition-colors"
                            >
                              {item.product.name}
                            </Link>
                            <button
                              onClick={() =>
                                removeFromCart(item.product.id, item.selectedSize.name)
                              }
                              className="text-[#7a7268] hover:text-red-600 transition-colors p-0.5"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {item.customDetails ? (
                            <div className="mt-1 space-y-0.5">
                              <span className="inline-block px-1.5 py-0.5 bg-[#f4f9f5] border border-[#d8ecde] text-[#22623a] rounded text-[10px] font-bold">
                                {item.customDetails.courseDuration} · {item.customDetails.preparationFormat}
                              </span>
                              <p className="text-[10px] text-[#7a7268] line-clamp-1" title={item.customDetails.ingredientsSummary}>
                                Herbs: {item.customDetails.ingredientsSummary}
                              </p>
                            </div>
                          ) : (
                            <p className="text-[11px] text-[#7a7268] pt-0.5">
                              Size: <span className="font-semibold text-[#1a1816]">{item.selectedSize.weight}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#f4eee5]">
                          <div className="flex items-center border border-[#e6dfd5] rounded-lg bg-[#faf8f5]">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.selectedSize.name,
                                  item.quantity - 1
                                )
                              }
                              className="p-1 text-[#6a6660] hover:text-[#22623a] transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-bold text-[#1a1816]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.selectedSize.name,
                                  item.quantity + 1
                                )
                              }
                              className="p-1 text-[#6a6660] hover:text-[#22623a] transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-bold text-[#22623a]">
                              ₨ {(item.selectedSize.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 4. In-Drawer Complementary Upsells */}
                {crossSellProducts.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#22623a] mb-2.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
                      <span>Complementary Hakim Recommendations:</span>
                    </div>

                    <div className="space-y-2">
                      {crossSellProducts.map((crossProduct) => {
                        const defaultSize = crossProduct.sizes[0];
                        return (
                          <div
                            key={crossProduct.id}
                            className="p-2.5 bg-white rounded-xl border border-[#e6dfd5] flex items-center justify-between gap-3 shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#faf8f5] shrink-0">
                                <Image
                                  src={crossProduct.image}
                                  alt={crossProduct.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-[#22623a] truncate">
                                  {crossProduct.name}
                                </div>
                                <div className="text-[10px] text-[#7a7268]">
                                  {defaultSize.weight} · ₨ {defaultSize.price}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => addToCart(crossProduct, defaultSize, 1)}
                              className="px-2.5 py-1.5 bg-[#f4f9f5] hover:bg-[#22623a] text-[#22623a] hover:text-white border border-[#d8ecde] hover:border-[#22623a] rounded-lg text-[11px] font-bold transition-colors shrink-0"
                            >
                              + Add
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 5. Footer with Promo Engine & Checkout CTA */}
          {cart.length > 0 && (
            <div className="p-5 bg-white border-t border-[#e6dfd5] space-y-3 shadow-lg">

              {/* Promo Code Box */}
              <div className="space-y-1.5">
                {appliedCoupon ? (
                  <div className="p-2.5 bg-[#f4f9f5] border border-[#d8ecde] rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-[#22623a] font-bold">
                      <Tag className="w-3.5 h-3.5 text-[#c59b27]" />
                      <span>{appliedCoupon.code}</span>
                      <span className="text-[11px] font-normal text-[#59534b]">
                        ({appliedCoupon.description})
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-red-600 hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-[#7a7268] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Coupon Code (e.g. HAKIM10)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="w-full pl-8 pr-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs font-medium text-[#1a1816] focus:outline-none focus:border-[#22623a]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-bold uppercase rounded-xl transition-colors shrink-0"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponFeedback && (
                  <div
                    className={`text-[11px] flex items-center gap-1 ${
                      couponFeedback.success ? "text-[#2d7648]" : "text-red-600"
                    }`}
                  >
                    {couponFeedback.success ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <AlertCircle className="w-3 h-3" />
                    )}
                    <span>{couponFeedback.message}</span>
                  </div>
                )}
              </div>

              {/* Calculations Breakdown */}
              <div className="space-y-1.5 text-xs pt-1 border-t border-[#f4eee5]">
                <div className="flex justify-between text-[#59534b]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1a1816]">
                    ₨ {subtotal.toLocaleString()}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#2d7648] font-semibold">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>- ₨ {discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#59534b]">
                  <span>Courier Delivery (Pakistan)</span>
                  <span className="font-semibold text-[#1a1816]">
                    {shippingFee === 0 ? (
                      <span className="text-[#2d7648] font-bold uppercase">Free</span>
                    ) : (
                      `₨ ${shippingFee}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-base font-bold text-[#22623a] pt-2 border-t border-[#e6dfd5]">
                  <span>Total (Cash on Delivery)</span>
                  <span>₨ {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg active:scale-98"
                >
                  <span>Proceed to Checkout (COD)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={generateWhatsAppOrderUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold tracking-wide rounded-xl transition-all shadow-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Quick WhatsApp Order Dispatch</span>
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
