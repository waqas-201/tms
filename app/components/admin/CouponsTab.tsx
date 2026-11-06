"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Tag,
  Sparkles,
  Plus,
  Search,
  Filter,
  Check,
  Copy,
  Edit2,
  Trash2,
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Loader2,
  X,
  ChevronDown,
  ShoppingBag,
  Activity,
  Droplets,
  Layers,
  Eye,
  CheckCircle2,
  ShieldAlert,
  Percent,
  Truck,
  Gift,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

interface CouponItem {
  id: string;
  code: string;
  description: string;
  scope: string; // PRODUCTS | HIJAMA | CONSULTATION | ALL | CATEGORY
  discountType: string; // PERCENTAGE | FIXED | FREE_SHIPPING | FREE_SERVICE
  discountValue: number;
  minSubtotal?: number | null;
  maxDiscountCap?: number | null;
  targetCategoryId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  usageLimit?: number | null;
  usageCount: number;
  perUserLimit: number;
  isActive: boolean;
  isFlashSale: boolean;
  flashSaleBannerText?: string | null;
  flashSaleBadge?: string | null;
  createdAt: string;
  totalDiscountGiven?: number;
  totalRevenueGenerated?: number;
  redemptions?: Array<{
    id: string;
    discountAmount: number;
    orderTotal: number | null;
    orderId: string | null;
    hijamaBookingId: string | null;
    consultationId: string | null;
    redeemedAt: string;
  }>;
  _count?: {
    redemptions: number;
    orders: number;
    hijamaBookings: number;
    consultations: number;
  };
}

interface SummaryData {
  totalCoupons: number;
  activeCoupons: number;
  totalRedemptions: number;
  totalDiscountsGiven: number;
  totalRevenueInfluenced: number;
}

export default function CouponsTab() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals & Drawers
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  const [selectedCouponForAudit, setSelectedCouponForAudit] = useState<CouponItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    scope: "PRODUCTS",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minSubtotal: "" as string | number,
    maxDiscountCap: "" as string | number,
    targetCategoryId: "",
    startDate: "",
    endDate: "",
    usageLimit: "" as string | number,
    perUserLimit: 1,
    isActive: true,
    isFlashSale: false,
    flashSaleBannerText: "",
    flashSaleBadge: "⚡ FLASH OFFER",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Categories list for CATEGORY scope
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (scopeFilter !== "ALL") params.set("scope", scopeFilter);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/admin/coupons?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load coupons.");
      }

      setCoupons(json.data || []);
      setSummary(json.summary || null);
    } catch (err: any) {
      console.error("Error loading coupons:", err);
      setError(err.message || "Failed to load coupons.");
    } finally {
      setLoading(false);
    }
  }, [scopeFilter, statusFilter, search]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // Load categories once
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      description: "",
      scope: "PRODUCTS",
      discountType: "PERCENTAGE",
      discountValue: 15,
      minSubtotal: "",
      maxDiscountCap: 500,
      targetCategoryId: "",
      startDate: "",
      endDate: "",
      usageLimit: "",
      perUserLimit: 1,
      isActive: true,
      isFlashSale: false,
      flashSaleBannerText: "",
      flashSaleBadge: "⚡ FLASH OFFER",
    });
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (coupon: CouponItem) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      scope: coupon.scope,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minSubtotal: coupon.minSubtotal ?? "",
      maxDiscountCap: coupon.maxDiscountCap ?? "",
      targetCategoryId: coupon.targetCategoryId || "",
      startDate: coupon.startDate ? coupon.startDate.split("T")[0] : "",
      endDate: coupon.endDate ? coupon.endDate.split("T")[0] : "",
      usageLimit: coupon.usageLimit ?? "",
      perUserLimit: coupon.perUserLimit || 1,
      isActive: coupon.isActive,
      isFlashSale: coupon.isFlashSale,
      flashSaleBannerText: coupon.flashSaleBannerText || "",
      flashSaleBadge: coupon.flashSaleBadge || "⚡ FLASH OFFER",
    });
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleGenerateRandomCode = () => {
    const prefixes = ["SEHAT", "TIBBI", "SUNNAH", "FLASH", "MATAB"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, code: `${prefix}${num}` }));
  };

  const handleToggleStatus = async (coupon: CouponItem) => {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error || "Failed to update status.");
        return;
      }
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, isActive: !coupon.isActive } : c))
      );
    } catch (err: any) {
      alert(err.message || "Failed to update status.");
    }
  };

  const handleDeleteCoupon = async (coupon: CouponItem) => {
    if (!confirm(`Are you sure you want to remove or deactivate coupon "${coupon.code}"?`)) return;

    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error || "Failed to delete coupon.");
        return;
      }
      fetchCoupons();
    } catch (err: any) {
      alert(err.message || "Failed to delete coupon.");
    }
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      const url = editingCoupon
        ? `/api/admin/coupons/${editingCoupon.id}`
        : "/api/admin/coupons";
      const method = editingCoupon ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save coupon.");
      }

      setIsFormModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      setFormError(err.message || "Failed to save coupon.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const getScopeBadge = (scope: string) => {
    switch (scope) {
      case "PRODUCTS":
        return {
          label: "Apothecary Products",
          className: "bg-emerald-50 text-emerald-800 border-emerald-200",
          icon: ShoppingBag,
        };
      case "HIJAMA":
        return {
          label: "Hijama Cupping",
          className: "bg-cyan-50 text-cyan-800 border-cyan-200",
          icon: Droplets,
        };
      case "CONSULTATION":
        return {
          label: "Hakeem Consultation",
          className: "bg-purple-50 text-purple-800 border-purple-200",
          icon: Activity,
        };
      case "CATEGORY":
        return {
          label: "Specific Category",
          className: "bg-amber-50 text-amber-800 border-amber-200",
          icon: Layers,
        };
      default:
        return {
          label: "Global (All Services)",
          className: "bg-blue-50 text-blue-800 border-blue-200",
          icon: Tag,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── 1. TOP STATS CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Promos */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-line shadow-xs space-y-2">
          <div className="flex items-center justify-between text-ink-subtle">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Promotions</span>
            <Tag className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-ink">
              {summary ? summary.activeCoupons : 0}
            </span>
            <span className="text-xs text-ink-muted">
              of {summary ? summary.totalCoupons : 0} Total
            </span>
          </div>
          <p className="text-[11px] text-ink-subtle">Live marketing codes running right now</p>
        </div>

        {/* Total Redemptions */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-line shadow-xs space-y-2">
          <div className="flex items-center justify-between text-ink-subtle">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Redemptions</span>
            <CheckCircle2 className="w-4 h-4 text-brand-green-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-ink">
              {summary ? summary.totalRedemptions.toLocaleString() : 0}
            </span>
            <span className="text-xs text-success font-semibold">Uses</span>
          </div>
          <p className="text-[11px] text-ink-subtle">Across Products, Hijama &amp; Consultations</p>
        </div>

        {/* Discounts Granted */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-line shadow-xs space-y-2">
          <div className="flex items-center justify-between text-ink-subtle">
            <span className="text-xs font-semibold uppercase tracking-wider">Discounts Given</span>
            <Gift className="w-4 h-4 text-brand-gold-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-ink">
              ₨ {summary ? Math.round(summary.totalDiscountsGiven).toLocaleString() : 0}
            </span>
          </div>
          <p className="text-[11px] text-ink-subtle">Total customer savings distributed</p>
        </div>

        {/* Influenced Revenue */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-line shadow-xs space-y-2">
          <div className="flex items-center justify-between text-ink-subtle">
            <span className="text-xs font-semibold uppercase tracking-wider">Influenced Revenue</span>
            <TrendingUp className="w-4 h-4 text-brand-green-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-ink">
              ₨ {summary ? Math.round(summary.totalRevenueInfluenced).toLocaleString() : 0}
            </span>
          </div>
          <p className="text-[11px] text-ink-subtle">Gross order value driven by coupons</p>
        </div>
      </div>

      {/* ─── 2. TOOLBAR & CONTROLS ─── */}
      <div className="p-4 rounded-2xl bg-white border border-line shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by code (e.g. SEHAT20) or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface border border-line rounded-xl text-xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-primary focus:bg-white transition-colors"
            />
          </div>

          {/* Action Button: Create Coupon */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchCoupons}
              className="p-2 border border-line rounded-xl hover:bg-surface text-ink-muted hover:text-ink transition-colors cursor-pointer"
              title="Refresh list"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
            </button>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-primary hover:bg-brand-green-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Coupon</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-line text-xs">
          <span className="text-ink-subtle font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Scope:</span>
          </span>
          {["ALL", "PRODUCTS", "HIJAMA", "CONSULTATION", "CATEGORY"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScopeFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                scopeFilter === s
                  ? "bg-primary text-white font-bold"
                  : "bg-surface hover:bg-line text-ink-body"
              }`}
            >
              {s === "ALL" ? "All Scopes" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}

          <span className="text-ink-subtle font-semibold ml-auto flex items-center gap-1">
            <span>Status:</span>
          </span>
          {["ALL", "ACTIVE", "INACTIVE"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === st
                  ? "bg-surface-inverse text-white font-bold"
                  : "bg-surface hover:bg-line text-ink-body"
              }`}
            >
              {st === "ALL" ? "All" : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 3. COUPONS LIST / TABLE ─── */}
      {loading ? (
        <div className="p-12 bg-white rounded-2xl border border-line text-center space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
          <p className="text-xs text-ink-muted">Loading coupons and marketing campaigns...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-danger-soft border border-danger/20 rounded-2xl text-center space-y-2 text-danger">
          <AlertCircle className="w-6 h-6 mx-auto text-danger" />
          <p className="text-xs font-semibold">{error}</p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-line text-center space-y-3">
          <Tag className="w-10 h-10 text-ink-subtle mx-auto opacity-50" />
          <h3 className="font-serif text-lg font-bold text-ink">No Coupons Found</h3>
          <p className="text-xs text-ink-muted max-w-sm mx-auto">
            No coupon codes match your active filters. Click &quot;Create Coupon&quot; to spin up a promotional code.
          </p>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-primary hover:bg-brand-green-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Coupon</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((coupon) => {
            const scopeInfo = getScopeBadge(coupon.scope);
            const ScopeIcon = scopeInfo.icon;
            const usagePercent = coupon.usageLimit
              ? Math.min(100, Math.round((coupon.usageCount / coupon.usageLimit) * 100))
              : 0;

            return (
              <div
                key={coupon.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  coupon.isActive
                    ? "bg-white border-line shadow-xs hover:border-line-strong"
                    : "bg-surface/50 border-line/60 opacity-75"
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Left: Code, Badges, Description */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-base sm:text-lg font-bold text-ink tracking-wide px-2.5 py-0.5 rounded-lg bg-surface border border-line">
                        {coupon.code}
                      </span>

                      {/* Scope Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${scopeInfo.className}`}
                      >
                        <ScopeIcon className="w-3 h-3" />
                        <span>{scopeInfo.label}</span>
                      </span>

                      {/* Flash Sale Badge */}
                      {coupon.isFlashSale && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-gold-100 text-brand-gold-900 border border-brand-gold-300 text-[10px] font-bold uppercase">
                          <Sparkles className="w-3 h-3 text-brand-gold-600" />
                          <span>{coupon.flashSaleBadge || "FLASH OFFER"}</span>
                        </span>
                      )}

                      {/* Active Status Badge */}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          coupon.isActive
                            ? "bg-success-soft text-success border border-success-line"
                            : "bg-surface-sunken text-ink-muted border border-line"
                        }`}
                      >
                        {coupon.isActive ? "Active" : "Paused"}
                      </span>
                    </div>

                    <p className="text-xs text-ink-body font-medium">{coupon.description}</p>

                    {/* Flash Banner Preview if present */}
                    {coupon.flashSaleBannerText && (
                      <p className="text-[11px] text-primary italic flex items-center gap-1">
                        <span>Banner ticker:</span> &quot;{coupon.flashSaleBannerText}&quot;
                      </p>
                    )}
                  </div>

                  {/* Middle: Discount Details & Safeguards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs w-full lg:w-auto shrink-0 bg-surface/60 p-3 rounded-xl border border-line/80">
                    <div>
                      <span className="block text-[10px] text-ink-subtle uppercase">Discount</span>
                      <span className="font-bold text-ink">
                        {coupon.discountType === "PERCENTAGE" && `${coupon.discountValue}% OFF`}
                        {coupon.discountType === "FIXED" && `₨ ${coupon.discountValue} Flat`}
                        {coupon.discountType === "FREE_SHIPPING" && "Free Shipping"}
                        {coupon.discountType === "FREE_SERVICE" && "100% Free Voucher"}
                      </span>
                      {coupon.maxDiscountCap && (
                        <span className="text-[10px] text-ink-muted block">
                          Cap: ₨ {coupon.maxDiscountCap}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="block text-[10px] text-ink-subtle uppercase">Requirements</span>
                      <span className="font-semibold text-ink">
                        {coupon.minSubtotal ? `Min: ₨ ${coupon.minSubtotal.toLocaleString()}` : "No min subtotal"}
                      </span>
                      <span className="text-[10px] text-ink-muted block">
                        Limit: {coupon.perUserLimit} per patient
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] text-ink-subtle uppercase">Redemptions</span>
                      <span className="font-bold text-ink">
                        {coupon.usageCount}
                        {coupon.usageLimit ? ` / ${coupon.usageLimit}` : " uses"}
                      </span>
                      {coupon.usageLimit && (
                        <div className="w-full bg-line rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full transition-all"
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 ml-auto lg:ml-0 shrink-0">
                    {/* View Redemptions Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedCouponForAudit(coupon)}
                      className="p-2 border border-line rounded-xl hover:bg-surface text-ink-body hover:text-ink transition-colors cursor-pointer"
                      title="Inspect Redemptions"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(coupon)}
                      className="p-2 border border-line rounded-xl hover:bg-surface text-ink-body hover:text-ink transition-colors cursor-pointer"
                      title="Edit Coupon"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Toggle Status Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(coupon)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer ${
                        coupon.isActive
                          ? "bg-warning-soft hover:bg-warning-line text-warning"
                          : "bg-success-soft hover:bg-success-line text-success"
                      }`}
                    >
                      {coupon.isActive ? "Pause" : "Activate"}
                    </button>

                    {/* Delete / Deactivate */}
                    <button
                      type="button"
                      onClick={() => handleDeleteCoupon(coupon)}
                      className="p-2 border border-line rounded-xl hover:bg-danger-soft text-ink-subtle hover:text-danger transition-colors cursor-pointer"
                      title="Delete / Deactivate"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── 4. CREATE / EDIT MODAL ─── */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-line shadow-2xl w-full max-w-2xl my-8 overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-line flex items-center justify-between bg-surface">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-ink">
                    {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : "Create Promotional Coupon"}
                  </h3>
                  <p className="text-xs text-ink-muted">
                    Configure scope, discount value, margin safeguards &amp; flash banners
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-line text-ink-subtle hover:text-ink transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="p-5 sm:p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-danger-soft border border-danger/20 rounded-xl text-danger flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Code & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-ink uppercase tracking-wider">
                      Coupon Code <span className="text-danger">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateRandomCode}
                      className="text-[10px] text-primary hover:underline font-semibold cursor-pointer"
                    >
                      Generate Code
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SEHAT20"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s/g, "") })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line-strong bg-white font-mono uppercase text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-ink uppercase tracking-wider">
                    Target Scope <span className="text-danger">*</span>
                  </label>
                  <select
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-line-strong bg-white text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="PRODUCTS">Herbal Products (Apothecary)</option>
                    <option value="HIJAMA">Sunnah Hijama Appointments</option>
                    <option value="CONSULTATION">Hakeem Consultations &amp; Rx</option>
                    <option value="ALL">Global (All Services &amp; Products)</option>
                    <option value="CATEGORY">Specific Remedy Category</option>
                  </select>
                </div>
              </div>

              {formData.scope === "CATEGORY" && (
                <div className="space-y-1.5">
                  <label className="font-bold text-ink uppercase tracking-wider">
                    Select Target Remedy Category <span className="text-danger">*</span>
                  </label>
                  <select
                    value={formData.targetCategoryId}
                    onChange={(e) => setFormData({ ...formData, targetCategoryId: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-line-strong bg-white text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">-- Choose Category --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.slug})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-bold text-ink uppercase tracking-wider">
                  Campaign Description <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 15% Off all classical Murabba &amp; Arqiyat orders over ₨ 2,000"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line-strong bg-white text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* 2. Discount Configuration & Safeguards */}
              <div className="p-4 rounded-2xl bg-surface border border-line space-y-4">
                <div className="flex items-center gap-2 font-bold text-ink">
                  <Percent className="w-4 h-4 text-primary" />
                  <span>Discount Math &amp; Profit Margin Safeguards</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-ink">Discount Type</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs font-medium"
                    >
                      <option value="PERCENTAGE">Percentage (% Off Subtotal)</option>
                      <option value="FIXED">Fixed Amount (Flat ₨ Off)</option>
                      <option value="FREE_SHIPPING">Free Shipping (0 Courier Fee)</option>
                      <option value="FREE_SERVICE">100% Free Service / Voucher</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-ink">
                      {formData.discountType === "PERCENTAGE"
                        ? "Percentage Value (%)"
                        : "Discount Value (₨)"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={formData.discountType === "PERCENTAGE" ? "100" : undefined}
                      disabled={
                        formData.discountType === "FREE_SHIPPING" ||
                        formData.discountType === "FREE_SERVICE"
                      }
                      value={formData.discountValue}
                      onChange={(e) =>
                        setFormData({ ...formData, discountValue: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs font-bold disabled:bg-surface-sunken"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="font-bold text-ink">
                      Minimum Subtotal Spend (₨){" "}
                      <span className="text-[10px] text-ink-subtle font-normal">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 1500"
                      value={formData.minSubtotal}
                      onChange={(e) => setFormData({ ...formData, minSubtotal: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs"
                    />
                    <p className="text-[10px] text-ink-subtle">
                      Prevents loss on small orders (e.g. requires order &ge; ₨ 1,500)
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-ink">
                      Max Discount Cap (₨){" "}
                      <span className="text-[10px] text-ink-subtle font-normal">(Critical for %)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={formData.maxDiscountCap}
                      onChange={(e) => setFormData({ ...formData, maxDiscountCap: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs"
                    />
                    <p className="text-[10px] text-ink-subtle">
                      Limits maximum PKR discount even on huge cart totals
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Limits & Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-ink">
                    Max Total Redemptions{" "}
                    <span className="text-[10px] text-ink-subtle font-normal">(Global Limit)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 100 for first 100 customers"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-ink">
                    Per-Customer Limit{" "}
                    <span className="text-[10px] text-ink-subtle font-normal">(Account + Phone)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.perUserLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, perUserLimit: Number(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-ink">
                    Start Date <span className="text-[10px] text-ink-subtle font-normal">(Optional)</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-ink">
                    Expiration Date <span className="text-[10px] text-ink-subtle font-normal">(Optional)</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs"
                  />
                </div>
              </div>

              {/* 4. Marketing Flash Sale Urgency Bar */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-950">
                    <input
                      type="checkbox"
                      checked={formData.isFlashSale}
                      onChange={(e) =>
                        setFormData({ ...formData, isFlashSale: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                    <span>Highlight in Top Site-Wide Flash Banner</span>
                  </label>
                  <Sparkles className="w-4 h-4 text-brand-gold-600" />
                </div>

                {formData.isFlashSale && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-amber-900">
                        Banner Badge Text
                      </label>
                      <input
                        type="text"
                        placeholder="⚡ FLASH OFFER or RAMADAN 20% OFF"
                        value={formData.flashSaleBadge}
                        onChange={(e) =>
                          setFormData({ ...formData, flashSaleBadge: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-amber-900">
                        Banner Announcement Message
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Special 20% Off All Murabba Preserves this weekend! Use code SEHAT20 at checkout."
                        value={formData.flashSaleBannerText}
                        onChange={(e) =>
                          setFormData({ ...formData, flashSaleBannerText: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-line">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  <span className="font-bold text-ink">Immediately Active</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2 border border-line rounded-xl text-xs font-semibold text-ink hover:bg-surface transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-5 py-2 bg-primary hover:bg-brand-green-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {formSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingCoupon ? "Save Changes" : "Create Coupon"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 5. REDEMPTIONS AUDIT DRAWER ─── */}
      {selectedCouponForAudit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-line shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="p-5 border-b border-line flex items-center justify-between bg-surface">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-serif text-lg font-bold text-ink">
                    Redemptions Log: {selectedCouponForAudit.code}
                  </h3>
                  <p className="text-xs text-ink-muted">
                    {selectedCouponForAudit.usageCount} total redemptions recorded
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCouponForAudit(null)}
                className="p-1.5 rounded-full hover:bg-line text-ink-subtle hover:text-ink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto text-xs">
              {!selectedCouponForAudit.redemptions || selectedCouponForAudit.redemptions.length === 0 ? (
                <p className="text-ink-muted text-center py-6">
                  No customer has redeemed this coupon yet.
                </p>
              ) : (
                selectedCouponForAudit.redemptions.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl border border-line bg-surface/50 flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <span className="font-semibold text-ink">
                        {r.orderId
                          ? `Product Order: ${r.orderId.slice(0, 10)}...`
                          : r.hijamaBookingId
                          ? `Hijama Booking: ${r.hijamaBookingId.slice(0, 10)}...`
                          : r.consultationId
                          ? `Consultation: ${r.consultationId.slice(0, 10)}...`
                          : "Service Redemption"}
                      </span>
                      <p className="text-[10px] text-ink-subtle">
                        {new Date(r.redeemedAt).toLocaleString("en-PK")}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-success block">
                        -₨ {r.discountAmount.toLocaleString()}
                      </span>
                      {r.orderTotal != null && (
                        <span className="text-[10px] text-ink-muted">
                          Order: ₨ {r.orderTotal.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-line bg-surface text-right">
              <button
                type="button"
                onClick={() => setSelectedCouponForAudit(null)}
                className="px-4 py-2 bg-surface-inverse text-white rounded-xl text-xs font-semibold uppercase cursor-pointer"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
