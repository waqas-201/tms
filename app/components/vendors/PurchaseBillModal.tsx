"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Building2,
  DollarSign,
  Calendar,
  Package,
  Loader2,
  AlertCircle,
  Check,
  CreditCard,
  FileText,
  Info,
} from "lucide-react";

interface PurchaseBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultVendorId?: string | null;
}

interface BillItem {
  id: string; // temp unique key
  productSizeId: string;
  productName: string;
  itemName: string;
  quantity: number;
  unitCost: number;
  batchNumber?: string;
  expiryDate?: string;
}

const PAYMENT_METHODS = [
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CASH", label: "Cash" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "JAZZCASH", label: "JazzCash" },
  { value: "EASYPAISA", label: "EasyPaisa" },
];

export default function PurchaseBillModal({
  isOpen,
  onClose,
  onSuccess,
  defaultVendorId,
}: PurchaseBillModalProps) {
  const [vendors, setVendors] = useState<any[]>([]);
  const [productSizes, setProductSizes] = useState<any[]>([]);
  const [vendorId, setVendorId] = useState<string>("");
  const [billNumber, setBillNumber] = useState<string>("");
  const [billDate, setBillDate] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [paidAmount, setPaidAmount] = useState<string>("0");
  const [paymentMethod, setPaymentMethod] = useState<string>("BANK_TRANSFER");
  const [paymentReference, setPaymentReference] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [autoReceiveStock, setAutoReceiveStock] = useState<boolean>(true);

  const [items, setItems] = useState<BillItem[]>([
    {
      id: "item-1",
      productSizeId: "",
      productName: "",
      itemName: "",
      quantity: 10,
      unitCost: 0,
      batchNumber: "",
      expiryDate: "",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      const today = new Date().toISOString().split("T")[0];
      setBillDate(today);
      const due = new Date();
      due.setDate(due.getDate() + 30);
      setDueDate(due.toISOString().split("T")[0]);
      setBillNumber(`PB-${Date.now().toString().slice(-6)}`);
      setPaidAmount("0");
      setPaymentMethod("BANK_TRANSFER");
      setPaymentReference("");
      setNotes("");
      setAutoReceiveStock(true);
      setError(null);
      setSuccessMsg(null);
      setItems([
        {
          id: "item-1",
          productSizeId: "",
          productName: "",
          itemName: "",
          quantity: 10,
          unitCost: 0,
          batchNumber: "",
          expiryDate: "",
        },
      ]);
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    setFetchingData(true);
    try {
      const [vendorsRes, invRes] = await Promise.all([
        fetch("/api/admin/vendors"),
        fetch("/api/admin/inventory"),
      ]);
      const vendorsData = await vendorsRes.json();
      const invData = await invRes.json();

      if (vendorsData.success && vendorsData.data) {
        setVendors(vendorsData.data);
        if (defaultVendorId) {
          setVendorId(defaultVendorId);
        } else if (vendorsData.data.length > 0) {
          setVendorId(vendorsData.data[0].id);
        }
      }

      if (invData.success && invData.data) {
        setProductSizes(invData.data);
      }
    } catch (err) {
      console.error("Failed to fetch bill prerequisites:", err);
    } finally {
      setFetchingData(false);
    }
  };

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        productSizeId: "",
        productName: "",
        itemName: "",
        quantity: 10,
        unitCost: 0,
        batchNumber: "",
        expiryDate: "",
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleVariantSelect = (idx: number, sizeId: string) => {
    const found = productSizes.find((s) => s.id === sizeId);
    setItems((prev) => {
      const copy = [...prev];
      if (found) {
        copy[idx] = {
          ...copy[idx],
          productSizeId: found.id,
          productName: `${found.productName} - ${found.name} (${found.weight})`,
          itemName: `${found.productName} - ${found.name} (${found.weight})`,
          unitCost: found.costPrice || Math.round(found.price * 0.55),
          batchNumber: found.batchNumber || `B-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(100 + Math.random() * 900)}`,
        };
      } else {
        copy[idx] = {
          ...copy[idx],
          productSizeId: "",
          productName: "",
        };
      }
      return copy;
    });
  };

  const handleItemChange = (idx: number, field: keyof BillItem, value: any) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const subtotal = items.reduce(
    (acc, curr) => acc + (Number(curr.quantity) || 0) * (Number(curr.unitCost) || 0),
    0
  );
  const total = subtotal;
  const numPaid = Math.min(total, Math.max(0, Number(paidAmount) || 0));
  const due = Math.max(0, total - numPaid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!vendorId) {
      setError("Please select a vendor.");
      return;
    }

    if (items.length === 0 || items.some((i) => !i.itemName && !i.productSizeId)) {
      setError("Please ensure every bill line has a product/item selected.");
      return;
    }

    if (items.some((i) => i.quantity <= 0 || i.unitCost < 0)) {
      setError("Quantity must be greater than 0 and unit cost cannot be negative.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        vendorId,
        billNumber: billNumber.trim() || undefined,
        billDate: billDate ? new Date(billDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        paidAmount: numPaid,
        paymentMethod: numPaid > 0 ? paymentMethod : undefined,
        paymentReference: numPaid > 0 ? paymentReference.trim() || undefined : undefined,
        notes: notes.trim() || undefined,
        autoReceiveStock,
        items: items.map((i) => ({
          productSizeId: i.productSizeId || undefined,
          itemName: i.itemName || i.productName,
          quantity: Math.floor(Number(i.quantity)),
          unitCost: Number(i.unitCost),
          batchNumber: i.batchNumber?.trim() || undefined,
          expiryDate: i.expiryDate ? new Date(i.expiryDate) : undefined,
        })),
      };

      const res = await fetch("/api/admin/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to record purchase bill.");
      }

      setSuccessMsg("Purchase bill & stock reception recorded successfully!");
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
    <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 flex items-center justify-center">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#22623a]/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-[#e6dfd5] overflow-hidden my-auto max-h-[95vh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e6dfd5] bg-[#faf8f5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#22623a] text-[#c59b27] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-[#22623a]">
                New Inward Purchase Bill & Goods Reception
              </h2>
              <p className="text-[11px] text-[#6a6660]">
                Record vendor supplier bills, update cost valuation, and replenish inventory.
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
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

          {/* Top Row: Vendor & Bill Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl">
            <div className="space-y-1 sm:col-span-1">
              <label className="font-semibold text-[#1a1816] flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#22623a]" />
                <span>Select Vendor / Supplier *</span>
              </label>
              <select
                required
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                className="w-full p-2 bg-white border border-[#e6dfd5] rounded-lg text-[#1a1816] font-semibold focus:outline-none focus:border-[#22623a]"
              >
                <option value="">-- Choose Vendor --</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} {v.company ? `(${v.company})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1a1816]">Vendor Bill / Invoice #</label>
              <input
                type="text"
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
                placeholder="e.g. INV-9821"
                className="w-full p-2 bg-white border border-[#e6dfd5] rounded-lg text-[#1a1816] font-mono text-[11px] focus:outline-none focus:border-[#22623a]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-[#1a1816]">Bill Date</label>
                <input
                  type="date"
                  value={billDate}
                  onChange={(e) => setBillDate(e.target.value)}
                  className="w-full p-2 bg-white border border-[#e6dfd5] rounded-lg text-[#1a1816] text-[11px] focus:outline-none focus:border-[#22623a]"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-[#1a1816]">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2 bg-white border border-[#e6dfd5] rounded-lg text-[#1a1816] text-[11px] focus:outline-none focus:border-[#22623a]"
                />
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#22623a] text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>Purchased Items & Reception Lines</span>
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#22623a] hover:bg-[#1b502e] text-white rounded-lg font-semibold text-[11px] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item Line</span>
              </button>
            </div>

            <div className="border border-[#e6dfd5] rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#22623a] text-white">
                  <tr>
                    <th className="p-2.5 font-semibold">Item / Variant</th>
                    <th className="p-2.5 font-semibold w-24">Qty</th>
                    <th className="p-2.5 font-semibold w-28">Unit Cost</th>
                    <th className="p-2.5 font-semibold w-28">Total (PKR)</th>
                    <th className="p-2.5 font-semibold w-28">Batch #</th>
                    <th className="p-2.5 font-semibold w-28">Expiry</th>
                    <th className="p-2.5 font-semibold w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6dfd5] bg-white">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-[#faf8f5]/50">
                      <td className="p-2">
                        <select
                          value={item.productSizeId}
                          onChange={(e) => handleVariantSelect(idx, e.target.value)}
                          className="w-full p-1.5 bg-[#faf8f5] border border-[#e6dfd5] rounded text-xs font-semibold focus:outline-none focus:border-[#22623a]"
                        >
                          <option value="">-- Custom or Select Variant --</option>
                          {productSizes.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.productName} · {s.name} ({s.weight}) [OnHand: {s.stockOnHand}]
                            </option>
                          ))}
                        </select>
                        {!item.productSizeId && (
                          <input
                            type="text"
                            value={item.itemName}
                            onChange={(e) =>
                              handleItemChange(idx, "itemName", e.target.value)
                            }
                            placeholder="Or type custom raw herb/packaging name..."
                            className="w-full mt-1 p-1 bg-white border border-[#e6dfd5] rounded text-[11px] focus:outline-none focus:border-[#22623a]"
                          />
                        )}
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(idx, "quantity", Math.max(1, Number(e.target.value) || 1))
                          }
                          className="w-full p-1.5 bg-[#faf8f5] border border-[#e6dfd5] rounded text-xs font-bold text-center focus:outline-none focus:border-[#22623a]"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          required
                          value={item.unitCost}
                          onChange={(e) =>
                            handleItemChange(idx, "unitCost", Number(e.target.value) || 0)
                          }
                          className="w-full p-1.5 bg-[#faf8f5] border border-[#e6dfd5] rounded text-xs font-bold text-right focus:outline-none focus:border-[#22623a]"
                        />
                      </td>
                      <td className="p-2 text-right font-bold text-[#22623a]">
                        ₨ {((item.quantity || 0) * (item.unitCost || 0)).toLocaleString()}
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.batchNumber || ""}
                          onChange={(e) =>
                            handleItemChange(idx, "batchNumber", e.target.value)
                          }
                          placeholder="B-2026-..."
                          className="w-full p-1 bg-[#faf8f5] border border-[#e6dfd5] rounded font-mono text-[10px] focus:outline-none focus:border-[#22623a]"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="date"
                          value={item.expiryDate || ""}
                          onChange={(e) =>
                            handleItemChange(idx, "expiryDate", e.target.value)
                          }
                          className="w-full p-1 bg-[#faf8f5] border border-[#e6dfd5] rounded text-[10px] focus:outline-none focus:border-[#22623a]"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          disabled={items.length <= 1}
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 text-[#6a6660] hover:text-red-600 disabled:opacity-30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Auto Receive Inventory Toggle */}
          <div className="p-3 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoReceiveStock"
                checked={autoReceiveStock}
                onChange={(e) => setAutoReceiveStock(e.target.checked)}
                className="w-4 h-4 rounded text-[#22623a] focus:ring-[#22623a]"
              />
              <label htmlFor="autoReceiveStock" className="font-bold text-[#22623a] cursor-pointer">
                Auto-Receive Stock into Active Inventory
              </label>
            </div>
            <span className="text-[11px] text-[#6a6660]">
              Increases physical on-hand stock and logs stock movement audit entry.
            </span>
          </div>

          {/* Bottom Section: Upfront Payment & Financial Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Payment Section */}
            <div className="p-4 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl space-y-3">
              <span className="font-bold text-[#22623a] text-xs flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>Upfront / Immediate Payment (Optional)</span>
              </span>

              <div className="space-y-1">
                <label className="text-[#59534b]">Amount Paid to Vendor Now (PKR)</label>
                <input
                  type="number"
                  min="0"
                  max={total}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-full p-2 bg-white border border-[#e6dfd5] rounded-lg font-bold text-[#1a1816] focus:outline-none focus:border-[#22623a]"
                />
              </div>

              {numPaid > 0 && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="space-y-1">
                    <label className="text-[#59534b]">Payment Mode</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full p-1.5 bg-white border border-[#e6dfd5] rounded-lg text-[11px] focus:outline-none focus:border-[#22623a]"
                    >
                      {PAYMENT_METHODS.map((pm) => (
                        <option key={pm.value} value={pm.value}>
                          {pm.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#59534b]">Txn / Cheque #</label>
                    <input
                      type="text"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="e.g. CHQ-8212"
                      className="w-full p-1.5 bg-white border border-[#e6dfd5] rounded-lg text-[11px] focus:outline-none focus:border-[#22623a]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Financial Totals Card */}
            <div className="p-4 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl space-y-2.5">
              <div className="flex justify-between text-[#59534b]">
                <span>Total Bill Value:</span>
                <span className="font-bold text-[#1a1816] text-sm">
                  ₨ {total.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-[#2d7648] font-semibold">
                <span>Advance / Paid Amount:</span>
                <span>₨ {numPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-black text-amber-900 pt-2 border-t border-[#e6dfd5]">
                <span>Net Payable Balance:</span>
                <span>₨ {due.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-[#6a6660]">
                {due > 0
                  ? `₨ ${due.toLocaleString()} will be recorded as payable in vendor ledger.`
                  : "Bill will be marked as FULLY PAID."}
              </p>
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
              disabled={loading}
              className="px-5 py-2 bg-[#22623a] hover:bg-[#1b502e] text-white font-semibold rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Bill & Receiving Stock...</span>
                </>
              ) : (
                <>
                  <Package className="w-4 h-4" />
                  <span>Record Bill (₨ {total.toLocaleString()})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
