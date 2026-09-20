"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { CLINIC_INFO } from "@/app/data/products";
import {
  X,
  Printer,
  MessageSquare,
  DollarSign,
  Receipt,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Phone,
  User,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
} from "lucide-react";

interface CustomerLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerIdentifier: string | null; // phone or userId or customerName
  onCollectPayment?: (customer: any) => void;
  onViewInvoice?: (order: any) => void;
}

export default function CustomerLedgerModal({
  isOpen,
  onClose,
  customerIdentifier,
  onCollectPayment,
  onViewInvoice,
}: CustomerLedgerModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ledgerData, setLedgerData] = useState<any | null>(null);
  const statementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && customerIdentifier) {
      fetchLedger();
    }
  }, [isOpen, customerIdentifier]);

  const fetchLedger = async () => {
    if (!customerIdentifier) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/accounts/customers/${encodeURIComponent(customerIdentifier)}/ledger`
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load customer ledger.");
      }
      setLedgerData(data.data);
    } catch (err: any) {
      setError(err.message || "Failed to load customer statement.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const customer = ledgerData?.customer || {
    name: customerIdentifier,
    phone: customerIdentifier,
    totalBilled: 0,
    totalPaid: 0,
    dueBalance: 0,
  };

  const totalBilled = customer.totalBilled || 0;
  const totalPaid = customer.totalPaid || 0;
  const dueBalance = customer.dueBalance || (totalBilled - totalPaid);

  const formattedDate = new Date().toLocaleDateString("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const waStatementUrl = `https://wa.me/${(customer.phone || "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `*Assalam-o-Alaikum ${customer.name || "Valued Customer"},*\n\nHere is your official *Account Statement Ledger* from *Tameer-e-Sehat Herbal Dispensary*:\n\n📅 *Statement Date:* ${formattedDate}\n📦 *Total Orders Placed:* ${ledgerData?.orders?.length || 0}\n💵 *Total Billed Amount:* ₨ ${totalBilled.toLocaleString()}\n✅ *Total Payments Received:* ₨ ${totalPaid.toLocaleString()}\n⚠️ *Net Outstanding Balance:* ₨ ${dueBalance.toLocaleString()}\n\nFor any billing queries or to settle your balance, please reach out to us.\n*Helpline / WhatsApp:* +92 312 2841990`
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
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-[#e6dfd5] bg-[#faf8f5] flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#22623a] text-[#c59b27] flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-[#22623a]">
                Customer Account Statement & Ledger
              </h2>
              <p className="text-[11px] text-[#6a6660]">
                Full double-entry balance, order history & payment credits.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onCollectPayment && dueBalance > 0 && (
              <button
                type="button"
                onClick={() => onCollectPayment(customer)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#c59b27] hover:bg-[#a8821d] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Receive Payment</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            {customer.phone && (
              <a
                href={waStatementUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Statement</span>
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

        {/* Modal Scrollable Content / Printable Statement */}
        <div
          ref={statementRef}
          className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-[#1a1816] bg-white print:p-4"
        >
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-[#22623a] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#6a6660] font-semibold">
                Loading customer statement & ledger transactions...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : (
            <>
              {/* Header Statement Branding */}
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
                      Customer Account Statement
                    </p>
                    <p className="text-[11px] text-[#59534b]">{CLINIC_INFO.address}</p>
                    <p className="text-[11px] text-[#59534b]">
                      Helpline: +92 312 2841990
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-1 rounded-md bg-[#faf8f5] border border-[#e6dfd5] text-[#22623a]">
                    ACCOUNT STATEMENT
                  </span>
                  <p className="text-[11px] text-[#6a6660] pt-1">
                    Generated: <strong className="text-[#1a1816]">{formattedDate}</strong>
                  </p>
                  <p className="text-[11px] text-[#6a6660]">
                    Status:{" "}
                    <span
                      className={`font-bold ${
                        dueBalance <= 0 ? "text-emerald-700" : "text-amber-700"
                      }`}
                    >
                      {dueBalance <= 0 ? "CLEAR / NO DUE" : "OUTSTANDING BALANCE"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Customer Account Summary Header Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#c59b27] flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span>Customer Details</span>
                  </span>
                  <p className="font-serif text-base font-bold text-[#22623a]">
                    {customer.name || "Customer"}
                  </p>
                  <p className="text-xs text-[#59534b] flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-[#6a6660]" />
                    <span>{customer.phone || "N/A"}</span>
                  </p>
                  {customer.email && (
                    <p className="text-[11px] text-[#6a6660] truncate">{customer.email}</p>
                  )}
                </div>

                <div className="p-4 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#22623a] flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Total Billing & Paid</span>
                  </span>
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-xs text-[#59534b]">Total Invoiced:</span>
                    <span className="text-xs font-bold text-[#1a1816]">
                      ₨ {totalBilled.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-[#2d7648]">Total Collected:</span>
                    <span className="text-xs font-bold text-[#2d7648]">
                      ₨ {totalPaid.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                    Current Outstanding Due
                  </span>
                  <p className="font-serif text-2xl font-black text-amber-950 pt-0.5">
                    ₨ {dueBalance.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-amber-800">
                    {dueBalance > 0
                      ? "Net amount receivable from customer"
                      : "Account fully settled"}
                  </p>
                </div>
              </div>

              {/* Transactions Ledger Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[#22623a] text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#c59b27]" />
                    <span>Transaction History & Chronological Ledger</span>
                  </h3>
                  <span className="text-[11px] text-[#6a6660]">
                    {ledgerData?.ledger?.length || 0} Records Found
                  </span>
                </div>

                <div className="border border-[#e6dfd5] rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#22623a] text-white">
                      <tr>
                        <th className="p-3 font-semibold">Date</th>
                        <th className="p-3 font-semibold">Reference / Details</th>
                        <th className="p-3 font-semibold">Type</th>
                        <th className="p-3 font-semibold text-right">Debit (+)</th>
                        <th className="p-3 font-semibold text-right">Credit (-)</th>
                        <th className="p-3 font-semibold text-right">Running Balance</th>
                        <th className="p-3 font-semibold text-center print:hidden">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e6dfd5] bg-white">
                      {ledgerData?.ledger && ledgerData.ledger.length > 0 ? (
                        ledgerData.ledger.map((entry: any) => (
                          <tr key={entry.id} className="hover:bg-[#faf8f5] transition-colors">
                            <td className="p-3 text-[#59534b] font-mono text-[11px]">
                              {new Date(entry.date).toLocaleDateString("en-PK")}
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-[#22623a] block">
                                {entry.description}
                              </span>
                              {entry.notes && (
                                <span className="text-[10px] text-[#6a6660] block">
                                  {entry.notes}
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  entry.type === "ORDER"
                                    ? "bg-amber-100 text-amber-900 border border-amber-200"
                                    : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                                }`}
                              >
                                {entry.type === "ORDER" ? (
                                  <>
                                    <ArrowUpRight className="w-3 h-3 text-amber-700" />
                                    <span>ORDER INVOICE</span>
                                  </>
                                ) : (
                                  <>
                                    <ArrowDownLeft className="w-3 h-3 text-emerald-700" />
                                    <span>PAYMENT CREDIT</span>
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="p-3 text-right font-bold text-[#1a1816]">
                              {entry.debit > 0 ? `₨ ${entry.debit.toLocaleString()}` : "—"}
                            </td>
                            <td className="p-3 text-right font-bold text-[#2d7648]">
                              {entry.credit > 0 ? `₨ ${entry.credit.toLocaleString()}` : "—"}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-[#22623a]">
                              ₨ {entry.balance?.toLocaleString()}
                            </td>
                            <td className="p-3 text-center print:hidden">
                              {entry.order && onViewInvoice && (
                                <button
                                  type="button"
                                  onClick={() => onViewInvoice(entry.order)}
                                  className="text-[10px] text-[#22623a] hover:underline font-bold px-2 py-1 rounded bg-[#faf8f5] border border-[#e6dfd5]"
                                >
                                  Invoice #{entry.order.orderNumber}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-[#6a6660]">
                            No transactions or orders recorded for this customer yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Invoices Breakdown Section */}
              {ledgerData?.orders && ledgerData.orders.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-[#22623a] text-xs uppercase tracking-wider">
                    Associated Order Invoices Summary
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ledgerData.orders.map((o: any) => (
                      <div
                        key={o.id}
                        className="p-3 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs flex justify-between items-center"
                      >
                        <div>
                          <span className="font-bold text-[#22623a] block">
                            Order #{o.orderNumber}
                          </span>
                          <span className="text-[10px] text-[#6a6660]">
                            {new Date(o.createdAt).toLocaleDateString("en-PK")} · {o.items?.length || 0} Pack(s)
                          </span>
                        </div>
                        <div className="text-right space-y-0.5">
                          <span className="font-bold text-[#1a1816] block">
                            ₨ {o.total?.toLocaleString()}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              o.paymentStatus === "PAID"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {o.paymentStatus || "UNPAID"}
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
