"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { CLINIC_INFO } from "@/app/data/products";
import {
  X,
  Printer,
  MessageSquare,
  Building2,
  DollarSign,
  Receipt,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Phone,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  CreditCard,
  Package,
} from "lucide-react";

interface VendorLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorId: string | null;
  onPayVendor?: (vendor: any) => void;
  onNewBill?: (vendorId: string) => void;
}

export default function VendorLedgerModal({
  isOpen,
  onClose,
  vendorId,
  onPayVendor,
  onNewBill,
}: VendorLedgerModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ledgerData, setLedgerData] = useState<any | null>(null);
  const statementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && vendorId) {
      fetchLedger();
    }
  }, [isOpen, vendorId]);

  const fetchLedger = async () => {
    if (!vendorId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/vendors/${vendorId}/ledger`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load vendor ledger.");
      }
      setLedgerData(data.data);
    } catch (err: any) {
      setError(err.message || "Failed to load vendor statement.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const vendor = ledgerData?.vendor || {};
  const currentPayable = vendor.currentBalance || 0;
  const totalBilled = vendor.totalPurchases || 0;
  const totalPaid = vendor.totalPayments || 0;

  const formattedDate = new Date().toLocaleDateString("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const waStatementUrl = `https://wa.me/${(vendor.phone || "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `*Assalam-o-Alaikum ${vendor.name || "Respected Supplier"},*\n\nHere is your official *Supplier Account Statement* from *Tameer-e-Sehat Herbal Dispensary*:\n\n📅 *Statement Date:* ${formattedDate}\n📦 *Total Purchases Billed:* ₨ ${totalBilled.toLocaleString()}\n✅ *Total Payments Disbursed:* ₨ ${totalPaid.toLocaleString()}\n⚠️ *Net Payable Balance:* ₨ ${currentPayable.toLocaleString()}\n\nThank you for being our trusted herbal supply partner.\n*Accounts Helpline:* +92 312 2841990`
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 md:p-8 flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#22623a]/60 backdrop-blur-xs transition-opacity animate-fade-in print:hidden"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-[#e6dfd5] overflow-hidden my-auto max-h-[95vh] flex flex-col animate-fade-in print:max-w-none print:shadow-none print:border-none print:m-0 print:p-0">
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-[#e6dfd5] bg-[#faf8f5] flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#22623a] text-[#c59b27] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-[#22623a]">
                Vendor & Supplier Payable Statement
              </h2>
              <p className="text-[11px] text-[#6a6660]">
                Inward purchase bills, payment vouchers, and running balance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onPayVendor && currentPayable > 0 && (
              <button
                type="button"
                onClick={() => onPayVendor(vendor)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Pay Vendor</span>
              </button>
            )}

            {onNewBill && (
              <button
                type="button"
                onClick={() => onNewBill(vendor.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#c59b27] hover:bg-[#a8821d] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <Package className="w-3.5 h-3.5" />
                <span>New Purchase Bill</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#faf8f5] hover:bg-[#e6dfd5] border border-[#e6dfd5] text-[#22623a] text-xs font-semibold rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {vendor.phone && (
              <a
                href={waStatementUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-[#6a6660] hover:text-[#22623a] hover:bg-[#e6dfd5]/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Statement */}
        <div
          ref={statementRef}
          className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-[#1a1816] bg-white print:p-4"
        >
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-[#22623a] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#6a6660] font-semibold">
                Loading supplier ledger & transaction records...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : (
            <>
              {/* Header Branding */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-start border-b-2 border-[#22623a] pb-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#22623a] shrink-0 border border-[#c59b27]">
                    <Image
                      src="/images/logo.png"
                      alt="Tameer-e-Sehat Logo"
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div>
                    <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#22623a] tracking-tight">
                      TAMEER-E-SEHAT
                    </h1>
                    <p className="text-[11px] uppercase tracking-widest font-semibold text-[#c59b27]">
                      Vendor / Supplier Payable Ledger
                    </p>
                    <p className="text-[11px] text-[#59534b]">{CLINIC_INFO.address}</p>
                    <p className="text-[11px] text-[#59534b]">
                      Accounts: +92 312 2841990
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-1 rounded-md bg-[#faf8f5] border border-[#e6dfd5] text-[#22623a]">
                    SUPPLIER LEDGER
                  </span>
                  <p className="text-[11px] text-[#6a6660] pt-1">
                    Generated: <strong className="text-[#1a1816]">{formattedDate}</strong>
                  </p>
                  <p className="text-[11px] text-[#6a6660]">
                    Status:{" "}
                    <span
                      className={`font-bold ${
                        currentPayable <= 0 ? "text-emerald-700" : "text-amber-700"
                      }`}
                    >
                      {currentPayable <= 0 ? "ZERO PAYABLE / CLEAR" : "OUTSTANDING PAYABLE"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Vendor Account Summary Header Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#c59b27] flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Vendor Details</span>
                  </span>
                  <p className="font-serif text-base font-bold text-[#22623a]">
                    {vendor.name}
                  </p>
                  {vendor.company && (
                    <p className="text-xs text-[#59534b] font-medium">{vendor.company}</p>
                  )}
                  <p className="text-xs text-[#6a6660] flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3" />
                    <span>{vendor.phone || "N/A"}</span>
                  </p>
                </div>

                <div className="p-4 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#22623a] flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Purchases & Disbursements</span>
                  </span>
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-xs text-[#59534b]">Total Inward Bills:</span>
                    <span className="text-xs font-bold text-[#1a1816]">
                      ₨ {totalBilled.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-[#2d7648]">Total Paid:</span>
                    <span className="text-xs font-bold text-[#2d7648]">
                      ₨ {totalPaid.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                    Current Net Payable Balance
                  </span>
                  <p className="font-serif text-2xl font-black text-amber-950 pt-0.5">
                    ₨ {currentPayable.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-amber-800">
                    {currentPayable > 0
                      ? "Payable balance owed to supplier"
                      : "Account fully settled"}
                  </p>
                </div>
              </div>

              {/* Transactions Ledger Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[#22623a] text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#c59b27]" />
                    <span>Double-Entry Chronological Ledger</span>
                  </h3>
                  <span className="text-[11px] text-[#6a6660]">
                    {ledgerData?.entries?.length || 0} Entries
                  </span>
                </div>

                <div className="border border-[#e6dfd5] rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#22623a] text-white">
                      <tr>
                        <th className="p-3 font-semibold">Date</th>
                        <th className="p-3 font-semibold">Transaction / Description</th>
                        <th className="p-3 font-semibold">Type</th>
                        <th className="p-3 font-semibold text-right">Debit (-) (Payment)</th>
                        <th className="p-3 font-semibold text-right">Credit (+) (Bill)</th>
                        <th className="p-3 font-semibold text-right">Running Payable</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e6dfd5] bg-white">
                      {ledgerData?.entries && ledgerData.entries.length > 0 ? (
                        ledgerData.entries.map((entry: any) => (
                          <tr key={entry.id} className="hover:bg-[#faf8f5] transition-colors">
                            <td className="p-3 text-[#59534b] font-mono text-[11px]">
                              {new Date(entry.date).toLocaleDateString("en-PK")}
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-[#22623a] block">
                                {entry.description}
                              </span>
                              {entry.reference && (
                                <span className="text-[10px] text-[#6a6660] font-mono block">
                                  Ref: {entry.reference}
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  entry.type === "BILL" || entry.credit > 0
                                    ? "bg-amber-100 text-amber-900 border border-amber-200"
                                    : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                                }`}
                              >
                                {entry.credit > 0 ? (
                                  <>
                                    <ArrowUpRight className="w-3 h-3 text-amber-700" />
                                    <span>PURCHASE BILL</span>
                                  </>
                                ) : (
                                  <>
                                    <ArrowDownLeft className="w-3 h-3 text-emerald-700" />
                                    <span>PAYMENT DEBIT</span>
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="p-3 text-right font-bold text-[#2d7648]">
                              {entry.debit > 0 ? `₨ ${entry.debit.toLocaleString()}` : "—"}
                            </td>
                            <td className="p-3 text-right font-bold text-[#1a1816]">
                              {entry.credit > 0 ? `₨ ${entry.credit.toLocaleString()}` : "—"}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-[#22623a]">
                              ₨ {entry.balance?.toLocaleString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-[#6a6660]">
                            No transactions or bills recorded for this vendor yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Purchase Bills Summary Cards */}
              {ledgerData?.purchases && ledgerData.purchases.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-[#22623a] text-xs uppercase tracking-wider">
                    Inward Purchase Bills Records
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ledgerData.purchases.map((p: any) => (
                      <div
                        key={p.id}
                        className="p-3 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs flex justify-between items-center"
                      >
                        <div>
                          <span className="font-bold text-[#22623a] block font-mono">
                            Bill #{p.billNumber}
                          </span>
                          <span className="text-[10px] text-[#6a6660]">
                            {new Date(p.billDate).toLocaleDateString("en-PK")} · {p.items?.length || 0} Item(s)
                          </span>
                        </div>
                        <div className="text-right space-y-0.5">
                          <span className="font-bold text-[#1a1816] block">
                            ₨ {p.totalAmount?.toLocaleString()}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              p.paymentStatus === "PAID"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {p.paymentStatus || "UNPAID"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
