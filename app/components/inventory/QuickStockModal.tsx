"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Loader2,
  AlertCircle,
  Check,
  Zap,
  Calendar,
  DollarSign,
  PackageCheck,
  Building2,
} from "lucide-react";

interface QuickStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productSizeItem?: any | null;
}

const RESTOCK_CHIPS = [10, 25, 50, 100, 250];

export default function QuickStockModal({
  isOpen,
  onClose,
  onSuccess,
  productSizeItem,
}: QuickStockModalProps) {
  const [quantity, setQuantity] = useState<number>(25);
  const [unitCost, setUnitCost] = useState<string>("");
  const [batchNumber, setBatchNumber] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [reason, setReason] = useState<string>("Quick restock reception");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && productSizeItem) {
      setQuantity(25);
      setUnitCost(
        productSizeItem.costPrice ? String(productSizeItem.costPrice) : ""
      );
      setBatchNumber(
        `B-${new Date().getFullYear()}${(new Date().getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${Math.floor(100 + Math.random() * 900)}`
      );
      // Default expiry: 2 years from now for herbal products
      const exp = new Date();
      exp.setFullYear(exp.getFullYear() + 2);
      setExpiryDate(exp.toISOString().split("T")[0]);
      setReason("Direct clinic quick restock");
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, productSizeItem]);

  if (!isOpen || !productSizeItem) return null;

  const currentOnHand = productSizeItem.stockOnHand || 0;
  const currentAvailable = productSizeItem.available || 0;
  const effectiveCost = Number(unitCost) || (productSizeItem.costPrice || productSizeItem.price * 0.55);
  const totalBatchCost = quantity * effectiveCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (quantity <= 0) {
      setError("Please specify a restock quantity greater than 0.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/inventory/receive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSizeId: productSizeItem.id,
          quantity: Math.floor(quantity),
          unitCost: unitCost ? Number(unitCost) : undefined,
          batchNumber: batchNumber.trim() || undefined,
          expiryDate: expiryDate ? expiryDate : undefined,
          reason: reason.trim() || "Quick restock reception",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to restock inventory.");
      }

      setSuccessMsg(data.message || `Successfully restocked +${quantity} units!`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while restocking.");
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
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#e6dfd5] bg-[#faf8f5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#22623a] text-[#c59b27] flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-[#22623a]">
                Quick 1-Click Restock
              </h2>
              <p className="text-[11px] text-[#6a6660]">
                Rapidly replenish inventory, record batch details & unit cost.
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

        {/* Modal Body */}
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

          {/* Product Variant Details Card */}
          <div className="p-3.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-[#22623a] text-sm">
                  {productSizeItem.productName}
                </h4>
                <p className="text-[#6a6660]">
                  {productSizeItem.name} ({productSizeItem.weight}) · {productSizeItem.categoryLabel || "Unani Product"}
                </p>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#2d7648] text-sm block">
                  ₨ {productSizeItem.price?.toLocaleString()}
                </span>
                <span className="text-[10px] text-[#6a6660]">Selling Price</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#e6dfd5] text-center">
              <div>
                <span className="text-[10px] text-[#6a6660] uppercase block">
                  Current On Hand
                </span>
                <span className="text-sm font-bold text-[#22623a]">{currentOnHand} units</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6a6660] uppercase block">
                  After Restock
                </span>
                <span className="text-sm font-bold text-[#2d7648]">
                  {currentOnHand + quantity} units
                </span>
              </div>
            </div>
          </div>

          {/* Quick Restock Amount Selector */}
          <div className="space-y-2">
            <label className="font-semibold text-[#1a1816] flex items-center justify-between">
              <span>Select Quantity to Add (+ Units)</span>
              <span className="text-[#c59b27] font-bold">+{quantity} units</span>
            </label>

            {/* Quick Chips */}
            <div className="grid grid-cols-5 gap-1.5">
              {RESTOCK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setQuantity(chip)}
                  className={`py-2 rounded-lg font-bold text-xs border transition-all ${
                    quantity === chip
                      ? "bg-[#22623a] text-white border-[#22623a] shadow-xs"
                      : "bg-[#faf8f5] text-[#22623a] border-[#e6dfd5] hover:bg-[#e6dfd5]"
                  }`}
                >
                  +{chip}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="pt-1">
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                placeholder="Custom amount..."
                className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] font-bold text-sm focus:outline-none focus:border-[#22623a]"
              />
            </div>
          </div>

          {/* Batch & Cost Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="font-semibold text-[#1a1816] flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>Unit Cost Price (PKR)</span>
              </label>
              <input
                type="number"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                placeholder="e.g. 600"
                className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1a1816] flex items-center gap-1">
                <PackageCheck className="w-3.5 h-3.5 text-[#22623a]" />
                <span>Batch / Lot Number</span>
              </label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="e.g. B-202609-102"
                className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] font-mono text-[11px] focus:outline-none focus:border-[#22623a]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1a1816] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#6a6660]" />
                <span>Expiry Date</span>
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1a1816]">Total Batch Valuation</label>
              <div className="p-2.5 bg-[#f4eee5] border border-[#e6dfd5] rounded-lg font-bold text-[#22623a] flex items-center justify-between">
                <span>₨ {totalBatchCost.toLocaleString()}</span>
                <span className="text-[10px] font-normal text-[#6a6660]">Asset Added</span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
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
              disabled={loading || quantity <= 0}
              className="px-5 py-2 bg-[#22623a] hover:bg-[#1b502e] text-white font-semibold rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Restocking...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Confirm +{quantity} Units</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
