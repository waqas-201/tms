"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
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
  ShieldAlert,
  Users,
  UserPlus,
  ShieldCheck,
  Search,
  CheckCircle2,
  Check,
  AlertCircle,
  X,
  Sparkles,
  Leaf,
  Scale,
  Warehouse,
  SlidersHorizontal,
  History,
  AlertTriangle,
  ArrowDownRight,
  TrendingDown,
  Lock,
  Building2,
  CreditCard,
  Wallet,
  Landmark,
  TrendingUp,
  Receipt,
  Phone,
  ArrowUpRight,
  ArrowDownLeft,
  FileSpreadsheet,
  PieChart,
  Zap,
  BarChart3,
} from "lucide-react";
import ProductFormModal from "@/app/components/ProductFormModal";
import NuskhaFormModal from "@/app/components/NuskhaFormModal";
import OrderInvoiceModal from "@/app/components/OrderInvoiceModal";
import ReceiveStockModal from "@/app/components/inventory/ReceiveStockModal";
import AdjustStockModal from "@/app/components/inventory/AdjustStockModal";
import StockMovementsDrawer from "@/app/components/inventory/StockMovementsDrawer";
import UnitsManagerModal from "@/app/components/inventory/UnitsManagerModal";
import CustomerLedgerModal from "@/app/components/accounts/CustomerLedgerModal";
import ReceivePaymentModal from "@/app/components/accounts/ReceivePaymentModal";
import VendorModal from "@/app/components/vendors/VendorModal";
import PurchaseBillModal from "@/app/components/vendors/PurchaseBillModal";
import VendorPaymentModal from "@/app/components/vendors/VendorPaymentModal";
import VendorLedgerModal from "@/app/components/vendors/VendorLedgerModal";
import QuickStockModal from "@/app/components/inventory/QuickStockModal";
import { ROLES, isStaffRole } from "@/lib/rbac-base";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: sessionData, isPending: sessionLoading } = useSession();

  const userRole = (sessionData?.user as any)?.role || "user";
  const isAdmin = userRole === ROLES.ADMIN;
  const isEditor = userRole === ROLES.EDITOR;
  const isContributor = userRole === ROLES.CONTRIBUTOR;
  const isStaff = isStaffRole(userRole);

  // Tab State
  const [activeTab, setActiveTab] = useState<
    "overview" | "consultations" | "orders" | "products" | "inventory" | "nuskhajaat" | "accounts" | "vendors" | "finance" | "inquiries" | "team"
  >("overview");

  // Data State
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [nuskhajaat, setNuskhajaat] = useState<any[]>([]);
  const [inventorySizes, setInventorySizes] = useState<any[]>([]);
  const [inventorySummary, setInventorySummary] = useState<any>(null);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Inventory Filter State
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState("all");
  const [inventoryLowStockOnly, setInventoryLowStockOnly] = useState(false);

  // Inventory Modals State
  const [isReceiveStockOpen, setIsReceiveStockOpen] = useState(false);
  const [preselectedProductSizeId, setPreselectedProductSizeId] = useState<string | null>(null);
  const [isAdjustStockOpen, setIsAdjustStockOpen] = useState(false);
  const [selectedAdjustItem, setSelectedAdjustItem] = useState<any | null>(null);
  const [isMovementsDrawerOpen, setIsMovementsDrawerOpen] = useState(false);
  const [selectedMovementsItem, setSelectedMovementsItem] = useState<any | null>(null);
  const [isUnitsModalOpen, setIsUnitsModalOpen] = useState(false);

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

  // Nuskha (Compounded Remedies) modal state
  const [isNuskhaModalOpen, setIsNuskhaModalOpen] = useState(false);
  const [editingNuskha, setEditingNuskha] = useState<any | null>(null);
  const [deletingNuskhaId, setDeletingNuskhaId] = useState<string | null>(null);

  // Invoice modal state
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<any | null>(null);

  // Accounts & Receivables State
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [accountsSummary, setAccountsSummary] = useState<any>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState<"all" | "due" | "settled">("all");
  const [isCustomerLedgerOpen, setIsCustomerLedgerOpen] = useState(false);
  const [selectedLedgerCustomer, setSelectedLedgerCustomer] = useState<string | null>(null);
  const [isReceivePaymentOpen, setIsReceivePaymentOpen] = useState(false);
  const [paymentModalCustomer, setPaymentModalCustomer] = useState<any | null>(null);
  const [paymentModalOrderId, setPaymentModalOrderId] = useState<string | null>(null);
  const [paymentModalMaxDue, setPaymentModalMaxDue] = useState<number | undefined>(undefined);

  // Vendors & Purchasing State
  const [vendorsList, setVendorsList] = useState<any[]>([]);
  const [vendorsSummary, setVendorsSummary] = useState<any>(null);
  const [purchasesList, setPurchasesList] = useState<any[]>([]);
  const [vendorSubTab, setVendorSubTab] = useState<"vendors" | "bills">("vendors");
  const [vendorSearch, setVendorSearch] = useState("");
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<any | null>(null);
  const [isPurchaseBillModalOpen, setIsPurchaseBillModalOpen] = useState(false);
  const [purchaseBillVendorId, setPurchaseBillVendorId] = useState<string | null>(null);
  const [isVendorPaymentModalOpen, setIsVendorPaymentModalOpen] = useState(false);
  const [vendorPaymentTarget, setVendorPaymentTarget] = useState<any | null>(null);
  const [vendorPaymentPurchaseId, setVendorPaymentPurchaseId] = useState<string | null>(null);
  const [vendorPaymentMaxDue, setVendorPaymentMaxDue] = useState<number | undefined>(undefined);
  const [isVendorLedgerOpen, setIsVendorLedgerOpen] = useState(false);
  const [selectedVendorLedgerId, setSelectedVendorLedgerId] = useState<string | null>(null);

  // Quick Stock Restock Modal State
  const [isQuickStockOpen, setIsQuickStockOpen] = useState(false);
  const [selectedQuickStockItem, setSelectedQuickStockItem] = useState<any | null>(null);

  // Team management state
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [addStaffLoading, setAddStaffLoading] = useState(false);
  const [addStaffError, setAddStaffError] = useState<string | null>(null);
  const [addStaffSuccess, setAddStaffSuccess] = useState<string | null>(null);
  const [newStaffForm, setNewStaffForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "editor",
    phone: "",
    city: "",
  });
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Set default tab on load based on role
  useEffect(() => {
    if (!sessionLoading && sessionData) {
      if (isEditor) {
        setActiveTab("products");
      } else if (isContributor) {
        setActiveTab("inquiries");
      } else if (isAdmin) {
        setActiveTab("overview");
      }
    }
  }, [sessionLoading, sessionData, isEditor, isContributor, isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const [
          statsRes,
          ordersRes,
          consultRes,
          prodRes,
          nuskhaRes,
          inqRes,
          usersRes,
          invRes,
          accountsRes,
          vendorsRes,
          purchasesRes,
        ] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/orders"),
          fetch("/api/consultations"),
          fetch("/api/products"),
          fetch("/api/nuskhajaat"),
          fetch("/api/inquiries"),
          fetch("/api/admin/users"),
          fetch("/api/admin/inventory"),
          fetch("/api/admin/accounts/customers"),
          fetch("/api/admin/vendors"),
          fetch("/api/admin/purchases"),
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
        if (nuskhaRes.ok) {
          const d = await nuskhaRes.json();
          if (d.success) setNuskhajaat(d.data);
        }
        if (inqRes.ok) {
          const d = await inqRes.json();
          if (d.success) setInquiries(d.data);
        }
        if (usersRes.ok) {
          const d = await usersRes.json();
          if (d.success) setUsersList(d.data);
        }
        if (invRes.ok) {
          const d = await invRes.json();
          if (d.success) {
            setInventorySizes(d.data || []);
            setInventorySummary(d.summary || null);
          }
        }
        if (accountsRes && accountsRes.ok) {
          const d = await accountsRes.json();
          if (d.success) {
            setCustomersList(d.data || []);
            setAccountsSummary(d.summary || null);
          }
        }
        if (vendorsRes && vendorsRes.ok) {
          const d = await vendorsRes.json();
          if (d.success) {
            setVendorsList(d.data || []);
            setVendorsSummary(d.summary || null);
          }
        }
        if (purchasesRes && purchasesRes.ok) {
          const d = await purchasesRes.json();
          if (d.success) {
            setPurchasesList(d.data || []);
          }
        }
      } else if (isEditor) {
        const [prodRes, nuskhaRes, invRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/nuskhajaat"),
          fetch("/api/admin/inventory"),
        ]);
        if (prodRes.ok) {
          const d = await prodRes.json();
          if (d.success) setProducts(d.data);
        }
        if (nuskhaRes && nuskhaRes.ok) {
          const d = await nuskhaRes.json();
          if (d.success) setNuskhajaat(d.data);
        }
        if (invRes.ok) {
          const d = await invRes.json();
          if (d.success) {
            setInventorySizes(d.data || []);
            setInventorySummary(d.summary || null);
          }
        }
      } else if (isContributor) {
        const inqRes = await fetch("/api/inquiries");
        if (inqRes.ok) {
          const d = await inqRes.json();
          if (d.success) setInquiries(d.data);
        }
      }
    } catch (e) {
      console.error("Failed to load staff portal data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionLoading) {
      if (!sessionData) {
        router.push("/login");
      } else if (!isStaff) {
        router.push("/account");
      }
    }
  }, [sessionData, sessionLoading, isStaff, router]);

  useEffect(() => {
    if (sessionData && isStaff) {
      fetchData();
    }
  }, [sessionData, isStaff]);

  // Consultation handlers
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

  // Order handlers
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

  // Product handlers
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
    if (!isAdmin) return;
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

  // Nuskha (Compounded Formulas) handlers
  const handleToggleNuskhaStock = async (nuskha: any) => {
    try {
      await fetch(`/api/nuskhajaat/${nuskha.id || nuskha.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inStock: !nuskha.inStock }),
      });
      fetchData();
    } catch (e) {
      console.error("Error updating Nuskha stock:", e);
    }
  };

  const handleDeleteNuskha = async (nuskhaId: string) => {
    if (!isAdmin) return;
    setDeletingNuskhaId(nuskhaId);
    try {
      const res = await fetch(`/api/nuskhajaat/${nuskhaId}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error("Error deleting Nuskha:", e);
    } finally {
      setDeletingNuskhaId(null);
    }
  };

  const openNuskhaEditor = (nuskha: any) => {
    setEditingNuskha(nuskha);
    setIsNuskhaModalOpen(true);
  };

  const openNewNuskha = () => {
    setEditingNuskha(null);
    setIsNuskhaModalOpen(true);
  };

  const openInvoice = (order: any) => {
    setInvoiceOrder(order);
    setIsInvoiceOpen(true);
  };

  // Team Management Handlers (Admin Only)
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddStaffError(null);
    setAddStaffSuccess(null);
    setAddStaffLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStaffForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setAddStaffError(data.error || "Failed to create staff account.");
      } else {
        setAddStaffSuccess(`Staff account '${newStaffForm.name}' created successfully.`);
        setNewStaffForm({
          name: "",
          email: "",
          password: "",
          role: "editor",
          phone: "",
          city: "",
        });
        fetchData();
        setTimeout(() => {
          setIsAddStaffModalOpen(false);
          setAddStaffSuccess(null);
        }, 1500);
      }
    } catch (err: any) {
      setAddStaffError(err?.message || "An unexpected error occurred.");
    } finally {
      setAddStaffLoading(false);
    }
  };

  const handleChangeUserRole = async (userId: string, newRole: string) => {
    setUpdatingUserId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        fetchData();
      } else {
        alert(data.error || "Failed to update user role.");
      }
    } catch (err) {
      console.error("Error changing role:", err);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (user: any) => {
    if (user.role === ROLES.ADMIN) {
      alert("Cannot delete the primary Admin account.");
      return;
    }

    if (!confirm(`Are you sure you want to remove '${user.name}' (${user.email})? This action will immediately revoke their access.`)) {
      return;
    }

    setDeletingUserId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchData();
      } else {
        alert(data.error || "Failed to delete user.");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    } finally {
      setDeletingUserId(null);
    }
  };

  // Filter inventory list
  const filteredInventory = useMemo(() => {
    return inventorySizes.filter((item) => {
      const matchesSearch =
        inventorySearch === "" ||
        item.productName?.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        item.name?.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        item.weight?.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        item.sku?.toLowerCase().includes(inventorySearch.toLowerCase());

      const matchesCategory =
        inventoryCategoryFilter === "all" ||
        item.categoryLabel?.toLowerCase() === inventoryCategoryFilter.toLowerCase() ||
        item.categoryId?.toLowerCase() === inventoryCategoryFilter.toLowerCase();

      const matchesLowStock = !inventoryLowStockOnly || item.isLowStock;

      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [inventorySizes, inventorySearch, inventoryCategoryFilter, inventoryLowStockOnly]);

  // Filter users list
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const matchesSearch =
        userSearchQuery === "" ||
        u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.phone?.toLowerCase().includes(userSearchQuery.toLowerCase());

      const matchesRole =
        userRoleFilter === "all" ||
        (userRoleFilter === "staff" && (u.role === ROLES.ADMIN || u.role === ROLES.EDITOR || u.role === ROLES.CONTRIBUTOR)) ||
        u.role === userRoleFilter;

      return matchesSearch && matchesRole;
    });
  }, [usersList, userSearchQuery, userRoleFilter]);

  // Filter Customers List
  const filteredCustomers = useMemo(() => {
    return customersList.filter((c) => {
      const q = customerSearch.toLowerCase();
      const matchesSearch =
        customerSearch === "" ||
        c.name?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q);

      const matchesFilter =
        customerFilter === "all" ||
        (customerFilter === "due" && (c.currentBalance || 0) > 0) ||
        (customerFilter === "settled" && (c.currentBalance || 0) <= 0);

      return matchesSearch && matchesFilter;
    });
  }, [customersList, customerSearch, customerFilter]);

  // Filter Vendors List
  const filteredVendors = useMemo(() => {
    return vendorsList.filter((v) => {
      const q = vendorSearch.toLowerCase();
      return (
        vendorSearch === "" ||
        v.name?.toLowerCase().includes(q) ||
        v.company?.toLowerCase().includes(q) ||
        v.phone?.toLowerCase().includes(q) ||
        v.email?.toLowerCase().includes(q)
      );
    });
  }, [vendorsList, vendorSearch]);

  // Filter Purchases List
  const filteredPurchases = useMemo(() => {
    return purchasesList.filter((p) => {
      const q = vendorSearch.toLowerCase();
      return (
        vendorSearch === "" ||
        p.billNumber?.toLowerCase().includes(q) ||
        p.vendorName?.toLowerCase().includes(q) ||
        p.vendorPhone?.toLowerCase().includes(q) ||
        p.notes?.toLowerCase().includes(q)
      );
    });
  }, [purchasesList, vendorSearch]);

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#22623a] animate-spin" />
          <p className="text-xs text-[#59534b] font-medium">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  if (!sessionData || !isStaff) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-[#e6dfd5] text-center space-y-4 shadow-xl">
          <ShieldAlert className="w-12 h-12 text-[#c59b27] mx-auto" />
          <h2 className="font-serif text-xl font-bold text-[#22623a]">Access Restricted</h2>
          <p className="text-xs text-[#59534b]">
            This portal is exclusively accessible to authorized clinic staff members and administrators.
          </p>
          <Link
            href="/login"
            className="inline-block px-5 py-2.5 bg-[#22623a] text-white text-xs font-semibold rounded-lg hover:bg-[#1b502e] transition-colors"
          >
            Sign In with Staff Credentials
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Top Admin Navigation Header */}
      <header className="bg-[#22623a] text-white border-b border-[#143e23] sticky top-0 z-30 shadow-md print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#c59b27] text-[#22623a] flex items-center justify-center font-bold text-sm shadow-xs">
              TS
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-base font-bold text-white">
                  Tameer-e-Sehat · {isAdmin ? "Admin Portal" : "Staff Workspace"}
                </h1>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    isAdmin
                      ? "bg-[#c59b27] text-[#22623a]"
                      : isEditor
                      ? "bg-blue-200 text-blue-900"
                      : "bg-purple-200 text-purple-900"
                  }`}
                >
                  {isAdmin ? "Primary Admin" : isEditor ? "Catalog Editor" : "Contributor"}
                </span>
              </div>
              <span className="text-[10px] text-[#e6dfd5] font-sans block">
                Logged in as <strong className="text-white">{sessionData.user.name || sessionData.user.email}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            <button
              onClick={fetchData}
              className="p-2 rounded-lg bg-[#143e23] hover:bg-[#2d7648] text-[#f4eee5] transition-colors flex items-center gap-1.5"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="px-3 py-1.5 rounded-lg bg-[#143e23] hover:bg-[#2d7648] text-white flex items-center gap-1 transition-colors"
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
          {isAdmin && (
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                activeTab === "overview"
                  ? "bg-[#22623a] text-white shadow-xs"
                  : "bg-white text-[#59534b] border border-[#e6dfd5] hover:border-[#22623a]"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setActiveTab("consultations")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                activeTab === "consultations"
                  ? "bg-[#22623a] text-white shadow-xs"
                  : "bg-white text-[#59534b] border border-[#e6dfd5] hover:border-[#22623a]"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Consultations ({consultations.length})</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                activeTab === "orders"
                  ? "bg-[#22623a] text-white shadow-xs"
                  : "bg-white text-[#59534b] border border-[#e6dfd5] hover:border-[#22623a]"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Orders ({orders.length})</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setActiveTab("accounts")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                activeTab === "accounts"
                  ? "bg-[#22623a] text-white shadow-xs"
                  : "bg-white text-[#59534b] border border-[#e6dfd5] hover:border-[#22623a]"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Accounts & Receivables ({customersList.length})</span>
              {accountsSummary?.totalOutstandingReceivable > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                  ₨ {Math.round(accountsSummary.totalOutstandingReceivable / 1000)}k
                </span>
              )}
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setActiveTab("vendors")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                activeTab === "vendors"
                  ? "bg-[#22623a] text-white shadow-xs"
                  : "bg-white text-[#59534b] border border-[#e6dfd5] hover:border-[#22623a]"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Vendors & Purchasing ({vendorsList.length})</span>
              {vendorsSummary?.totalPayableBalance > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                  ₨ {Math.round(vendorsSummary.totalPayableBalance / 1000)}k
                </span>
              )}
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setActiveTab("finance")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                activeTab === "finance"
                  ? "bg-[#22623a] text-white shadow-xs"
                  : "bg-white text-[#59534b] border border-[#e6dfd5] hover:border-[#22623a]"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Financial KPIs & Reports</span>
            </button>
          )}

          {(isAdmin || isEditor) && (
            <button
              onClick={() => setActiveTab("inventory")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                activeTab === "inventory"
                  ? "bg-[#22623a] text-white shadow-xs"
                  : "bg-white text-[#59534b] border border-[#e6dfd5] hover:border-[#22623a]"
              }`}
            >
              <Warehouse className="w-3.5 h-3.5" />
              <span>Inventory & Stock ({inventorySizes.length})</span>
              {inventorySummary?.lowStockCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                  {inventorySummary.lowStockCount}
                </span>
              )}
            </button>
          )}

          {(isAdmin || isEditor) && (
            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                activeTab === "products"
                  ? "bg-[#22623a] text-white shadow-xs"
                  : "bg-white text-[#59534b] border border-[#e6dfd5] hover:border-[#22623a]"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Products & Catalog ({products.length})</span>
            </button>
          )}

          {(isAdmin || isEditor) && (
            <button
              onClick={() => setActiveTab("nuskhajaat")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                activeTab === "nuskhajaat"
                  ? "bg-[#22623a] text-white shadow-xs"
                  : "bg-white text-[#59534b] border border-[#e6dfd5] hover:border-[#22623a]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
              <span>Nuskhajaat / Compounds ({nuskhajaat.length})</span>
            </button>
          )}

          {(isAdmin || isContributor) && (
            <button
              onClick={() => setActiveTab("inquiries")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                activeTab === "inquiries"
                  ? "bg-[#22623a] text-white shadow-xs"
                  : "bg-white text-[#59534b] border border-[#e6dfd5] hover:border-[#22623a]"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Inquiries ({inquiries.length})</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setActiveTab("team")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                activeTab === "team"
                  ? "bg-[#22623a] text-white shadow-xs"
                  : "bg-white text-[#59534b] border border-[#e6dfd5] hover:border-[#22623a]"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Team & RBAC ({usersList.length})</span>
            </button>
          )}
        </div>

        {/* TAB 1: OVERVIEW (Admin Only) */}
        {activeTab === "overview" && isAdmin && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-5 rounded-xl border border-[#e6dfd5] shadow-xs space-y-2">
                <span className="text-xs text-[#6a6660] font-medium flex items-center justify-between">
                  <span>Total Revenue</span>
                  <span className="p-1.5 rounded-md bg-[#f4f9f5] text-[#2d7648]">
                    <DollarSign className="w-4 h-4" />
                  </span>
                </span>
                <h3 className="text-2xl font-bold text-[#22623a]">
                  ₨ {(stats?.totalRevenue || 0).toLocaleString()}
                </h3>
                <p className="text-[11px] text-[#2d7648] font-medium">
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
                <h3 className="text-2xl font-bold text-[#22623a]">
                  {consultations.length}
                </h3>
                <p className="text-[11px] text-[#c59b27] font-medium">
                  {stats?.consultations?.new || 0} new requests
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#e6dfd5] shadow-xs space-y-2">
                <span className="text-xs text-[#6a6660] font-medium flex items-center justify-between">
                  <span>Product Catalog</span>
                  <span className="p-1.5 rounded-md bg-[#faf8f5] text-[#22623a]">
                    <Package className="w-4 h-4" />
                  </span>
                </span>
                <h3 className="text-2xl font-bold text-[#22623a]">
                  {products.length} Products
                </h3>
                <p className="text-[11px] text-[#6a6660]">
                  {products.filter((p) => p.inStock).length} in stock
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#e6dfd5] shadow-xs space-y-2">
                <span className="text-xs text-[#6a6660] font-medium flex items-center justify-between">
                  <span>Registered Users</span>
                  <span className="p-1.5 rounded-md bg-[#faf8f5] text-[#22623a]">
                    <Users className="w-4 h-4" />
                  </span>
                </span>
                <h3 className="text-2xl font-bold text-[#22623a]">
                  {usersList.length} Accounts
                </h3>
                <p className="text-[11px] text-[#6a6660]">
                  {usersList.filter((u) => isStaffRole(u.role)).length} staff members
                </p>
              </div>
            </div>

            {/* Low Stock Warning Banner in Overview */}
            {inventorySummary?.lowStockCount > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <strong className="text-[#22623a]">Inventory Attention Required:</strong>{" "}
                    <span>
                      {inventorySummary.lowStockCount} pack variant(s) are running below safety stock levels.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setInventoryLowStockOnly(true);
                    setActiveTab("inventory");
                  }}
                  className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-lg text-xs transition-colors shrink-0 shadow-xs"
                >
                  Manage Stock
                </button>
              </div>
            )}

            {/* Recent Activity Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-[#e6dfd5] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#f4eee5] pb-3">
                  <h3 className="font-serif text-sm font-bold text-[#22623a] flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-[#c59b27]" />
                    <span>Recent Consultations</span>
                  </h3>
                  <button onClick={() => setActiveTab("consultations")} className="text-xs text-[#22623a] hover:underline font-medium">
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
                      className="p-3 bg-[#faf8f5] rounded-lg border border-[#e6dfd5] hover:border-[#22623a] cursor-pointer transition-colors space-y-1 text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#22623a]">{c.fullName} ({c.age} yrs · {c.city})</span>
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
                  <h3 className="font-serif text-sm font-bold text-[#22623a] flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#2d7648]" />
                    <span>Recent Orders</span>
                  </h3>
                  <button onClick={() => setActiveTab("orders")} className="text-xs text-[#22623a] hover:underline font-medium">
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
                      className="p-3 bg-[#faf8f5] rounded-lg border border-[#e6dfd5] hover:border-[#22623a] cursor-pointer transition-colors space-y-1 text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#22623a]">{o.orderNumber} · {o.customerName}</span>
                        <span className="font-bold text-[#22623a]">₨ {o.total.toLocaleString()}</span>
                      </div>
                      <p className="text-[11px] text-[#59534b]">{o.items?.length || 1} items · {o.paymentMethod}</p>
                      <div className="text-[10px] text-[#6a6660] pt-1 flex justify-between">
                        <span className="px-1.5 py-0.5 rounded bg-[#f4f9f5] text-[#2d7648] font-semibold">{o.orderStatus}</span>
                        <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONSULTATIONS (Admin Only) */}
        {activeTab === "consultations" && isAdmin && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#22623a]">Diagnostic Intake & Clinical Prescriptions</h2>
              <p className="text-xs text-[#6a6660]">Review patient symptoms, formulate clinical observations, and prescribe herbal courses.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 bg-white rounded-xl border border-[#e6dfd5] shadow-xs overflow-hidden">
                <div className="p-4 border-b border-[#e6dfd5] bg-[#faf8f5] flex justify-between items-center text-xs font-semibold text-[#22623a]">
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
                          selectedConsultation?.id === c.id ? "bg-[#f4f9f5] border-l-4 border-[#22623a]" : "hover:bg-[#faf8f5]"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[#22623a] text-sm">{c.fullName}</span>
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
                        <h3 className="font-serif text-lg font-bold text-[#22623a]">{selectedConsultation.fullName}</h3>
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
                      <p><strong className="text-[#22623a]">Symptoms:</strong> {selectedConsultation.primarySymptoms}</p>
                      <p><strong className="text-[#22623a]">Duration:</strong> {selectedConsultation.duration}</p>
                      {selectedConsultation.previousTreatments && (
                        <p><strong className="text-[#22623a]">Prior Treatments:</strong> {selectedConsultation.previousTreatments}</p>
                      )}
                      {selectedConsultation.digestiveState && (
                        <p><strong className="text-[#22623a]">Digestive State:</strong> {selectedConsultation.digestiveState}</p>
                      )}
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#22623a]">Clinical Notes & Analysis:</label>
                        <textarea rows={2} value={hakimNotesInput} onChange={(e) => setHakimNotesInput(e.target.value)}
                          placeholder="Record observations, pulse/temperament diagnosis..."
                          className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#22623a]">Prescribed Herbal Formulations:</label>
                        <textarea rows={2} value={prescribedInput} onChange={(e) => setPrescribedInput(e.target.value)}
                          placeholder="e.g. Amla Murabba (1 pc morning) + Roghan Surkh (nightly)"
                          className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a]"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button onClick={() => handleUpdateConsultationStatus(selectedConsultation.id, "IN_REVIEW")} disabled={updatingConsultation}
                          className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-md">
                          Mark In Review
                        </button>
                        <button onClick={() => handleUpdateConsultationStatus(selectedConsultation.id, "COMPLETED")} disabled={updatingConsultation}
                          className="flex-1 py-2 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-semibold rounded-md">
                          Save & Complete
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center text-xs text-[#6a6660] space-y-2">
                    <Stethoscope className="w-8 h-8 text-[#c59b27] mx-auto opacity-50" />
                    <p>Select a patient to review symptoms and prescribe remedies.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS (Admin Only) */}
        {activeTab === "orders" && isAdmin && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#22623a]">Customer Orders & Logistics</h2>
              <p className="text-xs text-[#6a6660]">Manage courier dispatch, update COD payment status, and generate official invoices.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 bg-white rounded-xl border border-[#e6dfd5] shadow-xs overflow-hidden">
                <div className="p-4 border-b border-[#e6dfd5] bg-[#faf8f5] flex justify-between items-center text-xs font-semibold text-[#22623a]">
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
                          selectedOrder?.id === o.id ? "bg-[#f4f9f5] border-l-4 border-[#22623a]" : "hover:bg-[#faf8f5]"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[#22623a] text-sm">{o.orderNumber}</span>
                          <span className="font-bold text-[#22623a]">₨ {o.total.toLocaleString()}</span>
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
                        <h3 className="font-serif text-lg font-bold text-[#22623a]">{selectedOrder.customerName}</h3>
                        <p className="text-[#59534b]">{selectedOrder.address}, {selectedOrder.city}</p>
                        <p className="text-[#6a6660]">Phone: {selectedOrder.phone}</p>
                      </div>
                      <button
                        onClick={() => openInvoice(selectedOrder)}
                        className="px-3 py-1.5 bg-[#c59b27] hover:bg-[#aa821c] text-[#22623a] text-xs font-semibold rounded-md flex items-center gap-1 shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-[#22623a]">Order Items:</h4>
                      <div className="p-3 bg-[#faf8f5] rounded-lg space-y-2">
                        {selectedOrder.items?.map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center border-b border-[#e6dfd5] pb-1.5 last:border-0 last:pb-0">
                            <div>
                              <p className="font-semibold text-[#22623a]">{item.productName}</p>
                              <p className="text-[11px] text-[#6a6660]">{item.sizeWeight} × {item.quantity}</p>
                            </div>
                            <span className="font-bold text-[#22623a]">₨ {item.total.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between font-bold text-sm text-[#22623a] pt-2 border-t border-[#f4eee5]">
                      <span>Total (COD):</span>
                      <span>₨ {selectedOrder.total.toLocaleString()}</span>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-[#f4eee5]">
                      <div className="space-y-1">
                        <label className="font-bold text-[#22623a]">Update Status:</label>
                        <select value={orderStatusInput} onChange={(e) => setOrderStatusInput(e.target.value)}
                          className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#22623a] font-medium">
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED (Packing)</option>
                          <option value="DISPATCHED">DISPATCHED (Courier)</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-[#22623a]">Tracking / Courier Note:</label>
                        <input type="text" value={trackingNoteInput} onChange={(e) => setTrackingNoteInput(e.target.value)}
                          placeholder="e.g. Leopard Courier #LCS-998213"
                          className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816]"
                        />
                      </div>
                      <button onClick={() => handleUpdateOrderStatus(selectedOrder.id)} disabled={updatingOrder}
                        className="w-full py-2.5 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-semibold rounded-md shadow-xs">
                        {updatingOrder ? "Saving..." : "Save Order Status"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center text-xs text-[#6a6660] space-y-2">
                    <ShoppingBag className="w-8 h-8 text-[#2d7648] mx-auto opacity-50" />
                    <p>Select an order to view its details and update courier tracking.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: INVENTORY & PHYSICAL STOCK CONTROL (Admin & Editor) */}
        {activeTab === "inventory" && (isAdmin || isEditor) && (
          <div className="space-y-6">
            {/* Header & Main Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#22623a]">
                  Inventory & Stock Control
                </h2>
                <p className="text-xs text-[#6a6660]">
                  Real-time multi-tier stock tracking: Physical On-Hand, Active Order Reservations, and Live Available inventory.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsUnitsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#faf8f5] text-[#22623a] border border-[#e6dfd5] text-xs font-semibold rounded-lg transition-colors shadow-xs"
                >
                  <Scale className="w-3.5 h-3.5 text-[#c59b27]" />
                  <span>Units Catalog</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedMovementsItem(null);
                    setIsMovementsDrawerOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#faf8f5] text-[#22623a] border border-[#e6dfd5] text-xs font-semibold rounded-lg transition-colors shadow-xs"
                >
                  <History className="w-3.5 h-3.5 text-[#22623a]" />
                  <span>Audit Ledger</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPreselectedProductSizeId(null);
                    setIsReceiveStockOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Receive Stock Batch</span>
                </button>
              </div>
            </div>

            {/* Inventory KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white p-4 rounded-xl border border-[#e6dfd5] space-y-1 shadow-xs">
                <span className="text-[10px] font-semibold text-[#6a6660] uppercase tracking-wider block">Physical On Hand</span>
                <p className="text-xl font-bold text-[#22623a]">
                  {inventorySummary?.totalOnHand?.toLocaleString() || 0}
                </p>
                <span className="text-[10px] text-[#6a6660] font-medium">In clinic store</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#e6dfd5] space-y-1 shadow-xs">
                <span className="text-[10px] font-semibold text-[#6a6660] uppercase tracking-wider block">Reserved Orders</span>
                <p className="text-xl font-bold text-[#c59b27]">
                  {inventorySummary?.totalReserved?.toLocaleString() || 0}
                </p>
                <span className="text-[10px] text-amber-700 font-medium">Awaiting dispatch</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#e6dfd5] space-y-1 shadow-xs">
                <span className="text-[10px] font-semibold text-[#6a6660] uppercase tracking-wider block">Live Available</span>
                <p className="text-xl font-bold text-[#2d7648]">
                  {inventorySummary?.totalAvailable?.toLocaleString() || 0}
                </p>
                <span className="text-[10px] text-emerald-700 font-medium">Live on storefront</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#e6dfd5] space-y-1 shadow-xs">
                <span className="text-[10px] font-semibold text-[#6a6660] uppercase tracking-wider block">Packaging SKUs</span>
                <p className="text-xl font-bold text-[#22623a]">
                  {inventorySizes.length}
                </p>
                <span className="text-[10px] text-[#6a6660] font-medium">Active pack sizes</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#e6dfd5] space-y-1 shadow-xs">
                <span className="text-[10px] font-semibold text-[#6a6660] uppercase tracking-wider block">Stock Valuation</span>
                <p className="text-lg font-bold text-[#22623a] truncate" title={`₨ ${(inventorySummary?.totalStockValue || 0).toLocaleString()}`}>
                  ₨ {(inventorySummary?.totalStockValue || 0).toLocaleString()}
                </p>
                <span className="text-[10px] text-[#6a6660] font-medium">Retail value</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#e6dfd5] space-y-1 shadow-xs">
                <span className="text-[10px] font-semibold text-[#6a6660] uppercase tracking-wider block">Low Stock Alerts</span>
                <p className={`text-xl font-bold ${inventorySummary?.lowStockCount > 0 ? "text-red-700" : "text-[#22623a]"}`}>
                  {inventorySummary?.lowStockCount || 0}
                </p>
                <span className={`text-[10px] font-medium ${inventorySummary?.lowStockCount > 0 ? "text-red-600" : "text-[#6a6660]"}`}>
                  Below safety limit
                </span>
              </div>
            </div>

            {/* Low Stock Warning Banner */}
            {inventorySummary?.lowStockCount > 0 && !inventoryLowStockOnly && (
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>{inventorySummary.lowStockCount} product pack(s)</strong> are currently at or below their low-stock safety threshold.
                  </span>
                </div>
                <button
                  onClick={() => setInventoryLowStockOnly(true)}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs transition-colors shrink-0"
                >
                  Filter to Low Stock Items
                </button>
              </div>
            )}

            {/* Filter & Search Toolbar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#e6dfd5]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#6a6660] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by product name, variant size (e.g. 500g, 100ml), unit, or SKU..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={inventoryCategoryFilter}
                  onChange={(e) => setInventoryCategoryFilter(e.target.value)}
                  className="text-xs px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#22623a] font-medium focus:outline-none focus:border-[#22623a]"
                >
                  <option value="all">All Categories</option>
                  {Array.from(new Set(inventorySizes.map((i) => i.productCategory).filter(Boolean))).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setInventoryLowStockOnly(!inventoryLowStockOnly)}
                  className={`text-xs px-3 py-2 rounded-lg font-semibold border transition-colors flex items-center gap-1.5 ${
                    inventoryLowStockOnly
                      ? "bg-red-50 border-red-300 text-red-700"
                      : "bg-[#faf8f5] border-[#e6dfd5] text-[#59534b] hover:border-[#22623a]"
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  <span>Low Stock Only</span>
                </button>

                {(inventorySearch || inventoryCategoryFilter !== "all" || inventoryLowStockOnly) && (
                  <button
                    type="button"
                    onClick={() => {
                      setInventorySearch("");
                      setInventoryCategoryFilter("all");
                      setInventoryLowStockOnly(false);
                    }}
                    className="text-xs px-2.5 py-2 text-[#6a6660] hover:text-[#22623a] underline font-medium"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Inventory Master Table */}
            <div className="bg-white rounded-xl border border-[#e6dfd5] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#faf8f5] text-[#22623a] border-b border-[#e6dfd5]">
                    <tr>
                      <th className="p-3.5 font-bold">Product & Pack Variant</th>
                      <th className="p-3.5 font-bold">Unit / Type</th>
                      <th className="p-3.5 font-bold">Retail Price</th>
                      <th className="p-3.5 font-bold text-center">On Hand</th>
                      <th className="p-3.5 font-bold text-center">Reserved</th>
                      <th className="p-3.5 font-bold text-center">Live Available</th>
                      <th className="p-3.5 font-bold">Stock Status</th>
                      <th className="p-3.5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e6dfd5]">
                    {filteredInventory.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-[#6a6660]">
                          <Warehouse className="w-8 h-8 mx-auto text-[#c59b27] opacity-60 mb-2" />
                          <p className="font-semibold text-[#22623a]">No stock variants found</p>
                          <p className="text-[11px] text-[#6a6660] mt-0.5">
                            Try clearing your search filters or receive stock into the catalog.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredInventory.map((item) => {
                        const isLow = item.isLowStock;
                        const isOut = item.available <= 0;

                        return (
                          <tr key={item.id} className="hover:bg-[#faf8f5]/60 transition-colors">
                            <td className="p-3.5">
                              <div>
                                <p className="font-bold text-[#22623a] text-xs">
                                  {item.productName}
                                </p>
                                <div className="flex items-center gap-2 text-[11px] text-[#6a6660] mt-0.5">
                                  <span className="font-semibold text-[#1a1816]">
                                    {item.name} ({item.weight})
                                  </span>
                                  {item.productCategory && (
                                    <>
                                      <span>•</span>
                                      <span className="px-1.5 py-0.2 rounded bg-[#f4eee5] text-[10px] text-[#59534b]">
                                        {item.productCategory}
                                      </span>
                                    </>
                                  )}
                                  {item.sku && (
                                    <>
                                      <span>•</span>
                                      <span className="font-mono text-[10px] text-[#6a6660]">
                                        SKU: {item.sku}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="p-3.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#faf8f5] border border-[#e6dfd5] text-[#22623a]">
                                {item.unit ? `${item.unit.code} (${item.unit.name})` : item.weight}
                              </span>
                            </td>

                            <td className="p-3.5">
                              <div>
                                <span className="font-bold text-[#22623a]">
                                  ₨ {item.price?.toLocaleString()}
                                </span>
                                {item.originalPrice && item.originalPrice > item.price && (
                                  <span className="block text-[10px] text-[#6a6660] line-through">
                                    ₨ {item.originalPrice.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="p-3.5 text-center">
                              <span className="font-bold text-xs text-[#22623a]">
                                {item.stockOnHand}
                              </span>
                            </td>

                            <td className="p-3.5 text-center">
                              {item.stockReserved > 0 ? (
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                                  {item.stockReserved}
                                </span>
                              ) : (
                                <span className="text-[#6a6660] text-xs">0</span>
                              )}
                            </td>

                            <td className="p-3.5 text-center">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                  isOut
                                    ? "bg-red-100 text-red-800"
                                    : isLow
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                {item.available}
                              </span>
                            </td>

                            <td className="p-3.5">
                              {isOut ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  <span>Out of Stock</span>
                                </span>
                              ) : isLow ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>Low (≤ {item.lowStockThreshold})</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Live / Healthy</span>
                                </span>
                              )}
                            </td>

                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedQuickStockItem(item);
                                    setIsQuickStockOpen(true);
                                  }}
                                  className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded text-[11px] font-semibold transition-colors flex items-center gap-1"
                                  title="Quick single-click restock"
                                >
                                  <Zap className="w-3 h-3 text-amber-700" />
                                  <span>Quick +</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setPreselectedProductSizeId(item.id);
                                    setIsReceiveStockOpen(true);
                                  }}
                                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[11px] font-semibold transition-colors flex items-center gap-1"
                                  title="Receive stock batch for this variant"
                                >
                                  <Plus className="w-3 h-3 text-emerald-700" />
                                  <span>Receive</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedAdjustItem(item);
                                    setIsAdjustStockOpen(true);
                                  }}
                                  className="p-1 text-[#59534b] hover:text-[#22623a] hover:bg-[#faf8f5] rounded border border-[#e6dfd5] transition-colors"
                                  title="Adjust stock (shrinkage, recount, damage)"
                                >
                                  <SlidersHorizontal className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedMovementsItem(item);
                                    setIsMovementsDrawerOpen(true);
                                  }}
                                  className="p-1 text-[#59534b] hover:text-[#22623a] hover:bg-[#faf8f5] rounded border border-[#e6dfd5] transition-colors"
                                  title="View audit ledger movements"
                                >
                                  <History className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PRODUCTS — AVAILABLE TO ADMIN & EDITOR */}
        {activeTab === "products" && (isAdmin || isEditor) && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#22623a]">Product Catalog & Inventory Management</h2>
                <p className="text-xs text-[#6a6660]">
                  {products.length} active formulations in catalog. Upload new remedies, update prices, or manage stock levels.
                </p>
              </div>
              <button
                onClick={openNewProduct}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Upload New Product</span>
              </button>
            </div>

            <div className="bg-white rounded-xl border border-[#e6dfd5] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#faf8f5] text-[#22623a] border-b border-[#e6dfd5]">
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
                        <td className="p-3.5 font-medium text-[#22623a]">
                          <div className="flex items-center gap-2">
                            {p.featured && (
                              <span className="px-1.5 py-0.5 bg-[#c59b27]/10 text-[#c59b27] rounded text-[9px] font-bold uppercase">★ Featured</span>
                            )}
                            <span>{p.name}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-[#59534b]">{p.categoryLabel || p.categoryId}</td>
                        <td className="p-3.5 font-bold text-[#22623a]">₨ {p.price.toLocaleString()}</td>
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
                              className="px-2 py-1 bg-[#faf8f5] hover:bg-[#e6dfd5] text-[#22623a] text-[11px] font-semibold rounded border border-[#e6dfd5]"
                            >
                              {p.inStock ? "Mark Out" : "Restock"}
                            </button>
                            <button
                              onClick={() => openProductEditor(p)}
                              className="p-1.5 bg-[#22623a] hover:bg-[#1b502e] text-white rounded"
                              title="Edit product"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => {
                                  if (confirm(`Delete "${p.name}" permanently? This cannot be undone.`)) {
                                    handleDeleteProduct(p.id);
                                  }
                                }}
                                disabled={deletingProductId === p.id}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded border border-red-200 disabled:opacity-50"
                                title="Delete product (Admin only)"
                              >
                                {deletingProductId === p.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
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

        {/* TAB 4.5: NUSKHAJAAT (COMPOUNDED REMEDIES) — AVAILABLE TO ADMIN & EDITOR */}
        {activeTab === "nuskhajaat" && (isAdmin || isEditor) && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl font-bold text-[#22623a]">Nuskhajaat / Compounded Remedies</h2>
                  <span className="px-2 py-0.5 bg-[#c59b27]/15 text-[#8c6a15] text-[10px] font-bold uppercase rounded-md border border-[#c59b27]/30">
                    Apothecary Engine
                  </span>
                </div>
                <p className="text-xs text-[#6a6660] mt-1">
                  Classical Unani multi-herb formulations. Manage multi-herb ratios, default/min/max grams, unit pricing, preparation formats, and live customizer settings.
                </p>
              </div>
              <button
                onClick={openNewNuskha}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors shadow-md shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Nuskha</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-[#e6dfd5] shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#22623a]/10 text-[#22623a] flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-[#c59b27]" />
                </div>
                <div>
                  <p className="text-[11px] text-[#7a7268] uppercase font-bold">Total Formulations</p>
                  <p className="text-lg font-bold text-[#22623a]">{nuskhajaat.length} Classical Compounds</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#e6dfd5] shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                  <Leaf className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <p className="text-[11px] text-[#7a7268] uppercase font-bold">In-Stock Remedies</p>
                  <p className="text-lg font-bold text-emerald-800">
                    {nuskhajaat.filter((n) => n.inStock).length} Available for Dispensing
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#e6dfd5] shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#c59b27]/10 text-[#8c6a15] flex items-center justify-center shrink-0">
                  <Scale className="w-5 h-5 text-[#c59b27]" />
                </div>
                <div>
                  <p className="text-[11px] text-[#7a7268] uppercase font-bold">Compounding System</p>
                  <p className="text-lg font-bold text-[#22623a]">Real-Time Gram Pricing</p>
                </div>
              </div>
            </div>

            {/* Nuskhajaat Table */}
            <div className="bg-white rounded-xl border border-[#e6dfd5] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#faf8f5] text-[#22623a] border-b border-[#e6dfd5]">
                    <tr>
                      <th className="p-3.5 font-bold">Nuskha Compound</th>
                      <th className="p-3.5 font-bold">Specialty / Category</th>
                      <th className="p-3.5 font-bold">Herb Composition</th>
                      <th className="p-3.5 font-bold">Base Price & Prep</th>
                      <th className="p-3.5 font-bold">Status</th>
                      <th className="p-3.5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e6dfd5]">
                    {nuskhajaat.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-xs text-[#6a6660]">
                          No compounded Nuskhajaat found. Click &quot;Create New Nuskha&quot; above to add your first classical multi-herb formula.
                        </td>
                      </tr>
                    ) : (
                      nuskhajaat.map((n) => {
                        const totalBaseGrams = (n.ingredients || []).reduce(
                          (sum: number, ing: any) => sum + (ing.unit === "grams" ? Number(ing.defaultQuantity || 0) : 0),
                          0
                        );
                        return (
                          <tr key={n.id || n.slug} className="hover:bg-[#faf8f5]/50">
                            <td className="p-3.5 font-medium text-[#22623a]">
                              <div className="flex items-start gap-2.5">
                                <div className="w-9 h-9 rounded-lg bg-[#faf8f5] border border-[#e6dfd5] flex items-center justify-center shrink-0 text-base">
                                  {n.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={n.image} alt={n.title} className="w-full h-full object-cover rounded-lg" />
                                  ) : (
                                    <span>🌿</span>
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-[#22623a]">{n.title}</span>
                                    {n.featured && (
                                      <span className="px-1.5 py-0.2 bg-[#c59b27]/10 text-[#c59b27] rounded text-[9px] font-bold uppercase">
                                        ★ Featured
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#7a7268]">
                                    <span className="font-serif text-[#8c6a15]" dir="rtl">{n.urduTitle}</span>
                                    <span>·</span>
                                    <code className="text-[10px] text-[#999] bg-[#faf8f5] px-1 rounded">/{n.slug}</code>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3.5 text-[#59534b]">
                              <span className="inline-block px-2 py-0.5 bg-[#f4eee5] rounded-md font-medium text-[11px] text-[#22623a]">
                                {n.categoryLabel || n.category}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <div className="space-y-0.5">
                                <p className="font-semibold text-[#22623a]">
                                  {(n.ingredients || []).length} Classical Herbs
                                </p>
                                <p className="text-[11px] text-[#7a7268]">
                                  ~{totalBaseGrams}g base weight
                                </p>
                              </div>
                            </td>
                            <td className="p-3.5">
                              <div className="space-y-0.5">
                                <span className="font-bold text-[#22623a] block">
                                  ₨ {Number(n.basePrice || 0).toLocaleString()}
                                </span>
                                <span className="text-[10px] text-[#7a7268]">
                                  Prep Fee: ₨{Number(n.preparationFee || 0)}
                                </span>
                              </div>
                            </td>
                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                n.inStock ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"
                              }`}>
                                {n.inStock ? "In Stock" : "Out of Stock"}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleToggleNuskhaStock(n)}
                                  className="px-2 py-1 bg-[#faf8f5] hover:bg-[#e6dfd5] text-[#22623a] text-[11px] font-semibold rounded border border-[#e6dfd5]"
                                  title="Toggle Stock"
                                >
                                  {n.inStock ? "Mark Out" : "Restock"}
                                </button>
                                <Link
                                  href={`/nuskhajaat/${n.slug}`}
                                  target="_blank"
                                  className="p-1.5 bg-[#faf8f5] hover:bg-[#e6dfd5] text-[#59534b] hover:text-[#22623a] rounded border border-[#e6dfd5]"
                                  title="View Live Compounding Page"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                                <button
                                  onClick={() => openNuskhaEditor(n)}
                                  className="p-1.5 bg-[#22623a] hover:bg-[#1b502e] text-white rounded"
                                  title="Edit Nuskha Formula"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                {isAdmin && (
                                  <button
                                    onClick={() => {
                                      if (confirm(`Delete "${n.title}" formula permanently? This cannot be undone.`)) {
                                        handleDeleteNuskha(n.id || n.slug);
                                      }
                                    }}
                                    disabled={deletingNuskhaId === (n.id || n.slug)}
                                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded border border-red-200 disabled:opacity-50"
                                    title="Delete Nuskha (Admin only)"
                                  >
                                    {deletingNuskhaId === (n.id || n.slug) ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: ACCOUNTS RECEIVABLE & CUSTOMER LEDGERS (Admin Only) */}
        {activeTab === "accounts" && isAdmin && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl font-bold text-[#22623a]">
                    Customer Accounts & Receivables Ledger (A/R)
                  </h2>
                  {(accountsSummary?.totalReceivableDue || 0) > 0 && (
                    <span className="px-2 py-0.5 bg-amber-100 border border-amber-300 text-amber-900 rounded-md text-[11px] font-bold">
                      ₨ {(accountsSummary?.totalReceivableDue || 0).toLocaleString()} Total Due
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6a6660]">
                  Consolidated customer balances, payment records, outstanding dues, and printable ledger statements.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentModalCustomer(null);
                    setPaymentModalOrderId(null);
                    setPaymentModalMaxDue(undefined);
                    setIsReceivePaymentOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                >
                  <DollarSign className="w-4 h-4 text-[#c59b27]" />
                  <span>Record Customer Payment</span>
                </button>
              </div>
            </div>

            {/* Accounts Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-[#e6dfd5] shadow-xs space-y-1">
                <span className="text-[11px] font-semibold text-[#6a6660] uppercase flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5 text-amber-700" />
                  <span>Total Outstanding Receivables</span>
                </span>
                <p className="text-2xl font-bold text-amber-800">
                  ₨ {(accountsSummary?.totalReceivableDue || 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-[#6a6660]">
                  From {accountsSummary?.activeCustomersWithDues || 0} customer account(s) with pending dues
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#e6dfd5] shadow-xs space-y-1">
                <span className="text-[11px] font-semibold text-[#6a6660] uppercase flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#22623a]" />
                  <span>Customer Ledger Accounts</span>
                </span>
                <p className="text-2xl font-bold text-[#22623a]">
                  {customersList.length}
                </p>
                <p className="text-[10px] text-[#6a6660]">
                  Indexed by phone & registered accounts
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#e6dfd5] shadow-xs space-y-1">
                <span className="text-[11px] font-semibold text-[#6a6660] uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Fully Settled Accounts</span>
                </span>
                <p className="text-2xl font-bold text-emerald-800">
                  {accountsSummary?.totalSettled || 0}
                </p>
                <p className="text-[10px] text-[#6a6660]">
                  Zero outstanding balance / fully paid
                </p>
              </div>
            </div>

            {/* Filters & Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#e6dfd5]">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-[#6a6660] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer by name, phone, email, city..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a]"
                />
                {customerSearch && (
                  <button
                    type="button"
                    onClick={() => setCustomerSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6a6660] hover:text-[#1a1816]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setCustomerFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    customerFilter === "all"
                      ? "bg-[#22623a] text-white"
                      : "bg-[#faf8f5] text-[#59534b] hover:bg-[#e6dfd5]"
                  }`}
                >
                  All ({customersList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerFilter("due")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    customerFilter === "due"
                      ? "bg-amber-700 text-white"
                      : "bg-[#faf8f5] text-amber-800 hover:bg-amber-50"
                  }`}
                >
                  Pending Dues ({accountsSummary?.activeCustomersWithDues || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerFilter("settled")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    customerFilter === "settled"
                      ? "bg-emerald-700 text-white"
                      : "bg-[#faf8f5] text-emerald-800 hover:bg-emerald-50"
                  }`}
                >
                  Settled ({accountsSummary?.totalSettled || 0})
                </button>
              </div>
            </div>

            {/* Customers Receivable Ledger Table */}
            <div className="bg-white rounded-xl border border-[#e6dfd5] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#faf8f5] text-[#22623a] border-b border-[#e6dfd5]">
                    <tr>
                      <th className="p-3.5 font-bold">Customer / Patient</th>
                      <th className="p-3.5 font-bold">Contact & WhatsApp</th>
                      <th className="p-3.5 font-bold text-right">Total Invoiced</th>
                      <th className="p-3.5 font-bold text-right">Total Paid</th>
                      <th className="p-3.5 font-bold text-right">Net Balance Due</th>
                      <th className="p-3.5 font-bold text-center">Status</th>
                      <th className="p-3.5 font-bold text-right">Account Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e6dfd5]">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-[#6a6660]">
                          No customer accounts found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((c, idx) => {
                        const balance = c.currentBalance || 0;
                        const isDue = balance > 0;
                        const customerIdKey = c.phone || c.userId || c.name || `cust-${idx}`;
                        const waText = encodeURIComponent(
                          `*Assalam-o-Alaikum ${c.name || "Respected Patient"},*\n\nHere is your official account balance summary from *Tameer-e-Sehat Herbal Dispensary*:\n\n📦 *Total Orders Billed:* ₨ ${(c.totalPurchases || 0).toLocaleString()}\n✅ *Total Payments Received:* ₨ ${(c.totalPaid || 0).toLocaleString()}\n⚠️ *Net Outstanding Due:* ₨ ${balance.toLocaleString()}\n\nFor accounts queries, contact our helpline at +92 312 2841990.\n*Tameer-e-Sehat Health Clinic*`
                        );
                        return (
                          <tr key={customerIdKey} className="hover:bg-[#faf8f5]/60 transition-colors">
                            <td className="p-3.5">
                              <div className="font-bold text-[#22623a]">
                                {c.name || "Walk-in / Guest Patient"}
                              </div>
                              <div className="text-[11px] text-[#6a6660]">
                                {c.city || "Pakistan"} · {c.ordersCount || 0} order(s)
                              </div>
                            </td>

                            <td className="p-3.5">
                              <div className="font-mono text-[11px] text-[#1a1816]">
                                {c.phone || "No phone"}
                              </div>
                              {c.email && (
                                <div className="text-[10px] text-[#6a6660] font-mono">
                                  {c.email}
                                </div>
                              )}
                            </td>

                            <td className="p-3.5 text-right font-bold text-[#1a1816]">
                              ₨ {(c.totalPurchases || 0).toLocaleString()}
                            </td>

                            <td className="p-3.5 text-right font-bold text-[#2d7648]">
                              ₨ {(c.totalPaid || 0).toLocaleString()}
                            </td>

                            <td className="p-3.5 text-right">
                              <span
                                className={`font-mono font-bold text-sm ${
                                  isDue ? "text-amber-800" : "text-emerald-700"
                                }`}
                              >
                                ₨ {balance.toLocaleString()}
                              </span>
                            </td>

                            <td className="p-3.5 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isDue
                                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                                    : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                }`}
                              >
                                {isDue ? "OUTSTANDING" : "SETTLED"}
                              </span>
                            </td>

                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedLedgerCustomer(c.phone || c.userId || c.name);
                                    setIsCustomerLedgerOpen(true);
                                  }}
                                  className="px-2 py-1 bg-[#faf8f5] hover:bg-[#e6dfd5] text-[#22623a] border border-[#e6dfd5] rounded text-[11px] font-semibold transition-colors flex items-center gap-1"
                                  title="View full chronological account statement"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>Ledger</span>
                                </button>

                                {isDue && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPaymentModalCustomer(c);
                                      setPaymentModalMaxDue(balance);
                                      setPaymentModalOrderId(null);
                                      setIsReceivePaymentOpen(true);
                                    }}
                                    className="px-2 py-1 bg-[#22623a] hover:bg-[#1b502e] text-white rounded text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                                    title="Record payment received"
                                  >
                                    <DollarSign className="w-3.5 h-3.5 text-[#c59b27]" />
                                    <span>Receive</span>
                                  </button>
                                )}

                                {c.phone && (
                                  <a
                                    href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}?text=${waText}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 rounded transition-colors"
                                    title="Send WhatsApp Balance Statement"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: VENDORS, RAW HERB SUPPLIERS & PURCHASING (Admin Only) */}
        {activeTab === "vendors" && isAdmin && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl font-bold text-[#22623a]">
                    Vendors & Raw Herb Suppliers (Accounts Payable - A/P)
                  </h2>
                  {(vendorsSummary?.totalPayablesDue || 0) > 0 && (
                    <span className="px-2 py-0.5 bg-amber-100 border border-amber-300 text-amber-900 rounded-md text-[11px] font-bold">
                      ₨ {(vendorsSummary?.totalPayablesDue || 0).toLocaleString()} Total Payable
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6a6660]">
                  Manage raw botanical herb suppliers, packaging vendors, inward purchase bills, and disbursement vouchers.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setEditingVendor(null);
                    setIsVendorModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                >
                  <Building2 className="w-4 h-4 text-[#c59b27]" />
                  <span>Register Vendor</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPurchaseBillVendorId(null);
                    setIsPurchaseBillModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#c59b27] hover:bg-[#a8821d] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                >
                  <Package className="w-4 h-4" />
                  <span>New Purchase Bill</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVendorPaymentTarget(null);
                    setVendorPaymentPurchaseId(null);
                    setVendorPaymentMaxDue(undefined);
                    setIsVendorPaymentModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#faf8f5] hover:bg-[#e6dfd5] text-[#22623a] border border-[#e6dfd5] text-xs font-semibold rounded-lg transition-colors"
                >
                  <CreditCard className="w-4 h-4 text-[#22623a]" />
                  <span>Disburse Payment</span>
                </button>
              </div>
            </div>

            {/* Vendor Sub-Nav Tabs */}
            <div className="flex items-center gap-2 border-b border-[#e6dfd5] pb-2">
              <button
                type="button"
                onClick={() => setVendorSubTab("vendors")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  vendorSubTab === "vendors"
                    ? "bg-[#22623a] text-white shadow-xs"
                    : "bg-[#faf8f5] text-[#59534b] hover:bg-[#e6dfd5]"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Suppliers Directory ({vendorsList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setVendorSubTab("bills")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  vendorSubTab === "bills"
                    ? "bg-[#22623a] text-white shadow-xs"
                    : "bg-[#faf8f5] text-[#59534b] hover:bg-[#e6dfd5]"
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Inward Purchase Bills ({purchasesList.length})</span>
              </button>
            </div>

            {/* Vendor KPIs Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-[#e6dfd5] shadow-xs space-y-1">
                <span className="text-[11px] font-semibold text-[#6a6660] uppercase">
                  Registered Suppliers
                </span>
                <p className="text-2xl font-bold text-[#22623a]">
                  {vendorsList.length}
                </p>
                <p className="text-[10px] text-[#6a6660]">Botanical & packaging vendors</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#e6dfd5] shadow-xs space-y-1">
                <span className="text-[11px] font-semibold text-[#6a6660] uppercase">
                  Inward Purchases Billed
                </span>
                <p className="text-2xl font-bold text-[#1a1816]">
                  ₨ {(vendorsSummary?.totalPurchasesBilled || 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-[#6a6660]">Total inventory inward cost</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#e6dfd5] shadow-xs space-y-1">
                <span className="text-[11px] font-semibold text-[#6a6660] uppercase">
                  Disbursed Payments
                </span>
                <p className="text-2xl font-bold text-[#2d7648]">
                  ₨ {(vendorsSummary?.totalPaymentsDisbursed || 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-[#6a6660]">Total payments to suppliers</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/40 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-amber-900 uppercase">
                  Net Outstanding Payable
                </span>
                <p className="text-2xl font-bold text-amber-950">
                  ₨ {(vendorsSummary?.totalPayablesDue || 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-amber-800">Total liability owed to suppliers</p>
              </div>
            </div>

            {/* SubTab 1: Suppliers Directory */}
            {vendorSubTab === "vendors" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#e6dfd5]">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-[#6a6660] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search vendor by name, shop, phone, city..."
                      value={vendorSearch}
                      onChange={(e) => setVendorSearch(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 text-xs bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a]"
                    />
                    {vendorSearch && (
                      <button
                        type="button"
                        onClick={() => setVendorSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6a6660] hover:text-[#1a1816]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-[#e6dfd5] shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#faf8f5] text-[#22623a] border-b border-[#e6dfd5]">
                        <tr>
                          <th className="p-3.5 font-bold">Supplier / Market Shop</th>
                          <th className="p-3.5 font-bold">Phone & WhatsApp</th>
                          <th className="p-3.5 font-bold">Market Location</th>
                          <th className="p-3.5 font-bold text-right">Total Purchases</th>
                          <th className="p-3.5 font-bold text-right">Total Paid</th>
                          <th className="p-3.5 font-bold text-right">Net Payable Due</th>
                          <th className="p-3.5 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e6dfd5]">
                        {filteredVendors.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-[#6a6660]">
                              No suppliers registered yet. Click &quot;Register Vendor&quot; above to add one.
                            </td>
                          </tr>
                        ) : (
                          filteredVendors.map((v) => {
                            const payable = v.currentBalance || 0;
                            const isDue = payable > 0;
                            return (
                              <tr key={v.id} className="hover:bg-[#faf8f5]/60 transition-colors">
                                <td className="p-3.5">
                                  <div className="font-bold text-[#22623a] text-sm">
                                    {v.name}
                                  </div>
                                  {v.company && (
                                    <div className="text-[11px] text-[#59534b] font-medium">
                                      {v.company}
                                    </div>
                                  )}
                                </td>

                                <td className="p-3.5">
                                  <div className="font-mono text-[11px] text-[#1a1816]">
                                    {v.phone || "No phone"}
                                  </div>
                                  {v.email && (
                                    <div className="text-[10px] text-[#6a6660] font-mono">
                                      {v.email}
                                    </div>
                                  )}
                                </td>

                                <td className="p-3.5 text-[#59534b] text-[11px] max-w-xs truncate">
                                  {v.address || "Karachi, Pakistan"}
                                </td>

                                <td className="p-3.5 text-right font-bold text-[#1a1816]">
                                  ₨ {(v.totalPurchases || 0).toLocaleString()}
                                </td>

                                <td className="p-3.5 text-right font-bold text-[#2d7648]">
                                  ₨ {(v.totalPayments || 0).toLocaleString()}
                                </td>

                                <td className="p-3.5 text-right">
                                  <span
                                    className={`font-mono font-bold text-sm ${
                                      isDue ? "text-amber-800" : "text-emerald-700"
                                    }`}
                                  >
                                    ₨ {payable.toLocaleString()}
                                  </span>
                                </td>

                                <td className="p-3.5 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedVendorLedgerId(v.id);
                                        setIsVendorLedgerOpen(true);
                                      }}
                                      className="px-2 py-1 bg-[#faf8f5] hover:bg-[#e6dfd5] text-[#22623a] border border-[#e6dfd5] rounded text-[11px] font-semibold transition-colors flex items-center gap-1"
                                      title="View Supplier Statement"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                      <span>Statement</span>
                                    </button>

                                    {isDue && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setVendorPaymentTarget(v);
                                          setVendorPaymentPurchaseId(null);
                                          setVendorPaymentMaxDue(payable);
                                          setIsVendorPaymentModalOpen(true);
                                        }}
                                        className="px-2 py-1 bg-[#22623a] hover:bg-[#1b502e] text-white rounded text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                                        title="Disburse payment"
                                      >
                                        <DollarSign className="w-3.5 h-3.5 text-[#c59b27]" />
                                        <span>Pay</span>
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPurchaseBillVendorId(v.id);
                                        setIsPurchaseBillModalOpen(true);
                                      }}
                                      className="p-1 bg-[#c59b27]/10 hover:bg-[#c59b27]/20 text-[#c59b27] border border-[#c59b27]/30 rounded transition-colors"
                                      title="Create Purchase Bill"
                                    >
                                      <Package className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingVendor(v);
                                        setIsVendorModalOpen(true);
                                      }}
                                      className="p-1 text-[#59534b] hover:text-[#22623a] hover:bg-[#faf8f5] rounded border border-[#e6dfd5] transition-colors"
                                      title="Edit Vendor Info"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SubTab 2: Inward Purchase Bills */}
            {vendorSubTab === "bills" && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-[#e6dfd5] shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#faf8f5] text-[#22623a] border-b border-[#e6dfd5]">
                        <tr>
                          <th className="p-3.5 font-bold">Bill # & Date</th>
                          <th className="p-3.5 font-bold">Supplier / Vendor</th>
                          <th className="p-3.5 font-bold">Items Received</th>
                          <th className="p-3.5 font-bold text-right">Bill Total (PKR)</th>
                          <th className="p-3.5 font-bold text-right">Amount Paid</th>
                          <th className="p-3.5 font-bold text-center">Status</th>
                          <th className="p-3.5 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e6dfd5]">
                        {purchasesList.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-[#6a6660]">
                              No inward purchase bills recorded yet. Click &quot;New Purchase Bill&quot; to log incoming botanical or packaging stock.
                            </td>
                          </tr>
                        ) : (
                          purchasesList.map((p) => {
                            const unpaidAmount = Math.max(0, p.totalAmount - (p.paidAmount || 0));
                            return (
                              <tr key={p.id} className="hover:bg-[#faf8f5]/60 transition-colors">
                                <td className="p-3.5">
                                  <span className="font-mono font-bold text-[#22623a] block">
                                    Bill #{p.billNumber}
                                  </span>
                                  <span className="text-[10px] text-[#6a6660]">
                                    {new Date(p.billDate).toLocaleDateString("en-PK")}
                                  </span>
                                </td>

                                <td className="p-3.5">
                                  <span className="font-bold text-[#1a1816] block">
                                    {p.vendor?.name || "Unknown Supplier"}
                                  </span>
                                  <span className="text-[10px] text-[#6a6660]">
                                    {p.vendor?.company || p.vendor?.phone || "—"}
                                  </span>
                                </td>

                                <td className="p-3.5 text-[#59534b]">
                                  <span className="font-semibold text-[#22623a]">
                                    {p.items?.length || 0} item(s)
                                  </span>
                                  {p.items && p.items.length > 0 && (
                                    <div className="text-[10px] text-[#7a7268] truncate max-w-xs">
                                      {p.items.map((i: any) => `${i.productName} (${i.quantityReceived})`).join(", ")}
                                    </div>
                                  )}
                                </td>

                                <td className="p-3.5 text-right font-bold text-[#1a1816]">
                                  ₨ {(p.totalAmount || 0).toLocaleString()}
                                </td>

                                <td className="p-3.5 text-right font-bold text-[#2d7648]">
                                  ₨ {(p.paidAmount || 0).toLocaleString()}
                                </td>

                                <td className="p-3.5 text-center">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                      p.paymentStatus === "PAID"
                                        ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                        : p.paymentStatus === "PARTIAL"
                                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                                        : "bg-red-100 text-red-900 border border-red-300"
                                    }`}
                                  >
                                    {p.paymentStatus || "UNPAID"}
                                  </span>
                                </td>

                                <td className="p-3.5 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {unpaidAmount > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setVendorPaymentTarget(p.vendor);
                                          setVendorPaymentPurchaseId(p.id);
                                          setVendorPaymentMaxDue(unpaidAmount);
                                          setIsVendorPaymentModalOpen(true);
                                        }}
                                        className="px-2 py-1 bg-[#22623a] hover:bg-[#1b502e] text-white rounded text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                                        title="Pay bill"
                                      >
                                        <DollarSign className="w-3.5 h-3.5 text-[#c59b27]" />
                                        <span>Pay Bill</span>
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedVendorLedgerId(p.vendorId);
                                        setIsVendorLedgerOpen(true);
                                      }}
                                      className="px-2 py-1 bg-[#faf8f5] hover:bg-[#e6dfd5] text-[#22623a] border border-[#e6dfd5] rounded text-[11px] font-semibold transition-colors flex items-center gap-1"
                                      title="View vendor ledger"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                      <span>Ledger</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: EXECUTIVE FINANCIAL DASHBOARD (Admin Only) */}
        {activeTab === "finance" && isAdmin && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#22623a]">
                  Executive Financial Dashboard & Clinical Economics
                </h2>
                <p className="text-xs text-[#6a6660]">
                  Real-time revenue, cash collections, accounts receivable, supplier payables, inventory asset valuation, and gross margins.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fetchData()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#faf8f5] hover:bg-[#e6dfd5] text-[#22623a] border border-[#e6dfd5] text-xs font-semibold rounded-lg transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Financials</span>
                </button>
              </div>
            </div>

            {/* Financial Overview Master KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Gross Sales */}
              <div className="bg-white p-4 rounded-xl border border-[#e6dfd5] shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#22623a] uppercase tracking-wider">
                    Total Invoiced Sales
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-[#22623a]/10 text-[#22623a] flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-serif font-bold text-[#22623a]">
                  ₨ {(stats?.totalRevenue || 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-[#6a6660]">
                  Across {orders.length} patient order(s)
                </p>
              </div>

              {/* Card 2: Cash Collected */}
              <div className="bg-white p-4 rounded-xl border border-[#e6dfd5] shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#2d7648] uppercase tracking-wider">
                    Cash Collected
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-serif font-bold text-[#2d7648]">
                  ₨ {Math.max(0, (stats?.totalRevenue || 0) - (accountsSummary?.totalReceivableDue || 0)).toLocaleString()}
                </p>
                <p className="text-[10px] text-[#6a6660]">
                  Received via Cash, Bank, EasyPaisa, COD
                </p>
              </div>

              {/* Card 3: Receivables (A/R) */}
              <div className="bg-white p-4 rounded-xl border border-[#e6dfd5] shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                    Accounts Receivable (A/R)
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-serif font-bold text-amber-800">
                  ₨ {(accountsSummary?.totalReceivableDue || 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-[#6a6660]">
                  Pending collection from patients & clients
                </p>
              </div>

              {/* Card 4: Payables (A/P) */}
              <div className="bg-white p-4 rounded-xl border border-[#e6dfd5] shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider">
                    Accounts Payable (A/P)
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-serif font-bold text-red-800">
                  ₨ {(vendorsSummary?.totalPayablesDue || 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-[#6a6660]">
                  Owed to botanical herb & packaging vendors
                </p>
              </div>
            </div>

            {/* Inventory Valuation & Margins Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-[#e6dfd5] shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <Warehouse className="w-5 h-5 text-[#22623a]" />
                  <h3 className="font-bold text-sm text-[#22623a]">
                    Inventory Valuation (At Cost)
                  </h3>
                </div>
                <p className="text-3xl font-serif font-bold text-[#1a1816]">
                  ₨ {(inventorySummary?.totalCostValue || 0).toLocaleString()}
                </p>
                <p className="text-xs text-[#59534b]">
                  Total investment tied up in physical on-hand botanical stock ({inventorySummary?.totalOnHandStock || 0} units).
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#e6dfd5] shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#c59b27]" />
                  <h3 className="font-bold text-sm text-[#22623a]">
                    Potential Retail Value
                  </h3>
                </div>
                <p className="text-3xl font-serif font-bold text-[#22623a]">
                  ₨ {(inventorySummary?.totalRetailValue || 0).toLocaleString()}
                </p>
                <p className="text-xs text-[#59534b]">
                  Expected revenue upon 100% catalog liquidation at current retail pricing.
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-700" />
                  <h3 className="font-bold text-sm text-emerald-900">
                    Unrealized Gross Margin
                  </h3>
                </div>
                <p className="text-3xl font-serif font-bold text-emerald-950">
                  ₨ {(inventorySummary?.potentialProfitMargin || 0).toLocaleString()}
                </p>
                <p className="text-xs text-emerald-800">
                  Projected gross margin ({inventorySummary?.totalCostValue ? Math.round(((inventorySummary.potentialProfitMargin || 0) / inventorySummary.totalRetailValue) * 100) : 0}% catalog margin).
                </p>
              </div>
            </div>

            {/* Financial Working Capital & Cash Balance Position */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Working Position */}
              <div className="bg-white p-6 rounded-xl border border-[#e6dfd5] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#e6dfd5] pb-3">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-[#22623a]" />
                    <h3 className="font-serif font-bold text-[#22623a] text-sm">
                      Working Capital & Net Balance Matrix
                    </h3>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center p-3 bg-[#faf8f5] rounded-lg">
                    <span className="font-medium text-[#59534b]">Customer Receivables (Assets):</span>
                    <span className="font-mono font-bold text-emerald-800 text-sm">
                      + ₨ {(accountsSummary?.totalReceivableDue || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-[#faf8f5] rounded-lg">
                    <span className="font-medium text-[#59534b]">Supplier Payables (Liabilities):</span>
                    <span className="font-mono font-bold text-red-800 text-sm">
                      - ₨ {(vendorsSummary?.totalPayablesDue || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3.5 bg-[#22623a]/10 border border-[#22623a]/20 rounded-lg">
                    <span className="font-bold text-[#22623a]">Net Accounts Position (A/R - A/P):</span>
                    <span className="font-mono font-black text-[#22623a] text-base">
                      ₨ {((accountsSummary?.totalReceivableDue || 0) - (vendorsSummary?.totalPayablesDue || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Operational Procurement & Invoicing Breakdown */}
              <div className="bg-white p-6 rounded-xl border border-[#e6dfd5] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#e6dfd5] pb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#22623a]" />
                    <h3 className="font-serif font-bold text-[#22623a] text-sm">
                      Procurement vs Inward Purchase Summary
                    </h3>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center p-3 bg-[#faf8f5] rounded-lg">
                    <span className="font-medium text-[#59534b]">Total Inward Bills Received:</span>
                    <span className="font-mono font-bold text-[#1a1816] text-sm">
                      ₨ {(vendorsSummary?.totalPurchasesBilled || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-[#faf8f5] rounded-lg">
                    <span className="font-medium text-[#59534b]">Total Supplier Payments Disbursed:</span>
                    <span className="font-mono font-bold text-[#2d7648] text-sm">
                      ₨ {(vendorsSummary?.totalPaymentsDisbursed || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3.5 bg-amber-50 border border-amber-200 rounded-lg">
                    <span className="font-bold text-amber-950">Pending Supplier Dues (Unpaid Bills):</span>
                    <span className="font-mono font-black text-amber-900 text-base">
                      ₨ {(vendorsSummary?.totalPayablesDue || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: INQUIRIES — AVAILABLE TO ADMIN & CONTRIBUTOR */}
        {activeTab === "inquiries" && (isAdmin || isContributor) && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#22623a]">Customer Inquiries & Feedback</h2>
              <p className="text-xs text-[#6a6660]">Messages and consultation inquiries submitted through the contact page.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {inquiries.length === 0 ? (
                <div className="col-span-full bg-white p-8 rounded-xl border border-[#e6dfd5] text-center text-xs text-[#6a6660]">
                  No contact inquiries found.
                </div>
              ) : (
                inquiries.map((inq) => (
                  <div key={inq.id} className="bg-white p-5 rounded-xl border border-[#e6dfd5] shadow-xs space-y-3 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-[#22623a]">{inq.name}</h4>
                        <p className="text-[11px] text-[#6a6660]">{inq.phone} · {inq.city || "Pakistan"}</p>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-900">{inq.status}</span>
                    </div>
                    <div className="p-3 bg-[#faf8f5] rounded-lg text-[#59534b]">
                      <p className="font-semibold text-[#22623a]">{inq.subject}</p>
                      <p className="text-[11px] mt-1">{inq.message}</p>
                    </div>
                    <div className="pt-1 flex justify-between items-center text-[10px] text-[#6a6660]">
                      <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                      <a
                        href={`https://wa.me/${inq.phone?.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#2d7648] font-semibold hover:underline"
                      >
                        Reply via WhatsApp →
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 6: TEAM & RBAC MANAGEMENT (Admin Only) */}
        {activeTab === "team" && isAdmin && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#22623a]">Team & Access Control (RBAC)</h2>
                <p className="text-xs text-[#6a6660]">
                  Manage staff roles and user privileges. Assign Catalog Editors and Support Contributors.
                </p>
              </div>
              <button
                onClick={() => {
                  setAddStaffError(null);
                  setAddStaffSuccess(null);
                  setIsAddStaffModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors shadow-md"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Staff Member</span>
              </button>
            </div>

            {/* Role Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-[#e6dfd5] space-y-1">
                <span className="text-[11px] font-semibold text-[#6a6660] uppercase">Primary Admin</span>
                <p className="text-xl font-bold text-[#22623a]">
                  {usersList.filter((u) => u.role === ROLES.ADMIN).length}
                </p>
                <span className="text-[10px] text-amber-700 font-medium">Single Authority Lock</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#e6dfd5] space-y-1">
                <span className="text-[11px] font-semibold text-[#6a6660] uppercase">Catalog Editors</span>
                <p className="text-xl font-bold text-[#22623a]">
                  {usersList.filter((u) => u.role === ROLES.EDITOR).length}
                </p>
                <span className="text-[10px] text-blue-700 font-medium">Products & Inventory</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#e6dfd5] space-y-1">
                <span className="text-[11px] font-semibold text-[#6a6660] uppercase">Contributors</span>
                <p className="text-xl font-bold text-[#22623a]">
                  {usersList.filter((u) => u.role === ROLES.CONTRIBUTOR).length}
                </p>
                <span className="text-[10px] text-purple-700 font-medium">Inquiry Support</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#e6dfd5] space-y-1">
                <span className="text-[11px] font-semibold text-[#6a6660] uppercase">Registered Customers</span>
                <p className="text-xl font-bold text-[#22623a]">
                  {usersList.filter((u) => u.role === ROLES.USER || !u.role).length}
                </p>
                <span className="text-[10px] text-emerald-700 font-medium">Standard Accounts</span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#e6dfd5]">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#6a6660] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user by name, email, phone..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-[#6a6660] font-medium whitespace-nowrap">Filter Role:</span>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="text-xs px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#22623a] font-medium focus:outline-none focus:border-[#22623a]"
                >
                  <option value="all">All Accounts ({usersList.length})</option>
                  <option value="staff">All Staff Members</option>
                  <option value={ROLES.ADMIN}>Admins</option>
                  <option value={ROLES.EDITOR}>Editors</option>
                  <option value={ROLES.CONTRIBUTOR}>Contributors</option>
                  <option value={ROLES.USER}>Customers (Users)</option>
                </select>
              </div>
            </div>

            {/* Users & Staff Table */}
            <div className="bg-white rounded-xl border border-[#e6dfd5] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#faf8f5] text-[#22623a] border-b border-[#e6dfd5]">
                    <tr>
                      <th className="p-3.5 font-bold">User Name & Contact</th>
                      <th className="p-3.5 font-bold">Email Address</th>
                      <th className="p-3.5 font-bold">Assigned Role</th>
                      <th className="p-3.5 font-bold">Registered On</th>
                      <th className="p-3.5 font-bold text-right">Access Management</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e6dfd5]">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-[#6a6660]">
                          No users found matching query.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isCurrentAdmin = u.role === ROLES.ADMIN;
                        return (
                          <tr key={u.id} className="hover:bg-[#faf8f5]/50">
                            <td className="p-3.5 font-medium text-[#22623a]">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-[#f4eee5] text-[#22623a] font-bold flex items-center justify-center text-xs">
                                  {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                                </div>
                                <div>
                                  <p className="font-semibold text-[#22623a]">{u.name || "Unnamed User"}</p>
                                  <p className="text-[10px] text-[#6a6660]">{u.phone || "No phone"} {u.city ? `· ${u.city}` : ""}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3.5 text-[#59534b] font-mono text-[11px]">{u.email}</td>
                            <td className="p-3.5">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  u.role === ROLES.ADMIN
                                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                                    : u.role === ROLES.EDITOR
                                    ? "bg-blue-100 text-blue-900 border border-blue-300"
                                    : u.role === ROLES.CONTRIBUTOR
                                    ? "bg-purple-100 text-purple-900 border border-purple-300"
                                    : "bg-gray-100 text-gray-700 border border-gray-300"
                                }`}
                              >
                                {u.role === ROLES.ADMIN
                                  ? "Admin"
                                  : u.role === ROLES.EDITOR
                                  ? "Editor"
                                  : u.role === ROLES.CONTRIBUTOR
                                  ? "Contributor"
                                  : "Customer"}
                              </span>
                            </td>
                            <td className="p-3.5 text-[#6a6660] text-[11px]">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-3.5 text-right">
                              {isCurrentAdmin ? (
                                <span className="text-[11px] text-[#c59b27] font-semibold flex items-center justify-end gap-1">
                                  <Lock className="w-3 h-3" />
                                  <span>Primary Lock</span>
                                </span>
                              ) : (
                                <div className="flex items-center justify-end gap-2">
                                  <select
                                    value={u.role || ROLES.USER}
                                    disabled={updatingUserId === u.id}
                                    onChange={(e) => handleChangeUserRole(u.id, e.target.value)}
                                    className="text-[11px] px-2 py-1 bg-[#faf8f5] border border-[#e6dfd5] rounded text-[#22623a] font-medium focus:outline-none focus:border-[#22623a]"
                                  >
                                    <option value={ROLES.USER}>Set as Customer</option>
                                    <option value={ROLES.EDITOR}>Set as Editor (Products)</option>
                                    <option value={ROLES.CONTRIBUTOR}>Set as Contributor (Inquiries)</option>
                                  </select>

                                  <button
                                    onClick={() => handleDeleteUser(u)}
                                    disabled={deletingUserId === u.id}
                                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded border border-red-200 disabled:opacity-50"
                                    title="Delete User"
                                  >
                                    {deletingUserId === u.id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Staff Member Modal (Admin Only) */}
      {isAddStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-2xl border border-[#e6dfd5] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#f4eee5] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#22623a]" />
                <h3 className="font-serif text-base font-bold text-[#22623a]">Add New Staff Member</h3>
              </div>
              <button
                onClick={() => setIsAddStaffModalOpen(false)}
                className="p-1 rounded-md text-[#6a6660] hover:text-[#1a1816] hover:bg-[#faf8f5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addStaffError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{addStaffError}</span>
              </div>
            )}

            {addStaffSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{addStaffSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#22623a]">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asad Qureshi"
                  value={newStaffForm.name}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#22623a]">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="staff@tameeresehat.com"
                  value={newStaffForm.email}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#22623a]">Initial Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  value={newStaffForm.password}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, password: e.target.value })}
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#22623a]">Staff Role *</label>
                <select
                  value={newStaffForm.role}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, role: e.target.value })}
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#22623a] font-semibold focus:outline-none focus:border-[#22623a]"
                >
                  <option value={ROLES.EDITOR}>Catalog Editor (Can create and update products)</option>
                  <option value={ROLES.CONTRIBUTOR}>Contributor (Can manage contact inquiries)</option>
                </select>
                <p className="text-[10px] text-[#6a6660]">
                  {newStaffForm.role === ROLES.EDITOR
                    ? "Editor permissions: Create, edit, and restock products. Cannot access patient consultations or financial orders."
                    : "Contributor permissions: View and respond to customer inquiries. Cannot modify catalog products or financial orders."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#22623a]">Phone (Optional)</label>
                  <input
                    type="text"
                    placeholder="0300-1234567"
                    value={newStaffForm.phone}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, phone: e.target.value })}
                    className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#22623a]">City (Optional)</label>
                  <input
                    type="text"
                    placeholder="Karachi"
                    value={newStaffForm.city}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, city: e.target.value })}
                    className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#f4eee5]">
                <button
                  type="button"
                  onClick={() => setIsAddStaffModalOpen(false)}
                  className="px-4 py-2 bg-[#faf8f5] hover:bg-[#e6dfd5] text-[#59534b] font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addStaffLoading}
                  className="px-5 py-2 bg-[#22623a] hover:bg-[#1b502e] text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  {addStaffLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Staff Account</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* Nuskha (Compounded Formulas) Modal */}
      <NuskhaFormModal
        isOpen={isNuskhaModalOpen}
        onClose={() => {
          setIsNuskhaModalOpen(false);
          setEditingNuskha(null);
        }}
        onSuccess={() => fetchData()}
        initialNuskha={editingNuskha}
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

      {/* Receive Stock Batch Modal */}
      <ReceiveStockModal
        isOpen={isReceiveStockOpen}
        onClose={() => {
          setIsReceiveStockOpen(false);
          setPreselectedProductSizeId(null);
        }}
        onSuccess={() => fetchData()}
        preselectedProductSizeId={preselectedProductSizeId}
      />

      {/* Adjust Stock Modal */}
      <AdjustStockModal
        isOpen={isAdjustStockOpen}
        onClose={() => {
          setIsAdjustStockOpen(false);
          setSelectedAdjustItem(null);
        }}
        onSuccess={() => fetchData()}
        productSizeItem={selectedAdjustItem}
      />

      {/* Stock Movements Audit Drawer */}
      <StockMovementsDrawer
        isOpen={isMovementsDrawerOpen}
        onClose={() => {
          setIsMovementsDrawerOpen(false);
          setSelectedMovementsItem(null);
        }}
        productSizeItem={selectedMovementsItem}
      />

      {/* Units Catalog Manager Modal */}
      <UnitsManagerModal
        isOpen={isUnitsModalOpen}
        onClose={() => setIsUnitsModalOpen(false)}
        onSuccess={() => fetchData()}
      />

      {/* Customer Ledger Statement Modal */}
      <CustomerLedgerModal
        isOpen={isCustomerLedgerOpen}
        onClose={() => {
          setIsCustomerLedgerOpen(false);
          setSelectedLedgerCustomer(null);
        }}
        customerIdentifier={selectedLedgerCustomer}
        onCollectPayment={(customer: any) => {
          setPaymentModalCustomer(customer);
          setPaymentModalMaxDue(customer?.currentBalance);
          setPaymentModalOrderId(null);
          setIsReceivePaymentOpen(true);
        }}
      />

      {/* Receive Customer Payment Modal */}
      <ReceivePaymentModal
        isOpen={isReceivePaymentOpen}
        onClose={() => {
          setIsReceivePaymentOpen(false);
          setPaymentModalCustomer(null);
          setPaymentModalOrderId(null);
          setPaymentModalMaxDue(undefined);
        }}
        onSuccess={() => fetchData()}
        customer={paymentModalCustomer}
        orderId={paymentModalOrderId}
        maxDue={paymentModalMaxDue}
      />

      {/* Vendor Profile Modal (Add/Edit) */}
      <VendorModal
        isOpen={isVendorModalOpen}
        onClose={() => {
          setIsVendorModalOpen(false);
          setEditingVendor(null);
        }}
        onSuccess={() => fetchData()}
        vendor={editingVendor}
      />

      {/* Inward Purchase Bill Modal */}
      <PurchaseBillModal
        isOpen={isPurchaseBillModalOpen}
        onClose={() => {
          setIsPurchaseBillModalOpen(false);
          setPurchaseBillVendorId(null);
        }}
        onSuccess={() => fetchData()}
        defaultVendorId={purchaseBillVendorId}
      />

      {/* Vendor Payment Voucher Modal */}
      <VendorPaymentModal
        isOpen={isVendorPaymentModalOpen}
        onClose={() => {
          setIsVendorPaymentModalOpen(false);
          setVendorPaymentTarget(null);
          setVendorPaymentPurchaseId(null);
          setVendorPaymentMaxDue(undefined);
        }}
        onSuccess={() => fetchData()}
        vendor={vendorPaymentTarget}
        purchaseId={vendorPaymentPurchaseId}
        maxDue={vendorPaymentMaxDue}
      />

      {/* Vendor Statement / Ledger Modal */}
      <VendorLedgerModal
        isOpen={isVendorLedgerOpen}
        onClose={() => {
          setIsVendorLedgerOpen(false);
          setSelectedVendorLedgerId(null);
        }}
        vendorId={selectedVendorLedgerId}
        onPayVendor={(vendor) => {
          setVendorPaymentTarget(vendor);
          setVendorPaymentPurchaseId(null);
          setVendorPaymentMaxDue(vendor.currentBalance);
          setIsVendorPaymentModalOpen(true);
        }}
        onNewBill={(vendorId) => {
          setPurchaseBillVendorId(vendorId);
          setIsPurchaseBillModalOpen(true);
        }}
      />

      {/* Quick Stock Restock Modal */}
      <QuickStockModal
        isOpen={isQuickStockOpen}
        onClose={() => {
          setIsQuickStockOpen(false);
          setSelectedQuickStockItem(null);
        }}
        onSuccess={() => fetchData()}
        productSizeItem={selectedQuickStockItem}
      />
    </div>
  );
}
