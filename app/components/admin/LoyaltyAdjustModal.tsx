"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Coins,
  PlusCircle,
  MinusCircle,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Clock,
  History,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";

interface LoyaltyEntry {
  id: string;
  userId: string;
  amount: number;
  type: string;
  source: string;
  referenceId: string | null;
  balanceAfter: number;
  reason: string | null;
  createdAt: string;
}

interface LoyaltyAdjustModalProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    role?: string;
    membershipId?: string | null;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updatedBalance: number) => void;
}

export default function LoyaltyAdjustModal({
  user,
  isOpen,
  onClose,
  onSuccess,
}: LoyaltyAdjustModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [history, setHistory] = useState<LoyaltyEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [adjustmentType, setAdjustmentType] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [pointsInput, setPointsInput] = useState<string>("50");
  const [reason, setReason] = useState<string>("");

  const fetchUserLoyalty = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/loyalty/${userId}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load loyalty ledger.");
      }
      setCurrentBalance(data.pointsBalance ?? 0);
      setHistory(data.history || []);
    } catch (err: any) {
      setError(err?.message || "Error loading user loyalty data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchUserLoyalty(user.id);
      setPointsInput("50");
      setReason("");
      setError(null);
      setSuccessMessage(null);
      setAdjustmentType("CREDIT");
    }
  }, [isOpen, user?.id]);

  if (!isOpen || !user) return null;

  const numericPoints = Math.max(0, parseInt(pointsInput || "0", 10) || 0);
  const signedAmount = adjustmentType === "CREDIT" ? numericPoints : -numericPoints;
  const projectedBalance = currentBalance + signedAmount;
  const isReasonValid = reason.trim().length >= 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numericPoints || numericPoints <= 0) {
      setError("Please enter a valid points amount greater than 0.");
      return;
    }

    if (numericPoints > 5000) {
      setError("Manual adjustment cannot exceed ±5,000 points without executive override.");
      return;
    }

    if (!isReasonValid) {
      setError("Audit reason is mandatory and must contain at least 5 characters.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/admin/loyalty/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          amount: signedAmount,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to adjust loyalty points.");
      }

      setSuccessMessage(
        `Successfully ${adjustmentType === "CREDIT" ? "credited" : "debited"} ${numericPoints} points. New balance: ${data.balanceAfter} pts.`
      );
      setPointsInput("");
      setReason("");
      setCurrentBalance(data.balanceAfter);
      onSuccess?.(data.balanceAfter);

      // Refresh history list
      fetchUserLoyalty(user.id);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-line shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-surface-subtle">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-ink">
                Manual Loyalty Points Adjustment
              </h3>
              <p className="text-[11px] text-ink-subtle">
                {user.name} ({user.email}) {user.membershipId ? `• ${user.membershipId}` : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink-muted hover:text-ink hover:bg-surface rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Current Balance Banner */}
          <div className="bg-gradient-to-r from-emerald-900 to-primary text-white p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-emerald-200 font-medium">
                Current Loyalty Balance
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-serif text-3xl font-black">
                  {loading ? "..." : currentBalance.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-gold-300">points</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-emerald-200">PKR Value (1:1)</span>
              <div className="text-lg font-bold text-white mt-0.5">
                ₨ {currentBalance.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Error & Success Alerts */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-800 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Adjustment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink">Action Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustmentType("CREDIT")}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                    adjustmentType === "CREDIT"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-2xs font-bold"
                      : "border-line bg-white text-ink-subtle hover:bg-surface-subtle"
                  }`}
                >
                  <PlusCircle className="w-4 h-4 text-emerald-600" />
                  <span>Credit (+) Points</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustmentType("DEBIT")}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                    adjustmentType === "DEBIT"
                      ? "border-rose-600 bg-rose-50 text-rose-800 shadow-2xs font-bold"
                      : "border-line bg-white text-ink-subtle hover:bg-surface-subtle"
                  }`}
                >
                  <MinusCircle className="w-4 h-4 text-rose-600" />
                  <span>Debit (-) Points</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">
                  Points Amount <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="5000"
                  step="1"
                  required
                  value={pointsInput}
                  onChange={(e) => setPointsInput(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full px-3 py-2 border border-line rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Projected Balance After</label>
                <div className="px-3 py-2 bg-surface-subtle border border-line rounded-xl text-xs font-bold flex items-center justify-between text-ink">
                  <span>Balance After:</span>
                  <span
                    className={`font-mono ${
                      projectedBalance < 0 ? "text-rose-600" : "text-emerald-700"
                    }`}
                  >
                    {projectedBalance} pts
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-ink">
                  Audit Justification Reason <span className="text-rose-500">*</span>
                </label>
                <span
                  className={`text-[10px] ${
                    isReasonValid ? "text-emerald-600 font-semibold" : "text-ink-subtle"
                  }`}
                >
                  {reason.trim().length}/5 min characters
                </span>
              </div>
              <textarea
                required
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Mandatory reason for audit log (e.g. Compensation for courier delay on Order #1002)"
                className="w-full px-3 py-2 border border-line rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Audit Notice */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2 text-[11px] text-amber-900">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-700 mt-0.5" />
              <span>
                All adjustments create an immutable ledger entry permanently stamped with your staff ID and timestamp.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-line rounded-xl text-xs font-medium text-ink hover:bg-surface transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !numericPoints || !isReasonValid}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {adjustmentType === "CREDIT" ? "Credit Points" : "Debit Points"}
                </span>
              </button>
            </div>
          </form>

          {/* Recent History Table */}
          <div className="border-t border-line pt-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
              <History className="w-3.5 h-3.5 text-primary" />
              <span>Recent Ledger History ({history.length})</span>
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-ink-subtle py-2">No previous ledger entries found.</p>
            ) : (
              <div className="border border-line rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-surface-subtle text-ink-subtle sticky top-0 border-b border-line">
                    <tr>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-2">Type</th>
                      <th className="py-2 px-2">Reason</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                      <th className="py-2 px-3 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {history.slice(0, 10).map((h) => (
                      <tr key={h.id} className="hover:bg-surface-subtle/40">
                        <td className="py-2 px-3 text-ink-subtle whitespace-nowrap">
                          {new Date(h.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-2 whitespace-nowrap">
                          <span className="font-bold text-[10px]">{h.type}</span>
                        </td>
                        <td className="py-2 px-2 max-w-[160px] truncate text-ink">
                          {h.reason || "-"}
                        </td>
                        <td
                          className={`py-2 px-3 text-right font-semibold whitespace-nowrap ${
                            h.amount > 0 ? "text-emerald-700" : "text-rose-700"
                          }`}
                        >
                          {h.amount > 0 ? `+${h.amount}` : h.amount}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-ink">
                          {h.balanceAfter}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
