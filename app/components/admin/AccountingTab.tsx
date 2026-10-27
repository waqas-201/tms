"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Droplets,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Filter,
  Loader2,
  Package,
  Phone,
  Printer,
  Receipt,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
  User,
  Wallet,
  X,
} from "lucide-react";

interface PaymentItem {
  id: string;
  orderId: string | null;
  customerName: string;
  customerPhone: string | null;
  amount: number;
  paymentMethod: string;
  reference: string | null;
  notes: string | null;
  recordedBy: string | null;
  createdAt: string;
  order?: {
    id: string;
    orderNumber: string;
    total: number;
    paidAmount: number;
    dueAmount: number;
    paymentStatus: string;
    orderStatus: string;
  } | null;
}

interface PaymentSummary {
  totalCollected: number;
  todayCollected: number;
  byMethod: Record<string, number>;
}

const PAYMENT_METHOD_LABELS: Record<string, { label: string; badge: string; color: string }> = {
  CASH: { label: "Cash at Clinic", badge: "Cash (کاؤنٹر نقد)", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  COD: { label: "Cash on Delivery", badge: "COD (ڈلیوری پر نقد)", color: "bg-amber-50 text-amber-700 border-amber-200" },
  BANK: { label: "Bank Transfer / Raast", badge: "Bank (بینک ٹرانسفر)", color: "bg-blue-50 text-blue-700 border-blue-200" },
  JAZZCASH: { label: "JazzCash", badge: "JazzCash (جاز کیش)", color: "bg-orange-50 text-orange-700 border-orange-200" },
  EASYPAISA: { label: "EasyPaisa", badge: "EasyPaisa (ایزی پیسہ)", color: "bg-teal-50 text-teal-700 border-teal-200" },
  ONLINE: { label: "Online Gateway", badge: "Online (آن لائن)", color: "bg-purple-50 text-purple-700 border-purple-200" },
};

export default function AccountingTab() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [hijamaBookings, setHijamaBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Subtabs
  const [activeSubtab, setActiveSubtab] = useState<"payments" | "receivables" | "patients">("payments");
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");

  // Modal State
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [modalTargetType, setModalTargetType] = useState<"ORDER" | "HIJAMA" | "GENERAL">("ORDER");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedHijamaTicket, setSelectedHijamaTicket] = useState("");
  const [formCustomerName, setFormCustomerName] = useState("");
  const [formCustomerPhone, setFormCustomerPhone] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formPaymentMethod, setFormPaymentMethod] = useState("CASH");
  const [formReference, setFormReference] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [paymentsRes, ordersRes, hijamaRes] = await Promise.all([
        fetch("/api/admin/payments"),
        fetch("/api/orders?status=ALL"),
        fetch("/api/hijama/bookings?limit=200"),
      ]);

      const [paymentsJson, ordersJson, hijamaJson] = await Promise.all([
        paymentsRes.json(),
        ordersRes.json(),
        hijamaRes.json(),
      ]);

      if (paymentsJson.success) {
        setPayments(paymentsJson.data || []);
        setSummary(paymentsJson.summary || null);
      }
      if (ordersJson.success) {
        setOrders(ordersJson.data || []);
      }
      if (hijamaJson.success) {
        setHijamaBookings(hijamaJson.data || []);
      }
    } catch (err) {
      console.error("Failed to load accounting workspace data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Orders with outstanding balance
  const pendingReceivableOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.orderStatus !== "CANCELLED" &&
        ((o.dueAmount !== undefined && o.dueAmount > 0) ||
          (o.paymentStatus !== "PAID" && (o.total || 0) > 0))
    );
  }, [orders]);

  // Hijama with pending payment at clinic
  const pendingHijamaSessions = useMemo(() => {
    return hijamaBookings.filter(
      (b) =>
        b.status !== "CANCELLED" &&
        b.status !== "NO_SHOW" &&
        b.paymentStatus !== "PAID_AT_CLINIC"
    );
  }, [hijamaBookings]);

  // Clinic Overall Receivables
  const totalReceivables = useMemo(() => {
    const ordersDue = orders
      .filter((o) => o.orderStatus !== "CANCELLED")
      .reduce((sum, o) => sum + (o.dueAmount !== undefined ? o.dueAmount : o.total || 0), 0);

    const hijamaDue = pendingHijamaSessions.reduce((sum, b) => sum + (b.feeAmount || 2500), 0);

    return ordersDue + hijamaDue;
  }, [orders, pendingHijamaSessions]);

  // Patients Aggregation
  const patientLedgers = useMemo(() => {
    const map = new Map<string, {
      key: string;
      name: string;
      phone: string;
      city: string;
      orders: any[];
      hijama: any[];
      totalBilled: number;
      totalPaid: number;
      balanceDue: number;
    }>();

    orders.forEach((o) => {
      const key = (o.phone || o.customerName || "unknown").replace(/\D/g, "") || o.customerName;
      if (!map.has(key)) {
        map.set(key, {
          key,
          name: o.customerName,
          phone: o.phone,
          city: o.city,
          orders: [],
          hijama: [],
          totalBilled: 0,
          totalPaid: 0,
          balanceDue: 0,
        });
      }
      const p = map.get(key)!;
      p.orders.push(o);
      if (o.orderStatus !== "CANCELLED") {
        const billed = o.total || 0;
        const paid = o.paidAmount > 0 ? o.paidAmount : (o.paymentStatus === "PAID" ? billed : 0);
        p.totalBilled += billed;
        p.totalPaid += paid;
        p.balanceDue += Math.max(0, billed - paid);
      }
    });

    hijamaBookings.forEach((b) => {
      const key = (b.phone || b.fullName || "unknown").replace(/\D/g, "") || b.fullName;
      if (!map.has(key)) {
        map.set(key, {
          key,
          name: b.fullName,
          phone: b.phone,
          city: "Karachi Clinic",
          orders: [],
          hijama: [],
          totalBilled: 0,
          totalPaid: 0,
          balanceDue: 0,
        });
      }
      const p = map.get(key)!;
      p.hijama.push(b);
      if (b.status !== "CANCELLED" && b.status !== "NO_SHOW") {
        const fee = b.feeAmount || 2500;
        p.totalBilled += fee;
        if (b.paymentStatus === "PAID_AT_CLINIC") {
          p.totalPaid += fee;
        } else {
          p.balanceDue += fee;
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => b.balanceDue - a.balanceDue);
  }, [orders, hijamaBookings]);

  // Filtered Payments List
  const filteredPayments = useMemo(() => {
    return payments.filter((item) => {
      if (methodFilter !== "ALL" && item.paymentMethod !== methodFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.customerName.toLowerCase().includes(q);
        const matchPhone = item.customerPhone?.toLowerCase().includes(q);
        const matchRef = item.reference?.toLowerCase().includes(q);
        const matchOrder = item.order?.orderNumber.toLowerCase().includes(q);
        const matchNotes = item.notes?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchRef && !matchOrder && !matchNotes) return false;
      }
      return true;
    });
  }, [payments, methodFilter, searchQuery]);

  // Filtered Patients List
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patientLedgers;
    const q = searchQuery.toLowerCase().trim();
    return patientLedgers.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.orders.some((o) => o.orderNumber.toLowerCase().includes(q))
      );
    });
  }, [patientLedgers, searchQuery]);

  // Open Record Payment Modal with prefill
  const openRecordModal = (options?: {
    orderId?: string;
    hijamaTicket?: string;
    name?: string;
    phone?: string;
    amount?: number;
  }) => {
    setFormError(null);
    setFormSuccess(null);
    if (options?.orderId) {
      setModalTargetType("ORDER");
      setSelectedOrderId(options.orderId);
      const matched = orders.find((o) => o.id === options.orderId);
      if (matched) {
        setFormCustomerName(matched.customerName);
        setFormCustomerPhone(matched.phone || "");
        setFormAmount(String(matched.dueAmount > 0 ? matched.dueAmount : matched.total));
      }
    } else if (options?.hijamaTicket) {
      setModalTargetType("HIJAMA");
      setSelectedHijamaTicket(options.hijamaTicket);
      const matched = hijamaBookings.find((b) => b.ticketNumber === options.hijamaTicket);
      if (matched) {
        setFormCustomerName(matched.fullName);
        setFormCustomerPhone(matched.phone || "");
        setFormAmount(String(matched.feeAmount || 2500));
      }
    } else {
      setModalTargetType("GENERAL");
      setSelectedOrderId("");
      setSelectedHijamaTicket("");
      setFormCustomerName(options?.name || "");
      setFormCustomerPhone(options?.phone || "");
      setFormAmount(options?.amount ? String(options.amount) : "");
    }
    setFormPaymentMethod("CASH");
    setFormReference("");
    setFormNotes("");
    setIsRecordModalOpen(true);
  };

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrderId(orderId);
    const matched = orders.find((o) => o.id === orderId);
    if (matched) {
      setFormCustomerName(matched.customerName);
      setFormCustomerPhone(matched.phone || "");
      setFormAmount(String(matched.dueAmount > 0 ? matched.dueAmount : matched.total));
    }
  };

  const handleHijamaSelect = (ticket: string) => {
    setSelectedHijamaTicket(ticket);
    const matched = hijamaBookings.find((b) => b.ticketNumber === ticket);
    if (matched) {
      setFormCustomerName(matched.fullName);
      setFormCustomerPhone(matched.phone || "");
      setFormAmount(String(matched.feeAmount || 2500));
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const payload: Record<string, any> = {
        customerName: formCustomerName.trim(),
        customerPhone: formCustomerPhone.trim() || null,
        amount: Number(formAmount),
        paymentMethod: formPaymentMethod,
        reference: formReference.trim() || null,
        notes: formNotes.trim() || null,
      };

      if (modalTargetType === "ORDER" && selectedOrderId) {
        payload.orderId = selectedOrderId;
      } else if (modalTargetType === "HIJAMA" && selectedHijamaTicket) {
        payload.hijamaTicket = selectedHijamaTicket;
      }

      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to record payment.");
      }

      setFormSuccess(json.message || "Payment recorded successfully!");
      fetchData();
      setTimeout(() => {
        setIsRecordModalOpen(false);
      }, 1500);
    } catch (err: any) {
      setFormError(err.message || "Failed to record payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-line shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-primary">
              Clinic Accounting &amp; Ledger
            </h1>
            <span className="text-xs font-serif text-ink-subtle hidden sm:inline">
              (کلینک کا کھاتہ و بلنگ)
            </span>
          </div>
          <p className="text-xs text-ink-subtle mt-0.5 max-w-xl">
            Bookkeeping workspace to record counter cash, courier COD receipts, bank transfers, and audit patient balances.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 bg-surface hover:bg-surface-sunken border border-line text-ink-body rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-primary" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => openRecordModal()}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-brand-green-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
          >
            <Banknote className="w-4 h-4 text-brand-gold-300" />
            <span>Record Payment (ادائیگی)</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-line shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-subtle">
            Total Receipts Collected
          </p>
          <p className="font-serif text-xl sm:text-2xl font-bold text-primary mt-1">
            ₨ {(summary?.totalCollected || 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-ink-subtle mt-0.5">
            {payments.length} verified transactions
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-line shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-subtle">
            Collected Today
          </p>
          <p className="font-serif text-xl sm:text-2xl font-bold text-brand-green-700 mt-1">
            ₨ {(summary?.todayCollected || 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-ink-subtle mt-0.5">
            Daily counter + courier receipts
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-line shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-subtle">
            Outstanding Receivables
          </p>
          <p className={`font-serif text-xl sm:text-2xl font-bold mt-1 ${
            totalReceivables > 0 ? "text-danger" : "text-success"
          }`}>
            ₨ {totalReceivables.toLocaleString()}
          </p>
          <p className="text-[10px] text-ink-subtle mt-0.5">
            {pendingReceivableOrders.length} orders · {pendingHijamaSessions.length} Hijama pending
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-line shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-subtle">
            Payment Channels
          </p>
          <div className="flex items-center gap-1.5 flex-wrap mt-2">
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-md">
              Cash: ₨ {(summary?.byMethod?.CASH || 0).toLocaleString()}
            </span>
            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded-md">
              COD: ₨ {(summary?.byMethod?.COD || 0).toLocaleString()}
            </span>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold rounded-md">
              Bank/Jazz: ₨ {((summary?.byMethod?.BANK || 0) + (summary?.byMethod?.JAZZCASH || 0)).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Subtab Navigation Bar */}
      <div className="flex border-b border-line space-x-2 sm:space-x-8 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveSubtab("payments")}
          className={`pb-3 px-2 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeSubtab === "payments"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-ink-subtle hover:text-primary"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Payment Receipts Ledger ({payments.length})</span>
        </button>

        <button
          onClick={() => setActiveSubtab("receivables")}
          className={`pb-3 px-2 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeSubtab === "receivables"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-ink-subtle hover:text-primary"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending Receivables ({pendingReceivableOrders.length + pendingHijamaSessions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubtab("patients")}
          className={`pb-3 px-2 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeSubtab === "patients"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-ink-subtle hover:text-primary"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Patient Account Ledgers ({patientLedgers.length})</span>
        </button>
      </div>

      {/* ─── SUBTAB 1: PAYMENT RECEIPTS AUDIT ─── */}
      {activeSubtab === "payments" && (
        <div className="space-y-4">
          {/* Search & Channel Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-line shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-ink-subtle uppercase mr-1">Channel:</span>
              <button
                type="button"
                onClick={() => setMethodFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  methodFilter === "ALL"
                    ? "bg-primary text-white"
                    : "bg-surface hover:bg-surface-sunken text-ink-body border border-line"
                }`}
              >
                All ({payments.length})
              </button>
              {["CASH", "COD", "BANK", "JAZZCASH", "EASYPAISA"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethodFilter(m)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    methodFilter === m
                      ? "bg-primary text-white"
                      : "bg-surface hover:bg-surface-sunken text-ink-body border border-line"
                  }`}
                >
                  {m} ({payments.filter((p) => p.paymentMethod === m).length})
                </button>
              ))}
            </div>

            <div className="relative md:w-64">
              <Search className="w-3.5 h-3.5 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, slip #, TID..."
                className="w-full pl-8 pr-3 py-1.5 bg-surface border border-line rounded-lg text-xs text-ink focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-line">
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
              <p className="text-xs text-ink-subtle">Loading payment receipts...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-line text-center space-y-3">
              <Receipt className="w-12 h-12 text-ink-subtle opacity-40 mx-auto" />
              <h3 className="font-serif text-lg font-bold text-primary">
                No payment receipts found
              </h3>
              <p className="text-xs text-ink-body max-w-sm mx-auto">
                {searchQuery || methodFilter !== "ALL"
                  ? "No payments match your current search/channel filters."
                  : "Click 'Record Payment' to enter the first clinic receipt."}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-line shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-sunken border-b border-line text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
                    <tr>
                      <th className="py-3 px-4">Date &amp; Receipt ID</th>
                      <th className="py-3 px-4">Patient / Customer</th>
                      <th className="py-3 px-4">Payment Channel</th>
                      <th className="py-3 px-4">Linked Order / Service</th>
                      <th className="py-3 px-4 text-right">Amount (PKR)</th>
                      <th className="py-3 px-4">Reference / Slip</th>
                      <th className="py-3 px-4">Staff</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredPayments.map((p) => {
                      const methodCfg = PAYMENT_METHOD_LABELS[p.paymentMethod] || {
                        label: p.paymentMethod,
                        badge: p.paymentMethod,
                        color: "bg-surface text-ink-body border-line",
                      };
                      return (
                        <tr key={p.id} className="hover:bg-sand-50/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-primary block">
                              REC-{p.id.slice(-6).toUpperCase()}
                            </span>
                            <span className="text-[11px] text-ink-subtle">
                              {new Date(p.createdAt).toLocaleDateString("en-PK", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}{" "}
                              ·{" "}
                              {new Date(p.createdAt).toLocaleTimeString("en-PK", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-ink-body block">{p.customerName}</span>
                            {p.customerPhone && (
                              <span className="text-[11px] font-mono text-ink-subtle">
                                {p.customerPhone}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold border ${methodCfg.color}`}>
                              {methodCfg.badge}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {p.order ? (
                              <div>
                                <Link
                                  href={`/invoices/${p.order.orderNumber}`}
                                  target="_blank"
                                  className="font-mono font-bold text-primary hover:underline inline-flex items-center gap-1"
                                >
                                  <span>{p.order.orderNumber}</span>
                                  <ExternalLink className="w-3 h-3 opacity-60" />
                                </Link>
                                <span className="text-[10px] text-ink-subtle block">
                                  Total: ₨ {p.order.total.toLocaleString()} · Due: ₨ {p.order.dueAmount.toLocaleString()}
                                </span>
                              </div>
                            ) : p.notes?.includes("[HIJAMA:") ? (
                              <span className="text-brand-gold-800 font-semibold text-[11px] bg-brand-gold-50 px-2 py-0.5 rounded border border-brand-gold-200">
                                Hijama Cupping Session
                              </span>
                            ) : (
                              <span className="text-ink-subtle text-[11px]">General Clinic Receipt</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-base text-brand-green-700">
                            ₨ {p.amount.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            {p.reference ? (
                              <span className="font-mono text-[11px] text-ink-body bg-surface px-1.5 py-0.5 rounded border border-line">
                                {p.reference}
                              </span>
                            ) : (
                              <span className="text-ink-subtle text-[11px]">—</span>
                            )}
                            {p.notes && (
                              <p className="text-[10px] text-ink-subtle mt-0.5 line-clamp-1">
                                {p.notes}
                              </p>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-[11px] text-ink-body">
                            {p.recordedBy || "Staff"}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {p.order && (
                              <Link
                                href={`/invoices/${p.order.orderNumber}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface hover:bg-surface-sunken border border-line text-primary rounded-lg text-[11px] font-semibold transition-colors"
                              >
                                <FileText className="w-3 h-3" />
                                <span>Invoice</span>
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── SUBTAB 2: PENDING RECEIVABLES ─── */}
      {activeSubtab === "receivables" && (
        <div className="space-y-6">
          {/* Pending Orders Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-base font-bold text-primary flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                <span>Orders Pending Payment ({pendingReceivableOrders.length})</span>
              </h2>
              <span className="text-xs font-mono font-bold text-danger">
                ₨{" "}
                {pendingReceivableOrders
                  .reduce((sum, o) => sum + (o.dueAmount !== undefined ? o.dueAmount : o.total), 0)
                  .toLocaleString()}{" "}
                Pending
              </span>
            </div>

            {pendingReceivableOrders.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-line text-center text-xs text-ink-subtle">
                ✓ No pending order dues! All orders are fully settled.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {pendingReceivableOrders.map((o) => (
                  <div key={o.id} className="bg-white p-4 rounded-2xl border border-line shadow-2xs space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-primary">
                          {o.orderNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-warning-soft text-warning border border-warning-line">
                          {o.paymentStatus}
                        </span>
                      </div>
                      <p className="font-bold text-sm text-ink-body mt-1">{o.customerName}</p>
                      <p className="text-[11px] text-ink-subtle">{o.phone} · {o.city}</p>
                      <div className="pt-2 text-xs flex items-center justify-between border-t border-sand-100 mt-2">
                        <span className="text-ink-subtle">Total Billed:</span>
                        <span className="font-mono font-semibold">₨ {o.total.toLocaleString()}</span>
                      </div>
                      <div className="text-xs flex items-center justify-between">
                        <span className="text-ink-subtle">Balance Due:</span>
                        <span className="font-mono font-bold text-danger text-sm">
                          ₨ {(o.dueAmount !== undefined ? o.dueAmount : o.total).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-sand-100">
                      <button
                        type="button"
                        onClick={() => openRecordModal({ orderId: o.id })}
                        className="flex-1 py-1.5 bg-primary hover:bg-brand-green-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer text-center"
                      >
                        Record Payment
                      </button>
                      <Link
                        href={`/invoices/${o.orderNumber}`}
                        target="_blank"
                        className="p-1.5 bg-surface hover:bg-surface-sunken border border-line text-primary rounded-lg text-xs transition-colors"
                        title="View Invoice"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Hijama Sessions Section */}
          <div className="space-y-3 pt-4 border-t border-line">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-base font-bold text-primary flex items-center gap-2">
                <Droplets className="w-4 h-4 text-brand-gold-700" />
                <span>Hijama Sessions Unpaid ({pendingHijamaSessions.length})</span>
              </h2>
              <span className="text-xs font-mono font-bold text-danger">
                ₨ {(pendingHijamaSessions.length * 2500).toLocaleString()} Pending
              </span>
            </div>

            {pendingHijamaSessions.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-line text-center text-xs text-ink-subtle">
                ✓ No pending Hijama dues! All clinic sessions are cleared.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {pendingHijamaSessions.map((b) => (
                  <div key={b.id} className="bg-white p-4 rounded-2xl border border-line shadow-2xs space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-primary">
                          {b.ticketNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-warning-soft text-warning border border-warning-line">
                          Unpaid
                        </span>
                      </div>
                      <p className="font-bold text-sm text-ink-body mt-1">{b.fullName}</p>
                      <p className="text-[11px] text-ink-subtle">{b.phone} · {b.gender === "FEMALE" ? "Female" : "Male"}</p>
                      <p className="text-[11px] text-ink-muted mt-1">
                        Slot: {b.appointmentDate} ({b.appointmentSlot})
                      </p>
                      <div className="pt-2 text-xs flex items-center justify-between border-t border-sand-100 mt-2">
                        <span className="text-ink-subtle">Clinic Fee:</span>
                        <span className="font-mono font-bold text-danger text-sm">
                          ₨ {(b.feeAmount || 2500).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openRecordModal({ hijamaTicket: b.ticketNumber })}
                      className="w-full py-1.5 bg-brand-gold-600 hover:bg-brand-gold-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer text-center"
                    >
                      Record Clinic Fee Received
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── SUBTAB 3: PATIENT ACCOUNT LEDGERS ─── */}
      {activeSubtab === "patients" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-line shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-ink-subtle">
              Showing {filteredPatients.length} patient ledger accounts
            </span>
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient name, phone, order #..."
                className="w-full pl-8 pr-3 py-1.5 bg-surface border border-line rounded-lg text-xs text-ink focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((p) => (
              <div key={p.key} className="bg-white p-5 rounded-2xl border border-line shadow-2xs space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-primary text-base">{p.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.balanceDue > 0
                        ? "bg-warning-soft text-warning border border-warning-line"
                        : "bg-success-soft text-success border border-success-line"
                    }`}>
                      {p.balanceDue > 0 ? "Due" : "Cleared"}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-ink-subtle">{p.phone}</p>
                  <p className="text-[11px] text-ink-muted">{p.city}</p>

                  <div className="grid grid-cols-3 gap-2 bg-surface p-2.5 rounded-xl border border-line text-center text-xs mt-3">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-ink-subtle">Billed</p>
                      <p className="font-mono font-semibold text-ink mt-0.5">
                        ₨ {p.totalBilled.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-ink-subtle">Paid</p>
                      <p className="font-mono font-semibold text-brand-green-700 mt-0.5">
                        ₨ {p.totalPaid.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-ink-subtle">Balance</p>
                      <p className={`font-mono font-bold mt-0.5 ${p.balanceDue > 0 ? "text-danger" : "text-primary"}`}>
                        ₨ {p.balanceDue.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 text-[11px] text-ink-subtle space-y-0.5">
                    <p>• {p.orders.length} store orders</p>
                    <p>• {p.hijama.length} Hijama appointments</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-sand-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openRecordModal({ name: p.name, phone: p.phone, amount: p.balanceDue > 0 ? p.balanceDue : undefined })}
                    className="flex-1 py-1.5 bg-primary hover:bg-brand-green-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer text-center"
                  >
                    Record Payment
                  </button>
                  {p.orders.length > 0 && (
                    <Link
                      href={`/invoices/${p.orders[0].orderNumber}`}
                      target="_blank"
                      className="p-1.5 bg-surface hover:bg-surface-sunken border border-line text-primary rounded-lg text-xs transition-colors"
                      title="Latest Invoice"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── RECORD PAYMENT MODAL ─── */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl border border-line shadow-2xl p-6 space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-sand-100 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-primary">
                  Record Payment (ادائیگی کا اندراج)
                </h3>
                <p className="text-xs text-ink-subtle mt-0.5">
                  Save cash, courier COD, or online transaction into clinic ledger.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRecordModalOpen(false)}
                className="p-1.5 rounded-lg text-ink-subtle hover:bg-surface transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formSuccess && (
              <div className="p-3 bg-success-soft border border-success-line rounded-xl text-xs text-success flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-success" />
                <span>{formSuccess}</span>
              </div>
            )}

            {formError && (
              <div className="p-3 bg-danger-soft border border-danger/20 rounded-xl text-xs text-danger flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-danger" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitPayment} className="space-y-4 text-xs">
              {/* Payment Target Selector */}
              <div>
                <label className="text-[11px] font-bold text-ink uppercase block mb-1">
                  Payment Relates To:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModalTargetType("ORDER");
                      if (pendingReceivableOrders.length > 0) {
                        handleOrderSelect(pendingReceivableOrders[0].id);
                      }
                    }}
                    className={`py-2 px-2 text-center rounded-xl font-bold border transition-colors cursor-pointer ${
                      modalTargetType === "ORDER"
                        ? "bg-primary text-white border-primary"
                        : "bg-surface border-line text-ink-body hover:bg-surface-sunken"
                    }`}
                  >
                    Apothecary Order
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalTargetType("HIJAMA");
                      if (pendingHijamaSessions.length > 0) {
                        handleHijamaSelect(pendingHijamaSessions[0].ticketNumber);
                      }
                    }}
                    className={`py-2 px-2 text-center rounded-xl font-bold border transition-colors cursor-pointer ${
                      modalTargetType === "HIJAMA"
                        ? "bg-primary text-white border-primary"
                        : "bg-surface border-line text-ink-body hover:bg-surface-sunken"
                    }`}
                  >
                    Hijama Session
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalTargetType("GENERAL");
                      setSelectedOrderId("");
                      setSelectedHijamaTicket("");
                    }}
                    className={`py-2 px-2 text-center rounded-xl font-bold border transition-colors cursor-pointer ${
                      modalTargetType === "GENERAL"
                        ? "bg-primary text-white border-primary"
                        : "bg-surface border-line text-ink-body hover:bg-surface-sunken"
                    }`}
                  >
                    General Receipt
                  </button>
                </div>
              </div>

              {/* Order Dropdown if target === ORDER */}
              {modalTargetType === "ORDER" && (
                <div>
                  <label className="text-[11px] font-bold text-ink uppercase block mb-1">
                    Select Order: <span className="text-danger">*</span>
                  </label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => handleOrderSelect(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-surface border border-line rounded-xl font-mono text-ink focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="">-- Choose an order --</option>
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.orderNumber} · {o.customerName} · ₨ {o.total} (Due: ₨ {o.dueAmount})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Hijama Dropdown if target === HIJAMA */}
              {modalTargetType === "HIJAMA" && (
                <div>
                  <label className="text-[11px] font-bold text-ink uppercase block mb-1">
                    Select Hijama Booking: <span className="text-danger">*</span>
                  </label>
                  <select
                    value={selectedHijamaTicket}
                    onChange={(e) => handleHijamaSelect(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-surface border border-line rounded-xl font-mono text-ink focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="">-- Choose Hijama ticket --</option>
                    {hijamaBookings.map((b) => (
                      <option key={b.id} value={b.ticketNumber}>
                        {b.ticketNumber} · {b.fullName} · {b.appointmentDate} (Fee: ₨ {b.feeAmount || 2500})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Customer Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-ink uppercase block mb-1">
                    Patient / Customer Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCustomerName}
                    onChange={(e) => setFormCustomerName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full text-xs px-3.5 py-2.5 bg-surface border border-line rounded-xl text-ink focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-ink uppercase block mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={formCustomerPhone}
                    onChange={(e) => setFormCustomerPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full text-xs px-3.5 py-2.5 bg-surface border border-line rounded-xl text-ink focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Amount & Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-ink uppercase block mb-1">
                    Amount Received (₨) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    step={1}
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full text-xs px-3.5 py-2.5 bg-surface border border-line rounded-xl font-mono font-bold text-primary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-ink uppercase block mb-1">
                    Payment Method <span className="text-danger">*</span>
                  </label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-surface border border-line rounded-xl font-semibold text-ink focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="CASH">Clinic Cash (نقد کاؤنٹر)</option>
                    <option value="COD">Courier COD (ڈلیوری وصولی)</option>
                    <option value="BANK">Bank Transfer / Raast (بینک)</option>
                    <option value="JAZZCASH">JazzCash (جاز کیش)</option>
                    <option value="EASYPAISA">EasyPaisa (ایزی پیسہ)</option>
                    <option value="ONLINE">Online Gateway (آن لائن)</option>
                  </select>
                </div>
              </div>

              {/* Transaction Reference / Slip ID */}
              <div>
                <label className="text-[11px] font-bold text-ink uppercase block mb-1">
                  Slip Reference / Transaction ID (TID)
                </label>
                <input
                  type="text"
                  value={formReference}
                  onChange={(e) => setFormReference(e.target.value)}
                  placeholder="e.g. JazzCash TID 01928374 or Bank Ref #..."
                  className="w-full text-xs px-3.5 py-2.5 bg-surface border border-line rounded-xl font-mono text-ink focus:outline-none focus:border-primary"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-[11px] font-bold text-ink uppercase block mb-1">
                  Audit Notes / Remarks
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Notes e.g. Received at reception by Dr. / Courier batch #..."
                  className="w-full text-xs p-3 bg-surface border border-line rounded-xl text-ink focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-3 border-t border-sand-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2.5 bg-surface hover:bg-surface-sunken text-ink-body border border-line rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-brand-green-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Recording Payment...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-gold-300" />
                      <span>Save &amp; Update Ledger</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
