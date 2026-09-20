"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Loader2,
  AlertCircle,
  Check,
  FileText,
} from "lucide-react";

interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vendor?: any | null; // If editing
}

export default function VendorModal({
  isOpen,
  onClose,
  onSuccess,
  vendor,
}: VendorModalProps) {
  const isEdit = Boolean(vendor?.id);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [openingBalance, setOpeningBalance] = useState<string>("0");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (vendor) {
        setName(vendor.name || "");
        setCompany(vendor.company || "");
        setPhone(vendor.phone || "");
        setEmail(vendor.email || "");
        setAddress(vendor.address || "");
        setOpeningBalance(String(vendor.openingBalance || 0));
        setNotes(vendor.notes || "");
      } else {
        setName("");
        setCompany("");
        setPhone("");
        setEmail("");
        setAddress("");
        setOpeningBalance("0");
        setNotes("");
      }
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, vendor]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Vendor name is required.");
      return;
    }

    setLoading(true);
    try {
      const url = isEdit
        ? `/api/admin/vendors/${vendor.id}`
        : "/api/admin/vendors";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          company: company.trim() || undefined,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          address: address.trim() || undefined,
          openingBalance: Number(openingBalance) || 0,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save vendor details.");
      }

      setSuccessMsg(
        isEdit
          ? "Vendor profile updated successfully."
          : "New vendor registered successfully."
      );
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
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-[#22623a]">
                {isEdit ? "Edit Vendor / Supplier" : "Add New Herb / Packing Vendor"}
              </h2>
              <p className="text-[11px] text-[#6a6660]">
                Manage raw material suppliers, packaging vendors, and purchase ledgers.
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-[#1a1816]">Vendor Contact Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Haji Muhammad Younus"
                className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#1a1816]">Company / Market Shop</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Jodia Bazaar Herb Importers"
                className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-[#1a1816] flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#6a6660]" />
                <span>Phone / WhatsApp</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0300-1234567"
                className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#1a1816] flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#6a6660]" />
                <span>Email Address (Optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vendor@example.com"
                className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#1a1816] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#6a6660]" />
              <span>Physical Address / Market Location</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Shop # 12, Wholesale Herbal Market, Jodia Bazaar, Karachi"
              className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a]"
            />
          </div>

          {!isEdit && (
            <div className="space-y-1">
              <label className="font-semibold text-[#1a1816] flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>Opening Payable Balance (PKR)</span>
              </label>
              <input
                type="number"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                placeholder="0"
                className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] font-mono focus:outline-none focus:border-[#22623a]"
              />
              <span className="text-[10px] text-[#6a6660]">
                Enter any historical unpaid dues prior to TMS system initialization.
              </span>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-semibold text-[#1a1816] flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[#6a6660]" />
              <span>Internal Notes / Terms</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Specializing in raw Saffron, Asgandh Nagori, amber glass bottles..."
              className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a] resize-none"
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
              disabled={loading}
              className="px-5 py-2 bg-[#22623a] hover:bg-[#1b502e] text-white font-semibold rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEdit ? "Update Vendor" : "Register Vendor"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
