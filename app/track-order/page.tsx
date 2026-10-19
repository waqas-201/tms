"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CLINIC_INFO } from "@/app/data/products";
import {
  Search,
  Truck,
  Package,
  MapPin,
  AlertCircle,
  Loader2,
  ArrowRight,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ShoppingBag,
  Calendar,
  Droplets,
  Sparkles,
} from "lucide-react";

type TrackKind = "order" | "consultation" | "hijama";

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Order received",
  CONFIRMED: "Confirmed",
  DISPATCHED: "On the way",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const ORDER_STEPS = ["Order received", "Confirmed", "On the way", "Delivered"];
const ORDER_STEP_INDEX: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  DISPATCHED: 2,
  DELIVERED: 3,
};

const CONSULT_STATUS_LABELS: Record<string, string> = {
  NEW: "Booking received",
  CONFIRMED: "Confirmed",
  RESCHEDULED: "Rescheduled",
  PRESCRIBED: "Prescription issued",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const CONSULT_STEPS = [
  "Booking received",
  "Confirmed",
  "Prescription issued",
  "Completed",
];
const CONSULT_STEP_INDEX: Record<string, number> = {
  NEW: 0,
  CONFIRMED: 1,
  RESCHEDULED: 1,
  PRESCRIBED: 2,
  COMPLETED: 3,
};

const HIJAMA_STATUS_LABELS: Record<string, string> = {
  CONFIRMED: "Slot confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "Marked missed",
};

const HIJAMA_STEPS = ["Slot confirmed", "Session completed"];
const HIJAMA_STEP_INDEX: Record<string, number> = {
  CONFIRMED: 0,
  COMPLETED: 1,
};

function detectKind(ref: string): TrackKind {
  if (ref.startsWith("CON-")) return "consultation";
  if (ref.startsWith("HIJ-")) return "hijama";
  return "order";
}

function StatusTimeline({
  steps,
  current,
  cancelled = false,
  cancelledLabel = "Cancelled",
}: {
  steps: string[];
  current: number;
  cancelled?: boolean;
  cancelledLabel?: string;
}) {
  if (cancelled) {
    return (
      <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-stone-500 bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
        {cancelledLabel}
      </div>
    );
  }

  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
    >
      {steps.map((label, index) => {
        const reached = index <= current;
        const active = index === current;

        return (
          <div key={label} className="text-center space-y-2">
            <div
              className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                reached
                  ? active
                    ? "bg-[#9E7D3B] text-white ring-4 ring-[#9E7D3B]/20"
                    : "bg-[#14281D] text-white ring-4 ring-[#14281D]/10"
                  : "bg-stone-100 text-stone-400"
              }`}
            >
              {index < current ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            <span
              className={`text-[11px] font-bold block leading-tight ${
                reached ? "text-stone-900" : "text-stone-400"
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialRef = (
    searchParams.get("ref") ||
    searchParams.get("order") ||
    ""
  ).toUpperCase();

  const [refQuery, setRefQuery] = useState(initialRef);
  const [phoneQuery, setPhoneQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [kind, setKind] = useState<TrackKind | null>(null);
  const [record, setRecord] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchRecord = async (refInput: string, phoneInput: string) => {
    const ref = refInput.trim().toUpperCase();
    if (!ref) return;

    const detected = detectKind(ref);
    const digits = phoneInput.replace(/\D/g, "");

    setError(null);
    setNotice(null);

    if (detected !== "order" && digits.length < 7) {
      setKind(null);
      setRecord(null);
      setNotice(
        "Enter the phone number used when booking to view this consultation or Hijama ticket."
      );
      return;
    }

    setLoading(true);
    setKind(null);
    setRecord(null);

    try {
      if (detected === "order") {
        const res = await fetch(`/api/orders/${encodeURIComponent(ref)}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(
            data.error ||
              "No order found with this reference number. Please check your order number."
          );
        }

        setKind("order");
        setRecord(data.data);
      } else if (detected === "consultation") {
        const params = new URLSearchParams({
          ticket: ref,
          phone: phoneInput.trim(),
        });
        const res = await fetch(`/api/consultations?${params.toString()}`);
        const data = await res.json();
        const found = Array.isArray(data.data) ? data.data[0] : null;

        if (!res.ok || !data.success || !found) {
          throw new Error(
            data.error ||
              "No consultation found for that ticket and phone number."
          );
        }

        setKind("consultation");
        setRecord(found);
      } else {
        const params = new URLSearchParams({
          ticketNumber: ref,
          phone: phoneInput.trim(),
        });
        const res = await fetch(`/api/hijama/bookings?${params.toString()}`);
        const data = await res.json();
        const found = Array.isArray(data.data) ? data.data[0] : null;

        if (!res.ok || !data.success || !found) {
          throw new Error(
            data.error ||
              "No Hijama booking found for that ticket and phone number."
          );
        }

        setKind("hijama");
        setRecord(found);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialRef) return;

    setRefQuery(initialRef);

    if (detectKind(initialRef) === "order") {
      fetchRecord(initialRef, "");
    } else {
      setNotice(
        "Enter the phone number used when booking to view this consultation or Hijama ticket."
      );
    }
  }, [initialRef]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecord(refQuery, phoneQuery);
  };

  const isOrder = kind === "order";
  const isConsultation = kind === "consultation";
  const isHijama = kind === "hijama";

  const kindLabel = isOrder
    ? "Order Reference"
    : isConsultation
    ? "Consultation Ticket"
    : "Hijama Ticket";

  const statusLabel = isOrder
    ? ORDER_STATUS_LABELS[record?.orderStatus] || record?.orderStatus
    : isConsultation
    ? CONSULT_STATUS_LABELS[record?.status] || record?.status
    : HIJAMA_STATUS_LABELS[record?.status] || record?.status;

  return (
    <div className="min-h-[85vh] bg-[#FAF9F6] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#14281D]/5 rounded-full text-xs uppercase tracking-widest font-semibold text-[#14281D]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#9E7D3B]" />
            <span>Universal Booking &amp; Order Tracking</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Track Your Order or Booking
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto">
            Enter a reference number to check live status: orders{" "}
            <strong className="text-stone-900 font-mono">TMS-2026-1001</strong>,
            consultations{" "}
            <strong className="text-stone-900 font-mono">CON-2026-1234</strong>,
            or Hijama sessions{" "}
            <strong className="text-stone-900 font-mono">HIJ-2026-1001</strong>.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-sm">
          <form
            onSubmit={handleTrack}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={refQuery}
                onChange={(e) => setRefQuery(e.target.value.toUpperCase())}
                placeholder="TMS-2026-1001 / CON-2026-1234 / HIJ-2026-1001"
                className="w-full pl-10 pr-3.5 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 uppercase font-mono placeholder:text-stone-400 placeholder:normal-case focus:outline-none focus:border-[#14281D] focus:bg-white transition-colors"
              />
            </div>

            <div className="relative sm:w-44">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phoneQuery}
                onChange={(e) => setPhoneQuery(e.target.value)}
                placeholder="Phone (CON-/HIJ-)"
                className="w-full pl-10 pr-3.5 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#14281D] focus:bg-white transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#14281D] hover:bg-[#0c1b13] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <span>Track Status</span>
                  <ArrowRight className="w-4 h-4 text-[#9E7D3B]" />
                </>
              )}
            </button>
          </form>

          <p className="mt-2.5 text-[10px] text-stone-500">
            Consultation (CON-) and Hijama (HIJ-) tickets require the phone
            number used when booking. Order references work on their own.
          </p>

          {notice && (
            <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{notice}</span>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Result */}
        {record && kind && (
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-md overflow-hidden space-y-6">
            {/* Top Bar */}
            <div className="bg-[#14281D] text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <span className="text-[11px] font-mono text-[#9E7D3B] uppercase font-bold tracking-widest block">
                  Verified {kindLabel}
                </span>
                <h2 className="font-serif text-2xl font-bold tracking-tight">
                  {isOrder ? record.orderNumber : record.ticketNumber}
                </h2>
                <p className="text-xs text-stone-300 mt-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#9E7D3B]" />
                  <span>
                    {isOrder ? "Placed on: " : "Booked on: "}
                    {new Date(record.createdAt).toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </p>
              </div>

              <div className="text-left sm:text-right bg-white/5 sm:bg-transparent p-3 sm:p-0 rounded-xl border border-white/10 sm:border-0">
                {isOrder && (
                  <>
                    <span className="text-xs text-stone-300 block">
                      Amount Payable (COD)
                    </span>
                    <span className="font-serif text-2xl font-bold text-[#9E7D3B]">
                      ₨ {record.total.toLocaleString()}
                    </span>
                  </>
                )}

                {isHijama && (
                  <>
                    <span className="text-xs text-stone-300 block">
                      Session Fee
                    </span>
                    <span className="font-serif text-2xl font-bold text-[#9E7D3B]">
                      ₨ {(record.feeAmount || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-stone-300 block">
                      {record.paymentStatus === "PAID_AT_CLINIC"
                        ? "Paid at clinic"
                        : "Pay at clinic"}
                    </span>
                  </>
                )}

                {isConsultation && (
                  <>
                    <span className="text-xs text-stone-300 block">
                      Consultation Mode
                    </span>
                    <span className="font-serif text-lg font-bold text-[#9E7D3B]">
                      {record.consultationType === "ONLINE"
                        ? "Online Telehealth"
                        : "In-Person Clinic"}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="px-6 sm:px-8 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  {isOrder ? "Delivery Milestones" : "Booking Timeline"}
                </h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {statusLabel}
                  <span className="ml-1.5 text-[9px] font-mono text-emerald-600/70">
                    {isOrder ? record.orderStatus : record.status}
                  </span>
                </span>
              </div>

              {isOrder && (
                <StatusTimeline
                  steps={ORDER_STEPS}
                  current={ORDER_STEP_INDEX[record.orderStatus] ?? 0}
                  cancelled={record.orderStatus === "CANCELLED"}
                  cancelledLabel="Order cancelled"
                />
              )}

              {isConsultation && (
                <StatusTimeline
                  steps={CONSULT_STEPS}
                  current={CONSULT_STEP_INDEX[record.status] ?? 0}
                  cancelled={record.status === "CANCELLED"}
                  cancelledLabel="Booking cancelled"
                />
              )}

              {isHijama && (
                <StatusTimeline
                  steps={HIJAMA_STEPS}
                  current={HIJAMA_STEP_INDEX[record.status] ?? 0}
                  cancelled={
                    record.status === "CANCELLED" ||
                    record.status === "NO_SHOW"
                  }
                  cancelledLabel={
                    record.status === "NO_SHOW"
                      ? "Marked missed"
                      : "Session cancelled"
                  }
                />
              )}

              {isOrder && record.trackingNote && (
                <div className="mt-6 p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center gap-3">
                  <Truck className="w-5 h-5 text-emerald-800 shrink-0" />
                  <div className="text-xs text-stone-900">
                    <span className="font-bold block text-emerald-950">
                      Courier Dispatch &amp; Tracking Details:
                    </span>
                    <span className="font-mono text-xs text-emerald-900">
                      {record.trackingNote}
                    </span>
                  </div>
                </div>
              )}

              {isConsultation && record.status === "NEW" && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900">
                    <span className="font-bold block">
                      Awaiting confirmation
                    </span>
                    <span>
                      Your booking is recorded. The clinic will confirm this
                      slot on WhatsApp or phone — you can check back here
                      anytime.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Order details */}
            {isOrder && (
              <>
                <div className="p-6 sm:p-8 bg-[#FAF9F6] border-t border-stone-200/80 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-3">
                    <h4 className="font-bold text-stone-900 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                      <MapPin className="w-4 h-4 text-[#9E7D3B]" />
                      <span>Destination Address</span>
                    </h4>
                    <div className="text-stone-600 space-y-1 bg-white p-4 rounded-xl border border-stone-200/60 shadow-2xs">
                      <p className="font-bold text-stone-900">
                        {record.customerName}
                      </p>
                      <p className="font-mono text-stone-700">{record.phone}</p>
                      <p>{record.address}</p>
                      <p className="font-semibold text-stone-900">
                        {record.city}, Pakistan
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-stone-900 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                      <Package className="w-4 h-4 text-[#14281D]" />
                      <span>
                        Remedies Ordered ({record.items?.length || 0})
                      </span>
                    </h4>
                    <div className="space-y-2 bg-white p-4 rounded-xl border border-stone-200/60 shadow-2xs max-h-48 overflow-y-auto divide-y divide-stone-100">
                      {record.items?.map((item: any) => (
                        <div
                          key={item.id}
                          className="pt-2 first:pt-0 flex justify-between items-center text-xs"
                        >
                          <div>
                            <span className="text-stone-900 font-semibold block">
                              {item.productName}
                            </span>
                            <span className="text-[11px] text-stone-500">
                              {item.sizeWeight} · Qty: {item.quantity}
                            </span>
                          </div>
                          <span className="font-bold text-stone-900">
                            ₨ {item.total.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2 text-stone-600">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Need immediate guidance or rider coordination?</span>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link
                      href="/products"
                      className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors flex-1 sm:flex-initial"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Shop More</span>
                    </Link>
                    <a
                      href={`https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(
                        `Assalam-o-Alaikum, I would like to inquire about my order ${record.orderNumber}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-colors flex-1 sm:flex-initial"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>WhatsApp Helpline</span>
                    </a>
                  </div>
                </div>
              </>
            )}

            {/* Consultation details */}
            {isConsultation && (
              <>
                <div className="p-6 sm:p-8 bg-[#FAF9F6] border-t border-stone-200/80 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-3">
                    <h4 className="font-bold text-stone-900 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                      <Calendar className="w-4 h-4 text-[#9E7D3B]" />
                      <span>Appointment Details</span>
                    </h4>
                    <div className="text-stone-600 space-y-2 bg-white p-4 rounded-xl border border-stone-200/60 shadow-2xs">
                      <p>
                        <span className="text-stone-400 block text-[10px] uppercase font-bold">
                          Patient
                        </span>
                        <span className="font-semibold text-stone-900">
                          {record.fullName} · {record.phone}
                        </span>
                      </p>
                      <p>
                        <span className="text-stone-400 block text-[10px] uppercase font-bold">
                          Requested Date
                        </span>
                        <span className="font-semibold text-stone-900">
                          {record.appointmentDate || "To be coordinated"}
                        </span>
                      </p>
                      <p>
                        <span className="text-stone-400 block text-[10px] uppercase font-bold">
                          Requested Slot
                        </span>
                        <span className="font-semibold text-stone-900">
                          {record.appointmentSlot ||
                            (record.consultationType === "ONLINE"
                              ? "WhatsApp consultation"
                              : "Flexible clinic hours")}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-stone-900 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                      <Sparkles className="w-4 h-4 text-[#14281D]" />
                      <span>Clinical Summary</span>
                    </h4>
                    <div className="text-stone-600 space-y-2 bg-white p-4 rounded-xl border border-stone-200/60 shadow-2xs">
                      <p>
                        <span className="text-stone-400 block text-[10px] uppercase font-bold">
                          Primary Concern
                        </span>
                        <span className="text-stone-800">
                          {record.primarySymptoms}
                        </span>
                      </p>
                      {record.duration && (
                        <p>
                          <span className="text-stone-400 block text-[10px] uppercase font-bold">
                            Duration
                          </span>
                          <span className="text-stone-800">
                            {record.duration}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {record.prescribedTreatment && (
                    <div className="sm:col-span-2 p-4 bg-purple-50 border border-purple-200 rounded-xl text-purple-950 space-y-1">
                      <strong className="block text-[11px] uppercase tracking-wider text-purple-900 font-bold">
                        Hakim&apos;s Prescribed Botanical Protocol
                      </strong>
                      <p className="whitespace-pre-line text-xs font-mono bg-white/80 p-3 rounded-lg border border-purple-200/80">
                        {record.prescribedTreatment}
                      </p>
                    </div>
                  )}

                  {record.hakimNotes && (
                    <div className="sm:col-span-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 space-y-1">
                      <strong className="block text-[11px] uppercase tracking-wider text-emerald-900 font-bold">
                        Clinical Advice &amp; Dietary Guidelines (Parhez)
                      </strong>
                      <p className="text-xs whitespace-pre-line">
                        {record.hakimNotes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-white border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2 text-stone-600">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>
                      Need to reschedule? Quote ticket{" "}
                      <strong className="font-mono">
                        {record.ticketNumber}
                      </strong>
                      .
                    </span>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link
                      href="/account"
                      className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors flex-1 sm:flex-initial"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>My Account</span>
                    </Link>
                    <a
                      href={`https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(
                        `Assalam-o-Alaikum, I would like to ask about consultation ticket ${record.ticketNumber}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-colors flex-1 sm:flex-initial"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>WhatsApp Clinic</span>
                    </a>
                  </div>
                </div>
              </>
            )}

            {/* Hijama details */}
            {isHijama && (
              <>
                <div className="p-6 sm:p-8 bg-[#FAF9F6] border-t border-stone-200/80 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-3">
                    <h4 className="font-bold text-stone-900 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                      <Droplets className="w-4 h-4 text-[#9E7D3B]" />
                      <span>Session Details</span>
                    </h4>
                    <div className="text-stone-600 space-y-2 bg-white p-4 rounded-xl border border-stone-200/60 shadow-2xs">
                      <p>
                        <span className="text-stone-400 block text-[10px] uppercase font-bold">
                          Patient
                        </span>
                        <span className="font-semibold text-stone-900">
                          {record.fullName} · {record.phone}
                        </span>
                      </p>
                      <p>
                        <span className="text-stone-400 block text-[10px] uppercase font-bold">
                          Date
                        </span>
                        <span className="font-semibold text-stone-900">
                          {record.appointmentDate}
                          {record.hijriDate ? ` · ${record.hijriDate}` : ""}
                        </span>
                      </p>
                      <p>
                        <span className="text-stone-400 block text-[10px] uppercase font-bold">
                          Time Slot
                        </span>
                        <span className="font-semibold text-stone-900">
                          {record.appointmentSlot}
                        </span>
                      </p>
                      <p>
                        <span className="text-stone-400 block text-[10px] uppercase font-bold">
                          Session
                        </span>
                        <span className="font-semibold text-stone-900">
                          {record.gender === "FEMALE" ? "Female" : "Male"}{" "}
                          {record.isSunnahDay
                            ? "· Sunnah Day Cupping"
                            : "· Standard Cupping"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-stone-900 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                      <Sparkles className="w-4 h-4 text-[#14281D]" />
                      <span>Cupping Notes</span>
                    </h4>
                    <div className="text-stone-600 bg-white p-4 rounded-xl border border-stone-200/60 shadow-2xs min-h-[7rem]">
                      {record.cuppingReason ? (
                        <p className="text-stone-800 whitespace-pre-line">
                          {record.cuppingReason}
                        </p>
                      ) : (
                        <p className="text-stone-500">
                          No additional notes were recorded for this session.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2 text-stone-600">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>
                      Show ticket{" "}
                      <strong className="font-mono">
                        {record.ticketNumber}
                      </strong>{" "}
                      at clinic reception.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link
                      href="/account"
                      className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors flex-1 sm:flex-initial"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>My Account</span>
                    </Link>
                    <a
                      href={`https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(
                        `Assalam-o-Alaikum, I would like to ask about Hijama ticket ${record.ticketNumber}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-colors flex-1 sm:flex-initial"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>WhatsApp Clinic</span>
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] bg-[#FAF9F6] py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#14281D]" />
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
