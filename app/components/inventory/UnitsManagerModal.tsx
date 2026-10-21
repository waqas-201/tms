"use client";

import React, { useState, useEffect } from "react";
import { X, Scale, Plus, Loader2, AlertCircle, Check, Trash2, CheckCircle2 } from "lucide-react";

interface UnitItem {
  id: string;
  code: string;
  name: string;
  kind: string;
  isActive: boolean;
  _count?: {
    sizes: number;
  };
}

interface UnitsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UnitsManagerModal({
  isOpen,
  onClose,
  onSuccess,
}: UnitsManagerModalProps) {
  const [units, setUnits] = useState<UnitItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingUnit, setAddingUnit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [kind, setKind] = useState("WEIGHT");

  const fetchUnits = async () => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/units");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setUnits(data.data);
        }
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load units catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!code.trim() || !name.trim()) {
      setError("Please provide both unit code (e.g. 'tola') and display name.");
      return;
    }

    setAddingUnit(true);

    try {
      const res = await fetch("/api/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toLowerCase(),
          name: name.trim(),
          kind,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to add unit.");
      }

      setSuccessMsg(`Unit '${data.data.name}' (${data.data.code}) created.`);
      setCode("");
      setName("");
      fetchUnits();
      onSuccess();
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setAddingUnit(false);
    }
  };

  const handleDeactivateUnit = async (unit: UnitItem) => {
    if (!confirm(`Are you sure you want to deactivate unit '${unit.name}' (${unit.code})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/units/${unit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !unit.isActive }),
      });
      if (res.ok) {
        fetchUnits();
        onSuccess();
      }
    } catch (err) {
      console.error("Error toggling unit:", err);
    }
  };

  return (
    <div data-lenis-prevent className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-primary/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-line overflow-hidden my-auto animate-fade-in flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-line bg-surface flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary text-brand-gold-300 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-primary">
                Units Catalog Management
              </h2>
              <p className="text-[11px] text-ink-muted">
                Configure standard and traditional apothecary measurement units.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-ink-muted hover:text-primary hover:bg-line/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-3 bg-danger-soft border border-danger/20 rounded-xl text-danger flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-success-soft border border-success-line rounded-xl text-success flex items-center gap-2 font-semibold">
              <Check className="w-4 h-4 shrink-0 text-success" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Add New Unit Form */}
          <form onSubmit={handleAddUnit} className="p-4 bg-surface border border-line rounded-xl space-y-3">
            <h4 className="font-bold text-primary flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-secondary-text" />
              <span>Add New Unit</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-ink">Unit Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. tola, sachet"
                  className="w-full p-2 bg-white border border-line rounded-lg text-ink font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-ink">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tola (Apothecary)"
                  className="w-full p-2 bg-white border border-line rounded-lg text-ink"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-ink">Unit Kind</label>
                <select
                  value={kind}
                  onChange={(e) => setKind(e.target.value)}
                  className="w-full p-2 bg-white border border-line rounded-lg text-ink"
                >
                  <option value="WEIGHT">WEIGHT (g, kg, tola)</option>
                  <option value="VOLUME">VOLUME (ml, L)</option>
                  <option value="PACK">PACK (jar, bottle, tin)</option>
                  <option value="COUNT">COUNT (pcs, sachet)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={addingUnit}
                className="px-4 py-1.5 bg-primary hover:bg-brand-green-800 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {addingUnit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Save Unit</span>
              </button>
            </div>
          </form>

          {/* Existing Units List */}
          <div className="border border-line rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface border-b border-line text-ink-muted font-semibold">
                  <th className="p-3">Unit Code</th>
                  <th className="p-3">Display Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Usage</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-ink-muted">
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2 text-primary" />
                      Loading units...
                    </td>
                  </tr>
                ) : units.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-ink-muted">
                      No units found.
                    </td>
                  </tr>
                ) : (
                  units.map((u) => (
                    <tr key={u.id} className="hover:bg-surface/60 transition-colors">
                      <td className="p-3 font-mono font-bold text-primary">{u.code}</td>
                      <td className="p-3 font-semibold text-ink">{u.name}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-surface-sunken text-ink-body">
                          {u.kind}
                        </span>
                      </td>
                      <td className="p-3 text-ink-muted">
                        {u._count?.sizes || 0} variants
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeactivateUnit(u)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                            u.isActive
                              ? "bg-success-soft text-success hover:bg-success-soft"
                              : "bg-line text-neutral-700 hover:bg-line-strong"
                          }`}
                        >
                          {u.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
