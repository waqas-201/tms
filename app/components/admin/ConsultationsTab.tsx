"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  Search,
  RefreshCw,
  Phone,
  Mail,
  Activity,
  FileText,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Trash2,
  Loader2,
  ExternalLink,
  X,
  Check,
  Building2,
  Video,
  Plus,
} from "lucide-react";

interface Consultation {
  id: string;
  ticketNumber: string;
  fullName: string;
  age: number;
  gender: string;
  phone: string | null;
  email: string | null;
  city: string;
  primarySymptoms: string;
  duration: string;
  previousTreatments: string | null;
  currentMedications: string | null;
  digestiveState: string | null;
  sleepEnergyState: string | null;
  channel: string;
  consultationType: string;
  appointmentDate: string | null;
  appointmentSlot: string | null;
  preferredContact: string;
  status: string;
  hakimNotes: string | null;
  prescribedTreatment: string | null;
  reportUrl?: string | null;
  reportName?: string | null;
  reportSize?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

const STATUS_BADGES: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  NEW: {
    label: "Pending",
    bg: "bg-warning-soft",
    text: "text-warning",
    border: "border-warning-line",
  },
  CONFIRMED: {
    label: "Confirmed",
    bg: "bg-success-soft",
    text: "text-success",
    border: "border-success-line",
  },
  RESCHEDULED: {
    label: "Rescheduled",
    bg: "bg-info-soft",
    text: "text-info",
    border: "border-info-line",
  },
  PRESCRIBED: {
    label: "Prescribed",
    bg: "bg-plum-soft",
    text: "text-plum",
    border: "border-plum-line",
  },
  COMPLETED: {
    label: "Completed",
    bg: "bg-surface-sunken",
    text: "text-neutral-700",
    border: "border-line-strong",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-danger-soft",
    text: "text-danger",
    border: "border-danger/20",
  },
};

export default function ConsultationsTab() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // ── Centered Modal State ──
  const [selectedConsultation, setSelectedConsultation] =
    useState<Consultation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState("");
  const [modalSlot, setModalSlot] = useState("");
  const [modalSlots, setModalSlots] = useState<
    { slot: string; available: boolean }[]
  >([]);
  const [modalSlotsLoading, setModalSlotsLoading] = useState(false);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalNotice, setModalNotice] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  // Global action banner for feedback
  const [actionNotice, setActionNotice] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  // ── Manual booking (staff entry for phone/walk-in) ──
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [newBookingSubmitting, setNewBookingSubmitting] = useState(false);
  const [newBookingError, setNewBookingError] = useState<string | null>(null);
  const [newBookingSuccess, setNewBookingSuccess] = useState<any | null>(null);
  const [newBookingAvail, setNewBookingAvail] = useState<any | null>(null);
  const [newBookingAvailLoading, setNewBookingAvailLoading] = useState(false);
  const [newBooking, setNewBooking] = useState({
    fullName: "",
    phone: "",
    email: "",
    city: "Karachi",
    consultationType: "IN_PERSON",
    channel: "WHATSAPP",
    status: "CONFIRMED",
    primarySymptoms: "",
    appointmentDate: "",
    appointmentSlot: "",
  });

  const fetchConsultations = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      try {
        const params = new URLSearchParams();
        if (statusFilter !== "ALL") params.set("status", statusFilter);
        if (searchQuery.trim()) params.set("search", searchQuery.trim());
        if (dateFilter) params.set("date", dateFilter);

        const res = await fetch(`/api/consultations?${params.toString()}`);
        const json = await res.json();
        if (res.ok && json.success) {
          setConsultations(json.data || []);
        }
      } catch (err) {
        console.error("Failed to load consultations:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [statusFilter, searchQuery, dateFilter]
  );

  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  // Open the centered modal
  const handleOpenModal = (item: Consultation) => {
    setSelectedConsultation(item);

    const fallback = new Date();
    fallback.setDate(fallback.getDate() + 1);
    const pad = (n: number) => n.toString().padStart(2, "0");
    const fallbackDate = `${fallback.getFullYear()}-${pad(
      fallback.getMonth() + 1
    )}-${pad(fallback.getDate())}`;

    setModalDate(item.appointmentDate || fallbackDate);
    setModalSlot(item.appointmentSlot || "");
    setModalNotice(null);
    setIsModalOpen(true);
  };

  // Dynamically load available slots for in-person requests
  useEffect(() => {
    if (
      !isModalOpen ||
      !selectedConsultation ||
      selectedConsultation.consultationType !== "IN_PERSON" ||
      !modalDate
    ) {
      setModalSlots([]);
      return;
    }

    let cancelled = false;
    setModalSlotsLoading(true);

    fetch(`/api/consultations/availability?date=${encodeURIComponent(modalDate)}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled || !json.success) return;
        const slots = (json.data?.slots || []) as {
          slot: string;
          available: boolean;
        }[];
        setModalSlots(slots);
        setModalSlot((prev) => {
          if (slots.some((s) => s.slot === prev && s.available)) return prev;
          if (slots.some((s) => s.slot === prev)) return prev;
          return slots.find((s) => s.available)?.slot || "";
        });
      })
      .catch(() => {
        if (!cancelled) setModalSlots([]);
      })
      .finally(() => {
        if (!cancelled) setModalSlotsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isModalOpen, selectedConsultation, modalDate]);

  // ── Action 1: Confirm Request ──
  const handleConfirm = async () => {
    if (!selectedConsultation) return;
    setModalSubmitting(true);
    setModalNotice(null);

    const isInPerson = selectedConsultation.consultationType === "IN_PERSON";
    try {
      const res = await fetch(`/api/consultations/${selectedConsultation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CONFIRMED",
          ...(isInPerson && modalDate ? { appointmentDate: modalDate } : {}),
          ...(isInPerson && modalSlot ? { appointmentSlot: modalSlot } : {}),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to confirm request.");
      }

      const updated = json.data;
      setSelectedConsultation(updated);
      setConsultations((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );

      const contactEmail =
        updated.patientEmail || updated.email || updated.user?.email;
      const successMsg = contactEmail
        ? `Request confirmed! Confirmation email dispatched to ${contactEmail}.`
        : `Request confirmed! (No email address on file for this ticket).`;

      setModalNotice({ tone: "success", message: successMsg });
      setActionNotice({
        tone: "success",
        message: `${updated.ticketNumber}: ${successMsg}`,
      });
    } catch (err: any) {
      setModalNotice({
        tone: "error",
        message: err.message || "Failed to confirm request.",
      });
    } finally {
      setModalSubmitting(false);
    }
  };

  // ── Action 2: Put into Pending ──
  const handleSetPending = async () => {
    if (!selectedConsultation) return;
    setModalSubmitting(true);
    setModalNotice(null);

    try {
      const res = await fetch(`/api/consultations/${selectedConsultation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "NEW",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to put request into pending.");
      }

      const updated = json.data;
      setSelectedConsultation(updated);
      setConsultations((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );

      const successMsg = `Ticket ${updated.ticketNumber} marked as Pending.`;
      setModalNotice({ tone: "success", message: successMsg });
      setActionNotice({ tone: "success", message: successMsg });
    } catch (err: any) {
      setModalNotice({
        tone: "error",
        message: err.message || "Failed to update status.",
      });
    } finally {
      setModalSubmitting(false);
    }
  };

  // ── Action 3: Delete Request ──
  const handleDelete = async (id: string, ticket: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete consultation ${ticket}? This action cannot be undone.`
      )
    ) {
      return;
    }

    setModalSubmitting(true);
    try {
      const res = await fetch(`/api/consultations/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setIsModalOpen(false);
        setSelectedConsultation(null);
        setConsultations((prev) => prev.filter((c) => c.id !== id));
        setActionNotice({
          tone: "success",
          message: `Consultation ${ticket} was deleted.`,
        });
      } else {
        alert(json.error || "Failed to delete.");
      }
    } catch (err: any) {
      alert("Error deleting consultation.");
    } finally {
      setModalSubmitting(false);
    }
  };

  // ── Manual Booking Helpers ──
  const openNewBooking = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const pad = (n: number) => n.toString().padStart(2, "0");
    const dateStr = `${tomorrow.getFullYear()}-${pad(
      tomorrow.getMonth() + 1
    )}-${pad(tomorrow.getDate())}`;

    setNewBooking({
      fullName: "",
      phone: "",
      email: "",
      city: "Karachi",
      consultationType: "IN_PERSON",
      channel: "WHATSAPP",
      status: "CONFIRMED",
      primarySymptoms: "",
      appointmentDate: dateStr,
      appointmentSlot: "",
    });
    setNewBookingError(null);
    setNewBookingSuccess(null);
    setNewBookingAvail(null);
    setIsNewBookingOpen(true);
  };

  useEffect(() => {
    if (
      !isNewBookingOpen ||
      newBooking.consultationType !== "IN_PERSON" ||
      !newBooking.appointmentDate
    ) {
      setNewBookingAvail(null);
      return;
    }

    let cancelled = false;
    setNewBookingAvailLoading(true);

    fetch(
      `/api/consultations/availability?date=${encodeURIComponent(
        newBooking.appointmentDate
      )}`
    )
      .then((res) => res.json())
      .then((json) => {
        if (cancelled || !json.success) return;
        setNewBookingAvail(json.data);
        setNewBooking((prev) => {
          const available = (json.data.slots || []).filter(
            (slot: any) => slot.available
          );
          return {
            ...prev,
            appointmentSlot: available.some(
              (slot: any) => slot.slot === prev.appointmentSlot
            )
              ? prev.appointmentSlot
              : available[0]?.slot || "",
          };
        });
      })
      .catch(() => {
        if (!cancelled) setNewBookingAvail(null);
      })
      .finally(() => {
        if (!cancelled) setNewBookingAvailLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isNewBookingOpen, newBooking.consultationType, newBooking.appointmentDate]);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewBookingError(null);
    setNewBookingSubmitting(true);

    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffBooking: true,
          patientName: newBooking.fullName,
          patientPhone: newBooking.phone,
          patientEmail: newBooking.email || undefined,
          fullName: newBooking.fullName,
          phone: newBooking.phone,
          email: newBooking.email || undefined,
          city: newBooking.city || "Karachi",
          primarySymptoms:
            newBooking.primarySymptoms ||
            "Manual booking created by clinic staff",
          channel: newBooking.channel,
          consultationType: newBooking.consultationType,
          appointmentDate:
            newBooking.consultationType === "IN_PERSON"
              ? newBooking.appointmentDate || null
              : null,
          appointmentSlot:
            newBooking.consultationType === "IN_PERSON"
              ? newBooking.appointmentSlot || null
              : null,
          preferredContact:
            newBooking.channel === "WHATSAPP" ? "WHATSAPP" : "EMAIL",
          status: newBooking.status,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create booking.");
      }

      setNewBookingSuccess(json.data);
      fetchConsultations(true);
    } catch (err: any) {
      setNewBookingError(err.message || "Failed to create booking.");
    } finally {
      setNewBookingSubmitting(false);
    }
  };

  const modalBadge = selectedConsultation
    ? STATUS_BADGES[selectedConsultation.status] || STATUS_BADGES.NEW
    : STATUS_BADGES.NEW;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl border border-line p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
            <Activity className="w-5 h-5 text-secondary-text" />
            <span>Consultation Requests</span>
          </h2>
          <p className="text-xs text-ink-muted">
            Manage incoming patient consultation requests, confirm appointments, and dispatch status alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openNewBooking}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-surface-inverse hover:bg-brand-green-900 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Booking</span>
          </button>
          <button
            onClick={() => fetchConsultations(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-surface border border-line transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-ink-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patient name, phone, ticket, city..."
            className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-ink"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-ink"
          >
            <option value="ALL">All Statuses ({consultations.length})</option>
            <option value="NEW">Pending Requests</option>
            <option value="CONFIRMED">Confirmed Slots</option>
            <option value="RESCHEDULED">Rescheduled</option>
            <option value="PRESCRIBED">Prescribed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-ink"
          />
        </div>
      </div>

      {/* Global Action feedback */}
      {actionNotice && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
            actionNotice.tone === "success"
              ? "bg-success-soft border-success-line text-success"
              : "bg-danger-soft border-danger/20 text-danger"
          }`}
        >
          <span className="flex items-center gap-2">
            {actionNotice.tone === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{actionNotice.message}</span>
          </span>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="cursor-pointer opacity-70 hover:opacity-100"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Consultations Table */}
      <div className="bg-white rounded-2xl border border-line overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-ink space-y-2">
            <Loader2 className="w-8 h-8 animate-spin mx-auto" />
            <p className="text-xs font-semibold">Loading consultation requests...</p>
          </div>
        ) : consultations.length === 0 ? (
          <div className="py-16 text-center text-ink-muted space-y-2">
            <Calendar className="w-10 h-10 mx-auto text-ink-subtle/60" />
            <p className="text-sm font-semibold text-ink">No consultations found</p>
            <p className="text-xs">Adjust your search query or status filter above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface text-ink-subtle uppercase text-[10px] font-bold border-b border-line">
                <tr>
                  <th className="py-3.5 px-4">Ticket / Date</th>
                  <th className="py-3.5 px-4">Patient Details</th>
                  <th className="py-3.5 px-4">Mode / Slot</th>
                  <th className="py-3.5 px-4">Primary Concern</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {consultations.map((item) => {
                  const badge = STATUS_BADGES[item.status] || STATUS_BADGES.NEW;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-surface/60 transition-colors group cursor-pointer"
                      onClick={() => handleOpenModal(item)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-ink">
                          {item.ticketNumber}
                        </div>
                        <div className="text-[10px] text-ink-subtle">
                          {new Date(item.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-ink">{item.fullName}</div>
                        <div className="text-[11px] text-ink-muted">
                          {[
                            item.gender,
                            item.age ? `${item.age} yrs` : null,
                            item.city,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </div>
                        {item.phone && (
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="text-[11px] text-ink font-mono">
                              {item.phone}
                            </span>
                            <a
                              href={`https://wa.me/${item.phone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded-md text-success hover:bg-success-soft"
                              title="Open WhatsApp chat"
                            >
                              <MessageCircle className="w-3 h-3" />
                            </a>
                            <a
                              href={`tel:${item.phone.replace(/[^0-9+]/g, "")}`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded-md text-info hover:bg-info-soft"
                              title="Call patient"
                            >
                              <Phone className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                        {item.email && (
                          <div className="mt-0.5 flex items-center gap-1 text-[10px] text-ink-muted truncate max-w-[190px]">
                            <Mail className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{item.email}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1 font-semibold text-ink">
                          {item.consultationType === "ONLINE" ? (
                            <>
                              <Video className="w-3.5 h-3.5 text-info" />
                              <span>Online Telehealth</span>
                            </>
                          ) : (
                            <>
                              <Building2 className="w-3.5 h-3.5 text-success" />
                              <span>Karachi Clinic</span>
                            </>
                          )}
                        </div>
                        {item.appointmentDate && (
                          <div className="text-[11px] text-ink-subtle mt-0.5">
                            {item.appointmentDate} · {item.appointmentSlot || "Anytime"}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="line-clamp-2 text-neutral-700 text-[11px]">
                          {item.primarySymptoms}
                        </p>
                        {item.reportUrl && (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-success-soft text-success border border-success-line">
                              <FileText className="w-2.5 h-2.5 text-primary" />
                              <span>Report Attached</span>
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(item);
                          }}
                          className="px-3 py-1.5 bg-surface hover:bg-surface-sunken border border-line text-ink rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Manage</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Centered Minimalist Modal ── */}
      {isModalOpen && selectedConsultation && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl border border-line shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 p-5 border-b border-line bg-surface/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-ink bg-white px-2 py-0.5 rounded border border-line">
                    {selectedConsultation.ticketNumber}
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${modalBadge.bg} ${modalBadge.text} ${modalBadge.border}`}
                  >
                    {modalBadge.label}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-ink">
                  {selectedConsultation.fullName}
                </h3>
                <p className="text-xs text-ink-muted">
                  {[
                    selectedConsultation.age
                      ? `${selectedConsultation.age} yrs`
                      : null,
                    selectedConsultation.gender,
                    selectedConsultation.city || "Pakistan",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                  {" · "}
                  Booked{" "}
                  {new Date(selectedConsultation.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-surface border border-line flex items-center justify-center text-ink cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {modalNotice && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-2 ${
                    modalNotice.tone === "success"
                      ? "bg-success-soft border-success-line text-success"
                      : "bg-danger-soft border-danger/20 text-danger"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {modalNotice.tone === "success" ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{modalNotice.message}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setModalNotice(null)}
                    className="cursor-pointer opacity-70 hover:opacity-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Patient Contact Strip */}
              <div className="flex flex-wrap items-center gap-2">
                {selectedConsultation.phone ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface rounded-xl border border-line text-xs">
                    <Phone className="w-3.5 h-3.5 text-ink-subtle" />
                    <span className="font-mono text-ink font-semibold">
                      {selectedConsultation.phone}
                    </span>
                    <a
                      href={`https://wa.me/${selectedConsultation.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 p-1 rounded-md text-success hover:bg-success-soft"
                      title="WhatsApp patient"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={`tel:${selectedConsultation.phone.replace(/[^0-9+]/g, "")}`}
                      className="p-1 rounded-md text-info hover:bg-info-soft"
                      title="Call patient"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-warning-soft border border-warning-line text-warning rounded-xl text-xs">
                    <Phone className="w-3.5 h-3.5" />
                    <span>No phone on file</span>
                  </span>
                )}

                {selectedConsultation.email ? (
                  <a
                    href={`mailto:${selectedConsultation.email}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-surface-sunken rounded-xl border border-line text-xs text-ink truncate max-w-[220px]"
                    title={selectedConsultation.email}
                  >
                    <Mail className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
                    <span className="truncate">{selectedConsultation.email}</span>
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-line text-ink-subtle rounded-xl text-xs">
                    <Mail className="w-3.5 h-3.5" />
                    <span>No email</span>
                  </span>
                )}
              </div>

              {/* Consultation Mode & Time Configuration */}
              <div className="bg-surface rounded-xl border border-line p-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-subtle font-medium">Mode</span>
                  <div className="inline-flex items-center gap-1.5 font-semibold text-ink">
                    {selectedConsultation.consultationType === "ONLINE" ? (
                      <>
                        <Video className="w-3.5 h-3.5 text-info" />
                        <span>Online Telehealth</span>
                      </>
                    ) : (
                      <>
                        <Building2 className="w-3.5 h-3.5 text-success" />
                        <span>Karachi Clinic (In-Person)</span>
                      </>
                    )}
                  </div>
                </div>

                {/* If In-Person, minimal date and time-slot selector */}
                {selectedConsultation.consultationType === "IN_PERSON" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-line">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle">
                        Date
                      </label>
                      <input
                        type="date"
                        value={modalDate}
                        onChange={(e) => setModalDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-line rounded-lg text-xs text-ink focus:outline-none focus:border-ink"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle">
                        Time Slot
                      </label>
                      <select
                        value={modalSlot}
                        onChange={(e) => setModalSlot(e.target.value)}
                        disabled={modalSlotsLoading}
                        className="w-full px-2.5 py-1.5 bg-white border border-line rounded-lg text-xs text-ink focus:outline-none focus:border-ink disabled:opacity-50"
                      >
                        <option value="">
                          {modalSlotsLoading
                            ? "Loading slots..."
                            : "Select a slot"}
                        </option>
                        {modalSlots
                          .filter((s) => s.available || s.slot === modalSlot)
                          .map((s) => (
                            <option key={s.slot} value={s.slot}>
                              {s.slot}{" "}
                              {!s.available && s.slot === modalSlot
                                ? "(Current)"
                                : ""}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  selectedConsultation.appointmentDate && (
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-line">
                      <span className="text-ink-subtle font-medium">
                        Scheduled Time
                      </span>
                      <span className="font-semibold text-ink">
                        {selectedConsultation.appointmentDate} ·{" "}
                        {selectedConsultation.appointmentSlot || "Anytime"}
                      </span>
                    </div>
                  )
                )}
              </div>

              {/* Symptoms / Concern */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle">
                  Primary Concern / Symptoms
                </span>
                <div className="p-3 bg-surface rounded-xl border border-line text-xs text-ink leading-relaxed">
                  {selectedConsultation.primarySymptoms ||
                    "No symptoms specified."}
                </div>
              </div>

              {/* Medical Report (if any) */}
              {selectedConsultation.reportUrl && (
                <div className="flex items-center justify-between p-3 bg-success-soft/50 rounded-xl border border-success-line">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-success shrink-0" />
                    <span className="text-xs font-semibold text-ink truncate">
                      {selectedConsultation.reportName || "Attached Medical Report"}
                    </span>
                  </div>
                  <a
                    href={selectedConsultation.reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-surface border border-line rounded-lg text-xs font-semibold text-ink shrink-0"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Modal Controls (Ultra Minimalist: Delete, Pending, Confirm) */}
            <div className="p-4 border-t border-line bg-surface/50 flex flex-wrap items-center justify-between gap-2">
              {/* Delete Request */}
              <button
                type="button"
                onClick={() =>
                  handleDelete(
                    selectedConsultation.id,
                    selectedConsultation.ticketNumber
                  )
                }
                disabled={modalSubmitting}
                className="px-3.5 py-2 text-xs font-semibold text-danger hover:bg-danger-soft border border-danger/20 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Request</span>
              </button>

              <div className="flex items-center gap-2">
                {/* Put into Pending */}
                <button
                  type="button"
                  onClick={handleSetPending}
                  disabled={
                    modalSubmitting || selectedConsultation.status === "NEW"
                  }
                  className="px-3.5 py-2 text-xs font-semibold text-warning bg-warning-soft hover:bg-warning-soft/80 border border-warning-line rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title={
                    selectedConsultation.status === "NEW"
                      ? "Already pending"
                      : "Put request into pending"
                  }
                >
                  {modalSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" />
                  )}
                  <span>Put into Pending</span>
                </button>

                {/* Confirm Request */}
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={
                    modalSubmitting ||
                    (selectedConsultation.consultationType === "IN_PERSON" &&
                      (!modalDate || !modalSlot))
                  }
                  className="px-4 py-2 text-xs font-bold text-white bg-success hover:bg-success/90 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {modalSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Confirm Request</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual New Booking Modal */}
      {isNewBookingOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-line max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-line sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-serif text-base font-bold text-ink">
                  New Booking — Manual Entry
                </h3>
                <p className="text-[11px] text-ink-muted">
                  For phone / WhatsApp bookings. Creates a trackable ticket.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewBookingOpen(false)}
                className="w-8 h-8 rounded-full bg-surface hover:bg-line flex items-center justify-center text-ink cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              {newBookingSuccess ? (
                <div className="space-y-4">
                  <div className="text-center space-y-2 bg-success-soft border border-success-line rounded-2xl p-5">
                    <CheckCircle2 className="w-9 h-9 text-success mx-auto" />
                    <h4 className="font-serif text-base font-bold text-success">
                      Booking Created
                    </h4>
                    <p className="text-xs text-success">
                      Ticket:{" "}
                      <strong className="font-mono bg-white px-2 py-0.5 rounded border border-success-line">
                        {newBookingSuccess.ticketNumber}
                      </strong>
                    </p>
                    <p className="text-[11px] text-success">
                      {newBookingSuccess.fullName} · {newBookingSuccess.phone}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsNewBookingOpen(false)}
                      className="flex-1 h-10 bg-surface-inverse hover:bg-brand-green-900 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Done
                    </button>
                    <button
                      type="button"
                      onClick={openNewBooking}
                      className="flex-1 h-10 bg-surface hover:bg-surface-sunken border border-line text-ink text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Create Another
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateBooking} className="space-y-3">
                  {newBookingError && (
                    <div className="p-2.5 rounded-xl bg-danger-soft border border-danger/20 text-xs text-danger flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{newBookingError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-ink">
                        Patient Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newBooking.fullName}
                        onChange={(e) =>
                          setNewBooking((b) => ({
                            ...b,
                            fullName: e.target.value,
                          }))
                        }
                        placeholder="e.g. Tariq Mehmood"
                        className="w-full px-2.5 py-2 bg-surface border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-ink"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-ink">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={newBooking.phone}
                        onChange={(e) =>
                          setNewBooking((b) => ({
                            ...b,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="0300 1234567"
                        className="w-full px-2.5 py-2 bg-surface border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-ink"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-ink">
                        Patient Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={newBooking.email}
                        onChange={(e) =>
                          setNewBooking((b) => ({
                            ...b,
                            email: e.target.value,
                          }))
                        }
                        placeholder="patient@example.com"
                        className="w-full px-2.5 py-2 bg-surface border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-ink"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-ink">
                        City
                      </label>
                      <input
                        type="text"
                        value={newBooking.city}
                        onChange={(e) =>
                          setNewBooking((b) => ({
                            ...b,
                            city: e.target.value,
                          }))
                        }
                        className="w-full px-2.5 py-2 bg-surface border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-ink"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-ink">
                        Consultation Type
                      </label>
                      <select
                        value={newBooking.consultationType}
                        onChange={(e) =>
                          setNewBooking((b) => ({
                            ...b,
                            consultationType: e.target.value,
                          }))
                        }
                        className="w-full px-2.5 py-2 bg-surface border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-ink"
                      >
                        <option value="IN_PERSON">In-Person (Karachi Clinic)</option>
                        <option value="ONLINE">Online Telehealth</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-ink">
                        Initial Status
                      </label>
                      <select
                        value={newBooking.status}
                        onChange={(e) =>
                          setNewBooking((b) => ({
                            ...b,
                            status: e.target.value,
                          }))
                        }
                        className="w-full px-2.5 py-2 bg-surface border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-ink"
                      >
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="NEW">PENDING</option>
                      </select>
                    </div>
                  </div>

                  {newBooking.consultationType === "IN_PERSON" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-ink">
                          Appointment Date
                        </label>
                        <input
                          type="date"
                          value={newBooking.appointmentDate}
                          onChange={(e) =>
                            setNewBooking((b) => ({
                              ...b,
                              appointmentDate: e.target.value,
                            }))
                          }
                          className="w-full px-2.5 py-2 bg-surface border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-ink"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-ink">
                          Time Slot
                        </label>
                        <select
                          value={newBooking.appointmentSlot}
                          onChange={(e) =>
                            setNewBooking((b) => ({
                              ...b,
                              appointmentSlot: e.target.value,
                            }))
                          }
                          disabled={
                            newBookingAvailLoading || !newBookingAvail?.isOpen
                          }
                          className="w-full px-2.5 py-2 bg-surface border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-ink disabled:opacity-60"
                        >
                          {newBookingAvailLoading ? (
                            <option value="">Loading slots…</option>
                          ) : !newBookingAvail?.isOpen ? (
                            <option value="">Clinic closed</option>
                          ) : (
                            <>
                              <option value="">Select a time…</option>
                              {(newBookingAvail.slots || []).map((slot: any) => (
                                <option
                                  key={slot.slot}
                                  value={slot.slot}
                                  disabled={!slot.available}
                                >
                                  {slot.slot}
                                  {slot.available ? "" : " — Booked"}
                                </option>
                              ))}
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-ink">
                      Chief Complaint / Notes
                    </label>
                    <textarea
                      rows={2}
                      value={newBooking.primarySymptoms}
                      onChange={(e) =>
                        setNewBooking((b) => ({
                          ...b,
                          primarySymptoms: e.target.value,
                        }))
                      }
                      placeholder="Brief notes from the patient..."
                      className="w-full px-2.5 py-2 bg-surface border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-ink resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={newBookingSubmitting}
                    className="w-full h-10 bg-surface-inverse hover:bg-brand-green-900 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer mt-4"
                  >
                    {newBookingSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                        <span>Creating Booking...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 shrink-0" />
                        <span>Create Booking</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
