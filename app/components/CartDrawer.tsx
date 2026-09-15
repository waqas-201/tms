"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck, MessageSquare } from "lucide-react";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    shippingFee,
    total,
    freeShippingThreshold,
    remainingForFreeShipping,
    generateWhatsAppOrderUrl,
  } = useCart();

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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-[#138833]/40 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
        <div className="w-screen max-w-md bg-[#faf8f5] shadow-2xl flex flex-col h-full border-l border-[#e6dfd5]">
          {/* Header */}
          <div className="p-5 border-b border-[#e6dfd5] bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#138833]/5 flex items-center justify-center text-[#138833]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-semibold text-[#138833]">
                  Shopping Bag
                </h2>
                <p className="text-xs text-[#6a6660]">
                  {cart.length === 0
                    ? "Cart is empty"
                    : `${cart.reduce((s, i) => s + i.quantity, 0)} ${
                        cart.reduce((s, i) => s + i.quantity, 0) === 1 ? "item" : "items"
                      }`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full text-[#6a6660] hover:text-[#138833] hover:bg-[#faf8f5] transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          {cart.length > 0 && (
            <div className="bg-[#f1fbf3] border-b border-[#dff5e3] p-4 text-xs">
              <div className="flex items-center justify-between mb-1.5 font-medium text-[#138833]">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#1b993e]" />
                  <span>
                    {remainingForFreeShipping > 0
                      ? `Add ₨ ${remainingForFreeShipping.toLocaleString()} more for FREE Delivery`
                      : "🎉 You have earned FREE Delivery across Pakistan!"}
                  </span>
                </div>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#dff5e3] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1b993e] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#f4eee5] flex items-center justify-center text-[#6a6660]">
                  <ShoppingBag className="w-8 h-8 opacity-40" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-medium text-[#1a1816]">
                    Your bag is empty
                  </h3>
                  <p className="text-xs text-[#6a6660] max-w-xs">
                    Explore our pure natural remedies, fruit preserves, and herbal waters.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-[#138833] hover:bg-[#0f7229] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-colors"
                >
                  <Link href="/products" onClick={() => setIsCartOpen(false)}>
                    Browse Products
                  </Link>
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedSize.name}`}
                  className="flex gap-4 p-3 bg-white rounded-lg border border-[#e6dfd5] shadow-xs"
                >
                  <div className="relative w-20 h-20 bg-[#f4eee5] rounded-md overflow-hidden shrink-0">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${item.product.slug}`}
                          onClick={() => setIsCartOpen(false)}
                          className="text-sm font-medium text-[#138833] hover:text-[#c59b27] line-clamp-1 transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          onClick={() =>
                            removeFromCart(item.product.id, item.selectedSize.name)
                          }
                          className="text-[#6a6660] hover:text-red-600 transition-colors p-0.5"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[11px] text-[#6a6660]">
                        Size: <span className="font-medium text-[#1a1816]">{item.selectedSize.weight}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#f4eee5]">
                      <div className="flex items-center border border-[#e6dfd5] rounded bg-[#faf8f5]">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.selectedSize.name,
                              item.quantity - 1
                            )
                          }
                          className="p-1 text-[#6a6660] hover:text-[#138833] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-[#1a1816]">
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
                          className="p-1 text-[#6a6660] hover:text-[#138833] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-semibold text-[#138833]">
                          ₨ {(item.selectedSize.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Calculations & Checkout */}
          {cart.length > 0 && (
            <div className="p-5 bg-white border-t border-[#e6dfd5] space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#6a6660]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#1a1816]">
                    ₨ {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[#6a6660]">
                  <span>Courier Delivery</span>
                  <span className="font-medium text-[#1a1816]">
                    {shippingFee === 0 ? (
                      <span className="text-[#1b993e] font-semibold uppercase">Free</span>
                    ) : (
                      `₨ ${shippingFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold text-[#138833] pt-2 border-t border-[#e6dfd5]">
                  <span>Total (Cash on Delivery)</span>
                  <span>₨ {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 py-2 border-y border-[#f4eee5] text-[11px] text-[#6a6660]">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#c59b27]" /> 100% Pure Herbs
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#1b993e]" /> Cash on Delivery (COD)
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#138833] hover:bg-[#0f7229] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-all shadow-md hover:shadow-lg"
                >
                  <span>Proceed to Checkout (COD)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={generateWhatsAppOrderUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold tracking-wide rounded-md transition-all shadow-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Order via WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
