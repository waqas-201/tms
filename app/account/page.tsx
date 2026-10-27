"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut, sendVerificationEmail } from "@/lib/auth-client";
import { useCart } from "@/app/context/CartContext";
import { CLINIC_INFO, Product } from "@/app/data/products";
import SurfaceFade from "@/app/components/motion/SurfaceFade";
import ClinicCallCard from "@/app/components/ClinicCallCard";
import OrderInvoiceModal from "@/app/components/OrderInvoiceModal";
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
  MapPin,
  Navigation,
  Receipt,
  FileText,
  Printer,
  Search,
} from "lucide-react";

type AccountTab =
  | "orders"
  | "ledger"
  | "wishlist"
  | "consultations"
  | "hijama"
  | "profile";

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Order received",
  PENDING_CONFIRMATION: "Pending freight review",
  CONFIRMED: "Confirmed",
  DISPATCHED: "On the way",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const ORDER_STEPS = ["Order received", "Confirmed", "On the way", "Delivered"];
const ORDER_STEP_INDEX: Record<string, number> = {
  PENDING: 0,
  PENDING_CONFIRMATION: 0,
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
  PENDING: "Pending confirmation",
  CONFIRMED: "Slot confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "Marked missed",
};

const HIJAMA_STEPS = ["Slot confirmed", "Session completed"];
const HIJAMA_STEP_INDEX: Record<string, number> = {
  PENDING: 0,
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
    case "PENDING_CONFIRMATION":
      return "bg-warning-soft text-warning border border-warning-line";
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

const PAKISTAN_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Gujranwala",
  "Sialkot",
  "Hyderabad",
  "Abbottabad",
  "Bahawalpur",
  "Sargodha",
  "Sukkur",
  "Mardan",
  "Gujrat",
  "Sheikhupura",
  "Wah Cantt",
  "Rahim Yar Khan",
  "Other City / Town",
];

interface LedgerEntry {
  id: string;
  rawDate: number;
  dateStr: string;
  type: "ORDER" | "HIJAMA" | "CONSULTATION";
  typeUrdu: string;
  title: string;
  subtitle: string;
  reference: string;
  debit: number;
  credit: number;
  balance: number;
  paymentStatus: "PAID" | "PENDING" | "PARTIAL" | "CANCELLED" | "COMPLIMENTARY";
  orderStatus: string;
  orderRecord?: any;
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

  // Invoice Quick Preview Modal
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Ledger Filter States
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<"ALL" | "ORDER" | "HIJAMA" | "CONSULTATION">("ALL");
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState<"ALL" | "DUE" | "PAID">("ALL");
  const [ledgerSearch, setLedgerSearch] = useState("");

  const [resendingVerification, setResendingVerification] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    city: "Karachi",
    address: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [detectingAccountLocation, setDetectingAccountLocation] = useState(false);

  useEffect(() => {
    if (sessionData?.user) {
      fetch("/api/account/profile")
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setProfileForm({
              name: json.data.name || sessionData.user.name || "",
              phone: json.data.phone || (sessionData.user as any).phone || "",
              city: json.data.city || (sessionData.user as any).city || "Karachi",
              address: json.data.address || "",
              latitude: json.data.latitude ?? null,
              longitude: json.data.longitude ?? null,
            });
          }
        })
        .catch((e) => console.error("Failed to load user profile:", e));
    }
  }, [sessionData]);

  const handleDetectProfileLocation = () => {
    if (!navigator.geolocation) {
      setProfileError("Geolocation is not supported by your browser.");
      return;
    }
    setDetectingAccountLocation(true);
    setProfileError(null);
    setProfileSuccess(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setProfileForm((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const cityDetected = addr.city || addr.town || addr.municipality || "";
            const area = addr.suburb || addr.neighbourhood || addr.residential || addr.road || "";

            setProfileForm((prev) => {
              let newCity = prev.city;
              if (cityDetected.toLowerCase().includes("karachi")) {
                newCity = "Karachi";
              } else if (cityDetected) {
                const found = PAKISTAN_CITIES.find(
                  (c) => c.toLowerCase() === cityDetected.toLowerCase()
                );
                if (found) newCity = found;
              }
              let newAddr = prev.address;
              if (!newAddr.trim() && area) {
                newAddr = `${area}${addr.road && addr.road !== area ? `, ${addr.road}` : ""}`;
              }
              return {
                ...prev,
                city: newCity,
                address: newAddr,
              };
            });
          }
        } catch {
          // ignore reverse geocoding errors
        }

        setDetectingAccountLocation(false);
        setProfileSuccess(`Location detected (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        setTimeout(() => setProfileSuccess(null), 5000);
      },
      (err) => {
        setDetectingAccountLocation(false);
        setProfileError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission was denied. Please type your address manually."
            : "Could not retrieve GPS location. Please type your address manually."
        );
        setTimeout(() => setProfileError(null), 6000);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update profile.");
      }
      setProfileSuccess(json.message || "Profile updated successfully!");
      setTimeout(() => setProfileSuccess(null), 5000);
    } catch (err: any) {
      setProfileError(err.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

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
      try {
        await fetch("/api/account/link-records", { method: "POST" });
      } catch {
        // Linking is best-effort
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

  // Compute Unified Patient Ledger entries
  const ledgerEntries: LedgerEntry[] = useMemo(() => {
    const list: Omit<LedgerEntry, "balance">[] = [];

    // 1. Orders
    orders.forEach((o) => {
      const isCancelled = o.orderStatus === "CANCELLED";
      const debit = isCancelled ? 0 : (o.total || 0);
      const paid = isCancelled
        ? 0
        : o.paymentStatus === "PAID"
        ? (o.total || 0)
        : (o.paidAmount || 0);

      let paymentStatus: LedgerEntry["paymentStatus"] = "PENDING";
      if (isCancelled) paymentStatus = "CANCELLED";
      else if (o.paymentStatus === "PAID") paymentStatus = "PAID";
      else if ((o.paidAmount || 0) > 0) paymentStatus = "PARTIAL";

      const dateObj = new Date(o.createdAt);

      list.push({
        id: `ORDER-${o.id}`,
        rawDate: dateObj.getTime(),
        dateStr: dateObj.toLocaleDateString("en-PK", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        type: "ORDER",
        typeUrdu: "دواخانہ آرڈر",
        title: "Apothecary Remedy Order",
        subtitle: `${o.items?.length || 0} item${o.items?.length === 1 ? "" : "s"}${o.city ? ` · ${o.city}` : ""}`,
        reference: o.orderNumber,
        debit,
        credit: paid,
        paymentStatus,
        orderStatus: o.orderStatus,
        orderRecord: o,
      });
    });

    // 2. Hijama Bookings
    hijamaBookings.forEach((b) => {
      const isCancelled = b.status === "CANCELLED" || b.status === "NO_SHOW";
      const fee = b.feeAmount || 2500;
      const debit = isCancelled ? 0 : fee;
      const credit = isCancelled
        ? 0
        : b.paymentStatus === "PAID_AT_CLINIC"
        ? fee
        : 0;

      let paymentStatus: LedgerEntry["paymentStatus"] = "PENDING";
      if (isCancelled) paymentStatus = "CANCELLED";
      else if (b.paymentStatus === "PAID_AT_CLINIC") paymentStatus = "PAID";

      const dateObj = new Date(b.createdAt || b.appointmentDate);

      list.push({
        id: `HIJAMA-${b.id}`,
        rawDate: dateObj.getTime(),
        dateStr: dateObj.toLocaleDateString("en-PK", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        type: "HIJAMA",
        typeUrdu: "حجامہ سیشن",
        title: "Sunnah Hijama Session",
        subtitle: `${b.appointmentDate}${b.appointmentSlot ? ` · ${b.appointmentSlot}` : ""} (${b.gender === "FEMALE" ? "Female" : "Male"} Session)`,
        reference: b.ticketNumber,
        debit,
        credit,
        paymentStatus,
        orderStatus: b.status,
      });
    });

    // 3. Consultations
    consultations.forEach((c) => {
      const isCancelled = c.status === "CANCELLED";
      const dateObj = new Date(c.createdAt || c.appointmentDate || Date.now());

      list.push({
        id: `CONSULT-${c.id}`,
        rawDate: dateObj.getTime(),
        dateStr: dateObj.toLocaleDateString("en-PK", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        type: "CONSULTATION",
        typeUrdu: "طبی معائنہ",
        title: "Hakeem Consultation",
        subtitle: `${c.appointmentDate || "Intake"}${c.appointmentSlot ? ` · ${c.appointmentSlot}` : ""} (${c.consultationType === "ONLINE" ? "Online Consultation" : "In-Person Clinic"})`,
        reference: c.ticketNumber,
        debit: 0,
        credit: 0,
        paymentStatus: isCancelled ? "CANCELLED" : "COMPLIMENTARY",
        orderStatus: c.status,
      });
    });

    // Sort ascending by date to calculate accurate running balance
    list.sort((a, b) => a.rawDate - b.rawDate);

    let running = 0;
    const withBalance: LedgerEntry[] = list.map((item) => {
      running += item.debit - item.credit;
      return {
        ...item,
        balance: running,
      };
    });

    // Return descending for display (most recent first)
    return withBalance.reverse();
  }, [orders, hijamaBookings, consultations]);

  const ledgerTotalBilled = useMemo(() => {
    return ledgerEntries.reduce((sum, e) => sum + e.debit, 0);
  }, [ledgerEntries]);

  const ledgerTotalPaid = useMemo(() => {
    return ledgerEntries.reduce((sum, e) => sum + e.credit, 0);
  }, [ledgerEntries]);

  const ledgerBalanceDue = useMemo(() => {
    return Math.max(0, ledgerTotalBilled - ledgerTotalPaid);
  }, [ledgerTotalBilled, ledgerTotalPaid]);

  const filteredLedgerEntries = useMemo(() => {
    return ledgerEntries.filter((item) => {
      if (ledgerTypeFilter !== "ALL" && item.type !== ledgerTypeFilter) return false;
      if (ledgerStatusFilter === "DUE" && item.debit <= item.credit) return false;
      if (ledgerStatusFilter === "PAID" && item.paymentStatus !== "PAID") return false;
      if (ledgerSearch.trim()) {
        const q = ledgerSearch.toLowerCase().trim();
        const matchRef = item.reference.toLowerCase().includes(q);
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSubtitle = item.subtitle.toLowerCase().includes(q);
        if (!matchRef && !matchTitle && !matchSubtitle) return false;
      }
      return true;
    });
  }, [ledgerEntries, ledgerTypeFilter, ledgerStatusFilter, ledgerSearch]);

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
            onClick={() => setActiveTab("ledger")}
            className={`pb-3 px-2 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "ledger"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-ink-subtle hover:text-primary"
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Ledger &amp; Billing (کھاتہ)</span>
            {ledgerBalanceDue > 0 && (
              <span className="px-1.5 py-0.5 bg-warning-soft text-warning border border-warning-line text-[10px] rounded-full font-bold">
                ₨ {ledgerBalanceDue.toLocaleString()}
              </span>
            )}
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

        {/* ─── TAB CONTENT ─── */}
        <SurfaceFade surfaceKey={activeTab}>
        {/* ─── TAB 1: ORDERS ─── */}
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

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-serif text-base font-bold text-primary mr-1">
                        ₨ {order.total.toLocaleString()}
                      </span>
                      <Link
                        href={`/invoices/${order.orderNumber}`}
                        target="_blank"
                        className="px-2.5 py-1.5 bg-surface hover:bg-surface-sunken border border-line text-primary text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                        title="View & Download PDF Invoice"
                      >
                        <FileText className="w-3.5 h-3.5 text-primary" />
                        <span className="hidden sm:inline">Invoice</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedInvoiceOrder(order);
                          setIsInvoiceModalOpen(true);
                        }}
                        className="p-1.5 bg-surface hover:bg-surface-sunken border border-line text-primary text-xs font-semibold rounded-lg flex items-center transition-colors cursor-pointer"
                        title="Quick View Printable Invoice"
                      >
                        <Printer className="w-3.5 h-3.5 text-primary" />
                      </button>
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

        {/* ─── TAB 2: LEDGER & BILLING (کھاتہ و بلنگ) ─── */}
        {activeTab === "ledger" && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-line shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">
                    Patient Financial Ledger &amp; Billing
                  </h2>
                  <span className="text-xs font-serif text-ink-subtle">
                    (کھاتہ و بلنگ اسٹیٹمنٹ)
                  </span>
                </div>
                <p className="text-xs text-ink-subtle mt-0.5 max-w-xl">
                  Consolidated ledger statement across your apothecary orders, clinical consultations, and Sunnah Hijama sessions.
                </p>
              </div>

              <div className="flex items-center gap-2 self-stretch sm:self-auto">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-surface hover:bg-surface-sunken border border-line text-primary rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Statement</span>
                </button>
              </div>
            </div>

            {/* Financial Summary KPI Tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <SummaryTile
                label="Total Billed"
                value={`₨ ${ledgerTotalBilled.toLocaleString()}`}
                hint="Total debited (orders & sessions)"
              />
              <SummaryTile
                label="Total Paid"
                value={`₨ ${ledgerTotalPaid.toLocaleString()}`}
                hint="Collected via COD & clinic"
              />
              <div className="bg-white p-4 rounded-2xl border border-line shadow-2xs">
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink-subtle">
                  Current Balance Due
                </p>
                <p className={`font-serif text-lg sm:text-xl font-bold mt-1 break-words ${
                  ledgerBalanceDue > 0 ? "text-danger" : "text-success"
                }`}>
                  ₨ {ledgerBalanceDue.toLocaleString()}
                </p>
                <p className="text-[10px] text-ink-subtle mt-0.5">
                  {ledgerBalanceDue > 0 ? "Outstanding balance" : "All accounts clear"}
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-line shadow-2xs">
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink-subtle">
                  Account Standing
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  {ledgerBalanceDue === 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-success-soft text-success border border-success-line text-xs font-bold rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>All Cleared (بے باق)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-warning-soft text-warning border border-warning-line text-xs font-bold rounded-lg">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>₨ {ledgerBalanceDue.toLocaleString()} Due</span>
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-ink-subtle mt-1">
                  {ledgerEntries.length} total transaction entries
                </p>
              </div>
            </div>

            {/* Payment advice alert if balance due */}
            {ledgerBalanceDue > 0 && (
              <div className="p-4 bg-warning-soft/80 border border-warning-line rounded-2xl text-xs text-warning flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-warning text-xs">
                    Pending Payment Notice (ادائیگی کی یاد دہانی)
                  </p>
                  <p className="text-warning text-[11px] leading-relaxed">
                    You have an outstanding balance of <strong>₨ {ledgerBalanceDue.toLocaleString()}</strong>.
                    Orders placed with <strong>Cash on Delivery (COD)</strong> are collected by the courier rider upon delivery.
                    Hijama cupping and clinic fees are payable upon arrival at the clinic reception or via JazzCash/Bank transfer.
                  </p>
                </div>
              </div>
            )}

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl border border-line shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setLedgerTypeFilter("ALL")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    ledgerTypeFilter === "ALL"
                      ? "bg-primary text-white"
                      : "bg-surface hover:bg-surface-sunken text-ink-body border border-line"
                  }`}
                >
                  All ({ledgerEntries.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLedgerTypeFilter("ORDER")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    ledgerTypeFilter === "ORDER"
                      ? "bg-primary text-white"
                      : "bg-surface hover:bg-surface-sunken text-ink-body border border-line"
                  }`}
                >
                  Orders ({orders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLedgerTypeFilter("HIJAMA")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    ledgerTypeFilter === "HIJAMA"
                      ? "bg-primary text-white"
                      : "bg-surface hover:bg-surface-sunken text-ink-body border border-line"
                  }`}
                >
                  Hijama ({hijamaBookings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLedgerTypeFilter("CONSULTATION")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    ledgerTypeFilter === "CONSULTATION"
                      ? "bg-primary text-white"
                      : "bg-surface hover:bg-surface-sunken text-ink-body border border-line"
                  }`}
                >
                  Consultations ({consultations.length})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 md:w-56">
                  <Search className="w-3.5 h-3.5 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={ledgerSearch}
                    onChange={(e) => setLedgerSearch(e.target.value)}
                    placeholder="Search reference #..."
                    className="w-full pl-8 pr-3 py-1.5 bg-surface border border-line rounded-lg text-xs text-ink focus:outline-none focus:border-primary"
                  />
                </div>
                <select
                  value={ledgerStatusFilter}
                  onChange={(e: any) => setLedgerStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-surface border border-line rounded-lg text-xs font-semibold text-ink-body cursor-pointer"
                >
                  <option value="ALL">All Payments</option>
                  <option value="DUE">Pending Due Only</option>
                  <option value="PAID">Fully Paid Only</option>
                </select>
              </div>
            </div>

            {/* Table / Ledger Records */}
            {loadingData ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-line">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                <p className="text-xs text-ink-subtle">Loading your financial statement...</p>
              </div>
            ) : filteredLedgerEntries.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-line text-center space-y-3">
                <Receipt className="w-12 h-12 text-ink-subtle opacity-40 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-primary">
                  No ledger records found
                </h3>
                <p className="text-xs text-ink-body max-w-sm mx-auto">
                  {ledgerSearch || ledgerTypeFilter !== "ALL" || ledgerStatusFilter !== "ALL"
                    ? "No transactions match your current filters."
                    : "Your ledger statement will display transaction history as soon as you place an order or schedule a clinic consultation."}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-line shadow-2xs overflow-hidden">
                {/* Desktop View Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-sunken border-b border-line text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
                      <tr>
                        <th className="py-3 px-4">Date &amp; Ref</th>
                        <th className="py-3 px-4">Domain / Service</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Debit (Billed)</th>
                        <th className="py-3 px-4 text-right">Credit (Paid)</th>
                        <th className="py-3 px-4 text-right">Balance</th>
                        <th className="py-3 px-4 text-center">Invoice / Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {filteredLedgerEntries.map((entry) => {
                        return (
                          <tr key={entry.id} className="hover:bg-sand-50/50 transition-colors">
                            <td className="py-3.5 px-4">
                              <span className="font-mono font-bold text-primary block">
                                {entry.reference}
                              </span>
                              <span className="text-[11px] text-ink-subtle">
                                {entry.dateStr}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                  entry.type === "ORDER"
                                    ? "bg-primary/10 text-primary"
                                    : entry.type === "HIJAMA"
                                    ? "bg-brand-gold-50 text-brand-gold-800"
                                    : "bg-sand-100 text-ink-body"
                                }`}>
                                  {entry.type === "ORDER" && <Package className="w-3.5 h-3.5" />}
                                  {entry.type === "HIJAMA" && <Droplets className="w-3.5 h-3.5" />}
                                  {entry.type === "CONSULTATION" && <Calendar className="w-3.5 h-3.5" />}
                                </span>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-ink-body">{entry.title}</span>
                                    <span className="text-[10px] text-ink-subtle">({entry.typeUrdu})</span>
                                  </div>
                                  <p className="text-[11px] text-ink-subtle truncate max-w-xs">
                                    {entry.subtitle}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                entry.paymentStatus === "PAID"
                                  ? "bg-success-soft text-success border border-success-line"
                                  : entry.paymentStatus === "CANCELLED"
                                  ? "bg-danger-soft text-danger border border-danger/20"
                                  : entry.paymentStatus === "PARTIAL"
                                  ? "bg-warning-soft text-warning border border-warning-line"
                                  : entry.paymentStatus === "COMPLIMENTARY"
                                  ? "bg-info-soft text-info border border-info-line"
                                  : "bg-warning-soft text-warning border border-warning-line"
                              }`}>
                                {entry.paymentStatus === "COMPLIMENTARY"
                                  ? "Complimentary"
                                  : entry.paymentStatus === "PAID"
                                  ? "Paid in Full"
                                  : entry.paymentStatus === "PARTIAL"
                                  ? "Partially Paid"
                                  : entry.paymentStatus === "CANCELLED"
                                  ? "Cancelled / Void"
                                  : "Payment Due"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-semibold text-ink">
                              {entry.debit > 0 ? `₨ ${entry.debit.toLocaleString()}` : "—"}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-semibold text-brand-green-700">
                              {entry.credit > 0 ? `₨ ${entry.credit.toLocaleString()}` : "—"}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold">
                              <span className={entry.balance > 0 ? "text-danger" : "text-primary"}>
                                ₨ {entry.balance.toLocaleString()}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {entry.type === "ORDER" && entry.orderRecord ? (
                                <div className="flex items-center justify-center gap-1.5">
                                  <Link
                                    href={`/invoices/${entry.reference}`}
                                    target="_blank"
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface hover:bg-surface-sunken border border-line text-primary rounded-lg text-[11px] font-semibold transition-colors"
                                    title="View & Download PDF Invoice"
                                  >
                                    <FileText className="w-3 h-3" />
                                    <span>PDF</span>
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedInvoiceOrder(entry.orderRecord);
                                      setIsInvoiceModalOpen(true);
                                    }}
                                    className="p-1 bg-surface hover:bg-surface-sunken border border-line text-primary rounded-lg text-[11px] transition-colors cursor-pointer"
                                    title="Quick Preview Invoice"
                                  >
                                    <Printer className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : entry.type === "HIJAMA" ? (
                                <button
                                  type="button"
                                  onClick={() => setActiveTab("hijama")}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface hover:bg-surface-sunken border border-line text-ink-body rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                                >
                                  <span>View Ticket</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setActiveTab("consultations")}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface hover:bg-surface-sunken border border-line text-ink-body rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                                >
                                  <span>View</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Cards */}
                <div className="md:hidden divide-y divide-line">
                  {filteredLedgerEntries.map((entry) => (
                    <div key={entry.id} className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono font-bold text-sm text-primary">
                            {entry.reference}
                          </span>
                          <p className="text-[11px] text-ink-subtle">{entry.dateStr}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          entry.paymentStatus === "PAID"
                            ? "bg-success-soft text-success border border-success-line"
                            : entry.paymentStatus === "CANCELLED"
                            ? "bg-danger-soft text-danger border border-danger/20"
                            : "bg-warning-soft text-warning border border-warning-line"
                        }`}>
                          {entry.paymentStatus}
                        </span>
                      </div>

                      <div className="text-xs space-y-0.5">
                        <p className="font-bold text-ink">{entry.title} ({entry.typeUrdu})</p>
                        <p className="text-[11px] text-ink-subtle">{entry.subtitle}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-surface p-2.5 rounded-xl border border-line text-center text-xs">
                        <div>
                          <p className="text-[9px] uppercase font-bold text-ink-subtle">Billed</p>
                          <p className="font-mono font-bold text-ink mt-0.5">
                            {entry.debit > 0 ? `₨ ${entry.debit.toLocaleString()}` : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase font-bold text-ink-subtle">Paid</p>
                          <p className="font-mono font-bold text-brand-green-700 mt-0.5">
                            {entry.credit > 0 ? `₨ ${entry.credit.toLocaleString()}` : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase font-bold text-ink-subtle">Balance</p>
                          <p className={`font-mono font-bold mt-0.5 ${entry.balance > 0 ? "text-danger" : "text-primary"}`}>
                            ₨ {entry.balance.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="pt-1 flex items-center justify-end gap-2">
                        {entry.type === "ORDER" && entry.orderRecord && (
                          <Link
                            href={`/invoices/${entry.reference}`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold shadow-xs"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Download Invoice (PDF)</span>
                          </Link>
                        )}
                        {entry.type === "HIJAMA" && (
                          <button
                            type="button"
                            onClick={() => setActiveTab("hijama")}
                            className="px-3 py-1.5 bg-surface border border-line text-ink rounded-lg text-xs font-semibold"
                          >
                            View Hijama Ticket
                          </button>
                        )}
                        {entry.type === "CONSULTATION" && (
                          <button
                            type="button"
                            onClick={() => setActiveTab("consultations")}
                            className="px-3 py-1.5 bg-surface border border-line text-ink rounded-lg text-xs font-semibold"
                          >
                            View Consultation
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 3: WISHLIST ─── */}
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

        {/* ─── TAB 4: CONSULTATIONS ─── */}
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

        {/* ─── TAB 5: HIJAMA SESSIONS ─── */}
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

        {/* ─── TAB 6: PROFILE & ADDRESS ─── */}
        {activeTab === "profile" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-line shadow-xs space-y-6 max-w-2xl">
            <div className="flex items-center justify-between border-b border-sand-100 pb-3">
              <div>
                <h2 className="font-serif text-lg font-bold text-primary">
                  Profile &amp; Default Shipping Details
                </h2>
                <p className="text-xs text-ink-muted">
                  Your default contact details and delivery location used for apothecary orders.
                </p>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-green-700 bg-brand-green-50 px-2.5 py-1 rounded-full border border-brand-green-200">
                {(user as any).role || "Customer"}
              </span>
            </div>

            {profileSuccess && (
              <div className="p-3 bg-success-soft border border-success-line rounded-xl text-xs text-success flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-success" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="p-3 bg-danger-soft border border-danger/20 rounded-xl text-xs text-danger flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-danger" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-ink-subtle uppercase block mb-1">
                    Email Address (Immutable)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full text-xs px-3.5 py-2.5 bg-surface-sunken border border-line rounded-xl text-ink-muted cursor-not-allowed"
                  />
                  <span className="text-[10px] text-ink-subtle mt-0.5 block">
                    Account email address cannot be changed.
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink uppercase block mb-1">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Your Full Name"
                    className="w-full text-xs px-3.5 py-2.5 bg-surface border border-line rounded-xl text-ink focus:outline-none focus:border-primary focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink uppercase block mb-1">
                    Active Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="0300-1234567"
                    className="w-full text-xs px-3.5 py-2.5 bg-surface border border-line rounded-xl text-ink focus:outline-none focus:border-primary focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink uppercase block mb-1">
                    City <span className="text-danger">*</span>
                  </label>
                  <select
                    value={profileForm.city}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, city: e.target.value }))
                    }
                    className="w-full text-xs px-3.5 py-2.5 bg-surface border border-line rounded-xl text-ink font-semibold focus:outline-none focus:border-primary focus:bg-white transition-colors cursor-pointer"
                  >
                    {PAKISTAN_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Delivery Address & GPS */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-ink uppercase block">
                    Default Street Address &amp; Area
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectProfileLocation}
                    disabled={detectingAccountLocation}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {detectingAccountLocation ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Detecting GPS...</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="w-3 h-3" />
                        <span>Detect GPS Pin</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={profileForm.address}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, address: e.target.value }))
                  }
                  placeholder="House / Flat #, Street, Block, Landmark..."
                  className="w-full text-xs p-3 bg-surface border border-line rounded-xl text-ink focus:outline-none focus:border-primary focus:bg-white transition-colors"
                />
              </div>

              {/* Coordinates Pill */}
              {profileForm.latitude !== null && profileForm.longitude !== null && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold">Saved Coordinates:</span>{" "}
                      <span className="font-mono">
                        {profileForm.latitude.toFixed(5)}, {profileForm.longitude.toFixed(5)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setProfileForm((prev) => ({
                        ...prev,
                        latitude: null,
                        longitude: null,
                      }))
                    }
                    className="text-[11px] text-danger hover:underline font-semibold cursor-pointer"
                  >
                    Clear Pin
                  </button>
                </div>
              )}

              <div className="pt-4 border-t border-sand-100 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="px-4 py-2 bg-surface hover:bg-danger-soft text-danger border border-line rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Sign Out
                </button>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-brand-green-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Save Profile &amp; Location</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
        </SurfaceFade>

        {/* Printable Invoice Quick Preview Modal */}
        <OrderInvoiceModal
          isOpen={isInvoiceModalOpen}
          onClose={() => {
            setIsInvoiceModalOpen(false);
            setSelectedInvoiceOrder(null);
          }}
          order={selectedInvoiceOrder}
        />

      </div>
    </div>
  );
}
