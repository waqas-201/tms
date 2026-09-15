"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";
import { useSession } from "@/lib/auth-client";
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
    total,
    clearCart,
    generateWhatsAppOrderUrl,
  } = useCart();

  const { data: sessionData } = useSession();

  const [formData, setFormData] = useState({
    fullName: sessionData?.user?.name || "",
    phone: (sessionData?.user as any)?.phone || "",
    email: sessionData?.user?.email || "",
    address: "",
    city: (sessionData?.user as any)?.city || "Karachi",
    postalCode: "",
    specialNotes: "",
    paymentMethod: "COD",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        deliveryNotes: formData.specialNotes,
        paymentMethod: formData.paymentMethod,
        items: cart.map((item) => ({
          productId: item.product.id,
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

  if (orderConfirmed && createdOrder) {
    const waUrl = generateWhatsAppOrderUrl({
      name: formData.fullName,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      notes: formData.specialNotes,
    });

    return (
      <div className="bg-[#faf8f5] py-20 min-h-[70vh] flex items-center">
        <div className="max-w-xl mx-auto px-4 sm:px-6 w-full text-center space-y-6 bg-white p-8 sm:p-12 rounded-2xl border border-[#e6dfd5] shadow-xl">
          <div className="w-16 h-16 rounded-full bg-[#1b993e] text-white mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-semibold text-[#c59b27] tracking-widest">
              Order Received Successfully
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#138833]">
              Your Order is Confirmed!
            </h1>
            <p className="text-xs sm:text-sm text-[#59534b]">
              Your order reference number is:{" "}
              <strong className="text-[#138833] font-mono text-sm sm:text-base px-2 py-0.5 bg-[#faf8f5] rounded border border-[#e6dfd5]">
                {createdOrder.orderNumber}
              </strong>
            </p>
          </div>

          <div className="p-4 bg-[#faf8f5] rounded-xl border border-[#e6dfd5] text-left text-xs space-y-2 text-[#59534b]">
            <p>
              <strong>Name:</strong> {createdOrder.customerName} ({createdOrder.phone})
            </p>
            <p>
              <strong>Delivery Address:</strong> {createdOrder.city} — {createdOrder.address}
            </p>
            <p>
              <strong>Payment:</strong> Cash on Delivery (COD) · ₨ {createdOrder.total.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#6a6660] pt-1 border-t border-[#e6dfd5]">
              Our Karachi clinic will pack and dispatch your sealed remedies via tracked courier delivery.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send Order Copy on WhatsApp</span>
            </a>

            <div className="flex gap-3">
              <Link
                href="/products"
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-[#138833] hover:bg-[#0f7229] text-white text-xs font-semibold rounded-md transition-colors"
              >
                <span>Browse More Products</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="bg-[#faf8f5] py-24 min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4 space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#f4eee5] text-[#6a6660] mx-auto flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 opacity-40" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#138833]">
            Your Cart is Empty
          </h1>
          <p className="text-xs text-[#59534b]">
            You have not added any natural remedies to your cart yet.
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#138833] text-white text-xs font-semibold uppercase tracking-wider rounded-md"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#faf8f5] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Title */}
        <div className="space-y-1">
          <span className="text-xs uppercase font-semibold text-[#c59b27] tracking-widest">
            Courier Delivery Across Pakistan
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#138833]">
            Cash on Delivery Checkout
          </h1>
          <p className="text-xs text-[#6a6660]">
            Review your order and enter your delivery address in Pakistan.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form: Delivery Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#e6dfd5] shadow-xs space-y-5">
              <h2 className="font-serif text-lg font-bold text-[#138833] border-b border-[#f4eee5] pb-3">
                Delivery Address & Contact Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-[#1a1816]">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Muhammad Bilal"
                    className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#138833] focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1a1816]">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0300-1234567"
                    className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#138833] focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1a1816]">
                    City <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#138833] focus:bg-white transition-colors"
                  >
                    {PAKISTAN_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-[#1a1816]">
                    Complete Street Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="House/Apartment #, Street, Sector / Area, Landmark"
                    className="w-full text-xs p-3 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#138833] focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-[#1a1816]">
                    Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    name="specialNotes"
                    value={formData.specialNotes}
                    onChange={handleChange}
                    placeholder="e.g. Please call before delivering, near landmark..."
                    className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#138833] focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#e6dfd5] shadow-xs space-y-4">
              <h2 className="font-serif text-lg font-bold text-[#138833] border-b border-[#f4eee5] pb-3">
                Payment Method
              </h2>

              <div className="p-4 border-2 border-[#138833] bg-[#faf8f5] rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-4 border-[#138833] bg-white flex items-center justify-center" />
                  <div>
                    <h4 className="text-xs font-bold text-[#138833]">
                      Cash on Delivery (COD)
                    </h4>
                    <p className="text-[11px] text-[#6a6660]">
                      Pay cash in PKR directly to the courier rider when your parcel arrives.
                    </p>
                  </div>
                </div>
                <Truck className="w-5 h-5 text-[#1b993e]" />
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#e6dfd5] shadow-xs space-y-5 sticky top-24">
              <h2 className="font-serif text-lg font-bold text-[#138833] border-b border-[#f4eee5] pb-3">
                Order Summary
              </h2>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedSize.name}`}
                    className="flex items-center gap-3 pb-3 border-b border-[#f4eee5] text-xs"
                  >
                    <div className="relative w-12 h-12 rounded bg-[#faf8f5] overflow-hidden shrink-0">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#138833] truncate">
                        {item.product.name}
                      </p>
                      <p className="text-[11px] text-[#6a6660]">
                        {item.selectedSize.weight} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold text-[#1a1816]">
                      ₨ {(item.selectedSize.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div className="space-y-2 text-xs pt-2 border-t border-[#f4eee5]">
                <div className="flex justify-between text-[#6a6660]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#1a1816]">
                    ₨ {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[#6a6660]">
                  <span>Delivery Charges</span>
                  <span className="font-medium text-[#1a1816]">
                    {shippingFee === 0 ? (
                      <span className="text-[#1b993e] font-semibold">FREE</span>
                    ) : (
                      `₨ ${shippingFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#138833] pt-2 border-t border-[#e6dfd5]">
                  <span>Total (Cash on Delivery)</span>
                  <span>₨ {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#138833] hover:bg-[#0f7229] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Cash on Delivery Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Trust Pillars */}
              <div className="pt-2 text-[11px] text-[#6a6660] space-y-1 text-center">
                <p className="flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#c59b27]" />
                  <span>100% Pure Natural Remedies</span>
                </p>
                <p className="flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#1b993e]" />
                  <span>Dispatched within 24 hours from Karachi Clinic</span>
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
