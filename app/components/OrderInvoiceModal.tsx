"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { CLINIC_INFO } from "@/app/data/products";
import {
  X,
  Printer,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  FileText,
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

  const waInvoiceUrl = `https://wa.me/${order.phone?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `Assalam-o-Alaikum ${order.customerName},\nHere is your official invoice copy for Order ${order.orderNumber} from Tameer-e-Sehat Clinic.\n\nTotal Payable (COD): ₨ ${order.total?.toLocaleString()}\nAddress: ${order.address}, ${order.city}\n\nThank you for trusting Tameer-e-Sehat.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 md:p-10 flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#22623a]/60 backdrop-blur-xs transition-opacity animate-fade-in print:hidden"
      />

      {/* Invoice Card Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#e6dfd5] overflow-hidden my-auto max-h-[95vh] flex flex-col animate-fade-in print:max-w-none print:shadow-none print:border-none print:m-0 print:p-0">
        {/* Top Actions Bar (Hidden in Print) */}
        <div className="px-6 py-3.5 border-b border-[#e6dfd5] bg-[#faf8f5] flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#22623a]">
            <FileText className="w-4 h-4 text-[#c59b27]" />
            <span>Official Invoice — {invoiceNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <a
              href={waInvoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Send WhatsApp</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-[#6a6660] hover:text-[#22623a] hover:bg-[#e6dfd5]/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div
          ref={invoiceRef}
          className="flex-1 overflow-y-auto p-6 sm:p-10 text-[#1a1816] space-y-6 bg-white print:p-6"
        >
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
                  Herbal Healthcare & Natural Dispensary
                </p>
                <p className="text-[11px] text-[#59534b]">
                  {CLINIC_INFO.address}
                </p>
                <p className="text-[11px] text-[#59534b]">
                  Helpline / WhatsApp: +92 312 2841990
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 bg-[#f4f9f5] text-[#2d7648] rounded border border-[#bfeac7]">
                CASH ON DELIVERY (COD)
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-[#faf8f5] border border-[#e6dfd5] text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#c59b27] tracking-wider block">
                Deliver To Customer:
              </span>
              <p className="font-serif text-base font-bold text-[#22623a]">
                {order.customerName}
              </p>
              <p className="text-[#59534b]">Phone: <strong className="text-[#1a1816]">{order.phone}</strong></p>
              {order.email && <p className="text-[#6a6660]">Email: {order.email}</p>}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#c59b27] tracking-wider block">
                Shipping Destination:
              </span>
              <p className="text-[#1a1816] font-medium leading-relaxed">
                {order.address}
              </p>
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
                    <td className="p-3 font-semibold text-[#22623a]">
                      {item.productName}
                    </td>
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

          {/* Financial Calculation */}
          <div className="flex justify-end pt-2">
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-[#59534b]">
                <span>Subtotal:</span>
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
              <div className="flex justify-between text-base font-bold text-[#22623a] pt-2 border-t-2 border-[#22623a]">
                <span>Total Amount (COD):</span>
                <span>₨ {order.total?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer & Hakim Stamp */}
          <div className="pt-8 border-t border-[#e6dfd5] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#6a6660]">
            <div className="space-y-1 text-center sm:text-left">
              <p className="font-semibold text-[#22623a] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2d7648]" />
                <span>100% Pure Natural Remedies Guaranteed</span>
              </p>
              <p className="text-[11px]">
                Prepared and packaged hygienically at Tameer-e-Sehat Karachi Dispensary.
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
