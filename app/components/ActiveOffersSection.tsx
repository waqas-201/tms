"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Tag,
  Sparkles,
  Copy,
  Check,
  Clock,
  Coins,
  Users,
  ShoppingBag,
  Droplets,
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useCart } from "@/app/context/CartContext";

interface ActiveCoupon {
  id: string;
  code: string;
  description: string;
  scope: string; // PRODUCTS | HIJAMA | CONSULTATION | ALL | CATEGORY
  discountType: string; // PERCENTAGE | FIXED | FREE_SHIPPING | FREE_SERVICE
  discountValue: number;
  minSubtotal?: number | null;
  maxDiscountCap?: number | null;
  endDate?: string | null;
  isFlashSale: boolean;
  flashSaleBannerText?: string | null;
  flashSaleBadge?: string | null;
}

interface PromoResponse {
  success: boolean;
  coupons: ActiveCoupon[];
  loyalty: {
    active: boolean;
    title: string;
    description: string;
    earnPercent: number;
    hijamaPoints: number;
    consultationPoints: number;
  } | null;
  referral: {
    active: boolean;
    title: string;
    description: string;
    rewardPoints: number;
    welcomeDiscount: number;
  } | null;
  isReferralActive: boolean;
  isLoyaltyProgramActive: boolean;
  homeBannerText: string | null;
  totalActiveOffers: number;
}

export default function ActiveOffersSection() {
  const [data, setData] = useState<PromoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { applyCoupon, appliedCoupon } = useCart();

  useEffect(() => {
    let active = true;
    fetch("/api/coupons/active-promos")
      .then((res) => res.json())
      .then((json) => {
        if (active && json.success) {
          setData(json);
        }
      })
      .catch((err) => console.warn("Could not fetch active promotions:", err))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleCopyCode = async (code: string, scope: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);

      // Auto-apply to cart if apothecary or all scope
      if (scope === "PRODUCTS" || scope === "ALL") {
        applyCoupon(code);
      }
    } catch (e) {
      console.warn("Clipboard copy failed:", e);
    }
  };

  const getScopeBadge = (scope: string) => {
    switch (scope) {
      case "PRODUCTS":
        return {
          label: "Apothecary Dispensary",
          icon: ShoppingBag,
          color: "bg-emerald-50 text-emerald-800 border-emerald-200",
        };
      case "HIJAMA":
        return {
          label: "Sunnah Hijama Clinic",
          icon: Droplets,
          color: "bg-teal-50 text-teal-800 border-teal-200",
        };
      case "CONSULTATION":
        return {
          label: "Physician Consult",
          icon: Activity,
          color: "bg-blue-50 text-blue-800 border-blue-200",
        };
      default:
        return {
          label: "Platform-Wide",
          icon: Layers,
          color: "bg-purple-50 text-purple-800 border-purple-200",
        };
    }
  };

  const getDiscountDisplay = (coupon: ActiveCoupon) => {
    switch (coupon.discountType) {
      case "PERCENTAGE":
        return `${coupon.discountValue}% OFF`;
      case "FIXED":
        return `₨ ${coupon.discountValue} OFF`;
      case "FREE_SHIPPING":
        return "FREE SHIPPING";
      case "FREE_SERVICE":
        return "100% FREE VOUCHER";
      default:
        return "SPECIAL DISCOUNT";
    }
  };

  const coupons = data?.coupons || [];
  const loyalty = data?.loyalty;
  const referral = data?.isReferralActive ? data?.referral : null;

  return (
    <section
      id="active-offers"
      className="relative py-12 sm:py-16 bg-gradient-to-b from-surface to-surface-subtle border-y border-line overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold-100 border border-brand-gold-300 text-brand-gold-900 text-xs font-bold uppercase tracking-wider shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold-700" />
              <span>Live Promotions &amp; Rewards (پیشکش اور انعامات)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-primary">
              Active Offers &amp; Member Discounts
            </h2>
            <p className="text-xs sm:text-sm text-ink-body max-w-2xl">
              Apply active promotional vouchers at checkout or earn 1:1 loyalty points on every purchase. All offers are server-verified and guaranteed.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-white border border-line text-xs font-bold text-ink shadow-2xs">
              {loading ? "..." : `${coupons.length + (loyalty ? 1 : 0) + (referral ? 1 : 0)} Active Deals`}
            </span>
          </div>
        </div>

        {/* Offers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-48 rounded-2xl bg-white/60 animate-pulse border border-line"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Active Coupon Cards */}
            {coupons.map((coupon) => {
              const scopeInfo = getScopeBadge(coupon.scope);
              const ScopeIcon = scopeInfo.icon;
              const isApplied = appliedCoupon?.code === coupon.code;
              const isCopied = copiedCode === coupon.code;

              return (
                <div
                  key={coupon.id}
                  className="bg-white rounded-2xl p-5 border border-line shadow-2xs hover:shadow-sm hover:border-line-strong transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Badge Row */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-black tracking-wide">
                        {getDiscountDisplay(coupon)}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${scopeInfo.color}`}
                      >
                        <ScopeIcon className="w-3 h-3" />
                        <span>{scopeInfo.label}</span>
                      </span>
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="font-serif font-bold text-base text-ink group-hover:text-primary transition-colors">
                        {coupon.description}
                      </h3>
                      {coupon.isFlashSale && coupon.flashSaleBannerText && (
                        <p className="text-xs text-amber-700 font-semibold mt-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>{coupon.flashSaleBannerText}</span>
                        </p>
                      )}
                    </div>

                    {/* Terms & Safeguards */}
                    <div className="text-[11px] text-ink-subtle space-y-0.5 bg-surface p-2.5 rounded-xl border border-line/60">
                      {coupon.minSubtotal && (
                        <div>• Min. spend: ₨ {coupon.minSubtotal.toLocaleString()}</div>
                      )}
                      {coupon.maxDiscountCap && (
                        <div>• Maximum savings cap: ₨ {coupon.maxDiscountCap.toLocaleString()}</div>
                      )}
                      {coupon.endDate && (
                        <div className="flex items-center gap-1 text-ink-body pt-0.5 font-medium">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Valid through {new Date(coupon.endDate).toLocaleDateString("en-PK")}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Copy Coupon Action */}
                  <div className="pt-2 border-t border-line flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-bold text-primary tracking-wider bg-surface px-3 py-1.5 rounded-lg border border-line">
                      {coupon.code}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(coupon.code, coupon.scope)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                        isCopied || isApplied
                          ? "bg-emerald-700 text-white"
                          : "bg-brand-gold-400 hover:bg-brand-gold-500 text-brand-green-950 active:scale-95"
                      }`}
                    >
                      {isCopied || isApplied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{isApplied ? "Applied!" : "Copied!"}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Loyalty Rewards Program Card (Always active) */}
            {loyalty && (
              <div className="bg-gradient-to-br from-amber-500/10 via-amber-50/40 to-white rounded-2xl p-5 border border-amber-200/80 shadow-2xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-600 text-white text-xs font-black tracking-wide">
                      2% CASHBACK
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border bg-amber-50 text-amber-800 border-amber-200">
                      <Coins className="w-3 h-3 text-amber-600" />
                      <span>Loyalty Perks</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-base text-primary">
                      TMS Sehat Rewards (انعامی پوائنٹس)
                    </h3>
                    <p className="text-xs text-ink-body mt-1">
                      {loyalty.description}
                    </p>
                  </div>

                  <div className="text-[11px] text-amber-900 space-y-0.5 bg-amber-100/50 p-2.5 rounded-xl border border-amber-200/60 font-medium">
                    <div>• 1 Point = ₨ 1.00 PKR exact cash parity</div>
                    <div>• Automatically credits to your account on delivery</div>
                    <div>• Redeem up to 10% subtotal at checkout</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-950">
                    Perpetual Member Perk
                  </span>
                  <Link
                    href="/account/loyalty"
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-brand-green-800"
                  >
                    <span>View Ledger</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Friend Referral Card (CONDITIONALLY RENDERED ONLY IF REFERRAL IS ACTIVE) */}
            {referral && (
              <div className="bg-gradient-to-br from-emerald-500/10 via-teal-50/40 to-white rounded-2xl p-5 border border-teal-200/80 shadow-2xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-black tracking-wide">
                      ₨ 200 WELCOME
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border bg-emerald-50 text-emerald-800 border-emerald-200">
                      <Users className="w-3 h-3 text-emerald-600" />
                      <span>Referral Program</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-base text-primary">
                      Invite Friends &amp; Earn 100 Points
                    </h3>
                    <p className="text-xs text-ink-body mt-1">
                      {referral.description}
                    </p>
                  </div>

                  <div className="text-[11px] text-emerald-900 space-y-0.5 bg-emerald-100/50 p-2.5 rounded-xl border border-emerald-200/60 font-medium">
                    <div>• Friends get ₨ {referral.welcomeDiscount} off their 1st purchase</div>
                    <div>• You earn {referral.rewardPoints} points (₨ {referral.rewardPoints}) upon delivery</div>
                    <div>• Instant WhatsApp invite links</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-teal-200/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-950">
                    Community Rewards
                  </span>
                  <Link
                    href="/account/referrals"
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950"
                  >
                    <span>Invite Friends</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state when no coupons are active */}
        {!loading && coupons.length === 0 && !referral && (
          <div className="p-6 bg-white rounded-2xl border border-line text-center space-y-2">
            <Tag className="w-8 h-8 text-amber-600 mx-auto opacity-70" />
            <h3 className="font-serif font-bold text-base text-primary">
              Standard Loyalty Rewards Active
            </h3>
            <p className="text-xs text-ink-body max-w-md mx-auto">
              No seasonal coupon codes are currently running, but all registered members earn 2% cashback points on apothecary orders, ₨ 50 on Sunnah Hijama, and ₨ 30 on Physician Consultations!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
