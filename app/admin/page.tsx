"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import {
  Package,
  Warehouse,
  Scale,
  FolderTree,
  RefreshCw,
  LogOut,
  Loader2,
  ShieldAlert,
  Leaf,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Activity,
  CalendarCheck,
  Droplets,
  ShoppingBag,
} from "lucide-react";
import ProductFormModal from "@/app/components/ProductFormModal";
import ReceiveStockModal from "@/app/components/inventory/ReceiveStockModal";
import AdjustStockModal from "@/app/components/inventory/AdjustStockModal";
import StockMovementsDrawer from "@/app/components/inventory/StockMovementsDrawer";
import QuickStockModal from "@/app/components/inventory/QuickStockModal";
import ProductsTab from "@/app/components/admin/ProductsTab";
import StockTab from "@/app/components/admin/StockTab";
import UnitsTab from "@/app/components/admin/UnitsTab";
import CategoriesTab from "@/app/components/admin/CategoriesTab";
import ConsultationsTab from "@/app/components/admin/ConsultationsTab";
import ClinicScheduleTab from "@/app/components/admin/ClinicScheduleTab";
import HijamaTab from "@/app/components/admin/HijamaTab";
import OrdersTab from "@/app/components/admin/OrdersTab";
import NotificationBell from "@/app/components/admin/NotificationBell";
import { ROLES, isStaffRole } from "@/lib/rbac-base";

type AdminTab =
  | "orders"
  | "products"
  | "inventory"
  | "categories"
  | "units"
  | "consultations"
  | "schedule"
  | "hijama";

const TABS: { id: AdminTab; label: string; icon: typeof Package }[] = [
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "products", label: "Products", icon: Package },
  { id: "inventory", label: "Stock", icon: Warehouse },
  { id: "consultations", label: "Consultations & Rx", icon: Activity },
  { id: "hijama", label: "Hijama Cupping", icon: Droplets },
  { id: "schedule", label: "Clinic Schedule", icon: CalendarCheck },
  { id: "categories", label: "Categories", icon: FolderTree },
  { id: "units", label: "Units", icon: Scale },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: sessionData, isPending: sessionLoading } = useSession();

  const userRole = (sessionData?.user as any)?.role || "user";
  const isStaff = isStaffRole(userRole);

  const tabFromUrl = searchParams.get("tab") as AdminTab | null;
  const initialTab: AdminTab =
    tabFromUrl && TABS.some((t) => t.id === tabFromUrl) ? tabFromUrl : "products";

  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [products, setProducts] = useState<any[]>([]);
  const [inventorySizes, setInventorySizes] = useState<any[]>([]);
  const [inventorySummary, setInventorySummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Product modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Inventory modals
  const [isReceiveStockOpen, setIsReceiveStockOpen] = useState(false);
  const [preselectedProductSizeId, setPreselectedProductSizeId] = useState<string | null>(null);
  const [isAdjustStockOpen, setIsAdjustStockOpen] = useState(false);
  const [selectedAdjustItem, setSelectedAdjustItem] = useState<any | null>(null);
  const [isMovementsDrawerOpen, setIsMovementsDrawerOpen] = useState(false);
  const [selectedMovementsItem, setSelectedMovementsItem] = useState<any | null>(null);
  const [isQuickStockOpen, setIsQuickStockOpen] = useState(false);
  const [selectedQuickStockItem, setSelectedQuickStockItem] = useState<any | null>(null);

  const setTab = (tab: AdminTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/admin?${params.toString()}`, { scroll: false });
  };

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [prodRes, invRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/admin/inventory"),
      ]);

      if (prodRes.ok) {
        const d = await prodRes.json();
        if (d.success) setProducts(d.data || []);
      }
      if (invRes.ok) {
        const d = await invRes.json();
        if (d.success) {
          setInventorySizes(d.data || []);
          setInventorySummary(d.summary || null);
        }
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!sessionLoading && sessionData && isStaff) {
      fetchData();
    }
  }, [sessionLoading, sessionData, isStaff, fetchData]);

  useEffect(() => {
    if (tabFromUrl && TABS.some((t) => t.id === tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl, activeTab]);

  // Auth gates
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-primary">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-medium">Checking session...</p>
        </div>
      </div>
    );
  }

  if (!sessionData || !isStaff) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-line p-8 text-center shadow-xs">
          <ShieldAlert className="w-10 h-10 text-danger mx-auto mb-3" />
          <h1 className="font-serif text-xl font-bold text-primary mb-2">
            Staff access required
          </h1>
          <p className="text-sm text-ink-muted mb-5">
            This dashboard is restricted to Tameer-e-Sehat staff. Please sign in with an authorised account.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-brand-green-800 transition-all"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const userName = sessionData.user?.name || sessionData.user?.email || "Staff";

  return (
    <div className="min-h-screen bg-surface">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary text-brand-gold-300 flex items-center justify-center shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-serif text-base sm:text-lg font-bold text-primary truncate">
                Tameer-e-Sehat Admin
              </h1>
              <p className="text-[11px] text-ink-muted truncate">
                Catalog, stock & units · {userName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-surface border border-line transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push("/login") } })}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-danger hover:bg-danger-soft border border-danger/20 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-ink-muted hover:text-primary hover:border-line"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Compact summary strip */}
        {inventorySummary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-line px-4 py-3 flex items-center gap-3">
              <Package className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-ink-muted">
                  Products
                </p>
                <p className="text-lg font-serif font-bold text-ink">{products.length}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-line px-4 py-3 flex items-center gap-3">
              <Layers className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-ink-muted">
                  Packs on hand
                </p>
                <p className="text-lg font-serif font-bold text-ink">
                  {inventorySummary.totalOnHand}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-warning-line px-4 py-3 flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-warning">
                  Low stock
                </p>
                <p className="text-lg font-serif font-bold text-warning">
                  {inventorySummary.lowStockCount}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-line px-4 py-3 flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-ink-muted">
                  Available
                </p>
                <p className="text-lg font-serif font-bold text-success">
                  {inventorySummary.totalAvailable}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && <OrdersTab />}

        {activeTab === "products" && (
          <ProductsTab
            products={products}
            loading={loading}
            onRefresh={() => fetchData(true)}
            onOpenCreateModal={() => {
              setEditingProduct(null);
              setIsProductModalOpen(true);
            }}
            onOpenEditModal={(product) => {
              setEditingProduct(product);
              setIsProductModalOpen(true);
            }}
          />
        )}

        {activeTab === "inventory" && (
          <StockTab
            inventorySizes={inventorySizes}
            inventorySummary={inventorySummary}
            loading={loading}
            onRefresh={() => fetchData(true)}
            onOpenQuickStock={(item) => {
              setSelectedQuickStockItem(item);
              setIsQuickStockOpen(true);
            }}
            onOpenReceiveStock={(preselectedId) => {
              setPreselectedProductSizeId(preselectedId || null);
              setIsReceiveStockOpen(true);
            }}
            onOpenAdjustStock={(item) => {
              setSelectedAdjustItem(item);
              setIsAdjustStockOpen(true);
            }}
            onOpenMovements={(item) => {
              setSelectedMovementsItem(item || null);
              setIsMovementsDrawerOpen(true);
            }}
          />
        )}

        {activeTab === "categories" && <CategoriesTab />}

        {activeTab === "units" && <UnitsTab />}

        {activeTab === "consultations" && <ConsultationsTab />}

        {activeTab === "hijama" && <HijamaTab />}

        {activeTab === "schedule" && <ClinicScheduleTab />}
      </main>

      {/* Modals */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
          fetchData(true);
        }}
        initialProduct={editingProduct}
      />

      <ReceiveStockModal
        isOpen={isReceiveStockOpen}
        onClose={() => {
          setIsReceiveStockOpen(false);
          setPreselectedProductSizeId(null);
        }}
        onSuccess={() => fetchData(true)}
        preselectedProductSizeId={preselectedProductSizeId}
      />

      <AdjustStockModal
        isOpen={isAdjustStockOpen}
        onClose={() => {
          setIsAdjustStockOpen(false);
          setSelectedAdjustItem(null);
        }}
        onSuccess={() => fetchData(true)}
        productSizeItem={selectedAdjustItem}
      />

      <StockMovementsDrawer
        isOpen={isMovementsDrawerOpen}
        onClose={() => {
          setIsMovementsDrawerOpen(false);
          setSelectedMovementsItem(null);
        }}
        productSizeItem={selectedMovementsItem}
      />

      <QuickStockModal
        isOpen={isQuickStockOpen}
        onClose={() => {
          setIsQuickStockOpen(false);
          setSelectedQuickStockItem(null);
        }}
        onSuccess={() => fetchData(true)}
        productSizeItem={selectedQuickStockItem}
      />
    </div>
  );
}
