import React from "react";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CLINIC_INFO } from "@/app/data/products";
import InvoicePrintButton from "@/app/components/InvoicePrintButton";
import {
  FileText,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";

interface InvoicePageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id }, { orderNumber: id }],
    },
    include: {
      items: true,
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const invoiceNumber = `INV-${order.orderNumber}`;
  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-PK", {
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
    color: "bg-warning-soft text-warning border-warning-line",
    stampText: "COD DUE ON DELIVERY",
    stampBorder: "border-warning text-warning",
  };

  if (order.orderStatus === "CANCELLED") {
    statusBadge = {
      label: "CANCELLED",
      color: "bg-danger-soft text-danger border-danger/30",
      stampText: "CANCELLED",
      stampBorder: "border-danger text-danger",
    };
  } else if (dueAmount === 0 || order.paymentStatus === "PAID") {
    statusBadge = {
      label: "PAID IN FULL",
      color: "bg-success-soft text-success border-success-line",
      stampText: "PAID IN FULL",
      stampBorder: "border-success text-success",
    };
  } else if (paidAmount > 0 && dueAmount > 0) {
    statusBadge = {
      label: `PARTIALLY PAID (₨ ${paidAmount.toLocaleString()})`,
      color: "bg-info-soft text-info border-info-line",
      stampText: "PARTIALLY PAID",
      stampBorder: "border-info text-info",
    };
  }

  const cleanPhone = order.phone.replace(/[^0-9]/g, "");
  const waContactUrl = `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(
    `Assalam-o-Alaikum, I am inquiring about my invoice ${invoiceNumber} for order ${order.orderNumber}.`
  )}`;

  return (
    <div className="bg-surface min-h-screen py-8 sm:py-12 print:bg-white print:p-0">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 print:max-w-none print:px-0">
        
        {/* Navigation & Action Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-body hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Account</span>
          </Link>

          <div className="flex items-center gap-2">
            <InvoicePrintButton />
            <a
              href={waContactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-whatsapp hover:bg-whatsapp-hover text-on-whatsapp text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Helpline WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Official Printable Invoice Card */}
        <div className="bg-white rounded-2xl border border-line p-6 sm:p-10 shadow-lg space-y-6 print:border-none print:shadow-none print:p-0">
          
          {/* Header Branding */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-start border-b-2 border-primary pb-6 gap-4 relative">
            {/* Status Stamp */}
            <div
              className={`absolute right-4 top-10 sm:right-28 sm:top-2 transform -rotate-12 border-4 ${statusBadge.stampBorder} px-4 py-1.5 rounded-xl font-black text-xs sm:text-sm tracking-widest opacity-80 pointer-events-none uppercase shadow-xs`}
            >
              {statusBadge.stampText}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative h-12 aspect-[463/214] shrink-0 rounded-lg overflow-hidden bg-surface p-1 border border-line shadow-2xs">
                <Image
                  src="/images/cropped-logo.png"
                  alt="Tameer-e-Sehat Official Logo"
                  fill
                  sizes="120px"
                  priority
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-primary tracking-tight">
                  TAMEER-E-SEHAT
                </h1>
                <p className="text-[11px] uppercase tracking-widest font-semibold text-secondary-text">
                  Herbal Healthcare &amp; Natural Dispensary
                </p>
                <p className="text-[11px] text-ink-body">{CLINIC_INFO.address}</p>
                <p className="text-[11px] text-ink-body">
                  Helpline / WhatsApp: +92 335 3547888
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span
                className={`text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-1 rounded-md border ${statusBadge.color}`}
              >
                {statusBadge.label}
              </span>
              <h3 className="font-mono text-sm font-bold text-primary pt-1">
                {invoiceNumber}
              </h3>
              <p className="text-[11px] text-ink-muted">
                Date: <span className="font-semibold text-ink">{formattedDate}</span>
              </p>
              <p className="text-[11px] text-ink-muted">
                Order Ref: <span className="font-mono font-bold text-primary">{order.orderNumber}</span>
              </p>
            </div>
          </div>

          {/* Billed To / Recipient Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-surface border border-line text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-secondary-text tracking-wider block">
                Deliver To Customer:
              </span>
              <p className="font-serif text-base font-bold text-primary">
                {order.customerName}
              </p>
              <p className="text-ink-body">
                Phone: <strong className="text-ink">{order.phone}</strong>
              </p>
              {order.email && <p className="text-ink-muted">Email: {order.email}</p>}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-secondary-text tracking-wider block">
                Shipping Destination:
              </span>
              <p className="text-ink font-medium leading-relaxed">{order.address}</p>
              <p className="font-bold text-primary">{order.city}, Pakistan</p>
              {order.deliveryNotes && (
                <p className="text-[11px] text-ink-muted italic pt-1 border-t border-line">
                  Notes: {order.deliveryNotes}
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-line rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">#</th>
                  <th className="py-2.5 px-4 font-semibold">Remedy / Item Description</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Packaging / Size</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Qty</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Unit Price</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {order.items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-surface/50">
                    <td className="py-3 px-4 text-ink-muted">{index + 1}</td>
                    <td className="py-3 px-4 font-semibold text-primary">
                      {item.productName}
                      {item.productUrduName && (
                        <span className="block text-[11px] text-ink-muted font-normal">
                          {item.productUrduName}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-ink-body">
                      {item.sizeWeight || item.sizeName || "Standard"}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-ink">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-right text-ink-body font-mono">
                      ₨ {item.price.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-primary font-mono">
                      ₨ {item.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Totals Calculation Box */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pt-2">
            <div className="space-y-2 max-w-sm text-xs text-ink-body">
              <div className="p-3 bg-surface rounded-xl border border-line space-y-1">
                <span className="font-bold text-primary block">Payment Instructions:</span>
                <p className="text-[11px] leading-relaxed text-ink-muted">
                  Please hand over exact cash upon parcel delivery to the courier rider. For online transfers, quote invoice <strong className="font-mono text-primary">{invoiceNumber}</strong>.
                </p>
              </div>
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-xs text-ink">
              <div className="flex justify-between py-1 border-b border-line">
                <span className="text-ink-muted">Products Subtotal:</span>
                <span className="font-semibold font-mono">₨ {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line">
                <span className="text-ink-muted">Confirmed Delivery Charges:</span>
                <span className="font-semibold font-mono text-ink">
                  {order.shippingFee === 0 ? "FREE" : `₨ ${order.shippingFee.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between py-1.5 text-sm font-bold text-primary border-b-2 border-primary">
                <span>Grand Total:</span>
                <span className="font-mono">₨ {total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 text-ink-body">
                <span>Paid Amount:</span>
                <span className="font-semibold font-mono text-success">
                  ₨ {paidAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 font-bold text-danger">
                <span>Net Payable (Balance Due):</span>
                <span className="font-mono text-sm">₨ {dueAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer & Certification */}
          <div className="border-t border-line pt-6 text-center text-xs text-ink-muted space-y-1.5">
            <p className="font-semibold text-ink">
              Matab Tameer-e-Sehat · Authentic Classical Unani Tibb &amp; Hijama Therapy
            </p>
            <p className="text-[11px]">
              Computer-generated authentic digital tax invoice · No physical signature required.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
