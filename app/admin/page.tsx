"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "@/lib/auth-client";
import {
  Activity,
  ShoppingBag,
  Stethoscope,
  Package,
  MessageSquare,
  RefreshCw,
  LogOut,
  DollarSign,
  ExternalLink,
  Plus,
  Edit3,
  Trash2,
  FileText,
  Loader2,
} from "lucide-react";
import ProductFormModal from "@/app/components/ProductFormModal";
import OrderInvoiceModal from "@/app/components/OrderInvoiceModal";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "consultations" | "orders" | "products" | "inquiries">("overview");
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Consultation state
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [hakimNotesInput, setHakimNotesInput] = useState("");
  const [prescribedInput, setPrescribedInput] = useState("");
  const [updatingConsultation, setUpdatingConsultation] = useState(false);

  // Order state
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderStatusInput, setOrderStatusInput] = useState("");
  const [trackingNoteInput, setTrackingNoteInput] = useState("");
  const [updatingOrder, setUpdatingOrder] = useState(false);

  // Product form modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Invoice modal state
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<any | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, consultRes, prodRes, inqRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/orders"),
        fetch("/api/consultations"),
        fetch("/api/products"),
        fetch("/api/inquiries"),
      ]);

      if (statsRes.ok) {
        const d = await statsRes.json();
        if (d.success) setStats(d.data);
      }
      if (ordersRes.ok) {
        const d = await ordersRes.json();
        if (d.success) setOrders(d.data);
      }
      if (consultRes.ok) {
        const d = await consultRes.json();
        if (d.success) setConsultations(d.data);
      }
      if (prodRes.ok) {
        const d = await prodRes.json();
        if (d.success) setProducts(d.data);
      }
      if (inqRes.ok) {
        const d = await inqRes.json();
        if (d.success) setInquiries(d.data);
      }
    } catch (e) {
      console.error("Failed to load admin data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateConsultationStatus = async (id: string, status: string) => {
    setUpdatingConsultation(true);
    try {
      const res = await fetch(`/api/consultations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          hakimNotes: hakimNotesInput,
          prescribedTreatment: prescribedInput,
        }),
      });
      if (res.ok) {
        fetchData();
        setSelectedConsultation(null);
      }
    } finally {
      setUpdatingConsultation(false);
    }
  };

  const handleUpdateOrderStatus = async (id: string) => {
    setUpdatingOrder(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: orderStatusInput,
          trackingNote: trackingNoteInput,
        }),
      });
      if (res.ok) {
        fetchData();
        setSelectedOrder(null);
      }
    } finally {
      setUpdatingOrder(false);
    }
  };

  const handleToggleStock = async (product: any) => {
    try {
      await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inStock: !product.inStock }),
      });
      fetchData();
    } catch (e) {
      console.error("Error updating stock:", e);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setDeletingProductId(productId);
    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error("Error deleting product:", e);
    } finally {
      setDeletingProductId(null);
    }
  };

  const openProductEditor = (product: any) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const openInvoice = (order: any) => {
    setInvoiceOrder(order);
    setIsInvoiceOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Top Admin Navigation Header */}
      <header className="bg-[#138833] text-white border-b border-[#0d5e23] sticky top-0 z-30 shadow-md print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#c59b27] text-[#138833] flex items-center justify-center font-bold text-sm">
              TS
            </span>
            <div>
              <h1 className="font-serif text-base font-bold text-white">
                Tameer-e-Sehat · Admin Dashboard
              </h1>
              <span className="text-[10px] text-[#c59b27] font-mono block">
                Products · Orders · Consultations
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={fetchData}
              className="p-2 rounded-lg bg-[#0d5e23] hover:bg-[#1b993e] text-[#f4eee5] transition-colors flex items-center gap-1.5"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="px-3 py-1.5 rounded-lg bg-[#0d5e23] hover:bg-[#1b993e] text-white flex items-center gap-1 transition-colors"
            >
              <span>View Store</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              onClick={() => signOut()}
              className="px-3 py-1.5 rounded-lg bg-red-900/40 hover:bg-red-900/60 text-red-200 flex items-center gap-1 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 print:hidden">

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-[#e6dfd5] pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
              activeTab === "overview"
                ? "bg-[#138833] text-white shadow-xs"
                : "bg-white text-[#59534b] border border-[#e6dfd5] hover:border-[#138833]"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("consultations")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
              activeTab === "consultations"
                ? "bg-[#138833] text-white shadow-xs"
                : "bg-white text-[#59534b] border border-[#e6dfd5] hover:border-[#138833]"
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Consultations ({consultations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
              activeTab === "orders"
                ? "bg-[#138833] text-white shadow-xs"
                : "bg-white text-[#59534b] border border-[#e6dfd5] hover:border-[#138833]"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
              activeTab === "products"
                ? "bg-[#138833] text-white shadow-xs"
                : "bg-white text-[#59534b] border border-[#e6dfd5] hover:border-[#138833]"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Products ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("inquiries")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
              activeTab === "inquiries"
                ? "bg-[#138833] text-white shadow-xs"
                : "bg-white text-[#59534b] border border-[#e6dfd5] hover:border-[#138833]"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Inquiries ({inquiries.length})</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-5 rounded-xl border border-[#e6dfd5] shadow-xs space-y-2">
                <span className="text-xs text-[#6a6660] font-medium flex items-center justify-between">
                  <span>Total Revenue</span>
                  <span className="p-1.5 rounded-md bg-[#f1fbf3] text-[#1b993e]">
                    <DollarSign className="w-4 h-4" />
                  </span>
                </span>
                <h3 className="text-2xl font-bold text-[#138833]">
                  ₨ {(stats?.totalRevenue || 0).toLocaleString()}
                </h3>
                <p className="text-[11px] text-[#1b993e] font-medium">
                  {orders.length} total orders
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#e6dfd5] shadow-xs space-y-2">
                <span className="text-xs text-[#6a6660] font-medium flex items-center justify-between">
                  <span>Consultations</span>
                  <span className="p-1.5 rounded-md bg-[#faf8f5] text-[#c59b27]">
                    <Stethoscope className="w-4 h-4" />
                  </span>
                </span>
                <h3 className="text-2xl font-bold text-[#138833]">
                  {consultations.length}
                </h3>
                <p className="text-[11px] text-[#c59b27] font-medium">
                  {stats?.consultations?.new || 0} new requests
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#e6dfd5] shadow-xs space-y-2">
                <span className="text-xs text-[#6a6660] font-medium flex items-center justify-between">
                  <span>Product Catalog</span>
                  <span className="p-1.5 rounded-md bg-[#faf8f5] text-[#138833]">
                    <Package className="w-4 h-4" />
                  </span>
                </span>
                <h3 className="text-2xl font-bold text-[#138833]">
                  {products.length} Products
                </h3>
                <p className="text-[11px] text-[#6a6660]">
                  {products.filter((p) => p.inStock).length} in stock
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#e6dfd5] shadow-xs space-y-2">
                <span className="text-xs text-[#6a6660] font-medium flex items-center justify-between">
                  <span>Contact Inquiries</span>
                  <span className="p-1.5 rounded-md bg-[#faf8f5] text-[#6a6660]">
                    <MessageSquare className="w-4 h-4" />
                  </span>
                </span>
                <h3 className="text-2xl font-bold text-[#138833]">
                  {inquiries.length}
                </h3>
                <p className="text-[11px] text-[#6a6660]">
                  Customer messages
                </p>
              </div>
            </div>

            {/* Recent Activity Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-[#e6dfd5] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#f4eee5] pb-3">
                  <h3 className="font-serif text-sm font-bold text-[#138833] flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-[#c59b27]" />
                    <span>Recent Consultations</span>
                  </h3>
                  <button onClick={() => setActiveTab("consultations")} className="text-xs text-[#138833] hover:underline font-medium">
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {consultations.slice(0, 4).map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedConsultation(c);
                        setHakimNotesInput(c.hakimNotes || "");
                        setPrescribedInput(c.prescribedTreatment || "");
                        setActiveTab("consultations");
                      }}
                      className="p-3 bg-[#faf8f5] rounded-lg border border-[#e6dfd5] hover:border-[#138833] cursor-pointer transition-colors space-y-1 text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#138833]">{c.fullName} ({c.age} yrs · {c.city})</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-amber-100 text-amber-900">{c.status}</span>
                      </div>
                      <p className="text-[11px] text-[#59534b] line-clamp-1">{c.primarySymptoms}</p>
                      <div className="text-[10px] text-[#6a6660] pt-1 flex justify-between">
                        <span>Ticket: {c.ticketNumber}</span>
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-[#e6dfd5] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#f4eee5] pb-3">
                  <h3 className="font-serif text-sm font-bold text-[#138833] flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#1b993e]" />
                    <span>Recent Orders</span>
                  </h3>
                  <button onClick={() => setActiveTab("orders")} className="text-xs text-[#138833] hover:underline font-medium">
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {orders.slice(0, 4).map((o) => (
                    <div
                      key={o.id}
                      onClick={() => {
                        setSelectedOrder(o);
                        setOrderStatusInput(o.orderStatus);
                        setTrackingNoteInput(o.trackingNote || "");
                        setActiveTab("orders");
                      }}
                      className="p-3 bg-[#faf8f5] rounded-lg border border-[#e6dfd5] hover:border-[#138833] cursor-pointer transition-colors space-y-1 text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#138833]">{o.orderNumber} · {o.customerName}</span>
                        <span className="font-bold text-[#138833]">₨ {o.total.toLocaleString()}</span>
                      </div>
                      <p className="text-[11px] text-[#59534b]">{o.items?.length || 1} items · {o.paymentMethod}</p>
                      <div className="text-[10px] text-[#6a6660] pt-1 flex justify-between">
                        <span className="px-1.5 py-0.5 rounded bg-[#f1fbf3] text-[#1b993e] font-semibold">{o.orderStatus}</span>
                        <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONSULTATIONS */}
        {activeTab === "consultations" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#138833]">Consultation Requests</h2>
              <p className="text-xs text-[#6a6660]">Review patient symptoms, write notes, and prescribe remedies.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 bg-white rounded-xl border border-[#e6dfd5] shadow-xs overflow-hidden">
                <div className="p-4 border-b border-[#e6dfd5] bg-[#faf8f5] flex justify-between items-center text-xs font-semibold text-[#138833]">
                  <span>Patient ({consultations.length})</span>
                  <span>Status</span>
                </div>
                <div className="divide-y divide-[#e6dfd5] max-h-[600px] overflow-y-auto">
                  {consultations.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#6a6660]">No consultations yet.</div>
                  ) : (
                    consultations.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedConsultation(c);
                          setHakimNotesInput(c.hakimNotes || "");
                          setPrescribedInput(c.prescribedTreatment || "");
                        }}
                        className={`p-4 cursor-pointer transition-colors text-xs space-y-1.5 ${
                          selectedConsultation?.id === c.id ? "bg-[#f1fbf3] border-l-4 border-[#138833]" : "hover:bg-[#faf8f5]"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[#138833] text-sm">{c.fullName}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            c.status === "NEW" ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"
                          }`}>{c.status}</span>
                        </div>
                        <p className="text-[#59534b]">{c.age} yrs · {c.gender} · {c.city} · {c.phone}</p>
                        <p className="text-[11px] text-[#6a6660] line-clamp-2"><strong>Symptoms:</strong> {c.primarySymptoms}</p>
                        <div className="text-[10px] text-[#6a6660] pt-1 flex justify-between">
                          <span className="font-mono">#{c.ticketNumber}</span>
                          <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-[#e6dfd5] shadow-xs space-y-5 sticky top-24">
                {selectedConsultation ? (
                  <div className="space-y-4">
                    <div className="border-b border-[#f4eee5] pb-3 flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono text-[#c59b27] uppercase font-bold">{selectedConsultation.ticketNumber}</span>
                        <h3 className="font-serif text-lg font-bold text-[#138833]">{selectedConsultation.fullName}</h3>
                        <p className="text-xs text-[#6a6660]">{selectedConsultation.age} yrs, {selectedConsultation.gender} · {selectedConsultation.city}</p>
                      </div>
                      <a
                        href={`https://wa.me/${selectedConsultation.phone?.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold rounded-md flex items-center gap-1 shadow-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>

                    <div className="p-3.5 bg-[#faf8f5] rounded-lg text-xs space-y-2 text-[#59534b]">
                      <p><strong className="text-[#138833]">Symptoms:</strong> {selectedConsultation.primarySymptoms}</p>
                      <p><strong className="text-[#138833]">Duration:</strong> {selectedConsultation.duration}</p>
                      {selectedConsultation.previousTreatments && (
                        <p><strong className="text-[#138833]">Prior Treatments:</strong> {selectedConsultation.previousTreatments}</p>
                      )}
                      {selectedConsultation.digestiveState && (
                        <p><strong className="text-[#138833]">Digestive State:</strong> {selectedConsultation.digestiveState}</p>
                      )}
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#138833]">Hakim Notes:</label>
                        <textarea rows={2} value={hakimNotesInput} onChange={(e) => setHakimNotesInput(e.target.value)}
                          placeholder="Record observations and analysis..."
                          className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#138833]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#138833]">Prescribed Herbal Course:</label>
                        <textarea rows={2} value={prescribedInput} onChange={(e) => setPrescribedInput(e.target.value)}
                          placeholder="e.g. Amla Murabba (1 pc morning) + Roghan Surkh (nightly)"
                          className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#138833]"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button onClick={() => handleUpdateConsultationStatus(selectedConsultation.id, "IN_REVIEW")} disabled={updatingConsultation}
                          className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-md">
                          Mark In Review
                        </button>
                        <button onClick={() => handleUpdateConsultationStatus(selectedConsultation.id, "COMPLETED")} disabled={updatingConsultation}
                          className="flex-1 py-2 bg-[#138833] hover:bg-[#0f7229] text-white text-xs font-semibold rounded-md">
                          Save & Complete
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center text-xs text-[#6a6660] space-y-2">
                    <Stethoscope className="w-8 h-8 text-[#c59b27] mx-auto opacity-50" />
                    <p>Select a patient to review and prescribe.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#138833]">Customer Orders (COD)</h2>
              <p className="text-xs text-[#6a6660]">Manage courier dispatch, update status, and generate invoices.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 bg-white rounded-xl border border-[#e6dfd5] shadow-xs overflow-hidden">
                <div className="p-4 border-b border-[#e6dfd5] bg-[#faf8f5] flex justify-between items-center text-xs font-semibold text-[#138833]">
                  <span>Order Reference</span>
                  <span>Amount & Status</span>
                </div>
                <div className="divide-y divide-[#e6dfd5] max-h-[600px] overflow-y-auto">
                  {orders.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#6a6660]">No orders placed yet.</div>
                  ) : (
                    orders.map((o) => (
                      <div
                        key={o.id}
                        onClick={() => {
                          setSelectedOrder(o);
                          setOrderStatusInput(o.orderStatus);
                          setTrackingNoteInput(o.trackingNote || "");
                        }}
                        className={`p-4 cursor-pointer transition-colors text-xs space-y-1.5 ${
                          selectedOrder?.id === o.id ? "bg-[#f1fbf3] border-l-4 border-[#138833]" : "hover:bg-[#faf8f5]"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[#138833] text-sm">{o.orderNumber}</span>
                          <span className="font-bold text-[#138833]">₨ {o.total.toLocaleString()}</span>
                        </div>
                        <p className="text-[#59534b]">{o.customerName} · {o.phone} · {o.city}</p>
                        <div className="text-[11px] text-[#6a6660]">
                          {o.items?.length} items ({o.items?.map((i: any) => i.productName).join(", ")})
                        </div>
                        <div className="text-[10px] text-[#6a6660] pt-1 flex justify-between">
                          <span className="px-2 py-0.5 rounded font-semibold uppercase bg-emerald-100 text-emerald-900">{o.orderStatus}</span>
                          <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-[#e6dfd5] shadow-xs space-y-4 sticky top-24">
                {selectedOrder ? (
                  <div className="space-y-4 text-xs">
                    <div className="border-b border-[#f4eee5] pb-3 flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-[#c59b27]">{selectedOrder.orderNumber}</span>
                        <h3 className="font-serif text-lg font-bold text-[#138833]">{selectedOrder.customerName}</h3>
                        <p className="text-[#59534b]">{selectedOrder.address}, {selectedOrder.city}</p>
                        <p className="text-[#6a6660]">Phone: {selectedOrder.phone}</p>
                      </div>
                      <button
                        onClick={() => openInvoice(selectedOrder)}
                        className="px-3 py-1.5 bg-[#c59b27] hover:bg-[#aa821c] text-[#138833] text-xs font-semibold rounded-md flex items-center gap-1 shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-[#138833]">Order Items:</h4>
                      <div className="p-3 bg-[#faf8f5] rounded-lg space-y-2">
                        {selectedOrder.items?.map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center border-b border-[#e6dfd5] pb-1.5 last:border-0 last:pb-0">
                            <div>
                              <p className="font-semibold text-[#138833]">{item.productName}</p>
                              <p className="text-[11px] text-[#6a6660]">{item.sizeWeight} × {item.quantity}</p>
                            </div>
                            <span className="font-bold text-[#138833]">₨ {item.total.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between font-bold text-sm text-[#138833] pt-2 border-t border-[#f4eee5]">
                      <span>Total (COD):</span>
                      <span>₨ {selectedOrder.total.toLocaleString()}</span>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-[#f4eee5]">
                      <div className="space-y-1">
                        <label className="font-bold text-[#138833]">Update Status:</label>
                        <select value={orderStatusInput} onChange={(e) => setOrderStatusInput(e.target.value)}
                          className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#138833] font-medium">
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED (Packing)</option>
                          <option value="DISPATCHED">DISPATCHED (Courier)</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-[#138833]">Tracking / Courier Note:</label>
                        <input type="text" value={trackingNoteInput} onChange={(e) => setTrackingNoteInput(e.target.value)}
                          placeholder="e.g. Leopard Courier #LCS-998213"
                          className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816]"
                        />
                      </div>
                      <button onClick={() => handleUpdateOrderStatus(selectedOrder.id)} disabled={updatingOrder}
                        className="w-full py-2.5 bg-[#138833] hover:bg-[#0f7229] text-white text-xs font-semibold rounded-md shadow-xs">
                        {updatingOrder ? "Saving..." : "Save Order Status"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center text-xs text-[#6a6660] space-y-2">
                    <ShoppingBag className="w-8 h-8 text-[#1b993e] mx-auto opacity-50" />
                    <p>Select an order to view its details and update tracking.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PRODUCTS — WITH ADD/EDIT/DELETE */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#138833]">Product Catalog & Inventory</h2>
                <p className="text-xs text-[#6a6660]">
                  {products.length} products loaded from database. Upload, edit, or remove products below.
                </p>
              </div>
              <button
                onClick={openNewProduct}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#138833] hover:bg-[#0f7229] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Upload New Product</span>
              </button>
            </div>

            <div className="bg-white rounded-xl border border-[#e6dfd5] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#faf8f5] text-[#138833] border-b border-[#e6dfd5]">
                    <tr>
                      <th className="p-3.5 font-bold">Product</th>
                      <th className="p-3.5 font-bold">Category</th>
                      <th className="p-3.5 font-bold">Price (PKR)</th>
                      <th className="p-3.5 font-bold">Sizes</th>
                      <th className="p-3.5 font-bold">Stock</th>
                      <th className="p-3.5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e6dfd5]">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-[#faf8f5]/50">
                        <td className="p-3.5 font-medium text-[#138833]">
                          <div className="flex items-center gap-2">
                            {p.featured && (
                              <span className="px-1.5 py-0.5 bg-[#c59b27]/10 text-[#c59b27] rounded text-[9px] font-bold uppercase">★ Featured</span>
                            )}
                            <span>{p.name}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-[#59534b]">{p.categoryLabel || p.categoryId}</td>
                        <td className="p-3.5 font-bold text-[#138833]">₨ {p.price.toLocaleString()}</td>
                        <td className="p-3.5 text-[#6a6660]">
                          {p.sizes?.map((s: any) => `${s.weight} (₨${s.price})`).join(" · ") || "Standard"}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.inStock ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"
                          }`}>
                            {p.inStock ? "In Stock" : "Out of Stock"}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleStock(p)}
                              className="px-2 py-1 bg-[#faf8f5] hover:bg-[#e6dfd5] text-[#138833] text-[11px] font-semibold rounded border border-[#e6dfd5]"
                            >
                              {p.inStock ? "Mark Out" : "Restock"}
                            </button>
                            <button
                              onClick={() => openProductEditor(p)}
                              className="p-1.5 bg-[#138833] hover:bg-[#0f7229] text-white rounded"
                              title="Edit product"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete "${p.name}" permanently? This cannot be undone.`)) {
                                  handleDeleteProduct(p.id);
                                }
                              }}
                              disabled={deletingProductId === p.id}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded border border-red-200 disabled:opacity-50"
                              title="Delete product"
                            >
                              {deletingProductId === p.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: INQUIRIES */}
        {activeTab === "inquiries" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#138833]">Contact Inquiries</h2>
              <p className="text-xs text-[#6a6660]">Messages submitted through the contact page.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {inquiries.map((inq) => (
                <div key={inq.id} className="bg-white p-5 rounded-xl border border-[#e6dfd5] shadow-xs space-y-3 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-[#138833]">{inq.name}</h4>
                      <p className="text-[11px] text-[#6a6660]">{inq.phone} · {inq.city || "Pakistan"}</p>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-900">{inq.status}</span>
                  </div>
                  <div className="p-3 bg-[#faf8f5] rounded-lg text-[#59534b]">
                    <p className="font-semibold text-[#138833]">{inq.subject}</p>
                    <p className="text-[11px] mt-1">{inq.message}</p>
                  </div>
                  <div className="pt-1 flex justify-between items-center text-[10px] text-[#6a6660]">
                    <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                    <a
                      href={`https://wa.me/${inq.phone?.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1b993e] font-semibold hover:underline"
                    >
                      Reply via WhatsApp →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Product Upload/Edit Modal */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={() => fetchData()}
        initialProduct={editingProduct}
      />

      {/* Invoice Modal */}
      <OrderInvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => {
          setIsInvoiceOpen(false);
          setInvoiceOrder(null);
        }}
        order={invoiceOrder}
      />
    </div>
  );
}
