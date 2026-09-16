"use client";

import React, { useState } from "react";
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
} from "lucide-react";

export default function TrackOrderPage() {
  const [orderQuery, setOrderQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;

    setLoading(true);
    setError(null);
    setOrderData(null);

    try {
      // Find order by orderNumber
      const cleanRef = orderQuery.trim().toUpperCase();
      const res = await fetch(`/api/orders/${cleanRef}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error || "No order found with this reference number. Please check your order number."
        );
      }

      setOrderData(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-[85vh] bg-[#faf8f5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-[#c59b27]">
            <Truck className="w-4 h-4" />
            <span>Order Tracking</span>
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#22623a]">
            Track Your Order
          </h1>
          <p className="text-xs sm:text-sm text-[#6a6660] max-w-lg mx-auto">
            Enter your order reference number (e.g. TMS-2026-1001) to check your package status.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#e6dfd5] shadow-lg">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#6a6660] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                placeholder="e.g. TMS-2026-1001"
                className="w-full pl-10 pr-3.5 py-3 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs sm:text-sm text-[#1a1816] uppercase focus:outline-none focus:border-[#22623a] focus:bg-white font-mono transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <span>Track Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Order Details Output */}
        {orderData && (
          <div className="bg-white rounded-2xl border border-[#e6dfd5] shadow-xl overflow-hidden space-y-6 animate-fade-in">
            {/* Top Bar */}
            <div className="bg-[#22623a] text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <span className="text-[11px] font-mono text-[#c59b27] uppercase font-bold tracking-widest">
                  Order Number
                </span>
                <h2 className="font-serif text-2xl font-bold">{orderData.orderNumber}</h2>
                <p className="text-xs text-[#f4eee5]/80 mt-0.5">
                  Placed on:{" "}
                  {new Date(orderData.createdAt).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-[#f4eee5]/80 block">
                  Total (Cash on Delivery)
                </span>
                <span className="font-serif text-2xl font-bold text-[#c59b27]">
                  ₨ {orderData.total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="px-6 sm:px-8 py-4">
              <h3 className="text-xs font-bold text-[#22623a] uppercase tracking-wider mb-6">
                Delivery Timeline
              </h3>

              <div className="grid grid-cols-4 gap-2 relative">
                {/* Step 1: Placed */}
                <div className="text-center space-y-2">
                  <div
                    className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${
                      getStatusStep(orderData.orderStatus) >= 1
                        ? "bg-[#22623a] text-white"
                        : "bg-[#e6dfd5] text-[#6a6660]"
                    }`}
                  >
                    1
                  </div>
                  <span className="text-[11px] font-semibold text-[#22623a] block">
                    Received
                  </span>
                </div>

                {/* Step 2: Confirmed */}
                <div className="text-center space-y-2">
                  <div
                    className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${
                      getStatusStep(orderData.orderStatus) >= 2
                        ? "bg-[#22623a] text-white"
                        : "bg-[#e6dfd5] text-[#6a6660]"
                    }`}
                  >
                    2
                  </div>
                  <span className="text-[11px] font-semibold text-[#22623a] block">
                    Packed
                  </span>
                </div>

                {/* Step 3: Dispatched */}
                <div className="text-center space-y-2">
                  <div
                    className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${
                      getStatusStep(orderData.orderStatus) >= 3
                        ? "bg-[#22623a] text-white"
                        : "bg-[#e6dfd5] text-[#6a6660]"
                    }`}
                  >
                    3
                  </div>
                  <span className="text-[11px] font-semibold text-[#22623a] block">
                    Dispatched
                  </span>
                </div>

                {/* Step 4: Delivered */}
                <div className="text-center space-y-2">
                  <div
                    className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${
                      getStatusStep(orderData.orderStatus) >= 4
                        ? "bg-[#2d7648] text-white"
                        : "bg-[#e6dfd5] text-[#6a6660]"
                    }`}
                  >
                    4
                  </div>
                  <span className="text-[11px] font-semibold text-[#22623a] block">
                    Delivered
                  </span>
                </div>
              </div>

              {orderData.trackingNote && (
                <div className="mt-6 p-4 bg-[#f4f9f5] border border-[#bfeac7] rounded-xl flex items-center gap-3">
                  <Truck className="w-5 h-5 text-[#2d7648] shrink-0" />
                  <div className="text-xs text-[#22623a]">
                    <span className="font-bold block">
                      Courier Tracking Details:
                    </span>
                    <span className="font-mono text-sm">{orderData.trackingNote}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Details & Items */}
            <div className="p-6 sm:p-8 bg-[#faf8f5] border-t border-[#e6dfd5] grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-2">
                <h4 className="font-bold text-[#22623a] flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#c59b27]" />
                  <span>Delivery Address</span>
                </h4>
                <div className="text-[#59534b] space-y-1">
                  <p className="font-semibold text-[#22623a]">{orderData.customerName}</p>
                  <p>{orderData.phone}</p>
                  <p>{orderData.address}</p>
                  <p className="font-semibold">{orderData.city}, Pakistan</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[#22623a] flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#22623a]" />
                  <span>Ordered Items</span>
                </h4>
                <div className="space-y-1.5 divide-y divide-[#e6dfd5]">
                  {orderData.items?.map((item: any) => (
                    <div key={item.id} className="pt-1.5 first:pt-0 flex justify-between">
                      <span className="text-[#22623a] font-medium">
                        {item.productName} ({item.sizeWeight}) × {item.quantity}
                      </span>
                      <span className="font-bold text-[#22623a]">₨ {item.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Help Callout */}
            <div className="p-6 bg-white border-t border-[#e6dfd5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-[#59534b]">
                <ShieldCheck className="w-4 h-4 text-[#2d7648]" />
                <span>Need help with your order delivery?</span>
              </div>
              <a
                href={`https://wa.me/${CLINIC_INFO.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>WhatsApp Help</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
