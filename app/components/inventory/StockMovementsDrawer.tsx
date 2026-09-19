"use client";

import React, { useState, useEffect } from "react";
import { X, History, Loader2, ArrowDownRight, ArrowUpRight, ShoppingCart, RefreshCw, Undo2, SlidersHorizontal, AlertCircle } from "lucide-react";

interface StockMovementsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  productSizeItem: any | null;
}

export default function StockMovementsDrawer({
  isOpen,
  onClose,
  productSizeItem,
}: StockMovementsDrawerProps) {
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMovements = async () => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    try {
      const url = productSizeItem
        ? `/api/admin/inventory/movements?productSizeId=${productSizeItem.id}&limit=50`
        : `/api/admin/inventory/movements?limit=50`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setMovements(data.data);
        }
      } else {
        setError("Failed to fetch stock movements ledger.");
      }
    } catch (err: any) {
      setError(err?.message || "Error connecting to stock ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [isOpen, productSizeItem]);

  if (!isOpen) return null;

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "RECEIVE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            <ArrowDownRight className="w-3 h-3 text-emerald-600" />
            <span>RECEIVE</span>
          </span>
        );
      case "SALE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
            <ShoppingCart className="w-3 h-3 text-blue-600" />
            <span>DISPATCHED SALE</span>
          </span>
        );
      case "RESERVE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
            <ArrowUpRight className="w-3 h-3 text-amber-600" />
            <span>RESERVE</span>
          </span>
        );
      case "RELEASE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
            <Undo2 className="w-3 h-3 text-purple-600" />
            <span>RELEASE</span>
          </span>
        );
      case "ADJUST":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
            <SlidersHorizontal className="w-3 h-3 text-rose-600" />
            <span>ADJUST</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-800">
            {type}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#22623a]/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Slide-over Drawer */}
      <div className="relative w-full max-w-2xl bg-white shadow-2xl border-l border-[#e6dfd5] h-full flex flex-col z-10 animate-fade-in">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-[#e6dfd5] bg-[#faf8f5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#22623a] text-[#c59b27] flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-[#22623a]">
                Stock Audit Ledger
              </h2>
              <p className="text-[11px] text-[#6a6660]">
                {productSizeItem
                  ? `${productSizeItem.productName} (${productSizeItem.name} ${productSizeItem.weight})`
                  : "All recent inventory ledger movements"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchMovements}
              className="p-1.5 rounded-md text-[#6a6660] hover:text-[#22623a] hover:bg-[#e6dfd5]/50 transition-colors"
              title="Refresh ledger"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-[#6a6660] hover:text-[#22623a] hover:bg-[#e6dfd5]/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-2 text-[#6a6660]">
              <Loader2 className="w-6 h-6 animate-spin text-[#22623a]" />
              <p className="text-xs">Loading ledger entries...</p>
            </div>
          ) : movements.length === 0 ? (
            <div className="py-20 text-center text-[#6a6660] space-y-2">
              <History className="w-10 h-10 mx-auto text-[#c59b27] opacity-60" />
              <p className="text-sm font-semibold text-[#22623a]">No movements recorded yet</p>
              <p className="text-xs">Stock receptions, customer orders, and adjustments will show here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {movements.map((m) => {
                const dateStr = new Date(m.createdAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={m.id}
                    className="p-3.5 bg-[#faf8f5] rounded-xl border border-[#e6dfd5] text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeBadge(m.type)}
                        <span className="font-bold text-[#1a1816]">
                          {m.quantity > 0 ? `+${m.quantity}` : m.quantity} units
                        </span>
                      </div>
                      <span className="text-[11px] text-[#6a6660]">{dateStr}</span>
                    </div>

                    {!productSizeItem && (
                      <p className="font-semibold text-[#22623a]">
                        {m.productName} · <span className="text-[#6a6660]">{m.packName} ({m.packWeight})</span>
                      </p>
                    )}

                    {m.reason && (
                      <p className="text-[#59534b] text-[11px] italic">
                        "{m.reason}"
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1.5 border-t border-[#e6dfd5] text-[11px] text-[#6a6660]">
                      <span>On-Hand After: <strong className="text-[#22623a]">{m.onHandAfter}</strong></span>
                      <span>Reserved After: <strong className="text-[#c59b27]">{m.reservedAfter}</strong></span>
                      <span>Live Available: <strong className="text-[#2d7648]">{m.availableAfter}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
