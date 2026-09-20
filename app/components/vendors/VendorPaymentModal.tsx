"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  DollarSign,
  Building2,
  Loader2,
  AlertCircle,
  Check,
  CreditCard,
  FileText,
} from "lucide-react";

interface VendorPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vendor?: any | null;
  purchaseId?: string | null;
  maxDue?: number;
}

const PAYMENT_METHODS = [
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CASH", label: "Cash" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "JAZZCASH", label: "JazzCash" },
  { value: "EASYPAISA", label: "EasyPaisa" },
];

export default function VendorPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  vendor,
  purchaseId,
  maxDue,
}: VendorPaymentModalProps) {
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("BANK_TRANSFER");
  const [reference, setReference] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (vendor?.id) {
        setSelectedVendorId(vendor.id);
      } else {
        fetchVendors();
      }
      setAmount(maxDue != null && maxDue > 0 ? String(maxDue) : "");
      setPaymentMethod("BANK_TRANSFER");
      setReference("");
      setNotes("");
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, vendor, maxDue]);

  const fetchVendors = async () => {
    try {
      const res = await fetch("/api/admin/vendors");
      const data = await res.json();
      if (data.success && data.data) {
        setVendors(data.data);
        if (data.data.length > 0 && !selectedVendorId) {
          setSelectedVendorId(data.data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load vendors:", err);
    }
  };

  if (!isOpen) return null;

  const numAmount = Number(amount) || 0;
  const activeVendor = vendor || vendors.find((v) => v.id === selectedVendorId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const vendorTargetId = vendor?.id || selectedVendorId;
    if (!vendorTargetId) {
      setError("Please select a vendor.");
      return;
    }

    if (numAmount <= 0) {
      setError("Payment amount must be greater than zero.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/vendors/${vendorTargetId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchaseId: purchaseId || undefined,
          amount: numAmount,
          paymentMethod,
          paymentDate: paymentDate ? new Date(paymentDate) : undefined,
          reference: reference.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to record vendor payment.");
      }

      setSuccessMsg(`Payment of ₨ ${numAmount.toLocaleString()} recorded successfully.`);
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

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#e6dfd5] overflow-hidden my-auto animate-fade-in flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e6dfd5] bg-[#faf8f5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#22623a] text-[#c59b27] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-[#22623a]">
                Vendor Payment Voucher
              </h2>
              <p className="text-[11px] text-[#6a6660]">
                Record debit payment disbursement to supplier and clear payable balance.
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

          {/* Vendor Picker / Details Card */}
          {vendor ? (
            <div className="p-3.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl space-y-1">
              <span className="text-[10px] text-[#c59b27] uppercase font-bold tracking-wider block">
                Disbursing Payment To:
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#22623a]">
                    {vendor.name} {vendor.company ? `(${vendor.company})` : ""}
                  </h4>
                  <p className="text-[#6a6660] text-[11px]">{vendor.phone || "No phone recorded"}</p>
                </div>
                {vendor.currentBalance != null && (
                  <div className="text-right">
                    <span className="text-[10px] text-[#6a6660] block">Current Payable:</span>
                    <span className="font-bold text-sm text-amber-800">
                      ₨ {vendor.currentBalance.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="font-semibold text-[#1a1816] flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#22623a]" />
                <span>Select Vendor *</span>
              </label>
              <select
                required
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                className="w-full p-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg font-semibold text-[#1a1816] focus:outline-none focus:border-[#22623a]"
              >
                <option value="">-- Choose Vendor --</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} {v.company ? `(${v.company})` : ""} [Payable: ₨{" "}
                    {(v.currentBalance || 0).toLocaleString()}]
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Payment Amount */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#1a1816] flex items-center justify-between">
              <span>Payment Amount (PKR) *</span>
              {numAmount > 0 && (
                <span className="text-[#2d7648] font-bold">
                  ₨ {numAmount.toLocaleString()}
                </span>
              )}
            </label>
            <input
              type="number"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount paid to vendor..."
              className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] font-bold text-sm focus:outline-none focus:border-[#22623a]"
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#1a1816] flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-[#22623a]" />
              <span>Payment Mode *</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  key={pm.value}
                  type="button"
                  onClick={() => setPaymentMethod(pm.value)}
                  className={`py-2 px-1 rounded-lg text-[10px] font-bold border transition-all ${
                    paymentMethod === pm.value
                      ? "bg-[#22623a] text-white border-[#22623a]"
                      : "bg-[#faf8f5] text-[#22623a] border-[#e6dfd5] hover:bg-[#e6dfd5]"
                  }`}
                >
                  {pm.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reference & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-[#1a1816]">
                Cheque / Online Txn # (Optional)
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. HBL-98124"
                className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] font-mono text-[11px] focus:outline-none focus:border-[#22623a]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#1a1816]">Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] text-[11px] focus:outline-none focus:border-[#22623a]"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="font-semibold text-[#1a1816]">Voucher Remarks / Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Saffron bulk lot partial settlement"
              className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a]"
            />
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
              disabled={loading || numAmount <= 0}
              className="px-5 py-2 bg-[#22623a] hover:bg-[#1b502e] text-white font-semibold rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Recording Voucher...</span>
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  <span>Disburse ₨ {numAmount > 0 ? numAmount.toLocaleString() : "—"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
