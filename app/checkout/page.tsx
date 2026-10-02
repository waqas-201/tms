"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";
import { useSession } from "@/lib/auth-client";
import { CLINIC_INFO } from "@/app/data/products";
import {
  Truck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  ShoppingBag,
  Clock,
  Loader2,
  AlertCircle,
  Tag,
  Printer,
  Sparkles,
  MapPin,
  Phone,
  User,
  Check,
  Building2,
  Mail,
  Receipt,
} from "lucide-react";

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

export default function CheckoutPage() {
  const {
    cart,
    subtotal,
    shippingFee,
    discountAmount,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    clearCart,
    generateWhatsAppOrderUrl,
  } = useCart();

  const { data: sessionData } = useSession();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "Karachi",
    postalCode: "",
    specialNotes: "",
    deliveryOption: "standard", // standard | express_karachi
    paymentMethod: "COD",
  });

  const [couponInput, setCouponInput] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  // Populate form with session user details if logged in
  useEffect(() => {
    if (sessionData?.user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || sessionData.user.name || "",
        email: prev.email || sessionData.user.email || "",
        phone: prev.phone || (sessionData.user as any).phone || "",
        city: prev.city || (sessionData.user as any).city || "Karachi",
      }));
    }
  }, [sessionData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback(res);
    if (res.success) {
      setCouponInput("");
      setTimeout(() => setCouponFeedback(null), 3000);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const orderPayload = {
        customerName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        city: formData.city,
        address: formData.address,
        deliveryNotes: `${
          formData.deliveryOption === "express_karachi" ? "[EXPRESS KARACHI 24H DISPATCH] " : ""
        }${formData.specialNotes || ""}`,
        paymentMethod: formData.paymentMethod,
        discountAmount,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        items: cart.map((item) => ({
          productId: item.product.id,
          productSizeId: item.selectedSize.id || null,
          productName: item.product.name,
          productUrduName: "",
          sizeName: item.selectedSize.name,
          sizeWeight: item.selectedSize.weight,
          price: item.selectedSize.price,
          quantity: item.quantity,
          productImage: item.product.image,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to place order.");
      }

      setCreatedOrder(json.data);
      setOrderConfirmed(true);
      clearCart();
    } catch (err: any) {
      setError(err.message || "An error occurred while creating your order.");
    } finally {
      setLoading(false);
    }
  };

  // ─── ORDER CONFIRMATION SUCCESS SCREEN ───
  if (orderConfirmed && createdOrder) {
    const waUrl = generateWhatsAppOrderUrl({
      name: formData.fullName,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      notes: formData.specialNotes,
    });

    const trackingLink = `/track-order?ref=${encodeURIComponent(createdOrder.orderNumber)}`;

    return (
      <div className="bg-[#FAF9F6] py-14 sm:py-20 min-h-[80vh] flex items-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 w-full space-y-6">
          <div className="bg-white p-6 sm:p-10 rounded-2xl border border-stone-200/80 shadow-lg text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-700 text-white mx-auto flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-9 h-9 text-emerald-100" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-bold text-[#9E7D3B] tracking-widest block">
                Alhamdulillah · Order Dispatched for Processing
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                JazakAllah! Your Order is Confirmed
              </h1>
              <p className="text-xs sm:text-sm text-stone-600">
                Order Tracking Reference:{" "}
                <strong className="text-stone-900 font-mono text-sm sm:text-base px-2.5 py-1 bg-stone-100 rounded-lg border border-stone-200">
                  {createdOrder.orderNumber}
                </strong>
              </p>
              {formData.email && (
                <p className="text-xs text-emerald-700 flex items-center justify-center gap-1.5 pt-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span>A detailed confirmation receipt has been sent to <strong>{formData.email}</strong></span>
                </p>
              )}
            </div>

            {/* Receipt Summary Card */}
            <div className="p-5 bg-[#FAF9F6] rounded-xl border border-stone-200/80 text-left text-xs space-y-2.5 text-stone-700">
              <div className="flex justify-between border-b border-stone-200/80 pb-2 font-bold text-stone-900">
                <span className="flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-[#9E7D3B]" />
                  <span>Cash on Delivery (COD) Summary</span>
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold">Pay on Delivery</span>
              </div>
              <p>
                <strong className="text-stone-900">Recipient Name:</strong> {createdOrder.customerName} ({createdOrder.phone})
              </p>
              <p>
                <strong className="text-stone-900">Delivery Address:</strong> {createdOrder.city} — {createdOrder.address}
              </p>
              <p>
                <strong className="text-stone-900">Total Payable to Rider:</strong>{" "}
                <span className="text-sm font-bold text-stone-900">
                  ₨ {createdOrder.total.toLocaleString()}
                </span>
              </p>
              {createdOrder.deliveryNotes && (
                <p className="text-[11px] text-stone-500">
                  <strong>Notes:</strong> {createdOrder.deliveryNotes}
                </p>
              )}
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-2">
              <Link
                href={trackingLink}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-[#14281D] hover:bg-[#0c1b13] text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-98"
              >
                <Truck className="w-4 h-4 text-[#9E7D3B]" />
                <span>Track Order Milestones Live</span>
              </Link>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold tracking-wide rounded-xl shadow-xs transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send Order Copy on WhatsApp Helpline</span>
              </a>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#9E7D3B]" />
                  <span>Print Receipt</span>
                </button>

                <Link
                  href="/products"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-colors"
                >
                  <span>Browse More Remedies</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── EMPTY CART STATE ───
  if (cart.length === 0) {
    return (
      <div className="bg-[#FAF9F6] py-24 min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4 space-y-4">
          <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 opacity-40" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Your Shopping Bag is Empty
          </h1>
          <p className="text-xs text-stone-500">
            You have not added any natural Unani remedies to your cart yet.
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#14281D] text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-xs hover:bg-[#0c1b13] transition-colors"
            >
              <span>Explore Remedies</span>
              <ArrowRight className="w-4 h-4 text-[#9E7D3B]" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN CHECKOUT FORM ───
  return (
    <div className="bg-[#FAF9F6] py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Page Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#14281D]/5 rounded-full text-xs uppercase tracking-widest font-semibold text-[#14281D]">
            <Sparkles className="w-3.5 h-3.5 text-[#9E7D3B]" />
            <span>Secure Cash on Delivery Checkout</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900">
            Nationwide Courier Dispatch &amp; Delivery
          </h1>
          <p className="text-xs text-stone-600">
            Review your order, enter your Pakistan delivery address, and pay cash when the courier rider delivers your package.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── LEFT: CUSTOMER & ADDRESS DETAILS (7 cols on lg) ── */}
          <div className="lg:col-span-7 space-y-6">

            {/* 1. Recipient Information */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h2 className="font-serif text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#9E7D3B]" />
                  <span>1. Recipient &amp; Contact Details</span>
                </h2>
                {sessionData ? (
                  <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    ✓ Logged In as {sessionData.user.name}
                  </span>
                ) : (
                  <Link
                    href="/login"
                    className="text-[11px] text-stone-600 hover:text-[#14281D] hover:underline font-semibold"
                  >
                    Have an account? Sign in
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-stone-900">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Muhammad Bilal"
                    className="w-full text-xs px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#14281D] focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-900">
                    Active Phone / WhatsApp Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0300-1234567"
                    className="w-full text-xs px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#14281D] focus:bg-white transition-colors"
                  />
                  <span className="text-[10px] text-stone-500 block">
                    Rider will call this number prior to parcel delivery.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-900">
                    Email Address (For Tracking &amp; Invoices)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="bilal@example.com"
                    className="w-full text-xs px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#14281D] focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 2. Delivery Address in Pakistan */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs space-y-5">
              <h2 className="font-serif text-base sm:text-lg font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#9E7D3B]" />
                <span>2. Delivery Address (Pakistan)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-stone-900">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full text-xs px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-semibold focus:outline-none focus:border-[#14281D] focus:bg-white transition-colors cursor-pointer"
                  >
                    {PAKISTAN_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-stone-900">
                    Complete Street Address, Area &amp; Landmark <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="House/Apartment #, Street, Block / Sector, Landmark"
                    className="w-full text-xs p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#14281D] focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-stone-900">
                    Special Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    name="specialNotes"
                    value={formData.specialNotes}
                    onChange={handleChange}
                    placeholder="e.g. Please call before arrival, near Jamia Masjid..."
                    className="w-full text-xs px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#14281D] focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 3. Delivery Method Options */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
              <h2 className="font-serif text-base sm:text-lg font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#9E7D3B]" />
                <span>3. Dispatch Speed &amp; Courier Service</span>
              </h2>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3.5 rounded-xl border-2 border-[#14281D] bg-[#FAF9F6] cursor-pointer">
                  <input
                    type="radio"
                    name="deliveryOption"
                    value="standard"
                    checked={formData.deliveryOption === "standard"}
                    onChange={handleChange}
                    className="mt-1 text-[#14281D] focus:ring-[#14281D]"
                  />
                  <div className="text-xs flex-1">
                    <div className="font-bold text-stone-900 flex items-center justify-between">
                      <span>Standard Tracked Courier (Nationwide)</span>
                      <span className="text-emerald-700 font-bold">
                        {shippingFee === 0 ? "FREE" : `₨ ${shippingFee}`}
                      </span>
                    </div>
                    <p className="text-stone-500 text-[11px] mt-0.5">
                      Delivered via Blue-Ex / Leopard / Trax across Pakistan (2-4 business days).
                    </p>
                  </div>
                </label>

                {formData.city.toLowerCase() === "karachi" && (
                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-stone-200 bg-white cursor-pointer hover:border-[#14281D] transition-colors">
                    <input
                      type="radio"
                      name="deliveryOption"
                      value="express_karachi"
                      checked={formData.deliveryOption === "express_karachi"}
                      onChange={handleChange}
                      className="mt-1 text-[#14281D] focus:ring-[#14281D]"
                    />
                    <div className="text-xs flex-1">
                      <div className="font-bold text-stone-900 flex items-center justify-between">
                        <span>Express Karachi Clinic Rider (Within 24 Hours)</span>
                        <span className="text-[#9E7D3B] font-semibold">Priority</span>
                      </div>
                      <p className="text-stone-500 text-[11px] mt-0.5">
                        Direct dispatch from our Karachi Dispensary to your doorstep.
                      </p>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* 4. Payment Method */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
              <h2 className="font-serif text-base sm:text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
                4. Payment Method
              </h2>

              <div className="p-4 border-2 border-[#14281D] bg-[#FAF9F6] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-4 border-[#14281D] bg-white flex items-center justify-center" />
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">
                      Cash on Delivery (COD)
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Pay cash in PKR directly to the courier rider upon parcel handover.
                    </p>
                  </div>
                </div>
                <Truck className="w-5 h-5 text-[#14281D]" />
              </div>
            </div>

          </div>

          {/* ── RIGHT: ORDER SUMMARY & PROMO ENGINE (5 cols on lg) ── */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs space-y-5">
              <h2 className="font-serif text-base sm:text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
                Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)} Items)
              </h2>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedSize.name}`}
                    className="flex items-center gap-3 pb-3 border-b border-stone-100 text-xs"
                  >
                    <div className="relative w-12 h-12 rounded-lg bg-[#FAF9F6] overflow-hidden shrink-0 border border-stone-100">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-[11px] text-stone-500">
                        {item.selectedSize.weight} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-stone-900">
                      ₨ {(item.selectedSize.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo Code Input on Checkout */}
              <div className="pt-2 border-t border-stone-100 space-y-1.5">
                {appliedCoupon ? (
                  <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-950 font-semibold">
                      <Tag className="w-3.5 h-3.5 text-[#9E7D3B]" />
                      <span>{appliedCoupon.code}</span>
                      <span className="text-[11px] font-normal text-emerald-700">
                        ({appliedCoupon.description})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Coupon Code (e.g. HAKIM10)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#14281D] focus:bg-white transition-colors"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-[#14281D] hover:bg-[#0c1b13] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shrink-0 cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                )}

                {couponFeedback && (
                  <div
                    className={`text-[11px] flex items-center gap-1 ${
                      couponFeedback.success ? "text-emerald-700" : "text-rose-600"
                    }`}
                  >
                    {couponFeedback.success ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <AlertCircle className="w-3 h-3" />
                    )}
                    <span>{couponFeedback.message}</span>
                  </div>
                )}
              </div>

              {/* Price Calculations */}
              <div className="space-y-2 text-xs pt-2 border-t border-stone-100">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">
                    ₨ {subtotal.toLocaleString()}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>- ₨ {discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600">
                  <span>Courier Delivery (Pakistan)</span>
                  <span className="font-semibold text-stone-900">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-bold uppercase">Free</span>
                    ) : (
                      `₨ ${shippingFee}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Total (Cash on Delivery)</span>
                  <span>₨ {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Submit Order Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 bg-[#14281D] hover:bg-[#0c1b13] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 active:scale-98 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Placing Your Order...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Cash on Delivery (₨ {total.toLocaleString()})</span>
                    <ArrowRight className="w-4 h-4 text-[#9E7D3B]" />
                  </>
                )}
              </button>

              {/* Trust badges */}
              <div className="pt-2 text-[11px] text-stone-500 space-y-1.5 text-center">
                <p className="flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#9E7D3B]" />
                  <span>100% Pure Botanical Purity &amp; Freshness Guarantee</span>
                </p>
                <p className="flex items-center justify-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Dispatched from Karachi Clinic within 24 Hours</span>
                </p>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
