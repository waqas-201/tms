"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  Coins,
  ArrowLeft,
  RefreshCw,
  Gift,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  ChevronRight,
} from "lucide-react";

interface LoyaltyEntry {
  id: string;
  userId: string;
  amount: number;
  type: "EARN" | "REDEEM" | "CLAWBACK" | "REFUND" | "ADJUST" | "EXPIRE";
  source: "ORDER" | "HIJAMA" | "CONSULTATION" | "ADMIN" | "EXPIRY";
  referenceId: string | null;
  balanceAfter: number;
  reason: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface LoyaltyData {
  pointsBalance: number;
  pkrValue: number;
  rules: {
    pointToPkrRate: number;
    minRedemptionPoints: number;
    maxSubtotalCapPercent: number;
  };
  history: LoyaltyEntry[];
}

export default function LoyaltyAccountPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LoyaltyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "EARN" | "REDEEM" | "ADJUST">("ALL");

  const fetchLoyaltyData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account/loyalty");
      if (res.status === 401) {
        router.push("/login?redirect=/account/loyalty");
        return;
      }
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load loyalty account.");
      }
      setData(json);
    } catch (err: any) {
      setError(err?.message || "An error occurred while loading your loyalty ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSessionPending) {
      if (!session) {
        router.push("/login?redirect=/account/loyalty");
      } else {
        fetchLoyaltyData();
      }
    }
  }, [session, isSessionPending]);

  const filteredHistory = (data?.history || []).filter((entry) => {
    if (filter === "ALL") return true;
    if (filter === "EARN") return entry.type === "EARN";
    if (filter === "REDEEM") return entry.type === "REDEEM";
    if (filter === "ADJUST") return entry.type === "ADJUST" || entry.type === "CLAWBACK" || entry.type === "REFUND";
    return true;
  });

  const points = data?.pointsBalance ?? 0;
  const pkrValue = data?.pkrValue ?? 0;
  const minThreshold = data?.rules?.minRedemptionPoints ?? 200;
  const progressPercent = Math.min(100, Math.max(0, (points / minThreshold) * 100));

  return (
    <div className="min-h-screen bg-surface-subtle py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-ink-subtle hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Account</span>
          </Link>

          <button
            type="button"
            onClick={fetchLoyaltyData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-line rounded-xl text-xs font-medium text-ink hover:bg-surface-sunken transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Header Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-primary to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-gold-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>TMS Sehat Rewards (صحت لائلٹی پروگرام)</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                Loyalty &amp; Rewards Ledger
              </h1>
              <p className="text-emerald-100/90 text-xs sm:text-sm max-w-xl">
                Earn 2% on apothecary orders, ₨ 50 on Sunnah Hijama, and ₨ 30 on Physician Consultations. Points are valid 1:1 against future orders.
              </p>
            </div>

            {/* KPI Balance Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 sm:p-6 text-center md:min-w-[240px] flex flex-col items-center justify-center">
              <span className="text-xs uppercase tracking-wider text-emerald-200 font-medium">
                Active Balance
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-serif text-4xl sm:text-5xl font-black text-white">
                  {loading ? "..." : points.toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-gold-300">pts</span>
              </div>
              <div className="mt-2 text-xs text-emerald-100/80 bg-black/20 px-3 py-1 rounded-full">
                Value: <span className="font-bold text-white">₨ {pkrValue.toLocaleString()} PKR</span> (1 pt = ₨ 1)
              </div>
            </div>
          </div>

          {/* Progress to Burn bar */}
          <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-200">
                Redemption Threshold: <span className="font-semibold text-white">{minThreshold} points</span>
              </span>
              <span className="text-gold-300 font-medium">
                {points >= minThreshold ? (
                  <span className="inline-flex items-center gap-1 text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready to redeem at checkout
                  </span>
                ) : (
                  `${Math.max(0, minThreshold - points)} more points needed`
                )}
              </span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-gold-400 to-amber-300 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Program Rules & Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-line shadow-2xs space-y-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
              <Gift className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-sm text-primary">Apothecary Earn</h3>
            <p className="text-xs text-ink-subtle">
              Automatically receive 2% of product subtotal on all delivered apothecary orders.
            </p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-line shadow-2xs space-y-1">
            <div className="w-8 h-8 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center mb-2">
              <Coins className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-sm text-primary">Clinical Services</h3>
            <p className="text-xs text-ink-subtle">
              Earn a flat 50 pts (₨ 50) for Sunnah Hijama and 30 pts (₨ 30) for clinical consultations.
            </p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-line shadow-2xs space-y-1">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-2">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-sm text-primary">1:1 Cash Parity</h3>
            <p className="text-xs text-ink-subtle">
              Every point is worth exactly ₨ 1.00. Apply up to 25% of subtotal at checkout when balance ≥ 200 pts.
            </p>
          </div>
        </div>

        {/* Ledger Statement Section */}
        <div className="bg-white rounded-3xl border border-line shadow-2xs overflow-hidden">
          {/* Table Header & Filter Tabs */}
          <div className="p-5 sm:p-6 border-b border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-primary">
                Transaction History (کھاتہ تفصیل)
              </h2>
              <p className="text-xs text-ink-subtle mt-0.5">
                Authoritative double-entry ledger statement of all earnings, redemptions, and adjustments.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-surface-subtle p-1 rounded-xl text-xs font-semibold self-stretch sm:self-auto">
              {(["ALL", "EARN", "REDEEM", "ADJUST"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    filter === tab
                      ? "bg-white text-primary shadow-2xs font-bold"
                      : "text-ink-subtle hover:text-ink"
                  }`}
                >
                  {tab === "ALL" && "All"}
                  {tab === "EARN" && "Earned"}
                  {tab === "REDEEM" && "Redeemed"}
                  {tab === "ADJUST" && "Adjustments"}
                </button>
              ))}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="m-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Ledger Table */}
          {loading ? (
            <div className="p-12 text-center space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin text-primary mx-auto" />
              <p className="text-xs text-ink-subtle">Loading your loyalty ledger...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Coins className="w-10 h-10 text-ink-subtle/40 mx-auto" />
              <h3 className="font-serif font-bold text-ink">No transactions found</h3>
              <p className="text-xs text-ink-subtle max-w-sm mx-auto">
                {filter === "ALL"
                  ? "You have not earned or redeemed any points yet. Place an apothecary order or complete a clinic session to start earning!"
                  : `No entries matching the "${filter}" filter.`}
              </p>
              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-hover transition-colors"
                >
                  <span>Explore Apothecary</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-subtle text-ink-subtle font-semibold border-b border-line">
                    <th className="py-3 px-4 sm:px-6">Date</th>
                    <th className="py-3 px-4">Type &amp; Source</th>
                    <th className="py-3 px-4">Description / Reference</th>
                    <th className="py-3 px-4 text-right">Points</th>
                    <th className="py-3 px-4 sm:px-6 text-right">Balance After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredHistory.map((item) => {
                    const isCredit = item.amount > 0;
                    return (
                      <tr key={item.id} className="hover:bg-surface-subtle/50 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6 text-ink-subtle whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleDateString("en-PK", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide ${
                                item.type === "EARN"
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : item.type === "REDEEM"
                                  ? "bg-rose-50 text-rose-800 border border-rose-200"
                                  : item.type === "CLAWBACK"
                                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                                  : item.type === "REFUND"
                                  ? "bg-blue-50 text-blue-800 border border-blue-200"
                                  : "bg-purple-50 text-purple-800 border border-purple-200"
                              }`}
                            >
                              {item.type}
                            </span>
                            <span className="text-[10px] text-ink-subtle font-medium uppercase">
                              {item.source}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="text-ink font-medium truncate">
                            {item.reason || `Activity via ${item.source}`}
                          </p>
                          {item.referenceId && (
                            <span className="text-[10px] text-ink-subtle font-mono">
                              Ref: {item.referenceId}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <span
                            className={`font-semibold inline-flex items-center gap-0.5 ${
                              isCredit ? "text-emerald-700" : "text-rose-700"
                            }`}
                          >
                            {isCredit ? (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                            )}
                            {isCredit ? `+${item.amount}` : item.amount} pts
                          </span>
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap font-mono font-medium text-ink">
                          {item.balanceAfter} pts
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
