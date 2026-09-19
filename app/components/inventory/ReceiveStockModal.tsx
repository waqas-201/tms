"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Loader2, AlertCircle, Check, Package, Warehouse } from "lucide-react";

interface ReceiveStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedProductSizeId?: string | null;
}

export default function ReceiveStockModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedProductSizeId,
}: ReceiveStockModalProps) {
  const [inventoryList, setInventoryList] = useState<any[]>([]);
  const [selectedSizeId, setSelectedSizeId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("10");
  const [reason, setReason] = useState<string>("Fresh clinic batch reception");
  const [loading, setLoading] = useState(false);
  const [fetchingList, setFetchingList] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadInventory() {
      if (!isOpen) return;
      setFetchingList(true);
      setError(null);
      setSuccessMsg(null);
      try {
        const res = await fetch("/api/admin/inventory");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setInventoryList(data.data);
            if (preselectedProductSizeId) {
              setSelectedSizeId(preselectedProductSizeId);
            } else if (data.data.length > 0 && !selectedSizeId) {
              setSelectedSizeId(data.data[0].id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load inventory for receive modal:", err);
      } finally {
        setFetchingList(false);
      }
    }

    loadInventory();
  }, [isOpen, preselectedProductSizeId]);

  if (!isOpen) return null;

  const currentVariant = inventoryList.find((item) => item.id === selectedSizeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const numQty = Number(quantity);
    if (!selectedSizeId) {
      setError("Please select a product packaging variant.");
      return;
    }
    if (isNaN(numQty) || numQty <= 0) {
      setError("Quantity must be a positive integer greater than 0.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/inventory/receive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSizeId: selectedSizeId,
          quantity: Math.floor(numQty),
          reason: reason.trim() || "Batch stock reception",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to receive stock.");
      }

      setSuccessMsg(data.message || `Successfully received +${numQty} units.`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#22623a]/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#e6dfd5] overflow-hidden my-auto animate-fade-in flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e6dfd5] bg-[#faf8f5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#22623a] text-[#c59b27] flex items-center justify-center">
              <Warehouse className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-[#22623a]">
                Receive Stock Batch
              </h2>
              <p className="text-[11px] text-[#6a6660]">
                Add units directly to active stock. Immediately live on website.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#6a6660] hover:text-[#22623a] hover:bg-[#e6dfd5]/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2 font-semibold">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Product Variant Select */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#1a1816]">
              Select Product & Variant <span className="text-red-500">*</span>
            </label>
            {fetchingList ? (
              <div className="flex items-center gap-2 p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#6a6660]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Loading available catalog items...</span>
              </div>
            ) : (
              <select
                value={selectedSizeId}
                onChange={(e) => setSelectedSizeId(e.target.value)}
                className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] font-medium focus:outline-none focus:border-[#22623a]"
              >
                {inventoryList.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.productName} — {item.name} ({item.weight}) [₨ {item.price.toLocaleString()}] (Current Live: {item.available})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Current Stock Snapshot Card */}
          {currentVariant && (
            <div className="p-3 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[10px] text-[#6a6660] uppercase block">Physical On Hand</span>
                <span className="text-sm font-bold text-[#22623a]">{currentVariant.stockOnHand}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6a6660] uppercase block">Reserved Orders</span>
                <span className="text-sm font-bold text-[#c59b27]">{currentVariant.stockReserved}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6a6660] uppercase block">Live Available</span>
                <span className="text-sm font-bold text-[#2d7648]">{currentVariant.available}</span>
              </div>
            </div>
          )}

          {/* Quantity Input */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#1a1816]">
              Quantity Received (+ Units) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 20"
                className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] font-bold text-sm focus:outline-none focus:border-[#22623a]"
              />
              <span className="absolute right-3 top-2.5 text-xs text-[#6a6660] font-medium">
                Packs
              </span>
            </div>
            {currentVariant && Number(quantity) > 0 && (
              <p className="text-[11px] text-[#2d7648]">
                New available stock will be: <strong>{currentVariant.available + Number(quantity)}</strong> units.
              </p>
            )}
          </div>

          {/* Reason / Reference Note */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#1a1816]">
              Reason / Batch Reference Note
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Fresh batch from Lahore facility, Po #892"
              className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a]"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e6dfd5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#faf8f5] hover:bg-[#e6dfd5] text-[#59534b] font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || fetchingList || !selectedSizeId}
              className="px-5 py-2 bg-[#22623a] hover:bg-[#1b502e] text-white font-semibold rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Receiving Stock...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Receive +{quantity} Units</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
