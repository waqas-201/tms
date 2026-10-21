"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Droplets,
  Link2,
  Loader2,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search,
  User,
  X,
  Sliders,
} from "lucide-react";
import HijamaScheduleManager from "./HijamaScheduleManager";

const STATUS_OPTIONS = [
  { value: "CONFIRMED", label: "Slot confirmed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "NO_SHOW", label: "Marked missed" },
];

const STATUS_BADGES: Record<string, string> = {
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
  NO_SHOW: "bg-gray-100 text-gray-600 border-gray-300",
};

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toDateInputValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

function defaultTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  // Hijama has no sessions on Sundays; start admins on the next open day.
  if (d.getDay() === 0) d.setDate(d.getDate() + 1);
  return toDateInputValue(d);
}

interface BookingFormState {
  fullName: string;
  phone: string;
  email: string;
  age: string;
  gender: "MALE" | "FEMALE";
  appointmentDate: string;
  appointmentSlot: string;
  cuppingReason: string;
}

function emptyForm(): BookingFormState {
  return {
    fullName: "",
    phone: "",
    email: "",
    age: "",
    gender: "MALE",
    appointmentDate: defaultTomorrow(),
    appointmentSlot: "",
    cuppingReason: "",
  };
}

export default function HijamaTab() {
  const [subTab, setSubTab] = useState<"bookings" | "schedule">("bookings");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Manual entry modal
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [form, setForm] = useState<BookingFormState>(emptyForm);
  const [availability, setAvailability] = useState<any | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdBooking, setCreatedBooking] = useState<any | null>(null);

  // Optional patient account link
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupUsers, setLookupUsers] = useState<any[]>([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [linkedAccount, setLinkedAccount] = useState<any | null>(null);

  const fetchBookings = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/hijama/bookings?limit=100");
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load Hijama bookings.");
      }

      setBookings(json.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load Hijama bookings.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Load slot availability whenever date or gender changes in the form
  useEffect(() => {
    if (!isNewOpen || !form.appointmentDate) {
      setAvailability(null);
      return;
    }

    let cancelled = false;
    setAvailabilityLoading(true);

    fetch(
      `/api/hijama/availability?date=${encodeURIComponent(
        form.appointmentDate
      )}&gender=${form.gender}`
    )
      .then((res) => res.json())
      .then((json) => {
        if (cancelled || !json.success) return;
        setAvailability(json.data);
        setForm((prev) => {
          const available = (json.data.slots || []).filter(
            (slot: any) => slot.available
          );
          return {
            ...prev,
            appointmentSlot: available.some(
              (slot: any) => slot.slot === prev.appointmentSlot
            )
              ? prev.appointmentSlot
              : "",
          };
        });
      })
      .catch(() => {
        if (!cancelled) setAvailability(null);
      })
      .finally(() => {
        if (!cancelled) setAvailabilityLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isNewOpen, form.appointmentDate, form.gender]);

  const openNewBooking = () => {
    setForm(emptyForm());
    setAvailability(null);
    setCreateError(null);
    setCreatedBooking(null);
    setLinkedAccount(null);
    setLookupQuery("");
    setLookupUsers([]);
    setIsNewOpen(true);
  };

  const lookupPatients = async (queryOverride?: string) => {
    const q = (queryOverride ?? lookupQuery).trim();
    if (q.length < 3) return;

    setLookupLoading(true);
    try {
      const res = await fetch(
        `/api/admin/patient-lookup?q=${encodeURIComponent(q)}`
      );
      const json = await res.json();
      if (res.ok && json.success) {
        setLookupUsers(json.data.users || []);
      }
    } catch (err) {
      console.error("Patient lookup failed:", err);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!form.appointmentSlot) {
      setCreateError("Please select an available time slot.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/hijama/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          phone: form.phone,
          email: form.email || null,
          age: Number(form.age),
          gender: form.gender,
          appointmentDate: form.appointmentDate,
          appointmentSlot: form.appointmentSlot,
          cuppingReason: form.cuppingReason || null,
          userId: linkedAccount?.id || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create Hijama booking.");
      }

      setCreatedBooking(json.data);
      fetchBookings(true);
    } catch (err: any) {
      setCreateError(err.message || "Failed to create Hijama booking.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateBooking = async (booking: any, patch: Record<string, unknown>) => {
    setUpdatingId(booking.id);
    setError(null);

    try {
      const res = await fetch(`/api/hijama/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update booking.");
      }

      setBookings((prev) =>
        prev.map((row) => (row.id === booking.id ? json.data : row))
      );
    } catch (err: any) {
      setError(err.message || "Failed to update booking.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return bookings.filter((booking) => {
      if (statusFilter !== "ALL" && booking.status !== statusFilter) {
        return false;
      }
      if (!term) return true;
      return [
        booking.ticketNumber,
        booking.fullName,
        booking.phone,
        booking.email,
        booking.appointmentDate,
        booking.appointmentSlot,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [bookings, search, statusFilter]);

  const activeCount = bookings.filter(
    (b) => b.status !== "CANCELLED" && b.status !== "NO_SHOW"
  ).length;

  const availableSlots = (availability?.slots || []).filter(
    (slot: any) => slot.available
  );

  return (
    <div className="space-y-5">
      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-[#f4eee5]/70 rounded-2xl border border-[#e6dfd5] w-fit shadow-2xs">
        <button
          type="button"
          onClick={() => setSubTab("bookings")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            subTab === "bookings"
              ? "bg-[#14281D] text-white shadow-xs"
              : "text-[#59534b] hover:text-[#14281D]"
          }`}
        >
          <Droplets className="w-3.5 h-3.5" />
          <span>Bookings &amp; Patients ({bookings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("schedule")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            subTab === "schedule"
              ? "bg-[#14281D] text-white shadow-xs"
              : "text-[#59534b] hover:text-[#14281D]"
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-[#c59b27]" />
          <span>Slots &amp; Schedule Manager</span>
        </button>
      </div>

      {subTab === "schedule" ? (
        <HijamaScheduleManager />
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#e6dfd5] shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#eef7f1] border border-[#cde4d6] flex items-center justify-center text-[#22623a]">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#14281D]">
                Hijama Sessions
              </h2>
              <p className="text-[11px] text-[#6a6660]">
                {bookings.length} total · {activeCount} active · manual entry
                for phone / walk-in bookings
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8c827a] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ticket, name, phone"
              className="w-52 pl-8 pr-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D] focus:bg-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D]"
          >
            <option value="ALL">All statuses</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            onClick={openNewBooking}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#14281D] hover:bg-[#1e3d2c] transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Booking</span>
          </button>

          <button
            onClick={() => fetchBookings(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#4a4640] hover:bg-[#faf8f5] border border-[#e6dfd5] transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-[#e6dfd5] text-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#14281D] mx-auto mb-2" />
          <p className="text-xs text-[#6a6660]">Loading Hijama bookings…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#e6dfd5] text-center space-y-3">
          <Droplets className="w-10 h-10 text-[#8c827a] opacity-40 mx-auto" />
          <h3 className="font-serif text-base font-bold text-[#14281D]">
            {bookings.length === 0
              ? "No Hijama bookings yet"
              : "No bookings match your filters"}
          </h3>
          <p className="text-xs text-[#6a6660] max-w-sm mx-auto">
            Add phone or WhatsApp Hijama appointments manually — each booking
            gets a real ticket and appears in the patient&apos;s dashboard when
            linked to an account.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e6dfd5] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf8f5] border-b border-[#e6dfd5] text-[10px] uppercase tracking-wide text-[#78716C]">
                <tr>
                  <th className="px-4 py-3 font-bold">Ticket / Patient</th>
                  <th className="px-4 py-3 font-bold">Appointment</th>
                  <th className="px-4 py-3 font-bold">Session</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Payment</th>
                  <th className="px-4 py-3 font-bold text-right">Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4eee5]">
                {filtered.map((booking) => {
                  const inactive =
                    booking.status === "CANCELLED" ||
                    booking.status === "NO_SHOW";

                  return (
                    <tr
                      key={booking.id}
                      className={inactive ? "opacity-60" : ""}
                    >
                      <td className="px-4 py-3 align-top">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-[#14281D]">
                            {booking.ticketNumber}
                          </span>
                          <div className="font-semibold text-[#1a1816]">
                            {booking.fullName}
                          </div>
                          <div className="text-[11px] text-[#6a6660] flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {booking.phone}
                          </div>
                          {booking.user ? (
                            <div className="text-[10px] text-emerald-700 flex items-center gap-1">
                              <Link2 className="w-3 h-3" />
                              Linked account
                            </div>
                          ) : (
                            <div className="text-[10px] text-[#8c827a]">
                              Guest / unlinked
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <div className="font-semibold text-[#1a1816]">
                          {booking.appointmentDate}
                        </div>
                        <div className="text-[11px] text-[#6a6660] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {booking.appointmentSlot}
                        </div>
                        {booking.hijriDate && (
                          <div className="text-[10px] text-[#8c6a15]">
                            {booking.hijriDate}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 align-top">
                        <div className="font-semibold text-[#1a1816]">
                          {booking.gender === "FEMALE"
                            ? "Female"
                            : "Male"}
                        </div>
                        <div className="text-[11px] text-[#6a6660]">
                          {booking.isSunnahDay
                            ? "Sunnah Day"
                            : "Standard"}
                        </div>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                              STATUS_BADGES[booking.status] ||
                              "bg-gray-100 text-gray-600 border-gray-300"
                            }`}
                          >
                            {
                              STATUS_OPTIONS.find(
                                (option) => option.value === booking.status
                              )?.label
                            }
                          </span>
                          <select
                            value={booking.status}
                            onChange={(e) =>
                              updateBooking(booking, {
                                status: e.target.value,
                              })
                            }
                            disabled={updatingId === booking.id}
                            className="block w-full px-2 py-1.5 bg-white border border-[#e6dfd5] rounded-lg text-[11px] text-[#1a1816] focus:outline-none focus:border-[#14281D] disabled:opacity-50"
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <select
                          value={booking.paymentStatus}
                          onChange={(e) =>
                            updateBooking(booking, {
                              paymentStatus: e.target.value,
                            })
                          }
                          disabled={updatingId === booking.id}
                          className="px-2 py-1.5 bg-white border border-[#e6dfd5] rounded-lg text-[11px] text-[#1a1816] focus:outline-none focus:border-[#14281D] disabled:opacity-50"
                        >
                          <option value="UNPAID">Unpaid</option>
                          <option value="PAID_AT_CLINIC">Paid at clinic</option>
                        </select>
                      </td>

                      <td className="px-4 py-3 align-top text-right font-bold text-[#14281D]">
                        ₨ {(booking.feeAmount || 0).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Booking Modal */}
      {isNewOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#e6dfd5] max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[#e6dfd5] sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-serif text-base font-bold text-[#14281D]">
                  New Hijama Booking — Manual Entry
                </h3>
                <p className="text-[11px] text-[#6a6660]">
                  For phone, WhatsApp, or walk-in appointments. Capacity rules
                  still apply.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewOpen(false)}
                className="w-8 h-8 rounded-full bg-[#faf8f5] hover:bg-gray-200 flex items-center justify-center text-[#1a1816] cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              {createdBooking ? (
                <div className="space-y-4">
                  <div className="text-center space-y-2 bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                    <CheckCircle2 className="w-9 h-9 text-emerald-600 mx-auto" />
                    <h4 className="font-serif text-base font-bold text-emerald-900">
                      Hijama Booking Created
                    </h4>
                    <p className="text-xs text-emerald-800">
                      Ticket:{" "}
                      <strong className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-200">
                        {createdBooking.ticketNumber}
                      </strong>
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      {createdBooking.fullName} ·{" "}
                      {createdBooking.appointmentDate} ·{" "}
                      {createdBooking.appointmentSlot}
                    </p>
                    {createdBooking.hijriDate && (
                      <p className="text-[11px] text-[#6a6660]">
                        {createdBooking.hijriDate}
                        {createdBooking.isSunnahDay
                          ? " · Sunnah Day"
                          : ""}
                      </p>
                    )}
                    <p className="text-[11px] text-[#6a6660] leading-relaxed">
                      {createdBooking.userId
                        ? "Linked to the patient's account — it now appears in their dashboard."
                        : "Not linked to an account — the patient can track it with the ticket and phone."}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsNewOpen(false)}
                      className="flex-1 h-10 bg-[#14281D] hover:bg-[#1e3d2c] text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Done
                    </button>
                    <button
                      type="button"
                      onClick={openNewBooking}
                      className="flex-1 h-10 bg-[#faf8f5] hover:bg-gray-100 border border-[#e6dfd5] text-[#14281D] text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Create Another
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreate} className="space-y-3">
                  {createError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-700 flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{createError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-0.5">
                      <label className="text-[11px] font-semibold text-[#1a1816]">
                        Patient Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.fullName}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            fullName: e.target.value,
                          }))
                        }
                        placeholder="e.g. Ahmed Khan"
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D] focus:bg-white"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[11px] font-semibold text-[#1a1816]">
                        WhatsApp / Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        onBlur={() => {
                          if (form.phone.trim().length >= 3) {
                            setLookupQuery(form.phone);
                            lookupPatients(form.phone);
                          }
                        }}
                        placeholder="0300-1234567"
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="space-y-0.5 sm:col-span-2">
                      <label className="text-[11px] font-semibold text-[#1a1816]">
                        Email{" "}
                        <span className="text-[#8c827a] font-normal">
                          (optional)
                        </span>
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="patient@example.com"
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D] focus:bg-white"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[11px] font-semibold text-[#1a1816]">
                        Age <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        max={120}
                        value={form.age}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            age: e.target.value,
                          }))
                        }
                        placeholder="e.g. 38"
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div className="space-y-0.5">
                      <label className="text-[11px] font-semibold text-[#1a1816]">
                        Session For
                      </label>
                      <select
                        value={form.gender}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            gender: e.target.value as "MALE" | "FEMALE",
                            appointmentSlot: "",
                          }))
                        }
                        className="w-full px-2.5 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D]"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                      </select>
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[11px] font-semibold text-[#1a1816]">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        min={toDateInputValue(new Date())}
                        value={form.appointmentDate}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            appointmentDate: e.target.value,
                            appointmentSlot: "",
                          }))
                        }
                        className="w-full px-2.5 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D]"
                      />
                    </div>
                    <div className="space-y-0.5 col-span-2 sm:col-span-1">
                      <label className="text-[11px] font-semibold text-[#1a1816]">
                        Time Slot <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={form.appointmentSlot}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            appointmentSlot: e.target.value,
                          }))
                        }
                        disabled={availabilityLoading || !availability?.isOpen}
                        className="w-full px-2.5 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D] disabled:opacity-60"
                      >
                        {availabilityLoading ? (
                          <option value="">Loading slots…</option>
                        ) : !availability?.isOpen ? (
                          <option value="">Clinic closed</option>
                        ) : (
                          <>
                            <option value="">Select a time…</option>
                            {availableSlots.map((slot: any) => (
                              <option key={slot.slot} value={slot.slot}>
                                {slot.slot}
                                {slot.seatsRemaining != null
                                  ? slot.seatsRemaining > 0
                                    ? " · Available"
                                    : " · Booked"
                                  : ""}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  {!availabilityLoading && availability && (
                    <div className="text-[10px] text-[#6a6660] flex flex-wrap items-center gap-x-3 gap-y-1">
                      {availability.isOpen ? (
                        <>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#22623a]" />
                            {availability.dayName} ·{" "}
                            {availability.slots?.length || 0} slots
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Droplets className="w-3 h-3 text-[#22623a]" />
                            Fee ₨{" "}
                            {(availability.standardFee || 0).toLocaleString()}
                          </span>
                          {availability.isSunnahDay && (
                            <span className="text-[#8c6a15] font-semibold">
                              Sunnah Day
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-amber-700 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {availability.overrideNote ||
                            `Clinic closed on ${availability.dayName}.`}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="space-y-0.5">
                    <label className="text-[11px] font-semibold text-[#1a1816]">
                      Reason / Notes
                    </label>
                    <textarea
                      rows={2}
                      value={form.cuppingReason}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          cuppingReason: e.target.value,
                        }))
                      }
                      placeholder="Pain relief, migraine, general detox, Sunnah revival…"
                      className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D] focus:bg-white resize-none"
                    />
                  </div>

                  {/* Optional account link */}
                  <div className="bg-[#faf8f5] border border-[#e6dfd5] rounded-xl p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-[11px]">
                        <span className="text-[#78716C] block font-semibold uppercase tracking-wide text-[10px]">
                          Patient Account (optional)
                        </span>
                        {linkedAccount ? (
                          <strong className="text-[#14281D]">
                            {linkedAccount.name || linkedAccount.email}
                            {linkedAccount.email
                              ? ` · ${linkedAccount.email}`
                              : ""}
                          </strong>
                        ) : (
                          <span className="text-[#6a6660]">
                            Not linked — trackable via ticket + phone only.
                          </span>
                        )}
                      </div>
                      {linkedAccount && (
                        <button
                          type="button"
                          onClick={() => setLinkedAccount(null)}
                          className="px-2.5 py-1.5 bg-white border border-[#e6dfd5] hover:bg-rose-50 rounded-lg text-[10px] font-bold text-rose-600 cursor-pointer shrink-0"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={lookupQuery}
                        onChange={(e) => setLookupQuery(e.target.value)}
                        placeholder="Search phone, email, or name"
                        className="flex-1 px-2.5 py-1.5 bg-white border border-[#e6dfd5] rounded-lg text-[11px] text-[#1a1816] focus:outline-none focus:border-[#14281D]"
                      />
                      <button
                        type="button"
                        onClick={() => lookupPatients()}
                        disabled={lookupLoading || lookupQuery.trim().length < 3}
                        className="px-3 py-1.5 bg-[#14281D] hover:bg-[#1e3d2c] text-white rounded-lg text-[10px] font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1"
                      >
                        {lookupLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Search className="w-3 h-3" />
                        )}
                        Find
                      </button>
                    </div>

                    {lookupUsers.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-[#e6dfd5]">
                        {lookupUsers.slice(0, 4).map((u: any) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => setLinkedAccount(u)}
                            className={`w-full text-left text-[11px] px-2 py-1.5 rounded-lg border flex items-center justify-between gap-2 cursor-pointer ${
                              linkedAccount?.id === u.id
                                ? "bg-emerald-50 border-emerald-300"
                                : "bg-white border-[#e6dfd5] hover:border-[#14281D]/30"
                            }`}
                          >
                            <span>
                              <strong>{u.name || u.email}</strong>
                              {u.email ? ` · ${u.email}` : ""}
                              {u.phone ? ` · ${u.phone}` : ""}
                            </span>
                            {linkedAccount?.id === u.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <Link2 className="w-3.5 h-3.5 text-[#78716C] shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || availabilityLoading}
                    className="w-full h-11 bg-[#14281D] hover:bg-[#1e3d2c] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                        <span>Creating Booking...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 shrink-0" />
                        <span>Create Hijama Booking</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
