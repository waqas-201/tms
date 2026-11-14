"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  QrCode,
  Share2,
  Globe,
  Coins,
  ShoppingBag,
  ShieldCheck,
  RefreshCw,
  ArrowUpRight,
  Sparkles,
  Percent,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";

interface AnalyticsData {
  acquisition: {
    totalMembers: number;
    bySource: {
      QR: number;
      WEBSITE: number;
      REFERRAL: number;
      [key: string]: number;
    };
    qrPercentage: number;
    websitePercentage: number;
    referralPercentage: number;
  };
  referrals: {
    totalReferrers: number;
    totalReferred: number;
    successfulReferrals: number;
    pendingReferrals: number;
    conversionRate: number;
    pointsAwarded: number;
    pkrValueAwarded: number;
  };
  loyalty: {
    totalPointsIssued: number;
    totalPointsRedeemed: number;
    totalPointsClawedBack: number;
    outstandingPointsLiability: number;
    outstandingCashLiabilityPkr: number;
  };
  orders: {
    totalOrders: number;
    statusCounts: {
      DELIVERED: number;
      CANCELLED: number;
      CONFIRMED: number;
      DISPATCHED: number;
      PENDING: number;
    };
    gmv: number;
    netRevenue: number;
    totalDiscountBurn: number;
    aov: number;
    fulfillmentRate: number;
    cancellationRate: number;
  };
}

export default function AnalyticsTab() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/analytics");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load clinic analytics.");
      }
      setData(json.data);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred while fetching business analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading && !data) {
    return (
      <div className="bg-white rounded-2xl border border-line p-12 text-center text-sm text-ink-subtle">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
        Calculating business metrics and ledger balance sheet...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger-soft border border-danger-line text-danger p-6 rounded-2xl text-sm space-y-2">
        <div className="font-bold">Error Loading Analytics</div>
        <div>{error}</div>
        <button
          onClick={fetchAnalytics}
          className="mt-2 px-3 py-1 bg-white border border-danger text-danger text-xs font-bold rounded-lg cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-line shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-primary flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            Executive Business Analytics &amp; Ledger Telemetry
          </h2>
          <p className="text-xs text-ink-subtle mt-0.5">
            Real-time acquisition channels, referral funnel conversion, and loyalty points financial liabilities.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface hover:bg-surface-sunken border border-line rounded-xl text-xs font-bold text-ink transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Top Row: 4 Essential Financial Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GMV */}
        <div className="bg-white p-5 rounded-2xl border border-line shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink-subtle">
            <span>Gross Merchandise (GMV)</span>
            <ShoppingBag className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-serif font-bold text-primary">
            ₨ {data.orders.gmv.toLocaleString()}
          </div>
          <p className="text-[11px] text-ink-subtle">
            Net settled: ₨ {data.orders.netRevenue.toLocaleString()}
          </p>
        </div>

        {/* Total Members */}
        <div className="bg-white p-5 rounded-2xl border border-line shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink-subtle">
            <span>Total Clinic Members</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-700">
            {data.acquisition.totalMembers.toLocaleString()}
          </div>
          <p className="text-[11px] text-ink-subtle">
            {data.acquisition.bySource.QR || 0} QR • {data.acquisition.bySource.REFERRAL || 0} Referral
          </p>
        </div>

        {/* Referral Conversion */}
        <div className="bg-white p-5 rounded-2xl border border-line shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink-subtle">
            <span>Referral Conversion Rate</span>
            <Percent className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-blue-700">
            {data.referrals.conversionRate}%
          </div>
          <p className="text-[11px] text-ink-subtle">
            {data.referrals.successfulReferrals} of {data.referrals.totalReferred} orders qualified
          </p>
        </div>

        {/* Loyalty Liability */}
        <div className="bg-white p-5 rounded-2xl border border-line shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink-subtle">
            <span>Outstanding Point Liability</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-amber-700">
            ₨ {data.loyalty.outstandingCashLiabilityPkr.toLocaleString()}
          </div>
          <p className="text-[11px] text-ink-subtle">
            {data.loyalty.outstandingPointsLiability.toLocaleString()} active points on balance sheet
          </p>
        </div>
      </div>

      {/* Section 1: Acquisition Channels & Funnel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-line shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-primary flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-600" />
              Member Acquisition Channels
            </h3>
            <span className="text-xs font-semibold text-ink-subtle">
              {data.acquisition.totalMembers} Total Members
            </span>
          </div>

          <div className="space-y-4">
            {/* Walk-in QR Posters */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-ink flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  Clinic QR Poster Walk-ins
                </span>
                <span className="font-mono font-bold text-ink-body">
                  {data.acquisition.bySource.QR || 0} ({data.acquisition.qrPercentage}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-surface-sunken rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(2, data.acquisition.qrPercentage)}%` }}
                />
              </div>
            </div>

            {/* Word of Mouth Referrals */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-ink flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                  Word-of-Mouth Member Referrals
                </span>
                <span className="font-mono font-bold text-ink-body">
                  {data.acquisition.bySource.REFERRAL || 0} ({data.acquisition.referralPercentage}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-surface-sunken rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(2, data.acquisition.referralPercentage)}%` }}
                />
              </div>
            </div>

            {/* Direct Website */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-ink flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                  Direct Online &amp; Search Signups
                </span>
                <span className="font-mono font-bold text-ink-body">
                  {data.acquisition.bySource.WEBSITE || 0} ({data.acquisition.websitePercentage}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-surface-sunken rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(2, data.acquisition.websitePercentage)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Referral Funnel Performance */}
        <div className="bg-white p-6 rounded-2xl border border-line shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-primary flex items-center gap-2">
              <Share2 className="w-5 h-5 text-blue-600" />
              Referral Program ROI &amp; Conversion
            </h3>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {data.referrals.conversionRate}% Conversion
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-surface border border-line">
              <div className="text-xs text-ink-subtle">Active Referrers</div>
              <div className="text-xl font-bold font-serif text-primary mt-0.5">
                {data.referrals.totalReferrers}
              </div>
              <div className="text-[10px] text-ink-subtle">Members with referral codes</div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-line">
              <div className="text-xs text-ink-subtle">Friends Invited</div>
              <div className="text-xl font-bold font-serif text-primary mt-0.5">
                {data.referrals.totalReferred}
              </div>
              <div className="text-[10px] text-ink-subtle">Registered referee accounts</div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-line">
              <div className="text-xs text-ink-subtle">Delivered 1st Purchases</div>
              <div className="text-xl font-bold font-serif text-emerald-700 mt-0.5">
                {data.referrals.successfulReferrals}
              </div>
              <div className="text-[10px] text-ink-subtle">Orders $\ge$ ₨ 1,000 subtotal</div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-line">
              <div className="text-xs text-ink-subtle">Referral Points Awarded</div>
              <div className="text-xl font-bold font-serif text-amber-700 mt-0.5">
                ₨ {data.referrals.pkrValueAwarded.toLocaleString()}
              </div>
              <div className="text-[10px] text-ink-subtle">{data.referrals.pointsAwarded} pts credited</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Loyalty Ledger Balance Sheet & Commerce Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loyalty Balance Sheet */}
        <div className="bg-white p-6 rounded-2xl border border-line shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-primary flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-600" />
              Loyalty Ledger Balance Sheet
            </h3>
            <span className="text-xs font-mono font-bold text-ink-subtle">
              1 Pt = ₨ 1.00 PKR
            </span>
          </div>

          <div className="divide-y divide-line text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-ink-body">Total Points Issued (Orders, Hijama, Referrals)</span>
              <span className="font-mono font-bold text-emerald-700">
                +{data.loyalty.totalPointsIssued.toLocaleString()} pts
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-ink-body">Total Points Redeemed (Checkout Burns)</span>
              <span className="font-mono font-bold text-red-600">
                -{data.loyalty.totalPointsRedeemed.toLocaleString()} pts
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-ink-body">Total Points Clawed Back (Order Cancellations)</span>
              <span className="font-mono font-bold text-ink-subtle">
                -{data.loyalty.totalPointsClawedBack.toLocaleString()} pts
              </span>
            </div>
            <div className="py-3 flex items-center justify-between bg-surface/50 px-2 rounded-lg font-bold">
              <span className="text-primary font-serif text-sm">
                Active Liability to Honor
              </span>
              <span className="font-mono text-sm text-primary">
                ₨ {data.loyalty.outstandingCashLiabilityPkr.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Order Commerce Health */}
        <div className="bg-white p-6 rounded-2xl border border-line shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-primary flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Order Pipeline &amp; Discount Burn
            </h3>
            <span className="text-xs font-semibold text-ink-subtle">
              {data.orders.totalOrders} Orders Placed
            </span>
          </div>

          <div className="divide-y divide-line text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-ink-body">Average Delivered Order Value (AOV)</span>
              <span className="font-mono font-bold text-primary">
                ₨ {data.orders.aov.toLocaleString()}
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-ink-body">Delivered Fulfillment Rate</span>
              <span className="font-mono font-bold text-emerald-700">
                {data.orders.fulfillmentRate}% ({data.orders.statusCounts.DELIVERED} Delivered)
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-ink-body">Order Cancellation Rate</span>
              <span className="font-mono font-bold text-red-600">
                {data.orders.cancellationRate}% ({data.orders.statusCounts.CANCELLED} Cancelled)
              </span>
            </div>
            <div className="py-3 flex items-center justify-between bg-surface/50 px-2 rounded-lg font-bold">
              <span className="text-primary font-serif text-sm">
                Total Promotional Discount Burn
              </span>
              <span className="font-mono text-sm text-amber-700">
                ₨ {data.orders.totalDiscountBurn.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
