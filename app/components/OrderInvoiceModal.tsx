"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { CLINIC_INFO } from "@/app/data/products";
import {
  X,
  Printer,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  FileText,
  DollarSign,
  Receipt,
  Clock,
  CreditCard,
} from "lucide-react";

interface OrderInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any | null;
}

export default function OrderInvoiceModal({
  isOpen,
  onClose,
  order,
}: OrderInvoiceModalProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [layoutMode, setLayoutMode] = useState<"a4" | "pos">("a4");

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-${order.orderNumber || "TMS-1001"}`;
  const formattedDate = new Date(order.createdAt || Date.now()).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const total = order.total || 0;
  const paidAmount = order.paidAmount > 0 ? order.paidAmount : (order.paymentStatus === "PAID" ? total : 0);
  const dueAmount = order.dueAmount !== undefined && order.dueAmount !== null ? order.dueAmount : Math.max(0, total - paidAmount);

  // Status Stamp classification
  let statusBadge = {
    label: "UNPAID (COD)",
    color: "bg-amber-100 text-amber-900 border-amber-300",
    stampText: "COD DUE ON DELIVERY",
    stampBorder: "border-amber-600 text-amber-700",
  };

  if (order.orderStatus === "CANCELLED") {
    statusBadge = {
      label: "CANCELLED",
      color: "bg-red-100 text-red-900 border-red-300",
      stampText: "CANCELLED",
      stampBorder: "border-red-600 text-red-700",
    };
  } else if (dueAmount === 0 || order.paymentStatus === "PAID") {
    statusBadge = {
      label: "PAID IN FULL",
      color: "bg-emerald-100 text-emerald-900 border-emerald-300",
      stampText: "PAID IN FULL",
      stampBorder: "border-emerald-600 text-emerald-700",
    };
  } else if (paidAmount > 0 && dueAmount > 0) {
    statusBadge = {
      label: `PARTIALLY PAID (₨ ${paidAmount.toLocaleString()})`,
      color: "bg-blue-100 text-blue-900 border-blue-300",
      stampText: "PARTIALLY PAID",
      stampBorder: "border-blue-600 text-blue-700",
    };
  }

  const waInvoiceUrl = `https://wa.me/${order.phone?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `*Assalam-o-Alaikum ${order.customerName},*\n\nHere is your official invoice details for *Order #${order.orderNumber}* from *Tameer-e-Sehat Herbal Dispensary*:\n\n📅 *Date:* ${formattedDate}\n📦 *Items:* ${order.items?.length || 0} Pack(s)\n💵 *Order Total:* ₨ ${total.toLocaleString()}\n✅ *Paid Amount:* ₨ ${paidAmount.toLocaleString()}\n⚠️ *Net Payable / Due:* ₨ ${dueAmount.toLocaleString()}\n📍 *Delivery Address:* ${order.address}, ${order.city}\n\nThank you for choosing authentic natural Unani wellness.\n*Helpline / WhatsApp:* +92 312 2841990`
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 md:p-8 flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#22623a]/60 backdrop-blur-xs transition-opacity animate-fade-in print:hidden"
      />

      {/* Invoice Modal Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#e6dfd5] overflow-hidden my-auto max-h-[95vh] flex flex-col animate-fade-in print:max-w-none print:shadow-none print:border-none print:m-0 print:p-0">
        {/* Top Action Header Bar */}
        <div className="px-6 py-3.5 border-b border-[#e6dfd5] bg-[#faf8f5] flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#22623a]">
              <FileText className="w-4 h-4 text-[#c59b27]" />
              <span>Invoice #{order.orderNumber}</span>
            </div>

            {/* Layout switch */}
            <div className="flex bg-white p-0.5 rounded-lg border border-[#e6dfd5] text-[11px]">
              <button
                type="button"
                onClick={() => setLayoutMode("a4")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  layoutMode === "a4"
                    ? "bg-[#22623a] text-white"
                    : "text-[#6a6660] hover:text-[#22623a]"
                }`}
              >
                Standard A4
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode("pos")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  layoutMode === "pos"
                    ? "bg-[#22623a] text-white"
                    : "text-[#6a6660] hover:text-[#22623a]"
                }`}
              >
                POS Receipt (Thermal)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <a
              href={waInvoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Invoice</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-[#6a6660] hover:text-[#22623a] hover:bg-[#e6dfd5]/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div
          ref={invoiceRef}
          className={`flex-1 overflow-y-auto p-6 sm:p-10 text-[#1a1816] space-y-6 bg-white print:p-4 ${
            layoutMode === "pos" ? "max-w-md mx-auto font-mono text-xs" : ""
          }`}
        >
          {/* Header Branding */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-start border-b-2 border-[#22623a] pb-6 gap-4 relative">
            {/* Status Watermark Stamp */}
            <div
              className={`absolute right-4 top-10 sm:right-28 sm:top-2 transform -rotate-12 border-4 ${statusBadge.stampBorder} px-4 py-1.5 rounded-xl font-black text-xs sm:text-sm tracking-widest opacity-80 pointer-events-none uppercase shadow-xs`}
            >
              {statusBadge.stampText}
            </div>

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
                  Herbal Healthcare & Natural Dispensary
                </p>
                <p className="text-[11px] text-[#59534b]">{CLINIC_INFO.address}</p>
                <p className="text-[11px] text-[#59534b]">
                  Helpline / WhatsApp: +92 312 2841990
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span
                className={`text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-1 rounded-md border ${statusBadge.color}`}
              >
                {statusBadge.label}
              </span>
              <h3 className="font-mono text-sm font-bold text-[#22623a] pt-1">
                {invoiceNumber}
              </h3>
              <p className="text-[11px] text-[#6a6660]">
                Date: <span className="font-semibold text-[#1a1816]">{formattedDate}</span>
              </p>
              <p className="text-[11px] text-[#6a6660]">
                Order Ref: <span className="font-mono font-bold text-[#22623a]">{order.orderNumber}</span>
              </p>
            </div>
          </div>

          {/* Billed To / Recipient Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#faf8f5] border border-[#e6dfd5] text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#c59b27] tracking-wider block">
                Deliver To Customer:
              </span>
              <p className="font-serif text-base font-bold text-[#22623a]">
                {order.customerName}
              </p>
              <p className="text-[#59534b]">
                Phone: <strong className="text-[#1a1816]">{order.phone}</strong>
              </p>
              {order.email && <p className="text-[#6a6660]">Email: {order.email}</p>}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#c59b27] tracking-wider block">
                Shipping Destination:
              </span>
              <p className="text-[#1a1816] font-medium leading-relaxed">{order.address}</p>
              <p className="font-bold text-[#22623a]">{order.city}, Pakistan</p>
              {order.deliveryNotes && (
                <p className="text-[11px] text-[#6a6660] italic pt-1 border-t border-[#e6dfd5]">
                  Notes: {order.deliveryNotes}
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-[#e6dfd5] rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#22623a] text-white">
                <tr>
                  <th className="p-3 font-semibold">#</th>
                  <th className="p-3 font-semibold">Product Description</th>
                  <th className="p-3 font-semibold">Size / Pack</th>
                  <th className="p-3 font-semibold text-right">Unit Price</th>
                  <th className="p-3 font-semibold text-center">Qty</th>
                  <th className="p-3 font-semibold text-right">Total (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6dfd5] bg-white">
                {order.items?.map((item: any, idx: number) => (
                  <tr key={item.id || idx}>
                    <td className="p-3 text-[#6a6660] font-mono">{idx + 1}</td>
                    <td className="p-3 font-semibold text-[#22623a]">{item.productName}</td>
                    <td className="p-3 text-[#59534b]">{item.sizeWeight}</td>
                    <td className="p-3 text-right text-[#59534b]">
                      ₨ {item.price?.toLocaleString()}
                    </td>
                    <td className="p-3 text-center font-bold text-[#1a1816]">
                      {item.quantity}
                    </td>
                    <td className="p-3 text-right font-bold text-[#22623a]">
                      ₨ {(item.price * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Totals & Payments Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-2">
            {/* Payment History Log */}
            <div className="sm:col-span-6 space-y-2 text-xs">
              <span className="font-bold text-[#22623a] flex items-center gap-1.5 text-xs">
                <CreditCard className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>Payment Records & Transaction Logs</span>
              </span>

              {order.payments && order.payments.length > 0 ? (
                <div className="border border-[#e6dfd5] rounded-lg overflow-hidden divide-y divide-[#f4eee5]">
                  {order.payments.map((p: any, i: number) => (
                    <div key={p.id || i} className="p-2.5 bg-[#faf8f5] flex justify-between items-center text-[11px]">
                      <div>
                        <span className="font-bold text-[#22623a] block">
                          {p.paymentMethod} {p.reference ? `· ${p.reference}` : ""}
                        </span>
                        <span className="text-[#6a6660] text-[10px]">
                          {new Date(p.createdAt).toLocaleDateString("en-PK")}
                        </span>
                      </div>
                      <span className="font-bold text-[#2d7648]">
                        ₨ {p.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#6a6660] text-[11px]">
                  <span>Payment Mode: <strong>{order.paymentMethod || "Cash on Delivery (COD)"}</strong></span>
                  <p className="pt-0.5 text-[10px]">Settled upon door delivery by courier rider.</p>
                </div>
              )}
            </div>

            {/* Financial Summary */}
            <div className="sm:col-span-6 space-y-2 text-xs">
              <div className="p-4 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl space-y-2">
                <div className="flex justify-between text-[#59534b]">
                  <span>Items Subtotal:</span>
                  <span className="font-semibold text-[#1a1816]">
                    ₨ {order.subtotal?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[#59534b]">
                  <span>Courier Delivery:</span>
                  <span className="font-semibold text-[#1a1816]">
                    {order.shippingFee === 0 ? "FREE" : `₨ ${order.shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#22623a] pt-2 border-t border-[#e6dfd5]">
                  <span>Total Order Value:</span>
                  <span>₨ {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-[#2d7648] font-semibold">
                  <span>Amount Paid / Collected:</span>
                  <span>₨ {paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-black text-red-700 pt-2 border-t-2 border-[#22623a]">
                  <span>Net Due / Payable:</span>
                  <span>₨ {dueAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer & Signature */}
          <div className="pt-6 border-t border-[#e6dfd5] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#6a6660]">
            <div className="space-y-1 text-center sm:text-left">
              <p className="font-semibold text-[#22623a] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2d7648]" />
                <span>100% Pure Natural Herbal Remedies</span>
              </p>
              <p className="text-[11px]">
                Manufactured and dispensed under qualified Hakim supervision in Karachi.
              </p>
            </div>

            <div className="text-center sm:text-right">
              <div className="w-36 border-b border-[#22623a] pb-1 mx-auto sm:ml-auto">
                <span className="font-serif italic text-[#22623a] text-xs">Hakim Sahib</span>
              </div>
              <p className="text-[10px] text-[#6a6660] pt-0.5">Authorized Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
