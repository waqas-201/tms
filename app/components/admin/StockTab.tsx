"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Search,
  Warehouse,
  Zap,
  Package,
  History,
  SlidersHorizontal,
  AlertTriangle,
  TrendingDown,
  ArrowDownRight,
  Filter,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  Layers,
  DollarSign,
} from "lucide-react";

interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  productUrduName?: string;
  productSlug: string;
  productImage?: string;
  categoryLabel: string;
  name: string;
  weight: string;
  price: number;
  originalPrice?: number | null;
  costPrice?: number | null;
  batchNumber?: string | null;
  expiryDate?: string | null;
  sku?: string | null;
  unitId?: string | null;
  unitCode?: string | null;
  unitName?: string | null;
  quantityValue?: number | null;
  stockOnHand: number;
  stockReserved: number;
  available: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  isActive: boolean;
}

interface InventorySummary {
  totalPacks: number;
  totalOnHand: number;
  totalReserved: number;
  totalAvailable: number;
  totalStockValuation: number;
  totalRetailValuation: number;
  lowStockCount: number;
  outOfStockCount: number;
}

interface StockTabProps {
  inventorySizes: InventoryItem[];
  inventorySummary: InventorySummary | null;
  loading: boolean;
  onRefresh: () => void;
  onOpenQuickStock: (item: InventoryItem) => void;
  onOpenReceiveStock: (preselectedId?: string) => void;
  onOpenAdjustStock: (item: InventoryItem) => void;
  onOpenMovements: (item?: InventoryItem | null) => void;
}

export default function StockTab({
  inventorySizes,
  inventorySummary,
  loading,
  onRefresh,
  onOpenQuickStock,
  onOpenReceiveStock,
  onOpenAdjustStock,
  onOpenMovements,
}: StockTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");

  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    inventorySizes.forEach((item) => {
      if (item.categoryLabel) set.add(item.categoryLabel);
    });
    return Array.from(set).sort();
  }, [inventorySizes]);

  const filteredItems = useMemo(() => {
    return inventorySizes.filter((item) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.productName.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.weight.toLowerCase().includes(q) ||
        (item.sku && item.sku.toLowerCase().includes(q));

      const matchesCategory =
        categoryFilter === "all" || item.categoryLabel === categoryFilter;

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" && item.isLowStock && item.available > 0) ||
        (stockFilter === "out" && item.available === 0);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [inventorySizes, searchTerm, categoryFilter, stockFilter]);

  const formatPkr = (value: number) =>
    `PKR ${Math.round(value).toLocaleString()}`;

  const getImage = (item: InventoryItem): string => {
    const img = item.productImage || "";
    if (img.startsWith("[")) {
      try {
        const parsed = JSON.parse(img);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      } catch {}
    }
    return img || "";
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      {inventorySummary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-line shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Total Packs
              </span>
              <Layers className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-serif font-bold text-ink">
              {inventorySummary.totalPacks}
            </p>
            <p className="text-[11px] text-ink-subtle mt-1">
              {inventorySummary.totalOnHand} units on hand
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-line shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Available
              </span>
              <CheckCircle2 className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-serif font-bold text-success">
              {inventorySummary.totalAvailable}
            </p>
            <p className="text-[11px] text-ink-subtle mt-1">
              {inventorySummary.totalReserved} reserved for orders
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-warning-line/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-warning">
                Low Stock
              </span>
              <AlertTriangle className="w-4 h-4 text-warning" />
            </div>
            <p className="text-2xl font-serif font-bold text-warning">
              {inventorySummary.lowStockCount}
            </p>
            <p className="text-[11px] text-warning/70 mt-1">
              {inventorySummary.outOfStockCount} completely out of stock
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-line shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Stock Value
              </span>
              <DollarSign className="w-4 h-4 text-secondary-text" />
            </div>
            <p className="text-xl font-serif font-bold text-ink">
              {formatPkr(inventorySummary.totalStockValuation)}
            </p>
            <p className="text-[11px] text-ink-subtle mt-1">
              Retail: {formatPkr(inventorySummary.totalRetailValuation)}
            </p>
          </div>
        </div>
      )}

      {/* Filters & Actions */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-line shadow-xs">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <input
              type="text"
              placeholder="Search by product, pack, SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-surface border border-line rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary focus:bg-white transition-all text-ink placeholder:text-ink-subtle"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="min-w-[160px] py-2 pl-3 pr-8 text-sm bg-surface border border-line rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="min-w-[140px] py-2 pl-3 pr-8 text-sm bg-surface border border-line rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
          >
            <option value="all">All Stock Levels</option>
            <option value="low">Low Stock Only</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <button
            onClick={() => onOpenReceiveStock()}
            className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-primary text-primary hover:bg-surface rounded-xl text-sm font-semibold transition-all"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Receive Stock</span>
          </button>
          <button
            onClick={() => onOpenMovements(null)}
            className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-line text-neutral-700 hover:bg-surface rounded-xl text-sm font-semibold transition-all"
          >
            <History className="w-4 h-4" />
            <span>Ledger</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-line shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-line bg-surface flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Warehouse className="w-4 h-4 text-primary" />
            <h2 className="font-serif text-base font-bold text-primary">
              Live Inventory ({filteredItems.length})
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-ink-muted">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading live stock levels...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-16 text-center">
            <Warehouse className="w-12 h-12 text-secondary-text mx-auto mb-3 opacity-60" />
            <h3 className="font-serif text-lg font-bold text-primary mb-1">
              No inventory items found
            </h3>
            <p className="text-sm text-ink-muted max-w-md mx-auto">
              {searchTerm || categoryFilter !== "all" || stockFilter !== "all"
                ? "No pack variants match your current filters."
                : "Create products with pack sizes to start tracking inventory."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line bg-surface/60 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  <th className="py-3.5 px-4 sm:px-6">Product / Pack</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4 text-right">On Hand</th>
                  <th className="py-3.5 px-4 text-right">Reserved</th>
                  <th className="py-3.5 px-4 text-right">Available</th>
                  <th className="py-3.5 px-4">Unit Cost</th>
                  <th className="py-3.5 px-4">Retail</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-sm">
                {filteredItems.map((item) => {
                  const imgUrl = getImage(item);
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-surface/60 transition-colors ${
                        item.available === 0
                          ? "bg-danger-soft/40"
                          : item.isLowStock
                          ? "bg-warning-soft/40"
                          : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-line/40 shrink-0 border border-line">
                            {imgUrl ? (
                              <Image
                                src={imgUrl}
                                alt={item.productName}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-ink-subtle">
                                <Package className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-ink leading-tight">
                              {item.productName}
                            </div>
                            <div className="text-xs text-ink-muted mt-0.5">
                              {item.weight || item.name}
                              {item.unitName ? ` · ${item.unitName}` : ""}
                              {item.batchNumber ? ` · ${item.batchNumber}` : ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] text-ink-subtle">
                          {item.sku || "—"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-ink">
                        {item.stockOnHand}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-ink-subtle">
                        {item.stockReserved}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-mono font-bold ${
                            item.available === 0
                              ? "text-danger"
                              : item.isLowStock
                              ? "text-warning"
                              : "text-success"
                          }`}
                        >
                          {item.available}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-sm text-neutral-700">
                        {item.costPrice
                          ? `PKR ${item.costPrice.toLocaleString()}`
                          : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-sm font-medium text-ink">
                        PKR {item.price.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        {item.available === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-danger-soft text-danger">
                            <TrendingDown className="w-3 h-3" />
                            OUT
                          </span>
                        ) : item.isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning-soft text-warning">
                            <AlertTriangle className="w-3 h-3" />
                            LOW
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-soft text-success">
                            <CheckCircle2 className="w-3 h-3" />
                            OK
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenQuickStock(item)}
                            className="p-1.5 rounded-lg text-secondary-text hover:bg-warning-soft transition-colors"
                            title="Quick Restock"
                          >
                            <Zap className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenReceiveStock(item.id)}
                            className="p-1.5 rounded-lg text-primary hover:bg-surface transition-colors"
                            title="Receive Stock"
                          >
                            <ArrowDownRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenAdjustStock(item)}
                            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface transition-colors"
                            title="Adjust / Audit"
                          >
                            <SlidersHorizontal className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenMovements(item)}
                            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface transition-colors"
                            title="Movement History"
                          >
                            <History className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
