"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  DollarSign,
  Loader2,
  AlertCircle,
  Check,
  CreditCard,
  Phone,
  User,
  Receipt,
} from "lucide-react";

interface ReceivePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customer?: any | null;
  orderId?: string | null;
  maxDue?: number;
}

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "JAZZCASH", label: "JazzCash" },
  { value: "EASYPAISA", label: "EasyPaisa" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "COD", label: "Cash on Delivery (COD)" },
];

export default function ReceivePaymentModal({
  isOpen,
  onClose,
  onSuccess,
  customer,
  orderId,
  maxDue,
}: ReceivePaymentModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [reference, setReference] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAmount(maxDue != null ? String(maxDue) : "");
      setPaymentMethod("CASH");
      setReference("");
      setNote("");
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, maxDue]);

  if (!isOpen) return null;

  const numAmount = Number(amount) || 0;
  const customerIdentifier =
    customer?.phone || customer?.userId || customer?.name || orderId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (numAmount <= 0) {
      setError("Payment amount must be greater than zero.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/accounts/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerIdentifier,
          orderId: orderId || undefined,
          amount: numAmount,
          paymentMethod,
          reference: reference.trim() || undefined,
          note: note.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to record payment.");
      }

      setSuccessMsg(`₨ ${numAmount.toLocaleString()} payment recorded successfully!`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
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
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#e6dfd5] bg-[#faf8f5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#22623a] text-[#c59b27] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-[#22623a]">
                Record Customer Payment
              </h2>
              <p className="text-[11px] text-[#6a6660]">
                Log a payment received from this customer and update their ledger.
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

          {/* Customer Summary Card */}
          {customer && (
            <div className="p-3.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#22623a] flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-[#22623a] block text-sm">
                      {customer.name || "Customer"}
                    </span>
                    <span className="text-[#59534b] text-[10px] font-mono flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {customer.phone || "N/A"}
                    </span>
                  </div>
                </div>
                {maxDue != null && (
                  <div className="text-right">
                    <span className="text-[10px] text-[#6a6660] block">Outstanding Due:</span>
                    <span className="text-sm font-black text-amber-700">
                      ₨ {maxDue.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {orderId && (
                <div className="pt-1.5 border-t border-[#e6dfd5]">
                  <span className="text-[10px] text-[#6a6660]">
                    Recording payment against:{" "}
                    <strong className="text-[#22623a] font-mono">Order #{orderId}</strong>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Payment Amount */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#1a1816] flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-[#c59b27]" />
              <span>Payment Amount (PKR) *</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount received..."
              className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] font-bold text-sm focus:outline-none focus:border-[#22623a]"
            />
            {maxDue != null && numAmount > maxDue && (
              <p className="text-amber-700 text-[10px] font-semibold">
                ⚠ Amount entered exceeds outstanding due balance.
              </p>
            )}
          </div>

          {/* Quick Amount Chips */}
          {maxDue != null && maxDue > 0 && (
            <div className="grid grid-cols-3 gap-1.5">
              {[maxDue, Math.floor(maxDue / 2), Math.min(500, maxDue)].filter(
                (v, i, a) => v > 0 && a.indexOf(v) === i
              ).map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setAmount(String(chip))}
                  className={`py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                    numAmount === chip
                      ? "bg-[#22623a] text-white border-[#22623a]"
                      : "bg-[#faf8f5] text-[#22623a] border-[#e6dfd5] hover:bg-[#e6dfd5]"
                  }`}
                >
                  {chip === maxDue ? "Full Due" : chip === Math.floor(maxDue / 2) ? "Half Due" : `₨ ${chip.toLocaleString()}`}
                  {chip !== maxDue && (
                    <span className="block font-normal text-[9px]">₨ {chip.toLocaleString()}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Payment Method */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#1a1816] flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-[#22623a]" />
              <span>Payment Method *</span>
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

          {/* Reference & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-[#1a1816]">
                Reference / Transaction # (Optional)
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Bank TRN, Txn ID, etc."
                className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] font-mono text-[11px] focus:outline-none focus:border-[#22623a]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#1a1816]">Payment Note (Optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g., Received via rider"
                className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a]"
              />
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
              disabled={loading || numAmount <= 0}
              className="px-5 py-2 bg-[#c59b27] hover:bg-[#a8821d] text-white font-semibold rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  <Receipt className="w-4 h-4" />
                  <span>Record ₨ {numAmount > 0 ? numAmount.toLocaleString() : "—"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
