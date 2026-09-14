"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import {
  Search,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  Phone,
  ShieldCheck,
} from "lucide-react";

export default function TrackOrderPage() {
  const { isUrdu } = useLanguage();
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
          data.error ||
            (isUrdu
              ? "اس حوالہ نمبر کے ساتھ کوئی آرڈر نہیں ملا۔ براہ کرم اپنا درست آرڈر نمبر درج کریں۔"
              : "No order found with this reference number. Please verify your order number.")
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
            <span>{isUrdu ? "ملک گیر ترسیل ٹریکنگ" : "Live Pakistan Dispatch Tracking"}</span>
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#123824]">
            {isUrdu ? "اپنے پارسل اور ادویات کا سراغ لگائیں" : "Track Your Apothecary Order"}
          </h1>
          <p className="text-xs sm:text-sm text-[#6a6660] max-w-lg mx-auto">
            {isUrdu
              ? "اپنے آرڈر کی تصدیق، تیاری، اور کوریئر کے ذریعے ترسیل کی تازہ ترین صورتحال جانیں۔"
              : "Enter your order reference number (e.g. TMS-2026-XXXX) to view dispensary preparation and courier status."}
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
                placeholder={isUrdu ? "مثال کے طور پر: TMS-2026-1001" : "e.g. TMS-2026-1001"}
                className="w-full pl-10 pr-3.5 py-3 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs sm:text-sm text-[#1a1816] uppercase focus:outline-none focus:border-[#123824] focus:bg-white font-mono transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#123824] hover:bg-[#0c2719] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isUrdu ? "تلاش جاری ہے..." : "Locating..."}</span>
                </>
              ) : (
                <>
                  <span>{isUrdu ? "آرڈر تلاش کریں" : "Track Order"}</span>
                  <ArrowRight className={`w-4 h-4 ${isUrdu ? "rotate-180" : ""}`} />
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
            <div className="bg-[#123824] text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <span className="text-[11px] font-mono text-[#c59b27] uppercase font-bold tracking-widest">
                  {isUrdu ? "آرڈر نمبر" : "Order Reference"}
                </span>
                <h2 className="font-serif text-2xl font-bold">{orderData.orderNumber}</h2>
                <p className="text-xs text-[#f4eee5]/80 mt-0.5">
                  {isUrdu ? "آرڈر کی تاریخ: " : "Placed on: "}
                  {new Date(orderData.createdAt).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-[#f4eee5]/80 block">
                  {isUrdu ? "کل رقم (ادائیگی کیش آن ڈیلیوری)" : "Total (Cash on Delivery)"}
                </span>
                <span className="font-serif text-2xl font-bold text-[#c59b27]">
                  ₨ {orderData.total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="px-6 sm:px-8 py-4">
              <h3 className="text-xs font-bold text-[#123824] uppercase tracking-wider mb-6">
                {isUrdu ? "ترسیل کی موجودہ صورتحال" : "Fulfillment Timeline"}
              </h3>

              <div className="grid grid-cols-4 gap-2 relative">
                {/* Step 1: Placed */}
                <div className="text-center space-y-2">
                  <div
                    className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${
                      getStatusStep(orderData.orderStatus) >= 1
                        ? "bg-[#123824] text-white"
                        : "bg-[#e6dfd5] text-[#6a6660]"
                    }`}
                  >
                    1
                  </div>
                  <span className="text-[11px] font-semibold text-[#123824] block">
                    {isUrdu ? "موصول شدہ" : "Received"}
                  </span>
                </div>

                {/* Step 2: Confirmed */}
                <div className="text-center space-y-2">
                  <div
                    className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${
                      getStatusStep(orderData.orderStatus) >= 2
                        ? "bg-[#123824] text-white"
                        : "bg-[#e6dfd5] text-[#6a6660]"
                    }`}
                  >
                    2
                  </div>
                  <span className="text-[11px] font-semibold text-[#123824] block">
                    {isUrdu ? "تیار شدہ" : "Prepared"}
                  </span>
                </div>

                {/* Step 3: Dispatched */}
                <div className="text-center space-y-2">
                  <div
                    className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${
                      getStatusStep(orderData.orderStatus) >= 3
                        ? "bg-[#123824] text-white"
                        : "bg-[#e6dfd5] text-[#6a6660]"
                    }`}
                  >
                    3
                  </div>
                  <span className="text-[11px] font-semibold text-[#123824] block">
                    {isUrdu ? "روانہ شدہ" : "Dispatched"}
                  </span>
                </div>

                {/* Step 4: Delivered */}
                <div className="text-center space-y-2">
                  <div
                    className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${
                      getStatusStep(orderData.orderStatus) >= 4
                        ? "bg-[#256644] text-white"
                        : "bg-[#e6dfd5] text-[#6a6660]"
                    }`}
                  >
                    4
                  </div>
                  <span className="text-[11px] font-semibold text-[#123824] block">
                    {isUrdu ? "پہنچا دیا گیا" : "Delivered"}
                  </span>
                </div>
              </div>

              {orderData.trackingNote && (
                <div className="mt-6 p-4 bg-[#f2f9f5] border border-[#d2eadc] rounded-xl flex items-center gap-3">
                  <Truck className="w-5 h-5 text-[#256644] shrink-0" />
                  <div className="text-xs text-[#123824]">
                    <span className="font-bold block">
                      {isUrdu ? "کوریئر ٹریکنگ تفصیلات:" : "Courier Tracking Details:"}
                    </span>
                    <span className="font-mono text-sm">{orderData.trackingNote}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Details & Items */}
            <div className="p-6 sm:p-8 bg-[#faf8f5] border-t border-[#e6dfd5] grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-2">
                <h4 className="font-bold text-[#123824] flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#c59b27]" />
                  <span>{isUrdu ? "ترسیل کا پتہ" : "Destination & Patient Info"}</span>
                </h4>
                <div className="text-[#59534b] space-y-1">
                  <p className="font-semibold text-[#123824]">{orderData.customerName}</p>
                  <p>{orderData.phone}</p>
                  <p>{orderData.address}</p>
                  <p className="font-semibold">{orderData.city}, Pakistan</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[#123824] flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#123824]" />
                  <span>{isUrdu ? "آرڈر میں شامل ادویات" : "Prescribed & Packed Items"}</span>
                </h4>
                <div className="space-y-1.5 divide-y divide-[#e6dfd5]">
                  {orderData.items?.map((item: any) => (
                    <div key={item.id} className="pt-1.5 first:pt-0 flex justify-between">
                      <span className="text-[#123824] font-medium">
                        {item.productName} ({item.sizeWeight}) × {item.quantity}
                      </span>
                      <span className="font-bold text-[#123824]">₨ {item.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Help Callout */}
            <div className="p-6 bg-white border-t border-[#e6dfd5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-[#59534b]">
                <ShieldCheck className="w-4 h-4 text-[#256644]" />
                <span>{isUrdu ? "کسی بھی رہنمائی کے لیے ہماری ہیلپ لائن سے رابطہ کریں۔" : "Need help with your parcel delivery?"}</span>
              </div>
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{isUrdu ? "ہیلپ لائن واٹس ایپ" : "WhatsApp Support"}</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
