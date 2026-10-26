"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut, sendVerificationEmail } from "@/lib/auth-client";
import { useCart } from "@/app/context/CartContext";
import { CLINIC_INFO, Product } from "@/app/data/products";
import SurfaceFade from "@/app/components/motion/SurfaceFade";
import ClinicCallCard from "@/app/components/ClinicCallCard";
import { getSafeProductImage } from "@/lib/utils";
import { isStaffRole } from "@/lib/rbac-base";
import {
  User,
  ShoppingBag,
  Heart,
  Calendar,
  Truck,
  LogOut,
  ArrowRight,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Sparkles,
  ExternalLink,
  Phone,
  RefreshCw,
  Shield,
  Mail,
  ShieldCheck,
  Droplets,
} from "lucide-react";

type AccountTab =
  | "orders"
  | "wishlist"
  | "consultations"
  | "hijama"
  | "profile";

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Order received",
  CONFIRMED: "Confirmed",
  DISPATCHED: "On the way",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const ORDER_STEPS = ["Order received", "Confirmed", "On the way", "Delivered"];
const ORDER_STEP_INDEX: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  DISPATCHED: 2,
  DELIVERED: 3,
};

const CONSULT_STATUS_LABELS: Record<string, string> = {
  NEW: "Booking received",
  CONFIRMED: "Confirmed",
  RESCHEDULED: "Rescheduled",
  PRESCRIBED: "Prescription issued",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const CONSULT_STEPS = [
  "Booking received",
  "Confirmed",
  "Prescription issued",
  "Completed",
];
const CONSULT_STEP_INDEX: Record<string, number> = {
  NEW: 0,
  CONFIRMED: 1,
  RESCHEDULED: 1,
  PRESCRIBED: 2,
  COMPLETED: 3,
};

const HIJAMA_STATUS_LABELS: Record<string, string> = {
  CONFIRMED: "Slot confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "Marked missed",
};

const HIJAMA_STEPS = ["Slot confirmed", "Session completed"];
const HIJAMA_STEP_INDEX: Record<string, number> = {
  CONFIRMED: 0,
  COMPLETED: 1,
};

function orderStatusChipClass(status: string) {
  switch (status) {
    case "DELIVERED":
      return "bg-success-soft text-success";
    case "DISPATCHED":
      return "bg-info-soft text-info";
    case "CONFIRMED":
      return "bg-success-soft text-success";
    case "CANCELLED":
      return "bg-danger-soft text-danger";
    default:
      return "bg-warning-soft text-warning";
  }
}

function consultStatusChipClass(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "bg-success-soft text-success border border-success-line";
    case "RESCHEDULED":
      return "bg-warning-soft text-warning border border-warning-line";
    case "PRESCRIBED":
      return "bg-plum-soft text-plum border border-plum-line";
    case "COMPLETED":
      return "bg-surface-sunken text-neutral-700 border border-line-strong";
    case "CANCELLED":
      return "bg-danger-soft text-danger border border-danger/20";
    default:
      return "bg-info-soft text-info border border-info-line";
  }
}

function hijamaStatusChipClass(status: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-success-soft text-success border border-success-line";
    case "CANCELLED":
      return "bg-danger-soft text-danger border border-danger/20";
    case "NO_SHOW":
      return "bg-surface-sunken text-ink-body border border-line-strong";
    default:
      return "bg-info-soft text-info border border-info-line";
  }
}

function StatusStepper({
  steps,
  current,
  cancelled = false,
  cancelledLabel = "Cancelled",
}: {
  steps: string[];
  current: number;
  cancelled?: boolean;
  cancelledLabel?: string;
}) {
  if (cancelled) {
    return (
      <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-muted bg-surface-sunken border border-line px-2 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
        {cancelledLabel}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
      {steps.map((label, index) => {
        const done = index < current;
        const active = index === current;

        return (
          <React.Fragment key={label}>
            {index > 0 && (
              <span
                className={`h-px w-3 sm:w-5 ${
                  index <= current ? "bg-brand-green-300" : "bg-line"
                }`}
              />
            )}
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                active
                  ? "text-primary"
                  : done
                  ? "text-brand-green-600"
                  : "text-ink-subtle"
              }`}
            >
              {done ? (
                <CheckCircle2 className="w-3 h-3 shrink-0" />
              ) : (
                <span
                  className={`w-2 h-2 rounded-full border shrink-0 ${
                    active
                      ? "bg-primary border-primary"
                      : "bg-white border-line-strong"
                  }`}
                />
              )}
              {label}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function SummaryTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-line shadow-2xs">
      <p className="text-[10px] font-bold uppercase tracking-wide text-ink-subtle">
        {label}
      </p>
      <p className="font-serif text-lg sm:text-xl font-bold text-primary mt-1 break-words">
        {value}
      </p>
      {hint && <p className="text-[10px] text-ink-subtle mt-0.5">{hint}</p>}
    </div>
  );
}

export default function AccountPage() {
  const { data: sessionData, isPending } = useSession();
  const { wishlist, removeFromWishlist, addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<AccountTab>("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [hijamaBookings, setHijamaBookings] = useState<any[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [reorderMessage, setReorderMessage] = useState<string | null>(null);

  const [resendingVerification, setResendingVerification] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const handleResendVerification = async () => {
    if (!sessionData?.user?.email) return;
    setResendingVerification(true);
    setResendSuccess(false);
    setResendError(null);

    try {
      if (typeof sendVerificationEmail === "function") {
        const res = await sendVerificationEmail({
          email: sessionData.user.email,
          callbackURL: "/account",
        });
        if (res?.error) {
          throw new Error(res.error.message || "Failed to dispatch verification email.");
        }
      } else {
        const res = await fetch("/api/auth/send-verification-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: sessionData.user.email,
            callbackURL: "/account",
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to dispatch verification email.");
        }
      }
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 8000);
    } catch (err: any) {
      setResendError(err.message || "Failed to resend verification email.");
    } finally {
      setResendingVerification(false);
    }
  };

  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setCatalogProducts(json.data);
          }
        }
      } catch (err) {
        console.error("Error fetching products catalog for account:", err);
      }
    }
    loadCatalog();
  }, []);

  useEffect(() => {
    if (sessionData?.user) {
      fetchUserData();
    }
  }, [sessionData]);

  const fetchUserData = async () => {
    setLoadingData(true);
    try {
      // Attach any guest bookings made with this account's verified email
      // before loading the dashboard, so they appear immediately.
      try {
        await fetch("/api/account/link-records", { method: "POST" });
      } catch {
        // Linking is best-effort; never block the dashboard on it.
      }

      const [ordersRes, consultRes, hijamaRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/consultations"),
        fetch("/api/hijama/bookings?limit=100"),
      ]);

      const [ordersJson, consultJson, hijamaJson] = await Promise.all([
        ordersRes.json(),
        consultRes.json(),
        hijamaRes.json(),
      ]);

      if (ordersJson.success) setOrders(ordersJson.data || []);
      if (consultJson.success) setConsultations(consultJson.data || []);
      if (hijamaJson.success) setHijamaBookings(hijamaJson.data || []);
    } catch (err) {
      console.error("Error fetching account data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleReorder = (order: any) => {
    if (!order.items || order.items.length === 0) return;

    let addedCount = 0;
    order.items.forEach((item: any) => {
      // Find matching product in catalog
      const matchedProduct = catalogProducts.find((p) => p.id === item.productId || p.name === item.productName);
      if (matchedProduct && matchedProduct.sizes && matchedProduct.sizes.length > 0) {
        const matchedSize = matchedProduct.sizes.find((s) => s.name === item.sizeName || s.weight === item.sizeWeight) || matchedProduct.sizes[0];
        addToCart(matchedProduct, matchedSize, item.quantity || 1);
        addedCount++;
      }
    });

    setReorderMessage(`Added ${addedCount} items from order ${order.orderNumber} to your shopping bag!`);
    setTimeout(() => setReorderMessage(null), 4000);
  };

  // Get wishlist products
  const wishlistProducts = catalogProducts.filter((p) => wishlist.includes(p.id));

  // Loading state
  if (isPending) {
    return (
      <div className="min-h-[70vh] bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs text-ink-body">Loading your account portal...</p>
        </div>
      </div>
    );
  }

  // Not logged in view
  if (!sessionData?.user) {
    return (
      <div className="min-h-[75vh] bg-surface py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-line shadow-lg text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-surface-sunken text-primary mx-auto flex items-center justify-center">
            <User className="w-8 h-8 opacity-60" />
          </div>
          <div className="space-y-1.5">
            <h1 className="font-serif text-2xl font-bold text-primary">
              Customer Account Portal
            </h1>
            <p className="text-xs text-ink-body">
              Sign in to track your active orders, view your saved wishlist remedies, and check your Hakeem consultation records.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 pt-2">
            <Link
              href="/login"
              className="w-full py-3 bg-primary hover:bg-brand-green-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-xs"
            >
              Sign In to Your Account
            </Link>
            <Link
              href="/register"
              className="w-full py-3 bg-surface hover:bg-surface-sunken text-primary text-xs font-bold rounded-xl border border-line transition-colors"
            >
              Create a New Account
            </Link>
          </div>
          <div className="pt-4 border-t border-sand-100 text-xs text-ink-subtle">
            Want to track a guest order?{" "}
            <Link href="/track-order" className="text-secondary-text font-bold hover:underline">
              Track by Reference Number
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const user = sessionData.user;
  const userRole = (user as any)?.role || "user";
  const isStaff = isStaffRole(userRole);

  // ── Staff get a workspace view, not the customer dashboard ──
  if (isStaff) {
    return (
      <div className="min-h-[85vh] bg-surface py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-line shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary text-white font-serif font-bold text-xl flex items-center justify-center shadow-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : "S"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-xl sm:text-2xl font-bold text-primary">
                    {user.name || "Staff account"}
                  </h1>
                  <span className="px-2.5 py-0.5 bg-secondary/10 border border-secondary/30 text-brand-gold-800 text-[10px] font-bold uppercase rounded-full">
                    {userRole === "admin"
                      ? "Primary Administrator"
                      : userRole === "editor"
                      ? "Catalog Editor"
                      : "Inquiry Contributor"}
                  </span>
                </div>
                <p className="text-xs text-ink-subtle mt-0.5">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-surface hover:bg-danger-soft text-ink-body hover:text-danger border border-line hover:border-danger/20 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-brand-green-50 border border-brand-green-100 text-xs text-ink-body flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>
              This is a staff account. Customer shopping, wishlist and booking
              features are disabled. Manage patient orders, consultations and
              Hijama bookings from the admin dashboard.
            </span>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <Link
              href="/admin?tab=orders"
              className="group bg-white rounded-2xl border border-line p-5 hover:border-primary/40 hover:shadow-xs transition-all"
            >
              <ShoppingBag className="w-5 h-5 text-primary mb-3" />
              <p className="text-sm font-bold text-ink">Orders</p>
              <p className="text-[11px] text-ink-muted mt-0.5">
                Confirm, dispatch and contact customers.
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary mt-3">
                Open <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>

            <Link
              href="/admin?tab=consultations"
              className="group bg-white rounded-2xl border border-line p-5 hover:border-primary/40 hover:shadow-xs transition-all"
            >
              <Calendar className="w-5 h-5 text-primary mb-3" />
              <p className="text-sm font-bold text-ink">Consultations</p>
              <p className="text-[11px] text-ink-muted mt-0.5">
                Review requests, prescriptions and schedules.
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary mt-3">
                Open <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>

            <Link
              href="/admin?tab=hijama"
              className="group bg-white rounded-2xl border border-line p-5 hover:border-primary/40 hover:shadow-xs transition-all"
            >
              <Droplets className="w-5 h-5 text-primary mb-3" />
              <p className="text-sm font-bold text-ink">Hijama</p>
              <p className="text-[11px] text-ink-muted mt-0.5">
                Manage sessions, slots and patient records.
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary mt-3">
                Open <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>

            {userRole === "admin" && (
              <Link
                href="/admin?tab=users"
                className="group bg-white rounded-2xl border border-line p-5 hover:border-primary/40 hover:shadow-xs transition-all"
              >
                <ShieldCheck className="w-5 h-5 text-primary mb-3" />
                <p className="text-sm font-bold text-ink">Users &amp; Access</p>
                <p className="text-[11px] text-ink-muted mt-0.5">
                  See every registered account, add staff, suspend or remove users.
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary mt-3">
                  Open <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            )}
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-brand-green-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-brand-gold-300" />
            <span>Open Full Admin Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  // ── Summary metrics (cancelled records are excluded from counts) ──
  const activeOrders = orders.filter((o) => o.orderStatus !== "CANCELLED");
  const cancelledOrderCount = orders.length - activeOrders.length;
  const totalItemsOrdered = activeOrders.reduce(
    (sum, order) =>
      sum +
      (order.items?.reduce(
        (itemSum: number, item: any) => itemSum + (item.quantity || 0),
        0
      ) || 0),
    0
  );
  const totalSpend = activeOrders.reduce(
    (sum, order) => sum + (order.total || 0),
    0
  );
  const inProgressOrders = activeOrders.filter(
    (o) => o.orderStatus !== "DELIVERED"
  ).length;

  const activeConsultations = consultations.filter(
    (c) => c.status !== "CANCELLED"
  );
  const awaitingConfirmation = activeConsultations.filter(
    (c) => c.status === "NEW"
  ).length;
  const nextConsultation = [...activeConsultations]
    .filter(
      (c) =>
        c.appointmentDate &&
        ["NEW", "CONFIRMED", "RESCHEDULED"].includes(c.status)
    )
    .sort((a, b) =>
      `${a.appointmentDate} ${a.appointmentSlot || ""}`.localeCompare(
        `${b.appointmentDate} ${b.appointmentSlot || ""}`
      )
    )[0];

  const activeHijama = hijamaBookings.filter(
    (b) => b.status !== "CANCELLED" && b.status !== "NO_SHOW"
  );
  const nextHijama = [...activeHijama]
    .filter((b) => b.status === "CONFIRMED" && b.appointmentDate)
    .sort((a, b) =>
      `${a.appointmentDate} ${a.appointmentSlot || ""}`.localeCompare(
        `${b.appointmentDate} ${b.appointmentSlot || ""}`
      )
    )[0];
  const completedHijama = hijamaBookings.filter(
    (b) => b.status === "COMPLETED"
  ).length;

  const formatAppointment = (record: any) => {
    if (!record?.appointmentDate) return "—";
    const formatted = new Date(
      `${record.appointmentDate}T12:00:00`
    ).toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
    });
    return `${formatted}${record.appointmentSlot ? ` · ${record.appointmentSlot}` : ""}`;
  };

  return (
    <div className="min-h-[85vh] bg-surface py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Profile Header Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-line shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary text-white font-serif font-bold text-xl flex items-center justify-center shadow-xs">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-primary">
                  Welcome, {user.name}
                </h1>
                <span className={`px-2.5 py-0.5 border text-[10px] font-bold uppercase rounded-full ${
                  userRole === "admin"
                    ? "bg-secondary/10 border-secondary/30 text-brand-gold-800"
                    : isStaff
                    ? "bg-info-soft border-info-line text-info"
                    : "bg-brand-green-50 border-brand-green-100 text-brand-green-600"
                }`}>
                  {userRole === "admin" ? "Primary Administrator" : userRole === "editor" ? "Catalog Editor" : userRole === "contributor" ? "Inquiry Contributor" : "Customer"}
                </span>
              </div>
              <p className="text-xs text-ink-subtle mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isStaff && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-brand-green-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
              >
                <Shield className="w-3.5 h-3.5 text-brand-gold-300" />
                <span>Admin / Staff Workspace</span>
              </Link>
            )}
            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-surface hover:bg-danger-soft text-ink-body hover:text-danger border border-line hover:border-danger/20 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Email Verification Status Alert */}
        {!user.emailVerified ? (
          <div className="p-5 bg-warning-soft/90 border-2 border-warning-line rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-warning-soft/80 text-warning flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-bold text-warning text-sm">Account Email Not Verified</h3>
                <p className="text-warning text-[11px] leading-relaxed">
                  Your email address (<strong>{user.email}</strong>) requires verification before you can place orders on the pharmacy store.
                </p>
                {resendSuccess && (
                  <p className="text-success text-[11px] font-semibold pt-1">
                    ✓ Activation email dispatched! Please check your inbox.
                  </p>
                )}
                {resendError && (
                  <p className="text-danger text-[11px] font-semibold pt-1">
                    ✕ {resendError}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendingVerification}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-warning hover:bg-warning text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {resendingVerification ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5" />
                    <span>Resend Activation Email</span>
                  </>
                )}
              </button>
              <Link
                href={`/verify-email?email=${encodeURIComponent(user.email)}`}
                className="flex-1 sm:flex-initial text-center px-4 py-2 bg-white hover:bg-warning-soft/60 text-warning border border-warning-line font-semibold rounded-xl text-xs transition-colors"
              >
                Verification Help
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-success-soft/80 border border-success-line/80 rounded-2xl flex items-center justify-between text-xs text-success shadow-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-success" />
              <span className="font-bold text-success">Email Address Verified</span>
              <span className="text-success text-[11px]">({user.email})</span>
            </div>
            <span className="text-[11px] text-success font-medium bg-success-soft/60 px-2.5 py-0.5 rounded-full border border-success-line/60">
              Active Account
            </span>
          </div>
        )}

        {reorderMessage && (
          <div className="p-4 bg-brand-green-50 border border-brand-green-200 rounded-xl text-xs text-primary flex items-center justify-between animate-fade-in font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-green-600" />
              <span>{reorderMessage}</span>
            </div>
            <Link href="/checkout" className="text-xs font-bold text-brand-green-600 underline">
              Go to Checkout →
            </Link>
          </div>
        )}

        {/* Tab Navigation Navigation Bar */}
        <div className="flex border-b border-line space-x-2 sm:space-x-8 overflow-x-auto text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 px-2 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "orders"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-ink-subtle hover:text-primary"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("wishlist")}
            className={`pb-3 px-2 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "wishlist"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-ink-subtle hover:text-primary"
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Saved Remedies ({wishlistProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("consultations")}
            className={`pb-3 px-2 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "consultations"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-ink-subtle hover:text-primary"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Clinical Consultations ({consultations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("hijama")}
            className={`pb-3 px-2 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "hijama"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-ink-subtle hover:text-primary"
            }`}
          >
            <Droplets className="w-4 h-4" />
            <span>Hijama Sessions ({hijamaBookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 px-2 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "profile"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-ink-subtle hover:text-primary"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile &amp; Address</span>
          </button>
        </div>

        {/* ─── TAB 1: ORDERS ─── */}
        <SurfaceFade surfaceKey={activeTab}>
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <SummaryTile
                label="Total Orders"
                value={activeOrders.length}
                hint={
                  cancelledOrderCount > 0
                    ? `${cancelledOrderCount} cancelled excluded`
                    : "All orders active"
                }
              />
              <SummaryTile
                label="Items Ordered"
                value={totalItemsOrdered}
                hint="Excludes cancelled orders"
              />
              <SummaryTile
                label="Total Spend"
                value={`₨ ${totalSpend.toLocaleString()}`}
                hint="Excludes cancelled orders"
              />
              <SummaryTile
                label="In Progress"
                value={inProgressOrders}
                hint="Not delivered yet"
              />
            </div>

            {loadingData ? (
              <div className="p-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                <p className="text-xs text-ink-subtle">Retrieving your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-line text-center space-y-4">
                <ShoppingBag className="w-12 h-12 text-ink-subtle opacity-40 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-primary">
                  No orders placed yet
                </h3>
                <p className="text-xs text-ink-body max-w-sm mx-auto">
                  Explore our pure Unani remedies, herbal waters, and natural syrups to place your first order.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase rounded-xl hover:bg-brand-green-800 transition-colors"
                >
                  Browse Apothecary
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className={`bg-white p-5 sm:p-6 rounded-2xl border border-line shadow-2xs space-y-4 ${
                    order.orderStatus === "CANCELLED" ? "opacity-70" : ""
                  }`}
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-sand-100 gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-primary">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${orderStatusChipClass(
                            order.orderStatus
                          )}`}
                        >
                          {ORDER_STATUS_LABELS[order.orderStatus] ||
                            order.orderStatus}
                        </span>
                        <span
                          className="text-[9px] font-mono text-neutral-200"
                          title="Internal status code"
                        >
                          {order.orderStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-subtle">
                        Placed on {new Date(order.createdAt).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-serif text-base font-bold text-primary">
                        ₨ {order.total.toLocaleString()}
                      </span>
                      <Link
                        href={`/track-order?ref=${order.orderNumber}`}
                        className="px-3 py-1.5 bg-surface hover:bg-surface-sunken border border-line text-primary text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Truck className="w-3.5 h-3.5 text-secondary-text" />
                        <span>Track</span>
                      </Link>
                    </div>
                  </div>

                  {/* Progress timeline */}
                  <div className="pt-1">
                    <StatusStepper
                      steps={ORDER_STEPS}
                      current={ORDER_STEP_INDEX[order.orderStatus] ?? 0}
                      cancelled={order.orderStatus === "CANCELLED"}
                      cancelledLabel="Order cancelled"
                    />
                  </div>

                  {/* Items list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {order.items?.map((item: any) => (
                      <div
                        key={item.id}
                        className="p-3 bg-surface rounded-xl flex items-center gap-3 text-xs"
                      >
                        <div className="relative w-10 h-10 rounded bg-line overflow-hidden shrink-0">
                          {item.productImage ? (
                            <Image
                              src={item.productImage}
                              alt={item.productName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-ink-subtle m-2.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-primary truncate">
                            {item.productName}
                          </p>
                          <p className="text-[10px] text-ink-subtle">
                            {item.sizeWeight} · Qty: {item.quantity}
                          </p>
                        </div>
                        <span className="font-semibold text-ink">
                          ₨ {item.total.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer actions */}
                  <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-3 border-t border-sand-100">
                    <span className="text-[11px] text-ink-subtle">
                      Delivering to: <strong className="text-ink-body">{order.city}</strong> — {order.address}
                    </span>
                    <button
                      onClick={() => handleReorder(order)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-secondary-text transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reorder All Items</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ─── TAB 2: WISHLIST ─── */}
        {activeTab === "wishlist" && (
          <div className="space-y-4">
            {wishlistProducts.length > 0 && (
              <div className="flex items-center justify-between pb-2 border-b border-line">
                <span className="text-xs text-ink-body">
                  Showing <strong>{wishlistProducts.length}</strong> saved {wishlistProducts.length === 1 ? "remedy" : "remedies"}
                </span>
                <Link
                  href="/wishlist"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-secondary-text transition-colors"
                >
                  <span>Open Dedicated Wishlist &amp; Share</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {wishlistProducts.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-line text-center space-y-4">
                <Heart className="w-12 h-12 text-ink-subtle opacity-40 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-primary">
                  Your wishlist is empty
                </h3>
                <p className="text-xs text-ink-body max-w-sm mx-auto">
                  Click the heart icon on any remedy card in the apothecary to save it for later.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase rounded-xl hover:bg-brand-green-800 transition-colors"
                >
                  Explore Remedies
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistProducts.map((product) => {
                  const defaultSize = (product.sizes && product.sizes.length > 0)
                    ? product.sizes[0]
                    : { name: "Default", weight: "Standard", price: product.price, available: 10 };
                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl border border-line p-5 shadow-2xs flex flex-col justify-between space-y-4"
                    >
                      <div className="flex gap-4">
                        <div className="relative w-20 h-20 bg-surface rounded-xl overflow-hidden shrink-0">
                          <Image
                            src={getSafeProductImage(product.image)}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">
                            {product.categoryLabel || product.category}
                          </span>
                          <Link
                            href={`/products/${product.slug}`}
                            className="text-xs sm:text-sm font-bold text-primary hover:text-secondary-text line-clamp-2 transition-colors"
                          >
                            {product.name}
                          </Link>
                          <span className="text-xs font-serif font-bold text-primary block mt-1">
                            ₨ {defaultSize.price} ({defaultSize.weight})
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-sand-100">
                        <button
                          onClick={() => addToCart(product, defaultSize, 1)}
                          className="flex-1 py-2 bg-primary hover:bg-brand-green-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
                        >
                          + Add to Bag
                        </button>
                        <button
                          onClick={() => removeFromWishlist(product.id)}
                          className="p-2 border border-line hover:bg-danger-soft hover:border-danger/20 text-ink-subtle hover:text-danger rounded-xl transition-colors cursor-pointer"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 3: CONSULTATIONS ─── */}
        {activeTab === "consultations" && (
          <div className="space-y-4">
            <ClinicCallCard />
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <SummaryTile
                label="Total Booked"
                value={activeConsultations.length}
                hint={`${awaitingConfirmation} awaiting confirmation`}
              />
              <SummaryTile
                label="Next Appointment"
                value={
                  nextConsultation
                    ? formatAppointment(nextConsultation)
                    : "—"
                }
                hint={
                  nextConsultation
                    ? nextConsultation.consultationType === "ONLINE"
                      ? "Online consultation"
                      : "In-person clinic visit"
                    : "No upcoming slot yet"
                }
              />
              <SummaryTile
                label="Awaiting Confirmation"
                value={awaitingConfirmation}
                hint="Staff will confirm on WhatsApp"
              />
            </div>

            {loadingData ? (
              <div className="p-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                <p className="text-xs text-ink-subtle">Loading clinical consultation history...</p>
              </div>
            ) : consultations.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-line text-center space-y-4">
                <Calendar className="w-12 h-12 text-ink-subtle opacity-40 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-primary">
                  No consultations booked yet
                </h3>
                <p className="text-xs text-ink-body max-w-sm mx-auto">
                  Book a direct clinical consultation with Hakeem Tahir Hameed for chronic root-cause diagnosis.
                </p>
                <Link
                  href="/consultation"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase rounded-xl hover:bg-brand-green-800 transition-colors"
                >
                  Book Free Consultation
                </Link>
              </div>
            ) : (
              consultations.map((consult) => (
                <div
                  key={consult.id}
                  className={`bg-white p-6 rounded-2xl border border-line shadow-2xs space-y-4 ${
                    consult.status === "CANCELLED" ? "opacity-70" : ""
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-sand-100 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-primary">
                          {consult.ticketNumber}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${consultStatusChipClass(
                            consult.status
                          )}`}
                        >
                          {CONSULT_STATUS_LABELS[consult.status] ||
                            consult.status}
                        </span>
                        <span
                          className="text-[9px] font-mono text-neutral-200"
                          title="Internal status code"
                        >
                          {consult.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-subtle">
                        Submitted on {new Date(consult.createdAt).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href="/consultation"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-surface-sunken border border-line text-ink text-xs font-semibold rounded-lg transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5 text-secondary-text" />
                        <span>Book Another</span>
                      </Link>
                      <a
                        href={`https://wa.me/${CLINIC_INFO.whatsappNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-whatsapp text-on-whatsapp text-xs font-bold rounded-lg shadow-xs hover:bg-whatsapp-hover transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Hakeem WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {/* Progress timeline */}
                  <div className="pt-1">
                    <StatusStepper
                      steps={CONSULT_STEPS}
                      current={CONSULT_STEP_INDEX[consult.status] ?? 0}
                      cancelled={consult.status === "CANCELLED"}
                      cancelledLabel="Booking cancelled"
                    />
                  </div>

                  <div className="text-xs space-y-2 text-ink-body">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-surface p-3 rounded-xl border border-line">
                      <div>
                        <span className="text-ink-subtle block">Consultation Mode:</span>
                        <strong className="text-ink">
                          {consult.consultationType === "ONLINE" ? "Online Telehealth" : "In-Person Karachi Clinic"}
                        </strong>
                      </div>
                      {consult.appointmentDate && (
                        <div>
                          <span className="text-ink-subtle block">Scheduled Appointment:</span>
                          <strong className="text-ink">
                            {consult.appointmentDate} ({consult.appointmentSlot || "Anytime"})
                          </strong>
                        </div>
                      )}
                    </div>

                    {consult.status === "NEW" && (
                      <p className="text-[11px] font-semibold text-warning bg-warning-soft border border-warning-line rounded-lg px-3 py-2">
                        Awaiting confirmation — the clinic will confirm your
                        slot on WhatsApp or phone. Your ticket is already
                        active, so you can check back here anytime.
                      </p>
                    )}

                    <p>
                      <strong>Primary Symptoms / Concern:</strong> {consult.primarySymptoms}
                    </p>
                    <p>
                      <strong>Duration:</strong> {consult.duration} · <strong>City:</strong> {consult.city}
                    </p>

                    {consult.prescribedTreatment && (
                      <div className="mt-3 p-4 bg-plum-soft/70 border border-plum-line rounded-xl text-plum space-y-1">
                        <strong className="block text-xs uppercase tracking-wider text-plum font-bold flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-plum" />
                          <span>Hakeem's Prescribed Botanical Protocol:</span>
                        </strong>
                        <p className="mt-1 text-xs whitespace-pre-line font-mono bg-white/80 p-3 rounded-lg border border-plum-line/80">
                          {consult.prescribedTreatment}
                        </p>
                      </div>
                    )}

                    {consult.hakimNotes && (
                      <div className="mt-2 p-3 bg-brand-green-50 border border-brand-green-100 rounded-xl text-primary">
                        <strong className="block text-[11px] uppercase tracking-wider text-brand-green-600">
                          Hakeem Sahib's Clinical Advice &amp; Dietary Guidelines (Parhez):
                        </strong>
                        <p className="mt-0.5 text-xs">{consult.hakimNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ─── TAB 4: HIJAMA SESSIONS ─── */}
        {activeTab === "hijama" && (
          <div className="space-y-4">
            <ClinicCallCard />
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <SummaryTile
                label="Hijama Sessions"
                value={activeHijama.length}
                hint="Confirmed + completed"
              />
              <SummaryTile
                label="Next Session"
                value={nextHijama ? formatAppointment(nextHijama) : "—"}
                hint={
                  nextHijama?.hijriDate
                    ? nextHijama.hijriDate
                    : "No upcoming session"
                }
              />
              <SummaryTile
                label="Completed"
                value={completedHijama}
                hint="Sessions attended"
              />
            </div>

            {loadingData ? (
              <div className="p-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                <p className="text-xs text-ink-subtle">
                  Loading your Hijama session history...
                </p>
              </div>
            ) : hijamaBookings.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-line text-center space-y-4">
                <Droplets className="w-12 h-12 text-ink-subtle opacity-40 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-primary">
                  No Hijama sessions yet
                </h3>
                <p className="text-xs text-ink-body max-w-sm mx-auto">
                  Hijama (wet cupping) appointments booked with the clinic will
                  appear here with their ticket number, Hijri date, time slot,
                  and status.
                </p>
                <a
                  href={`https://wa.me/${CLINIC_INFO.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-whatsapp text-on-whatsapp text-xs font-bold uppercase rounded-xl hover:bg-whatsapp-hover transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Ask About Hijama
                </a>
              </div>
            ) : (
              hijamaBookings.map((booking) => {
                const cancelled =
                  booking.status === "CANCELLED" ||
                  booking.status === "NO_SHOW";

                return (
                  <div
                    key={booking.id}
                    className={`bg-white p-6 rounded-2xl border border-line shadow-2xs space-y-4 ${
                      cancelled ? "opacity-70" : ""
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-sand-100 gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm font-bold text-primary">
                            {booking.ticketNumber}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${hijamaStatusChipClass(
                              booking.status
                            )}`}
                          >
                            {HIJAMA_STATUS_LABELS[booking.status] ||
                              booking.status}
                          </span>
                          <span
                            className="text-[9px] font-mono text-neutral-200"
                            title="Internal status code"
                          >
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-ink-subtle">
                          Booked on{" "}
                          {new Date(booking.createdAt).toLocaleDateString(
                            "en-PK",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="font-serif text-base font-bold text-primary">
                          ₨ {(booking.feeAmount || 0).toLocaleString()}
                        </span>
                        <p className="text-[10px] text-ink-subtle">
                          {booking.paymentStatus === "PAID_AT_CLINIC"
                            ? "Paid at clinic"
                            : "Pay at clinic"}
                        </p>
                      </div>
                    </div>

                    <div className="pt-1">
                      <StatusStepper
                        steps={HIJAMA_STEPS}
                        current={HIJAMA_STEP_INDEX[booking.status] ?? 0}
                        cancelled={cancelled}
                        cancelledLabel={
                          booking.status === "NO_SHOW"
                            ? "Marked missed"
                            : "Session cancelled"
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-surface p-3 rounded-xl border border-line text-xs">
                      <div>
                        <span className="text-ink-subtle block">
                          Appointment Date:
                        </span>
                        <strong className="text-ink">
                          {booking.appointmentDate}
                          {booking.hijriDate ? ` · ${booking.hijriDate}` : ""}
                        </strong>
                      </div>
                      <div>
                        <span className="text-ink-subtle block">
                          Time Slot:
                        </span>
                        <strong className="text-ink">
                          {booking.appointmentSlot}
                        </strong>
                      </div>
                      <div>
                        <span className="text-ink-subtle block">For:</span>
                        <strong className="text-ink">
                          {booking.gender === "FEMALE"
                            ? "Female session"
                            : "Male session"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-ink-subtle block">
                          Session Type:
                        </span>
                        <strong className="text-ink">
                          {booking.isSunnahDay
                            ? "Sunnah Day Cupping"
                            : "Standard Cupping"}
                        </strong>
                      </div>
                    </div>

                    {booking.cuppingReason && (
                      <p className="text-xs text-ink-body">
                        <strong>Reason / Notes:</strong>{" "}
                        {booking.cuppingReason}
                      </p>
                    )}

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-sand-100">
                      <span className="text-[11px] text-ink-subtle">
                        Show this ticket at the clinic reception.
                      </span>
                      <a
                        href={`https://wa.me/${CLINIC_INFO.whatsappNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-whatsapp text-on-whatsapp text-xs font-bold rounded-lg shadow-xs hover:bg-whatsapp-hover transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Contact Clinic</span>
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ─── TAB 5: PROFILE & ADDRESS ─── */}
        {activeTab === "profile" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-line shadow-xs space-y-6 max-w-2xl">
            <h2 className="font-serif text-lg font-bold text-primary border-b border-sand-100 pb-3">
              Profile &amp; Default Shipping Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[11px] font-bold text-ink-subtle uppercase block">
                  Full Name
                </label>
                <p className="font-semibold text-ink mt-1 text-sm">{user.name}</p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-ink-subtle uppercase block">
                  Email Address
                </label>
                <p className="font-semibold text-ink mt-1 text-sm">{user.email}</p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-ink-subtle uppercase block">
                  Account Role
                </label>
                <p className="font-semibold text-brand-green-600 mt-1 uppercase text-sm">
                  {(user as any).role || "Customer"}
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-ink-subtle uppercase block">
                  Registered City
                </label>
                <p className="font-semibold text-ink mt-1 text-sm">
                  {(user as any).city || "Karachi, Pakistan"}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-sand-100 flex justify-between items-center">
              <span className="text-xs text-ink-subtle">
                Need to update your clinical profile?
              </span>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 bg-surface hover:bg-danger-soft text-danger border border-line rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
        </SurfaceFade>

      </div>
    </div>
  );
}
