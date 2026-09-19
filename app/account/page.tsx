"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "@/lib/auth-client";
import { useCart } from "@/app/context/CartContext";
import { PRODUCTS } from "@/app/data/products";
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
} from "lucide-react";

export default function AccountPage() {
  const { data: sessionData, isPending } = useSession();
  const { wishlist, removeFromWishlist, addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<"orders" | "wishlist" | "consultations" | "profile">("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [reorderMessage, setReorderMessage] = useState<string | null>(null);

  useEffect(() => {
    if (sessionData?.user) {
      fetchUserData();
    }
  }, [sessionData]);

  const fetchUserData = async () => {
    setLoadingData(true);
    try {
      const [ordersRes, consultRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/consultations"),
      ]);

      const [ordersJson, consultJson] = await Promise.all([
        ordersRes.json(),
        consultRes.json(),
      ]);

      if (ordersJson.success) setOrders(ordersJson.data || []);
      if (consultJson.success) setConsultations(consultJson.data || []);
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
      const matchedProduct = PRODUCTS.find((p) => p.id === item.productId || p.name === item.productName);
      if (matchedProduct) {
        const matchedSize = matchedProduct.sizes.find((s) => s.name === item.sizeName || s.weight === item.sizeWeight) || matchedProduct.sizes[0];
        addToCart(matchedProduct, matchedSize, item.quantity || 1);
        addedCount++;
      }
    });

    setReorderMessage(`Added ${addedCount} items from order ${order.orderNumber} to your shopping bag!`);
    setTimeout(() => setReorderMessage(null), 4000);
  };

  // Get wishlist products
  const wishlistProducts = PRODUCTS.filter((p) => wishlist.includes(p.id));

  // Loading state
  if (isPending) {
    return (
      <div className="min-h-[70vh] bg-[#faf8f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#22623a] animate-spin" />
          <p className="text-xs text-[#59534b]">Loading your account portal...</p>
        </div>
      </div>
    );
  }

  // Not logged in view
  if (!sessionData?.user) {
    return (
      <div className="min-h-[75vh] bg-[#faf8f5] py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-[#e6dfd5] shadow-lg text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-[#f4eee5] text-[#22623a] mx-auto flex items-center justify-center">
            <User className="w-8 h-8 opacity-60" />
          </div>
          <div className="space-y-1.5">
            <h1 className="font-serif text-2xl font-bold text-[#22623a]">
              Customer Account Portal
            </h1>
            <p className="text-xs text-[#59534b]">
              Sign in to track your active orders, view your saved wishlist remedies, and check your Hakim consultation records.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 pt-2">
            <Link
              href="/login"
              className="w-full py-3 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-xs"
            >
              Sign In to Your Account
            </Link>
            <Link
              href="/register"
              className="w-full py-3 bg-[#faf8f5] hover:bg-[#f4eee5] text-[#22623a] text-xs font-bold rounded-xl border border-[#e6dfd5] transition-colors"
            >
              Create a New Account
            </Link>
          </div>
          <div className="pt-4 border-t border-[#f4eee5] text-xs text-[#7a7268]">
            Want to track a guest order?{" "}
            <Link href="/track-order" className="text-[#8c6a15] font-bold hover:underline">
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

  return (
    <div className="min-h-[85vh] bg-[#faf8f5] py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Profile Header Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#e6dfd5] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#22623a] text-white font-serif font-bold text-xl flex items-center justify-center shadow-xs">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#22623a]">
                  Welcome, {user.name}
                </h1>
                <span className={`px-2.5 py-0.5 border text-[10px] font-bold uppercase rounded-full ${
                  userRole === "admin"
                    ? "bg-[#c59b27]/10 border-[#c59b27]/30 text-[#8c6a15]"
                    : isStaff
                    ? "bg-blue-50 border-blue-200 text-blue-800"
                    : "bg-[#f4f9f5] border-[#d8ecde] text-[#2d7648]"
                }`}>
                  {userRole === "admin" ? "Primary Administrator" : userRole === "editor" ? "Catalog Editor" : userRole === "contributor" ? "Inquiry Contributor" : "Customer"}
                </span>
              </div>
              <p className="text-xs text-[#7a7268] mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isStaff && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#22623a] hover:bg-[#1b502e] text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
              >
                <Shield className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>Admin / Staff Workspace</span>
              </Link>
            )}
            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#faf8f5] hover:bg-red-50 text-[#59534b] hover:text-red-700 border border-[#e6dfd5] hover:border-red-200 rounded-xl text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {reorderMessage && (
          <div className="p-4 bg-[#f4f9f5] border border-[#bfeac7] rounded-xl text-xs text-[#22623a] flex items-center justify-between animate-fade-in font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2d7648]" />
              <span>{reorderMessage}</span>
            </div>
            <Link href="/checkout" className="text-xs font-bold text-[#2d7648] underline">
              Go to Checkout →
            </Link>
          </div>
        )}

        {/* Tab Navigation Navigation Bar */}
        <div className="flex border-b border-[#e6dfd5] space-x-2 sm:space-x-8 overflow-x-auto text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 px-2 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === "orders"
                ? "border-[#22623a] text-[#22623a] font-bold"
                : "border-transparent text-[#7a7268] hover:text-[#22623a]"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("wishlist")}
            className={`pb-3 px-2 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === "wishlist"
                ? "border-[#22623a] text-[#22623a] font-bold"
                : "border-transparent text-[#7a7268] hover:text-[#22623a]"
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Saved Remedies ({wishlistProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("consultations")}
            className={`pb-3 px-2 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === "consultations"
                ? "border-[#22623a] text-[#22623a] font-bold"
                : "border-transparent text-[#7a7268] hover:text-[#22623a]"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Clinical Consultations ({consultations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 px-2 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === "profile"
                ? "border-[#22623a] text-[#22623a] font-bold"
                : "border-transparent text-[#7a7268] hover:text-[#22623a]"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile &amp; Address</span>
          </button>
        </div>

        {/* ─── TAB 1: ORDERS ─── */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {loadingData ? (
              <div className="p-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#22623a] mx-auto mb-2" />
                <p className="text-xs text-[#7a7268]">Retrieving your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-[#e6dfd5] text-center space-y-4">
                <ShoppingBag className="w-12 h-12 text-[#7a7268] opacity-40 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-[#22623a]">
                  No orders placed yet
                </h3>
                <p className="text-xs text-[#59534b] max-w-sm mx-auto">
                  Explore our pure Unani remedies, herbal waters, and natural syrups to place your first order.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#22623a] text-white text-xs font-bold uppercase rounded-xl hover:bg-[#1b502e] transition-colors"
                >
                  Browse Apothecary
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white p-5 sm:p-6 rounded-2xl border border-[#e6dfd5] shadow-2xs space-y-4"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#f4eee5] gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-[#22623a]">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            order.orderStatus === "DELIVERED"
                              ? "bg-green-100 text-green-800"
                              : order.orderStatus === "DISPATCHED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7a7268]">
                        Placed on {new Date(order.createdAt).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-serif text-base font-bold text-[#22623a]">
                        ₨ {order.total.toLocaleString()}
                      </span>
                      <Link
                        href={`/track-order?ref=${order.orderNumber}`}
                        className="px-3 py-1.5 bg-[#faf8f5] hover:bg-[#f4eee5] border border-[#e6dfd5] text-[#22623a] text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Truck className="w-3.5 h-3.5 text-[#c59b27]" />
                        <span>Track</span>
                      </Link>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {order.items?.map((item: any) => (
                      <div
                        key={item.id}
                        className="p-3 bg-[#faf8f5] rounded-xl flex items-center gap-3 text-xs"
                      >
                        <div className="relative w-10 h-10 rounded bg-[#e6dfd5] overflow-hidden shrink-0">
                          {item.productImage ? (
                            <Image
                              src={item.productImage}
                              alt={item.productName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-[#7a7268] m-2.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[#22623a] truncate">
                            {item.productName}
                          </p>
                          <p className="text-[10px] text-[#7a7268]">
                            {item.sizeWeight} · Qty: {item.quantity}
                          </p>
                        </div>
                        <span className="font-semibold text-[#1a1816]">
                          ₨ {item.total.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer actions */}
                  <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-3 border-t border-[#f4eee5]">
                    <span className="text-[11px] text-[#7a7268]">
                      Delivering to: <strong className="text-[#59534b]">{order.city}</strong> — {order.address}
                    </span>
                    <button
                      onClick={() => handleReorder(order)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#22623a] hover:text-[#c59b27] transition-colors"
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
              <div className="flex items-center justify-between pb-2 border-b border-[#e6dfd5]">
                <span className="text-xs text-[#59534b]">
                  Showing <strong>{wishlistProducts.length}</strong> saved {wishlistProducts.length === 1 ? "remedy" : "remedies"}
                </span>
                <Link
                  href="/wishlist"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#22623a] hover:text-[#c59b27] transition-colors"
                >
                  <span>Open Dedicated Wishlist &amp; Share</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {wishlistProducts.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-[#e6dfd5] text-center space-y-4">
                <Heart className="w-12 h-12 text-[#7a7268] opacity-40 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-[#22623a]">
                  Your wishlist is empty
                </h3>
                <p className="text-xs text-[#59534b] max-w-sm mx-auto">
                  Click the heart icon on any remedy card in the apothecary to save it for later.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#22623a] text-white text-xs font-bold uppercase rounded-xl hover:bg-[#1b502e] transition-colors"
                >
                  Explore Remedies
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistProducts.map((product) => {
                  const defaultSize = product.sizes[0];
                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl border border-[#e6dfd5] p-5 shadow-2xs flex flex-col justify-between space-y-4"
                    >
                      <div className="flex gap-4">
                        <div className="relative w-20 h-20 bg-[#faf8f5] rounded-xl overflow-hidden shrink-0">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-[#c59b27] uppercase tracking-wider block">
                            {product.category}
                          </span>
                          <Link
                            href={`/products/${product.slug}`}
                            className="text-xs sm:text-sm font-bold text-[#22623a] hover:text-[#c59b27] line-clamp-2 transition-colors"
                          >
                            {product.name}
                          </Link>
                          <span className="text-xs font-serif font-bold text-[#22623a] block mt-1">
                            ₨ {defaultSize.price} ({defaultSize.weight})
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-[#f4eee5]">
                        <button
                          onClick={() => addToCart(product, defaultSize, 1)}
                          className="flex-1 py-2 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                        >
                          + Add to Bag
                        </button>
                        <button
                          onClick={() => removeFromWishlist(product.id)}
                          className="p-2 border border-[#e6dfd5] hover:bg-red-50 hover:border-red-200 text-[#7a7268] hover:text-red-600 rounded-xl transition-colors"
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
            {loadingData ? (
              <div className="p-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#22623a] mx-auto mb-2" />
                <p className="text-xs text-[#7a7268]">Loading clinical consultation history...</p>
              </div>
            ) : consultations.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-[#e6dfd5] text-center space-y-4">
                <Calendar className="w-12 h-12 text-[#7a7268] opacity-40 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-[#22623a]">
                  No consultations booked yet
                </h3>
                <p className="text-xs text-[#59534b] max-w-sm mx-auto">
                  Book a direct clinical consultation with Hakim Muhammad Waqas for chronic root-cause diagnosis.
                </p>
                <Link
                  href="/consultation"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#22623a] text-white text-xs font-bold uppercase rounded-xl hover:bg-[#1b502e] transition-colors"
                >
                  Book Free Consultation
                </Link>
              </div>
            ) : (
              consultations.map((consult) => (
                <div
                  key={consult.id}
                  className="bg-white p-6 rounded-2xl border border-[#e6dfd5] shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#f4eee5] gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-[#22623a]">
                          {consult.ticketNumber}
                        </span>
                        <span className="px-2 py-0.5 bg-[#f4f9f5] border border-[#d8ecde] text-[#2d7648] text-[10px] font-bold uppercase rounded-full">
                          {consult.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7a7268]">
                        Submitted on {new Date(consult.createdAt).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <a
                      href="https://wa.me/923212176219"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#25D366] text-white text-xs font-bold rounded-lg shadow-xs hover:bg-[#1EBE5D] transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Hakim WhatsApp Chat</span>
                    </a>
                  </div>

                  <div className="text-xs space-y-1.5 text-[#59534b]">
                    <p>
                      <strong>Primary Symptoms / Concern:</strong> {consult.primarySymptoms}
                    </p>
                    <p>
                      <strong>Duration:</strong> {consult.duration} · <strong>City:</strong> {consult.city}
                    </p>
                    {consult.hakimNotes && (
                      <div className="mt-2 p-3 bg-[#f4f9f5] border border-[#d8ecde] rounded-xl text-[#22623a]">
                        <strong className="block text-[11px] uppercase tracking-wider text-[#2d7648]">
                          Hakim Sahib's Clinical Advice:
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

        {/* ─── TAB 4: PROFILE & ADDRESS ─── */}
        {activeTab === "profile" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#e6dfd5] shadow-xs space-y-6 max-w-2xl">
            <h2 className="font-serif text-lg font-bold text-[#22623a] border-b border-[#f4eee5] pb-3">
              Profile &amp; Default Shipping Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[11px] font-bold text-[#7a7268] uppercase block">
                  Full Name
                </label>
                <p className="font-semibold text-[#1a1816] mt-1 text-sm">{user.name}</p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#7a7268] uppercase block">
                  Email Address
                </label>
                <p className="font-semibold text-[#1a1816] mt-1 text-sm">{user.email}</p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#7a7268] uppercase block">
                  Account Role
                </label>
                <p className="font-semibold text-[#2d7648] mt-1 uppercase text-sm">
                  {(user as any).role || "Customer"}
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#7a7268] uppercase block">
                  Registered City
                </label>
                <p className="font-semibold text-[#1a1816] mt-1 text-sm">
                  {(user as any).city || "Karachi, Pakistan"}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#f4eee5] flex justify-between items-center">
              <span className="text-xs text-[#7a7268]">
                Need to update your clinical profile?
              </span>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 bg-[#faf8f5] hover:bg-red-50 text-red-700 border border-[#e6dfd5] rounded-xl text-xs font-bold transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
