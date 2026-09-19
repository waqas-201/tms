"use client";

import React, { useState, useEffect } from "react";
import { X, SlidersHorizontal, Loader2, AlertCircle, Check, Scale } from "lucide-react";

interface AdjustStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productSizeItem: any | null;
}

export default function AdjustStockModal({
  isOpen,
  onClose,
  onSuccess,
  productSizeItem,
}: AdjustStockModalProps) {
  const [adjustmentType, setAdjustmentType] = useState<"increase" | "decrease">("decrease");
  const [quantity, setQuantity] = useState<string>("1");
  const [reason, setReason] = useState<string>("Audit correction / damage");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuantity("1");
      setReason("Inventory audit recount / damage");
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, productSizeItem]);

  if (!isOpen || !productSizeItem) return null;

  const currentOnHand = productSizeItem.stockOnHand || 0;
  const currentReserved = productSizeItem.stockReserved || 0;
  const currentAvailable = productSizeItem.available || 0;

  const numQty = Number(quantity) || 0;
  const signedQty = adjustmentType === "increase" ? numQty : -numQty;
  const projectedOnHand = currentOnHand + signedQty;
  const projectedAvailable = Math.max(0, projectedOnHand - currentReserved);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (numQty <= 0) {
      setError("Adjustment quantity must be greater than 0.");
      return;
    }

    if (projectedOnHand < 0) {
      setError(`Cannot reduce physical stock below 0. Current on hand is ${currentOnHand}.`);
      return;
    }

    if (projectedOnHand < currentReserved) {
      setError(
        `Cannot reduce stock below active reserved customer orders (${currentReserved} units reserved).`
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSizeId: productSizeItem.id,
          quantity: signedQty,
          reason: reason.trim() || "Manual inventory adjustment",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to adjust stock.");
      }

      setSuccessMsg(data.message || `Successfully adjusted stock.`);
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
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-[#22623a]">
                Adjust Inventory Stock
              </h2>
              <p className="text-[11px] text-[#6a6660]">
                Record physical recount, damaged jars, or shrinkage.
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

          {/* Target Variant Info Box */}
          <div className="p-3.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-[#22623a] text-sm">{productSizeItem.productName}</h4>
                <p className="text-[#6a6660]">
                  {productSizeItem.name} ({productSizeItem.weight}) · SKU: {productSizeItem.sku || "N/A"}
                </p>
              </div>
              <span className="font-bold text-[#2d7648] text-sm">
                ₨ {productSizeItem.price?.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#e6dfd5] text-center">
              <div>
                <span className="text-[10px] text-[#6a6660] uppercase block">Physical On Hand</span>
                <span className="text-sm font-bold text-[#22623a]">{currentOnHand}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6a6660] uppercase block">Reserved Orders</span>
                <span className="text-sm font-bold text-[#c59b27]">{currentReserved}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6a6660] uppercase block">Live Available</span>
                <span className="text-sm font-bold text-[#2d7648]">{currentAvailable}</span>
              </div>
            </div>
          </div>

          {/* Increase / Decrease Toggle */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#1a1816]">Adjustment Direction</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustmentType("decrease")}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  adjustmentType === "decrease"
                    ? "bg-red-50 border-red-300 text-red-700"
                    : "bg-white border-[#e6dfd5] text-[#6a6660] hover:bg-[#faf8f5]"
                }`}
              >
                <span>− Deduct (Damage / Shrinkage)</span>
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType("increase")}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  adjustmentType === "increase"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                    : "bg-white border-[#e6dfd5] text-[#6a6660] hover:bg-[#faf8f5]"
                }`}
              >
                <span>+ Add (Found / Recount)</span>
              </button>
            </div>
          </div>

          {/* Adjustment Quantity Input */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#1a1816]">
              Quantity to {adjustmentType === "increase" ? "Add" : "Deduct"} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 2"
              className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] font-bold text-sm focus:outline-none focus:border-[#22623a]"
            />
            <div className="p-2 bg-blue-50/70 border border-blue-200/60 rounded-lg text-[11px] text-blue-900 flex justify-between">
              <span>Projected physical on hand: <strong>{projectedOnHand}</strong></span>
              <span>Projected live available: <strong>{projectedAvailable}</strong></span>
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#1a1816]">
              Reason / Audit Note <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Damaged seal during packaging, Annual physical audit count"
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
              disabled={loading || numQty <= 0 || projectedOnHand < 0}
              className={`px-5 py-2 text-white font-semibold rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 ${
                adjustmentType === "decrease"
                  ? "bg-red-700 hover:bg-red-800"
                  : "bg-[#22623a] hover:bg-[#1b502e]"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Adjustment...</span>
                </>
              ) : (
                <>
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Apply {adjustmentType === "decrease" ? `-${numQty}` : `+${numQty}`} Units</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
