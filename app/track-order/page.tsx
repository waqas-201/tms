"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CLINIC_INFO } from "@/app/data/products";
import {
  Search,
  Truck,
  Package,
  MapPin,
  AlertCircle,
  Loader2,
  ArrowRight,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShoppingBag,
} from "lucide-react";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") || searchParams.get("order") || "";

  const [orderQuery, setOrderQuery] = useState(initialRef);
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setOrderData(null);

    try {
      const cleanRef = query.trim().toUpperCase();
      const res = await fetch(`/api/orders/${cleanRef}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error ||
            "No order found with this reference number. Please check your order number or phone number."
        );
      }

      setOrderData(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef) {
      setOrderQuery(initialRef);
      fetchOrder(initialRef);
    }
  }, [initialRef]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderQuery);
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case "PENDING":
        return 1;
      case "CONFIRMED":
        return 2;
      case "DISPATCHED":
        return 3;
      case "DELIVERED":
        return 4;
      default:
        return 1;
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#FAF9F6] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#14281D]/5 rounded-full text-xs uppercase tracking-widest font-semibold text-[#14281D]">
            <Truck className="w-3.5 h-3.5 text-[#9E7D3B]" />
            <span>Live Order Tracking</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Track Your Remedy Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
            Enter your order reference number (e.g. <strong className="text-stone-900 font-mono">TMS-2026-1001</strong>) to check live courier delivery status.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-sm">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                placeholder="e.g. TMS-2026-1001"
                className="w-full pl-10 pr-3.5 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 uppercase font-mono placeholder:text-stone-400 focus:outline-none focus:border-[#14281D] focus:bg-white transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#14281D] hover:bg-[#0c1b13] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Locating Parcel...</span>
                </>
              ) : (
                <>
                  <span>Track Status</span>
                  <ArrowRight className="w-4 h-4 text-[#9E7D3B]" />
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Order Details Output */}
        {orderData && (
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-md overflow-hidden space-y-6">
            {/* Top Bar */}
            <div className="bg-[#14281D] text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <span className="text-[11px] font-mono text-[#9E7D3B] uppercase font-bold tracking-widest block">
                  Verified Order Reference
                </span>
                <h2 className="font-serif text-2xl font-bold tracking-tight">{orderData.orderNumber}</h2>
                <p className="text-xs text-stone-300 mt-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#9E7D3B]" />
                  <span>
                    Placed on:{" "}
                    {new Date(orderData.createdAt).toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </p>
              </div>

              <div className="text-left sm:text-right bg-white/5 sm:bg-transparent p-3 sm:p-0 rounded-xl border border-white/10 sm:border-0">
                <span className="text-xs text-stone-300 block">
                  Amount Payable (COD)
                </span>
                <span className="font-serif text-2xl font-bold text-[#9E7D3B]">
                  ₨ {orderData.total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="px-6 sm:px-8 py-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Delivery Milestones
                </h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Status: {orderData.orderStatus}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 relative">
                {/* Step 1: Placed */}
                <div className="text-center space-y-2">
                  <div
                    className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      getStatusStep(orderData.orderStatus) >= 1
                        ? "bg-[#14281D] text-white ring-4 ring-[#14281D]/10"
                        : "bg-stone-100 text-stone-400"
                    }`}
                  >
                    1
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">
                      Order Received
                    </span>
                    <span className="text-[10px] text-stone-500 hidden sm:block">
                      Verified in System
                    </span>
                  </div>
                </div>

                {/* Step 2: Confirmed */}
                <div className="text-center space-y-2">
                  <div
                    className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      getStatusStep(orderData.orderStatus) >= 2
                        ? "bg-[#14281D] text-white ring-4 ring-[#14281D]/10"
                        : "bg-stone-100 text-stone-400"
                    }`}
                  >
                    2
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">
                      Dispensary Packed
                    </span>
                    <span className="text-[10px] text-stone-500 hidden sm:block">
                      Fresh Batch Sealed
                    </span>
                  </div>
                </div>

                {/* Step 3: Dispatched */}
                <div className="text-center space-y-2">
                  <div
                    className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      getStatusStep(orderData.orderStatus) >= 3
                        ? "bg-[#14281D] text-white ring-4 ring-[#14281D]/10"
                        : "bg-stone-100 text-stone-400"
                    }`}
                  >
                    3
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">
                      With Courier
                    </span>
                    <span className="text-[10px] text-stone-500 hidden sm:block">
                      Out for Delivery
                    </span>
                  </div>
                </div>

                {/* Step 4: Delivered */}
                <div className="text-center space-y-2">
                  <div
                    className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      getStatusStep(orderData.orderStatus) >= 4
                        ? "bg-emerald-700 text-white ring-4 ring-emerald-100"
                        : "bg-stone-100 text-stone-400"
                    }`}
                  >
                    4
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">
                      Delivered
                    </span>
                    <span className="text-[10px] text-stone-500 hidden sm:block">
                      Handed Over (COD)
                    </span>
                  </div>
                </div>
              </div>

              {orderData.trackingNote && (
                <div className="mt-6 p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center gap-3">
                  <Truck className="w-5 h-5 text-emerald-800 shrink-0" />
                  <div className="text-xs text-stone-900">
                    <span className="font-bold block text-emerald-950">
                      Courier Dispatch &amp; Tracking Details:
                    </span>
                    <span className="font-mono text-xs text-emerald-900">{orderData.trackingNote}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Details & Items */}
            <div className="p-6 sm:p-8 bg-[#FAF9F6] border-t border-stone-200/80 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-3">
                <h4 className="font-bold text-stone-900 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                  <MapPin className="w-4 h-4 text-[#9E7D3B]" />
                  <span>Destination Address</span>
                </h4>
                <div className="text-stone-600 space-y-1 bg-white p-4 rounded-xl border border-stone-200/60 shadow-2xs">
                  <p className="font-bold text-stone-900">{orderData.customerName}</p>
                  <p className="font-mono text-stone-700">{orderData.phone}</p>
                  <p>{orderData.address}</p>
                  <p className="font-semibold text-stone-900">{orderData.city}, Pakistan</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-stone-900 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                  <Package className="w-4 h-4 text-[#14281D]" />
                  <span>Remedies Ordered ({orderData.items?.length || 0})</span>
                </h4>
                <div className="space-y-2 bg-white p-4 rounded-xl border border-stone-200/60 shadow-2xs max-h-48 overflow-y-auto divide-y divide-stone-100">
                  {orderData.items?.map((item: any) => (
                    <div key={item.id} className="pt-2 first:pt-0 flex justify-between items-center text-xs">
                      <div>
                        <span className="text-stone-900 font-semibold block">
                          {item.productName}
                        </span>
                        <span className="text-[11px] text-stone-500">
                          {item.sizeWeight} · Qty: {item.quantity}
                        </span>
                      </div>
                      <span className="font-bold text-stone-900">
                        ₨ {item.total.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Help Callout */}
            <div className="p-6 bg-white border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-stone-600">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Need immediate guidance or rider coordination?</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  href="/products"
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors flex-1 sm:flex-initial"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Shop More</span>
                </Link>
                <a
                  href={`https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(
                    `Assalam-o-Alaikum, I would like to inquire about my order ${orderData.orderNumber}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-colors flex-1 sm:flex-initial"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp Helpline</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] bg-[#FAF9F6] py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#14281D]" />
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
