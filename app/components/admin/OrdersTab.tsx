"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";

interface OrderItem {
  id: string;
  productName: string;
  sizeName: string | null;
  sizeWeight: string | null;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email: string | null;
  city: string;
  address: string;
  deliveryNotes: string | null;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  total: number;
  trackingNote: string | null;
  createdAt: string;
  items: OrderItem[];
  user?: { id: string; name: string | null; email: string | null } | null;
}

const ORDER_STATUSES = [
  { value: "PENDING", label: "Order received" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "DISPATCHED", label: "On the way" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

const PAYMENT_STATUSES = [
  { value: "PENDING", label: "Payment pending" },
  { value: "PARTIAL", label: "Partially paid" },
  { value: "PAID", label: "Paid" },
  { value: "REFUNDED", label: "Refunded" },
];

const STATUS_BADGES: Record<string, string> = {
  PENDING: "bg-warning-soft text-warning border-warning-line",
  CONFIRMED: "bg-info-soft text-info border-info-line",
  DISPATCHED: "bg-info-soft text-info border-info-line",
  DELIVERED: "bg-success-soft text-success border-success-line",
  CANCELLED: "bg-danger-soft text-danger border-danger/20",
};

const PAYMENT_BADGES: Record<string, string> = {
  PENDING: "bg-surface-sunken text-ink-body border-line-strong",
  PARTIAL: "bg-warning-soft text-warning border-warning-line",
  PAID: "bg-success-soft text-success border-success-line",
  REFUNDED: "bg-danger-soft text-danger border-danger/20",
};

function statusLabel(value: string) {
  return (
    ORDER_STATUSES.find((status) => status.value === value)?.label ||
    value.replace(/_/g, " ")
  );
}

function paymentLabel(value: string) {
  return (
    PAYMENT_STATUSES.find((status) => status.value === value)?.label ||
    value.replace(/_/g, " ")
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "—";
  return date.toLocaleString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatMoney(value: number) {
  return `₨ ${Number(value || 0).toLocaleString("en-PK")}`;
}

/** Convert a Pakistani local number into a wa.me-safe international number. */
function whatsappNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("92")) return digits;
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;
  return digits;
}

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [trackingDrafts, setTrackingDrafts] = useState<Record<string, string>>({});

  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load orders.");
      }

      setOrders(json.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      if (statusFilter !== "ALL" && order.orderStatus !== statusFilter) {
        return false;
      }
      if (!query) return true;

      return [
        order.orderNumber,
        order.customerName,
        order.phone,
        order.email || "",
        order.city,
        order.address,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [orders, search, statusFilter]);

  const counts = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((order) => order.orderStatus === "PENDING").length,
      active: orders.filter((order) =>
        ["CONFIRMED", "DISPATCHED"].includes(order.orderStatus)
      ).length,
    };
  }, [orders]);

  const updateOrder = async (
    order: Order,
    payload: { orderStatus?: string; paymentStatus?: string; trackingNote?: string }
  ) => {
    setUpdatingId(order.id);
    setError(null);

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update order.");
      }

      setOrders((prev) =>
        prev.map((item) => (item.id === order.id ? { ...item, ...json.data } : item))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-line px-4 py-3 flex items-center gap-3">
          <ShoppingBag className="w-4 h-4 text-primary shrink-0" />
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-ink-muted">
              All orders
            </p>
            <p className="text-lg font-serif font-bold text-ink">{counts.total}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-warning-line px-4 py-3 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-warning shrink-0" />
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-warning">
              Awaiting confirmation
            </p>
            <p className="text-lg font-serif font-bold text-warning">{counts.pending}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-line px-4 py-3 flex items-center gap-3">
          <Truck className="w-4 h-4 text-info shrink-0" />
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-ink-muted">
              In progress
            </p>
            <p className="text-lg font-serif font-bold text-info">{counts.active}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-line p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order number, customer, phone, city..."
            className="w-full pl-9 pr-3 py-2 bg-surface border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-primary focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="px-3 py-2 bg-surface border border-line rounded-xl text-xs font-semibold text-ink focus:outline-none focus:border-primary"
          >
            <option value="ALL">All statuses</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-surface border border-line transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-danger-soft border border-danger/20 rounded-xl text-xs text-danger flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-line py-16 flex flex-col items-center gap-2 text-primary">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="text-xs text-ink-muted">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-line py-16 flex flex-col items-center gap-2 text-center px-6">
          <Package className="w-8 h-8 text-ink-subtle" />
          <p className="text-sm font-semibold text-ink">No orders found</p>
          <p className="text-xs text-ink-muted">
            {orders.length === 0
              ? "New store orders will appear here automatically."
              : "Try a different search term or status filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isExpanded = expandedId === order.id;
            const isUpdating = updatingId === order.id;
            const phoneDigits = whatsappNumber(order.phone);

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-line overflow-hidden"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Identity */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${
                            STATUS_BADGES[order.orderStatus] ||
                            "bg-surface-sunken text-ink-body border-line-strong"
                          }`}
                        >
                          {statusLabel(order.orderStatus)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${
                            PAYMENT_BADGES[order.paymentStatus] ||
                            "bg-surface-sunken text-ink-body border-line-strong"
                          }`}
                        >
                          {paymentLabel(order.paymentStatus)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                        <User className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
                        <span className="truncate">{order.customerName}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-body">
                        <a
                          href={`tel:${order.phone}`}
                          className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{order.phone}</span>
                        </a>
                        {order.email && (
                          <a
                            href={`mailto:${order.email}`}
                            className="inline-flex items-center gap-1.5 hover:text-primary hover:underline"
                          >
                            <Mail className="w-3.5 h-3.5 text-ink-subtle" />
                            <span className="truncate max-w-[16rem]">{order.email}</span>
                          </a>
                        )}
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-ink-subtle" />
                          <span>
                            {order.address}, {order.city}
                          </span>
                        </span>
                      </div>

                      <p className="text-[11px] text-ink-subtle">
                        {formatDateTime(order.createdAt)} · {order.items.length} item
                        {order.items.length === 1 ? "" : "s"} ·{" "}
                        <strong className="text-ink">{formatMoney(order.total)}</strong>{" "}
                        ({order.paymentMethod})
                      </p>
                    </div>

                    {/* Contact + status controls */}
                    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-2 shrink-0">
                      <a
                        href={`https://wa.me/${phoneDigits}?text=${encodeURIComponent(
                          `Assalam-o-Alaikum ${order.customerName}, this is Tameer-e-Sehat regarding your order ${order.orderNumber}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-whatsapp/10 text-whatsapp border border-whatsapp/20 text-xs font-semibold hover:bg-whatsapp/15 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>

                      <select
                        value={order.orderStatus}
                        onChange={(event) =>
                          updateOrder(order, { orderStatus: event.target.value })
                        }
                        disabled={isUpdating}
                        className="px-3 py-2 bg-surface border border-line rounded-xl text-xs font-semibold text-ink focus:outline-none focus:border-primary disabled:opacity-50"
                        aria-label={`Update status for ${order.orderNumber}`}
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-line text-xs font-semibold text-ink-body hover:bg-surface transition-colors"
                        aria-expanded={isExpanded}
                      >
                        {isUpdating ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        )}
                        <span>{isExpanded ? "Hide" : "Details"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-line bg-surface/50 p-4 sm:p-5 space-y-4">
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-2">
                        Items
                      </h4>
                      <div className="space-y-1.5">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 text-xs bg-white rounded-lg border border-line px-3 py-2"
                          >
                            <span className="min-w-0 truncate text-ink">
                              {item.productName}
                              {[item.sizeName, item.sizeWeight]
                                .filter(Boolean)
                                .join(" · ")
                                ? ` · ${[item.sizeName, item.sizeWeight]
                                    .filter(Boolean)
                                    .join(" · ")}`
                                : ""}
                            </span>
                            <span className="text-ink-body shrink-0">
                              {item.quantity} × {formatMoney(item.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {order.deliveryNotes && (
                      <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1">
                          Delivery notes
                        </h4>
                        <p className="text-xs text-ink-body">{order.deliveryNotes}</p>
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                          Payment status
                        </label>
                        <select
                          value={order.paymentStatus}
                          onChange={(event) =>
                            updateOrder(order, { paymentStatus: event.target.value })
                          }
                          disabled={isUpdating}
                          className="w-full px-3 py-2 bg-white border border-line rounded-xl text-xs font-semibold text-ink focus:outline-none focus:border-primary disabled:opacity-50"
                        >
                          {PAYMENT_STATUSES.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                          Tracking note
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={
                              trackingDrafts[order.id] ?? order.trackingNote ?? ""
                            }
                            onChange={(event) =>
                              setTrackingDrafts((prev) => ({
                                ...prev,
                                [order.id]: event.target.value,
                              }))
                            }
                            placeholder="Courier / tracking reference"
                            className="flex-1 px-3 py-2 bg-white border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-primary"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateOrder(order, {
                                trackingNote:
                                  trackingDrafts[order.id] ?? order.trackingNote ?? "",
                              })
                            }
                            disabled={isUpdating}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-brand-green-800 disabled:opacity-50 transition-colors"
                          >
                            {isUpdating ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            <span>Save</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
