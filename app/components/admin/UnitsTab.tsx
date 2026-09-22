"use client";

import React, { useState, useEffect } from "react";
import {
  Scale,
  Plus,
  Loader2,
  AlertCircle,
  Check,
  Trash2,
  CheckCircle2,
  Weight,
  Droplets,
  Package,
  Leaf,
  Power,
  PowerOff,
} from "lucide-react";

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

const UNIT_KINDS = [
  { value: "WEIGHT", label: "Weight", icon: Weight, hint: "g, kg, mg, tola" },
  { value: "VOLUME", label: "Volume", icon: Droplets, hint: "ml, L, drop" },
  { value: "PACK", label: "Pack / Piece", icon: Package, hint: "jar, bottle, sachet" },
  { value: "TRADITIONAL", label: "Traditional", icon: Leaf, hint: "tola, masha, ratti" },
];

const PRESET_UNITS = [
  { code: "g", name: "Gram", kind: "WEIGHT" },
  { code: "kg", name: "Kilogram", kind: "WEIGHT" },
  { code: "mg", name: "Milligram", kind: "WEIGHT" },
  { code: "ml", name: "Millilitre", kind: "VOLUME" },
  { code: "l", name: "Litre", kind: "VOLUME" },
  { code: "drop", name: "Drop", kind: "VOLUME" },
  { code: "jar", name: "Jar", kind: "PACK" },
  { code: "bottle", name: "Bottle", kind: "PACK" },
  { code: "sachet", name: "Sachet", kind: "PACK" },
  { code: "pack", name: "Pack", kind: "PACK" },
  { code: "piece", name: "Piece", kind: "PACK" },
  { code: "tola", name: "Tola", kind: "TRADITIONAL" },
  { code: "masha", name: "Masha", kind: "TRADITIONAL" },
  { code: "ratti", name: "Ratti", kind: "TRADITIONAL" },
];

export default function UnitsTab() {
  const [units, setUnits] = useState<UnitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingUnit, setAddingUnit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [showInactive, setShowInactive] = useState(false);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [kind, setKind] = useState("WEIGHT");

  const fetchUnits = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/units?all=true");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setUnits(data.data);
        }
      } else {
        setError("Failed to load units catalog.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load units catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!code.trim() || !name.trim()) {
      setError("Please provide both a unit code (e.g. 'tola') and a display name.");
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
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setAddingUnit(false);
    }
  };

  const handleQuickAdd = async (preset: (typeof PRESET_UNITS)[0]) => {
    setError(null);
    setSuccessMsg(null);
    setAddingUnit(true);
    try {
      const res = await fetch("/api/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preset),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Failed to add ${preset.name}.`);
      }
      setSuccessMsg(`Unit '${data.data.name}' added.`);
      fetchUnits();
    } catch (err: any) {
      setError(err?.message || "Failed to add preset unit.");
    } finally {
      setAddingUnit(false);
    }
  };

  const handleToggleActive = async (unit: UnitItem) => {
    setBusyId(unit.id);
    try {
      const res = await fetch(`/api/units/${unit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !unit.isActive }),
      });
      if (res.ok) {
        fetchUnits();
      }
    } catch (err) {
      console.error("Error toggling unit:", err);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (unit: UnitItem) => {
    if (
      !confirm(
        `Delete unit '${unit.name}' (${unit.code})? If it is in use by product packs it will be deactivated instead.`
      )
    ) {
      return;
    }
    setBusyId(unit.id);
    try {
      const res = await fetch(`/api/units/${unit.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete unit.");
      }
      setSuccessMsg(data.message || `Unit '${unit.name}' removed.`);
      fetchUnits();
    } catch (err: any) {
      setError(err?.message || "Failed to delete unit.");
    } finally {
      setBusyId(null);
    }
  };

  const existingCodes = new Set(units.map((u) => u.code.toLowerCase()));
  const missingPresets = PRESET_UNITS.filter(
    (p) => !existingCodes.has(p.code.toLowerCase())
  );

  const filteredUnits = units.filter((u) => {
    if (kindFilter !== "all" && u.kind !== kindFilter) return false;
    if (!showInactive && !u.isActive) return false;
    return true;
  });

  const kindIcon = (kindValue: string) => {
    const found = UNIT_KINDS.find((k) => k.value === kindValue);
    if (!found) return Package;
    return found.icon;
  };

  return (
    <div className="space-y-6">
      {/* Add Unit Form */}
      <div className="bg-white rounded-2xl border border-[#e6dfd5] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e6dfd5] bg-[#faf8f5] flex items-center gap-2.5">
          <Scale className="w-4 h-4 text-[#22623a]" />
          <div>
            <h2 className="font-serif text-base font-bold text-[#22623a]">
              Add Measurement Unit
            </h2>
            <p className="text-[11px] text-[#6a6660]">
              Units are attached to product pack sizes (e.g. 50g jar, 120ml bottle, 1 tola pack).
            </p>
          </div>
        </div>

        <form onSubmit={handleAddUnit} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4a4640] mb-1.5">
                Unit Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. tola, g, ml"
                className="w-full px-3 py-2 text-sm bg-[#faf8f5] border border-[#e6dfd5] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#22623a] focus:bg-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4a4640] mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tola, Gram, Millilitre"
                className="w-full px-3 py-2 text-sm bg-[#faf8f5] border border-[#e6dfd5] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#22623a] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4a4640] mb-1.5">
                Kind
              </label>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#faf8f5] border border-[#e6dfd5] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#22623a] appearance-none cursor-pointer"
              >
                {UNIT_KINDS.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label} — {k.hint}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <button
              type="submit"
              disabled={addingUnit}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#22623a] hover:bg-[#1a4d2e] text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-all"
            >
              {addingUnit ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>Add Unit</span>
            </button>
          </div>
        </form>

        {missingPresets.length > 0 && (
          <div className="px-5 sm:px-6 pb-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6a6660] mb-2">
              Quick add common units
            </p>
            <div className="flex flex-wrap gap-1.5">
              {missingPresets.map((preset) => (
                <button
                  key={preset.code}
                  type="button"
                  disabled={addingUnit}
                  onClick={() => handleQuickAdd(preset)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#faf8f5] border border-[#e6dfd5] text-[#4a4640] hover:border-[#22623a] hover:text-[#22623a] disabled:opacity-50 transition-all"
                >
                  <Plus className="w-3 h-3" />
                  {preset.name} ({preset.code})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Units Catalog */}
      <div className="bg-white rounded-2xl border border-[#e6dfd5] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e6dfd5] bg-[#faf8f5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Scale className="w-4 h-4 text-[#22623a]" />
            <h2 className="font-serif text-base font-bold text-[#22623a]">
              Units Catalog ({filteredUnits.length})
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value)}
              className="py-1.5 pl-3 pr-8 text-xs bg-white border border-[#e6dfd5] rounded-lg appearance-none cursor-pointer"
            >
              <option value="all">All Kinds</option>
              {UNIT_KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
            <label className="inline-flex items-center gap-1.5 text-xs text-[#6a6660] cursor-pointer">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-[#e6dfd5]"
              />
              Show inactive
            </label>
          </div>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-[#6a6660]">
            <Loader2 className="w-8 h-8 animate-spin text-[#22623a]" />
            <p className="text-sm font-medium">Loading units catalog...</p>
          </div>
        ) : filteredUnits.length === 0 ? (
          <div className="p-16 text-center">
            <Scale className="w-12 h-12 text-[#c59b27] mx-auto mb-3 opacity-60" />
            <h3 className="font-serif text-lg font-bold text-[#22623a] mb-1">
              No units configured
            </h3>
            <p className="text-sm text-[#6a6660] max-w-md mx-auto">
              Add measurement units so product pack sizes can be labelled consistently (grams, millilitres, tola, jars).
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e6dfd5] bg-[#faf8f5]/60 text-[11px] font-bold uppercase tracking-wider text-[#6a6660]">
                  <th className="py-3.5 px-4 sm:px-6">Unit</th>
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Kind</th>
                  <th className="py-3.5 px-4 text-right">Used by packs</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6dfd5] text-sm">
                {filteredUnits.map((unit) => {
                  const Icon = kindIcon(unit.kind);
                  return (
                    <tr
                      key={unit.id}
                      className={`hover:bg-[#faf8f5]/60 transition-colors ${
                        !unit.isActive ? "opacity-60" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#faf8f5] border border-[#e6dfd5] flex items-center justify-center text-[#22623a]">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-[#1c1917]">
                            {unit.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-[#faf8f5] border border-[#e6dfd5] text-[#4a4640]">
                          {unit.code}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-medium text-[#6a6660]">
                          {UNIT_KINDS.find((k) => k.value === unit.kind)?.label ||
                            unit.kind}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-[#4a4640]">
                        {unit._count?.sizes ?? 0}
                      </td>
                      <td className="py-3.5 px-4">
                        {unit.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <Check className="w-3 h-3" />
                            ACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                            INACTIVE
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleActive(unit)}
                            disabled={busyId === unit.id}
                            className="p-1.5 rounded-lg text-[#6a6660] hover:text-[#22623a] hover:bg-[#faf8f5] transition-colors disabled:opacity-40"
                            title={unit.isActive ? "Deactivate" : "Reactivate"}
                          >
                            {busyId === unit.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : unit.isActive ? (
                              <PowerOff className="w-4 h-4" />
                            ) : (
                              <Power className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(unit)}
                            disabled={busyId === unit.id}
                            className="p-1.5 rounded-lg text-[#6a6660] hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40"
                            title="Delete unit"
                          >
                            <Trash2 className="w-4 h-4" />
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
