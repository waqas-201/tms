"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Copy, Check, X, Clock, Tag } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

interface PromoData {
  id: string;
  code: string;
  description: string;
  scope: string;
  discountType: string;
  discountValue: number;
  minSubtotal?: number | null;
  maxDiscountCap?: number | null;
  endDate?: string | null;
  isFlashSale: boolean;
  flashSaleBannerText?: string | null;
  flashSaleBadge?: string | null;
}

export default function MarketingFlashBanner() {
  const [promo, setPromo] = useState<PromoData | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const { applyCoupon, appliedCoupon } = useCart();

  useEffect(() => {
    // Check session storage
    if (typeof window !== "undefined") {
      const dismissed = sessionStorage.getItem("tms_flash_banner_dismissed");
      if (dismissed) {
        setIsDismissed(true);
        return;
      }
    }

    fetch("/api/coupons/active-promos")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setPromo(json.data[0]);
        }
      })
      .catch((err) => console.warn("Could not fetch active promotions:", err));
  }, []);

  // Countdown timer if endDate exists
  useEffect(() => {
    if (!promo?.endDate) return;

    const targetTime = new Date(promo.endDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetTime - now;

      if (distance <= 0) {
        setTimeLeft(null);
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [promo?.endDate]);

  if (!promo || isDismissed) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(promo.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    // Auto-apply to cart if products scope
    if (promo.scope === "PRODUCTS" || promo.scope === "ALL") {
      applyCoupon(promo.code);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("tms_flash_banner_dismissed", promo.code);
    }
  };

  const badgeText = promo.flashSaleBadge || (promo.isFlashSale ? "⚡ FLASH OFFER" : "PROMOTION");
  const bannerMessage = promo.flashSaleBannerText || promo.description || `Special offer with code ${promo.code}`;

  return (
    <aside aria-label="Special Offer" className="bg-gradient-to-r from-brand-green-900 via-primary to-brand-green-900 text-white border-b border-brand-green-700/60 shadow-sm relative z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left: Badge + Banner Text */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-gold-500 text-black text-[10px] font-black tracking-wider uppercase shadow-xs">
            <Sparkles className="w-3 h-3 text-black" />
            <span>{badgeText}</span>
          </span>
          <span className="font-medium text-white/95 text-[11px] sm:text-xs">
            {bannerMessage}
          </span>
        </div>

        {/* Right: Timer + Copy Code Button + Close */}
        <div className="flex items-center gap-2.5 ml-auto">
          {timeLeft && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-black/25 text-brand-gold-300 font-mono text-[11px] border border-white/10">
              <Clock className="w-3.5 h-3.5 text-brand-gold-400" />
              <span>
                {String(timeLeft.hours).padStart(2, "0")}h:
                {String(timeLeft.minutes).padStart(2, "0")}m:
                {String(timeLeft.seconds).padStart(2, "0")}s
              </span>
            </div>
          )}

          {/* Click to Copy / Apply Chip */}
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
              copied || appliedCoupon?.code === promo.code
                ? "bg-white text-brand-green-900 ring-2 ring-brand-gold-400"
                : "bg-brand-gold-500 hover:bg-brand-gold-400 text-black active:scale-95"
            }`}
          >
            {copied || appliedCoupon?.code === promo.code ? (
              <>
                <Check className="w-3.5 h-3.5 text-brand-green-800" />
                <span className="font-mono">{promo.code} (Applied)</span>
              </>
            ) : (
              <>
                <Tag className="w-3 h-3 text-black" />
                <span className="font-mono">{promo.code}</span>
                <span className="text-[10px] uppercase font-semibold opacity-80 underline ml-0.5">Copy</span>
              </>
            )}
          </button>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss promotion banner"
            className="p-1 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
