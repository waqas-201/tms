"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { Product } from "@/app/data/products";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
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
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setCatalogProducts(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to load catalog for cart recommendations:", err);
      }
    }
    loadProducts();
  }, []);

  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  // Cross-sell recommendations: products not in cart
  const cartProductIds = cart.map((i) => i.product.id);
  const crossSellProducts = catalogProducts
    .filter((p) => !cartProductIds.includes(p.id) && p.sizes && p.sizes.length > 0)
    .slice(0, 2);

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
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col h-full bg-[#FAF9F6] border-stone-200"
      >
        {/* 1. Header */}
        <SheetHeader className="p-5 border-b border-stone-200/80 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#14281D]/10 flex items-center justify-center text-[#14281D] shrink-0">
              <ShoppingBag className="w-5 h-5 text-[#14281D]" />
            </div>
            <div>
              <SheetTitle className="text-base sm:text-lg font-serif font-bold text-stone-900">
                Your Shopping Bag
              </SheetTitle>
              <p className="text-xs text-stone-500">
                {cart.length === 0
                  ? "Bag is empty"
                  : `${cart.reduce((s, i) => s + i.quantity, 0)} ${
                      cart.reduce((s, i) => s + i.quantity, 0) === 1 ? "remedy" : "remedies"
                    }`}
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* 2. Free Shipping Progress Meter */}
        {cart.length > 0 && (
          <div className="bg-emerald-50/70 border-b border-emerald-100/80 px-5 py-3 text-xs">
            <div className="flex items-center justify-between mb-1.5 font-medium text-[#14281D]">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="font-semibold text-stone-800">
                  {remainingForFreeShipping > 0
                    ? `Add ₨ ${remainingForFreeShipping.toLocaleString()} more for FREE Delivery`
                    : "🎉 You qualified for FREE Courier Delivery!"}
                </span>
              </div>
              <span className="font-bold text-emerald-800">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-700 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* 3. Items List */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                <ShoppingBag className="w-8 h-8 opacity-40" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-stone-900 font-serif">
                  Your bag is empty
                </h3>
                <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
                  Explore our natural Unani remedies, herbal waters, and handcrafted fruit preserves.
                </p>
              </div>
              <Link
                href="/products"
                onClick={() => setIsCartOpen(false)}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-[#14281D] hover:bg-[#0c1b13] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-xs"
              >
                Browse Remedies
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedSize.name}`}
                    className="flex gap-3.5 p-3.5 bg-white rounded-xl border border-stone-200/80 shadow-2xs"
                  >
                    <div className="relative w-18 h-18 bg-[#FAF9F6] rounded-lg overflow-hidden shrink-0 border border-stone-100">
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
                            href={`/products/${item.product.slug}`}
                            onClick={() => setIsCartOpen(false)}
                            className="text-xs font-semibold text-stone-900 hover:text-[#14281D] line-clamp-1 transition-colors"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            onClick={() =>
                              removeFromCart(item.product.id, item.selectedSize.name)
                            }
                            className="text-stone-400 hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className="text-[11px] text-stone-500 pt-0.5">
                          Size: <span className="font-medium text-stone-700">{item.selectedSize.weight}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-stone-100">
                        <div className="flex items-center border border-stone-200 rounded-md bg-stone-50">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.selectedSize.name,
                                item.quantity - 1
                              )
                            }
                            className="p-1 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-stone-900 min-w-[16px] text-center">
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
                            className="p-1 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-stone-900">
                            ₨ {(item.selectedSize.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 4. Cross-Sell Recommendations */}
              {crossSellProducts.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900 mb-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#9E7D3B]" />
                    <span>Frequently Paired Remedies:</span>
                  </div>

                  <div className="space-y-2">
                    {crossSellProducts.map((crossProduct) => {
                      const defaultSize = crossProduct.sizes[0];
                      if (!defaultSize) return null;
                      return (
                        <div
                          key={crossProduct.id}
                          className="p-2.5 bg-white rounded-xl border border-stone-200/80 flex items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#FAF9F6] shrink-0 border border-stone-100">
                              <Image
                                src={crossProduct.image}
                                alt={crossProduct.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-stone-900 truncate">
                                {crossProduct.name}
                              </div>
                              <div className="text-[10px] text-stone-500">
                                {defaultSize.weight} · ₨ {defaultSize.price.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => addToCart(crossProduct, defaultSize, 1)}
                            className="px-2.5 py-1.5 bg-[#FAF9F6] hover:bg-[#14281D] text-[#14281D] hover:text-white border border-stone-200 hover:border-[#14281D] rounded-lg text-[11px] font-semibold transition-colors shrink-0 cursor-pointer"
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
          <div className="p-5 bg-white border-t border-stone-200 space-y-3 shadow-lg">
            {/* Promo Code Box */}
            <div className="space-y-1.5">
              {appliedCoupon ? (
                <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-900 font-semibold">
                    <Tag className="w-3.5 h-3.5 text-[#9E7D3B]" />
                    <span>{appliedCoupon.code}</span>
                    <span className="text-[11px] font-normal text-emerald-700">
                      ({appliedCoupon.description})
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. HAKIM10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#14281D] focus:bg-white transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#14281D] hover:bg-[#0c1b13] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shrink-0 cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}

              {couponFeedback && (
                <div
                  className={`text-[11px] flex items-center gap-1 ${
                    couponFeedback.success ? "text-emerald-700" : "text-rose-600"
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
            <div className="space-y-1.5 text-xs pt-1 border-t border-stone-100">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-900">
                  ₨ {subtotal.toLocaleString()}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>- ₨ {discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>Courier Delivery (Pakistan)</span>
                <span className="font-semibold text-stone-900">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-bold uppercase">Free</span>
                  ) : (
                    `₨ ${shippingFee}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
                <span>Total (Cash on Delivery)</span>
                <span>₨ {total.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#14281D] hover:bg-[#0c1b13] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-sm hover:shadow-md active:scale-98"
              >
                <span>Proceed to Checkout (COD)</span>
                <ArrowRight className="w-4 h-4 text-[#9E7D3B]" />
              </Link>

              <a
                href={generateWhatsAppOrderUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold tracking-wide rounded-xl transition-all shadow-2xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Quick WhatsApp Order Dispatch</span>
              </a>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
