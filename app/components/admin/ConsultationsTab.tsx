"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  User,
  Activity,
  FileText,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Sparkles,
  Edit,
  Trash2,
  Send,
  Loader2,
  ExternalLink,
  ChevronDown,
  X,
  Check,
  Building2,
  Video,
  Plus,
  Link2,
  Unlink,
} from "lucide-react";
import { CLINIC_INFO } from "@/app/data/products";

interface Consultation {
  id: string;
  ticketNumber: string;
  fullName: string;
  age: number;
  gender: string;
  phone: string;
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
    label: "New Request",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  CONFIRMED: {
    label: "Confirmed",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  RESCHEDULED: {
    label: "Rescheduled",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
  },
  PRESCRIBED: {
    label: "Prescribed",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  COMPLETED: {
    label: "Completed",
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-300",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
};

export default function ConsultationsTab() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Drawer / Modal for single consultation
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Edit fields in drawer
  const [editStatus, setEditStatus] = useState("NEW");
  const [editPrescription, setEditPrescription] = useState("");
  const [editHakimNotes, setEditHakimNotes] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editSlot, setEditSlot] = useState("");
  const [savingChanges, setSavingChanges] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  // ── Manual booking (staff creates on behalf of WhatsApp/phone patients) ──
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [newBookingSubmitting, setNewBookingSubmitting] = useState(false);
  const [newBookingError, setNewBookingError] = useState<string | null>(null);
  const [newBookingSuccess, setNewBookingSuccess] = useState<any | null>(null);
  const [newBookingAvail, setNewBookingAvail] = useState<any | null>(null);
  const [newBookingAvailLoading, setNewBookingAvailLoading] = useState(false);
  const [linkedAccount, setLinkedAccount] = useState<{
    id: string;
    name: string | null;
    email: string | null;
  } | null>(null);
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
  const [lookupResults, setLookupResults] = useState<{
    users: any[];
    consultations: any[];
  } | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  // ── Link account inside the dossier drawer ──
  const [showLinkPanel, setShowLinkPanel] = useState(false);
  const [linkQuery, setLinkQuery] = useState("");
  const [linkResults, setLinkResults] = useState<any[]>([]);
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const fetchConsultations = useCallback(async (silent = false) => {
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
  }, [statusFilter, searchQuery, dateFilter]);

  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  const handleOpenDrawer = (item: Consultation) => {
    setSelectedConsultation(item);
    setEditStatus(item.status || "NEW");
    setEditPrescription(item.prescribedTreatment || "");
    setEditHakimNotes(item.hakimNotes || "");
    setEditDate(item.appointmentDate || "");
    setEditSlot(item.appointmentSlot || "");
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);
    setIsDrawerOpen(true);
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsultation) return;

    setSavingChanges(true);
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);

    try {
      const res = await fetch(`/api/consultations/${selectedConsultation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          prescribedTreatment: editPrescription,
          hakimNotes: editHakimNotes,
          appointmentDate: editDate || null,
          appointmentSlot: editSlot || null,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update consultation.");
      }

      setSaveSuccessMsg("Consultation updated. Notification email dispatched if applicable.");
      setSelectedConsultation(json.data);

      // Refresh table in background
      fetchConsultations(true);
    } catch (err: any) {
      setSaveErrorMsg(err.message || "Failed to update.");
    } finally {
      setSavingChanges(false);
    }
  };

  const handleDelete = async (id: string, ticket: string) => {
    if (!window.confirm(`Are you sure you want to delete consultation ${ticket}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/consultations/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setIsDrawerOpen(false);
        setSelectedConsultation(null);
        fetchConsultations(true);
      } else {
        alert(json.error || "Failed to delete.");
      }
    } catch (err: any) {
      alert("Error deleting consultation.");
    }
  };

  // ── Manual booking helpers ──
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
    setLinkedAccount(null);
    setLookupResults(null);
    setNewBookingError(null);
    setNewBookingSuccess(null);
    setNewBookingAvail(null);
    setIsNewBookingOpen(true);
  };

  const lookupPatients = async (query: string) => {
    const q = query.trim();
    if (q.length < 3) {
      setLookupResults(null);
      return;
    }
    setLookupLoading(true);
    try {
      const res = await fetch(
        `/api/admin/patient-lookup?q=${encodeURIComponent(q)}`
      );
      const json = await res.json();
      if (res.ok && json.success) {
        setLookupResults(json.data);
      }
    } catch (err) {
      console.error("Patient lookup failed:", err);
    } finally {
      setLookupLoading(false);
    }
  };

  // Load available slots for the manual booking date
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
          userId: linkedAccount?.id || undefined,
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

  const openExistingConsultation = async (id: string) => {
    try {
      const res = await fetch(`/api/consultations/${id}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setIsNewBookingOpen(false);
        handleOpenDrawer(json.data);
      }
    } catch (err) {
      console.error("Failed to open consultation:", err);
    }
  };

  // ── Link account helpers (dossier drawer) ──
  const searchAccounts = async (query: string) => {
    const q = query.trim();
    if (q.length < 3) return;

    setLinkLoading(true);
    setLinkError(null);
    try {
      const res = await fetch(
        `/api/admin/patient-lookup?q=${encodeURIComponent(q)}`
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Search failed.");
      }
      setLinkResults(json.data.users || []);
    } catch (err: any) {
      setLinkError(err.message || "Search failed.");
    } finally {
      setLinkLoading(false);
    }
  };

  const linkAccount = async (userId: string | null) => {
    if (!selectedConsultation) return;

    setLinkLoading(true);
    setLinkError(null);
    try {
      const res = await fetch(
        `/api/consultations/${selectedConsultation.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }
      );

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to link account.");
      }

      setSelectedConsultation(json.data);
      setShowLinkPanel(false);
      setLinkQuery("");
      setLinkResults([]);
      fetchConsultations(true);
    } catch (err: any) {
      setLinkError(err.message || "Failed to link account.");
    } finally {
      setLinkLoading(false);
    }
  };

  const getWhatsAppContactLink = (c: Consultation) => {
    const text =
      `*Assalam-o-Alaikum ${c.fullName} Sahib/Sahiba*\n` +
      `This is Matab Tameer-e-Sehat (Hakim Tahir Hameed) regarding your Consultation Ticket *${c.ticketNumber}* for: *${c.primarySymptoms}*.\n\n` +
      `We are ready to discuss your health assessment.`;
    return `https://wa.me/${c.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl border border-[#e6dfd5] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-lg font-bold text-[#14281D] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#c59b27]" />
            <span>Consultation &amp; Appointment Dossiers</span>
          </h2>
          <p className="text-xs text-[#6a6660]">
            Review patient health concerns, manage appointment slots, and dispatch Hakim prescriptions with email alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openNewBooking}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#14281D] hover:bg-[#1e3d2c] transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Booking</span>
          </button>
          <button
            onClick={() => fetchConsultations(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#4a4640] hover:bg-[#faf8f5] border border-[#e6dfd5] transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-[#8c8880] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patient name, phone, ticket, city..."
            className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D]"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D]"
          >
            <option value="ALL">All Statuses ({consultations.length})</option>
            <option value="NEW">New Requests</option>
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
            className="w-full px-3 py-2.5 bg-white border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D]"
          />
        </div>
      </div>

      {/* Consultations Table */}
      <div className="bg-white rounded-2xl border border-[#e6dfd5] overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-[#14281D] space-y-2">
            <Loader2 className="w-8 h-8 animate-spin mx-auto" />
            <p className="text-xs font-semibold">Loading consultation dossiers...</p>
          </div>
        ) : consultations.length === 0 ? (
          <div className="py-16 text-center text-[#6a6660] space-y-2">
            <Calendar className="w-10 h-10 mx-auto text-[#8c8880]/60" />
            <p className="text-sm font-semibold text-[#1a1816]">No consultations found</p>
            <p className="text-xs">Adjust your search query or status filter above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf8f5] text-[#78716C] uppercase text-[10px] font-bold border-b border-[#e6dfd5]">
                <tr>
                  <th className="py-3.5 px-4">Ticket / Date</th>
                  <th className="py-3.5 px-4">Patient Details</th>
                  <th className="py-3.5 px-4">Mode / Slot</th>
                  <th className="py-3.5 px-4">Primary Concern</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6dfd5]">
                {consultations.map((item) => {
                  const badge = STATUS_BADGES[item.status] || STATUS_BADGES.NEW;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#faf8f5]/60 transition-colors group cursor-pointer"
                      onClick={() => handleOpenDrawer(item)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-[#14281D]">
                          {item.ticketNumber}
                        </div>
                        <div className="text-[10px] text-[#78716C]">
                          {new Date(item.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#1a1816]">{item.fullName}</div>
                        <div className="text-[11px] text-[#6a6660]">
                          {item.gender}, {item.age} yrs · {item.city}
                        </div>
                        <div className="text-[11px] text-[#14281D] font-mono">
                          {item.phone}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1 font-semibold text-[#14281D]">
                          {item.consultationType === "ONLINE" ? (
                            <>
                              <Video className="w-3.5 h-3.5 text-blue-600" />
                              <span>Online Telehealth</span>
                            </>
                          ) : (
                            <>
                              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Karachi Clinic</span>
                            </>
                          )}
                        </div>
                        {item.appointmentDate && (
                          <div className="text-[11px] text-[#78716C] mt-0.5">
                            {item.appointmentDate} · {item.appointmentSlot || "Anytime"}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="line-clamp-2 text-[#44403C] text-[11px]">
                          {item.primarySymptoms}
                        </p>
                        {item.reportUrl && (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <FileText className="w-2.5 h-2.5 text-[#22623a]" />
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
                            handleOpenDrawer(item);
                          }}
                          className="px-3 py-1.5 bg-[#14281D] hover:bg-[#1e3d2c] text-white rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Manage</span>
                          <ChevronDown className="w-3 h-3" />
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

      {/* New Booking Modal — staff manual entry for phone/WhatsApp bookings */}
      {isNewBookingOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#e6dfd5] max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[#e6dfd5] sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-serif text-base font-bold text-[#14281D]">
                  New Booking — Manual Entry
                </h3>
                <p className="text-[11px] text-[#6a6660]">
                  For phone / WhatsApp bookings. Creates a trackable ticket instantly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewBookingOpen(false)}
                className="w-8 h-8 rounded-full bg-[#faf8f5] hover:bg-gray-200 flex items-center justify-center text-[#1a1816] cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              {newBookingSuccess ? (
                <div className="space-y-4">
                  <div className="text-center space-y-2 bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                    <CheckCircle2 className="w-9 h-9 text-emerald-600 mx-auto" />
                    <h4 className="font-serif text-base font-bold text-emerald-900">
                      Booking Created
                    </h4>
                    <p className="text-xs text-emerald-800">
                      Ticket:{" "}
                      <strong className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-200">
                        {newBookingSuccess.ticketNumber}
                      </strong>
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      {newBookingSuccess.fullName} · {newBookingSuccess.phone}
                    </p>
                    <p className="text-[11px] text-[#6a6660] leading-relaxed">
                      Status: <strong>{newBookingSuccess.status}</strong>.{" "}
                      {newBookingSuccess.userId
                        ? "Linked to the patient's account — it now appears in their dashboard."
                        : "Not linked to an account — the patient can track it with the ticket and phone."}
                      {newBookingSuccess.email
                        ? " A confirmation email has been dispatched."
                        : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsNewBookingOpen(false)}
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
                <form onSubmit={handleCreateBooking} className="space-y-3">
                  {newBookingError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{newBookingError}</span>
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
                        value={newBooking.fullName}
                        onChange={(e) =>
                          setNewBooking((prev) => ({
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
                        value={newBooking.phone}
                        onChange={(e) =>
                          setNewBooking((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        onBlur={() => lookupPatients(newBooking.phone)}
                        placeholder="0300-1234567"
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-0.5">
                      <label className="text-[11px] font-semibold text-[#1a1816]">
                        Email{" "}
                        <span className="text-[#8c827a] font-normal">
                          (optional)
                        </span>
                      </label>
                      <input
                        type="email"
                        value={newBooking.email}
                        onChange={(e) =>
                          setNewBooking((prev) => ({
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
                        City
                      </label>
                      <input
                        type="text"
                        value={newBooking.city}
                        onChange={(e) =>
                          setNewBooking((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                        placeholder="Karachi"
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="space-y-0.5">
                      <label className="text-[11px] font-semibold text-[#1a1816]">
                        Visit Mode
                      </label>
                      <select
                        value={newBooking.consultationType}
                        onChange={(e) =>
                          setNewBooking((prev) => ({
                            ...prev,
                            consultationType: e.target.value,
                          }))
                        }
                        className="w-full px-2.5 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D]"
                      >
                        <option value="IN_PERSON">In-Person Clinic</option>
                        <option value="ONLINE">Online / WhatsApp</option>
                      </select>
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[11px] font-semibold text-[#1a1816]">
                        Contact Channel
                      </label>
                      <select
                        value={newBooking.channel}
                        onChange={(e) =>
                          setNewBooking((prev) => ({
                            ...prev,
                            channel: e.target.value,
                          }))
                        }
                        className="w-full px-2.5 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D]"
                      >
                        <option value="WHATSAPP">WhatsApp</option>
                        <option value="EMAIL">Email</option>
                      </select>
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[11px] font-semibold text-[#1a1816]">
                        Initial Status
                      </label>
                      <select
                        value={newBooking.status}
                        onChange={(e) =>
                          setNewBooking((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                        className="w-full px-2.5 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D]"
                      >
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="NEW">New Request</option>
                        <option value="RESCHEDULED">Rescheduled</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[11px] font-semibold text-[#1a1816]">
                      Health Concern / Notes
                    </label>
                    <textarea
                      rows={2}
                      value={newBooking.primarySymptoms}
                      onChange={(e) =>
                        setNewBooking((prev) => ({
                          ...prev,
                          primarySymptoms: e.target.value,
                        }))
                      }
                      placeholder="Reason for consultation (from the WhatsApp conversation)"
                      className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D] focus:bg-white resize-none"
                    />
                  </div>

                  {newBooking.consultationType === "IN_PERSON" && (
                    <>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-0.5">
                          <label className="text-[11px] font-semibold text-[#1a1816]">
                            Appointment Date
                          </label>
                          <input
                            type="date"
                            value={newBooking.appointmentDate}
                            onChange={(e) =>
                              setNewBooking((prev) => ({
                                ...prev,
                                appointmentDate: e.target.value,
                                appointmentSlot: "",
                              }))
                            }
                            className="w-full px-2.5 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D]"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[11px] font-semibold text-[#1a1816]">
                            Time Slot
                          </label>
                          <select
                            value={newBooking.appointmentSlot}
                            onChange={(e) =>
                              setNewBooking((prev) => ({
                                ...prev,
                                appointmentSlot: e.target.value,
                              }))
                            }
                            disabled={
                              newBookingAvailLoading ||
                              !newBookingAvail?.isOpen
                            }
                            className="w-full px-2.5 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D] disabled:opacity-60"
                          >
                            {newBookingAvailLoading ? (
                              <option value="">Loading slots…</option>
                            ) : !newBookingAvail?.isOpen ? (
                              <option value="">Clinic closed</option>
                            ) : (
                              <>
                                <option value="">Select a time…</option>
                                {(newBookingAvail.slots || []).map(
                                  (slot: any) => (
                                    <option
                                      key={slot.slot}
                                      value={slot.slot}
                                      disabled={!slot.available}
                                    >
                                      {slot.slot}
                                      {slot.available ? "" : " — Booked"}
                                    </option>
                                  )
                                )}
                              </>
                            )}
                          </select>
                        </div>
                      </div>
                      {!newBookingAvailLoading &&
                        newBookingAvail &&
                        !newBookingAvail.isOpen && (
                          <p className="text-[10px] text-amber-700 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            Clinic closed on this date — pick another day.
                          </p>
                        )}
                    </>
                  )}

                  {/* Linked account + duplicate search */}
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
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            lookupPatients(
                              newBooking.phone || newBooking.fullName
                            )
                          }
                          className="px-2.5 py-1.5 bg-white border border-[#e6dfd5] hover:bg-gray-50 rounded-lg text-[10px] font-bold text-[#14281D] cursor-pointer flex items-center gap-1"
                        >
                          {lookupLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Search className="w-3 h-3" />
                          )}
                          Find
                        </button>
                        {linkedAccount && (
                          <button
                            type="button"
                            onClick={() => setLinkedAccount(null)}
                            className="px-2.5 py-1.5 bg-white border border-[#e6dfd5] hover:bg-rose-50 rounded-lg text-[10px] font-bold text-rose-600 cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {lookupResults && (
                      <div className="space-y-2 pt-2 border-t border-[#e6dfd5]">
                        {lookupResults.consultations.length > 0 && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 space-y-1">
                            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">
                              Existing tickets found — edit instead of
                              duplicating:
                            </p>
                            {lookupResults.consultations
                              .slice(0, 4)
                              .map((c: any) => (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => openExistingConsultation(c.id)}
                                  className="w-full text-left text-[11px] px-2 py-1 rounded bg-white/70 hover:bg-white border border-amber-200 flex items-center justify-between gap-2 cursor-pointer"
                                >
                                  <span>
                                    <strong className="font-mono">
                                      {c.ticketNumber}
                                    </strong>{" "}
                                    · {c.fullName} · {c.status}
                                  </span>
                                  <span className="text-amber-700 font-semibold shrink-0">
                                    Open →
                                  </span>
                                </button>
                              ))}
                          </div>
                        )}

                        {lookupResults.users.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-[#78716C] uppercase tracking-wide">
                              Registered accounts:
                            </p>
                            {lookupResults.users.slice(0, 4).map((u: any) => (
                              <button
                                key={u.id}
                                type="button"
                                onClick={() =>
                                  setLinkedAccount({
                                    id: u.id,
                                    name: u.name,
                                    email: u.email,
                                  })
                                }
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

                        {lookupResults.users.length === 0 &&
                          lookupResults.consultations.length === 0 && (
                            <p className="text-[10px] text-[#78716C]">
                              No matching accounts or tickets found.
                            </p>
                          )}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={newBookingSubmitting}
                    className="w-full h-11 bg-[#14281D] hover:bg-[#1e3d2c] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
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

      {/* Consultation Dossier Drawer / Modal */}
      {isDrawerOpen && selectedConsultation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full overflow-y-auto p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl">
            <div className="space-y-6">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#e6dfd5]">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#14281D] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {selectedConsultation.ticketNumber}
                    </span>
                    <span className="text-xs text-[#78716C]">
                      Booked {new Date(selectedConsultation.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#1a1816]">
                    {selectedConsultation.fullName} ({selectedConsultation.age} yrs, {selectedConsultation.gender})
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#faf8f5] hover:bg-gray-200 flex items-center justify-center text-[#1a1816] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Patient Quick Contact Bar */}
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={getWhatsAppContactLink(selectedConsultation)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Patient ({selectedConsultation.phone})</span>
                </a>

                <a
                  href={`tel:${selectedConsultation.phone}`}
                  className="px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] hover:bg-gray-100 text-[#1a1816] rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Phone className="w-4 h-4 text-[#14281D]" />
                  <span>Call Phone</span>
                </a>

                {selectedConsultation.email && (
                  <a
                    href={`mailto:${selectedConsultation.email}`}
                    className="px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] hover:bg-gray-100 text-[#1a1816] rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Mail className="w-4 h-4 text-[#14281D]" />
                    <span>Send Email ({selectedConsultation.email})</span>
                  </a>
                )}
              </div>

              {/* Linked Patient Account */}
              <div className="bg-white border border-[#e6dfd5] rounded-2xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs">
                    <span className="text-[#78716C] block text-[10px] uppercase font-bold tracking-wide">
                      Linked Patient Account
                    </span>
                    {selectedConsultation.user ? (
                      <strong className="text-[#14281D]">
                        {selectedConsultation.user.name ||
                          selectedConsultation.user.email}
                        {selectedConsultation.user.email
                          ? ` · ${selectedConsultation.user.email}`
                          : ""}
                      </strong>
                    ) : (
                      <span className="text-[#78716C]">
                        Not linked — this ticket won&apos;t appear in the
                        patient&apos;s dashboard.
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setShowLinkPanel((open) => !open);
                        setLinkError(null);
                        if (!showLinkPanel) {
                          const q =
                            selectedConsultation.phone ||
                            selectedConsultation.email ||
                            "";
                          setLinkQuery(q);
                          if (q.length >= 3) searchAccounts(q);
                        }
                      }}
                      className="px-2.5 py-1.5 bg-[#faf8f5] border border-[#e6dfd5] hover:bg-gray-100 rounded-lg text-[10px] font-bold text-[#14281D] cursor-pointer flex items-center gap-1"
                    >
                      <Link2 className="w-3 h-3" />
                      {selectedConsultation.user ? "Change" : "Link account"}
                    </button>
                    {selectedConsultation.user && (
                      <button
                        type="button"
                        onClick={() => linkAccount(null)}
                        className="px-2.5 py-1.5 bg-white border border-rose-200 hover:bg-rose-50 rounded-lg text-[10px] font-bold text-rose-600 cursor-pointer flex items-center gap-1"
                      >
                        <Unlink className="w-3 h-3" />
                        Unlink
                      </button>
                    )}
                  </div>
                </div>

                {showLinkPanel && (
                  <div className="space-y-2 pt-2 border-t border-[#e6dfd5]">
                    {linkError && (
                      <p className="text-[10px] text-red-600">{linkError}</p>
                    )}
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={linkQuery}
                        onChange={(e) => setLinkQuery(e.target.value)}
                        placeholder="Search by phone, email, or name"
                        className="flex-1 px-2.5 py-1.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[11px] text-[#1a1816] focus:outline-none focus:border-[#14281D]"
                      />
                      <button
                        type="button"
                        onClick={() => searchAccounts(linkQuery)}
                        disabled={linkLoading}
                        className="px-3 py-1.5 bg-[#14281D] hover:bg-[#1e3d2c] text-white rounded-lg text-[10px] font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1"
                      >
                        {linkLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Search className="w-3 h-3" />
                        )}
                        Search
                      </button>
                    </div>
                    {linkResults.map((u: any) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => linkAccount(u.id)}
                        className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-lg border border-[#e6dfd5] bg-white hover:border-[#14281D]/40 flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <span>
                          <strong>{u.name || u.email}</strong>
                          {u.email ? ` · ${u.email}` : ""}
                          {u.phone ? ` · ${u.phone}` : ""}
                        </span>
                        <span className="text-[#14281D] font-bold shrink-0">
                          Link
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Medical Dossier Preview */}
              <div className="bg-[#faf8f5] rounded-2xl border border-[#e6dfd5] p-4 space-y-3 text-xs">
                <h4 className="font-serif font-bold text-sm text-[#14281D] flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#c59b27]" />
                  <span>Patient Health Dossier</span>
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#78716C] block">City / Location:</span>
                    <strong className="text-[#1a1816]">{selectedConsultation.city}</strong>
                  </div>
                  <div>
                    <span className="text-[#78716C] block">Condition Duration:</span>
                    <strong className="text-[#1a1816]">{selectedConsultation.duration}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#e6dfd5]">
                  <span className="text-[#78716C] block mb-1">Primary Symptoms &amp; Notes:</span>
                  <p className="text-[#1a1816] bg-white p-3 rounded-xl border border-[#e6dfd5] leading-relaxed">
                    {selectedConsultation.primarySymptoms}
                  </p>
                </div>

                {selectedConsultation.currentMedications && (
                  <div>
                    <span className="text-[#78716C] block mb-1">Current Medications / Allergies:</span>
                    <p className="text-[#1a1816] bg-white p-2.5 rounded-xl border border-[#e6dfd5]">
                      {selectedConsultation.currentMedications}
                    </p>
                  </div>
                )}

                {selectedConsultation.reportUrl && (
                  <div className="pt-2 border-t border-[#e6dfd5]">
                    <span className="text-[#78716C] block mb-1 font-semibold">
                      Attached Medical Report:
                    </span>
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#cde4d6] shadow-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#22623a] flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-[#1a1816] text-xs truncate max-w-[220px]">
                            {selectedConsultation.reportName || "Medical Report / Document"}
                          </p>
                          {selectedConsultation.reportSize && (
                            <p className="text-[10px] text-[#78716C]">
                              {selectedConsultation.reportSize}
                            </p>
                          )}
                        </div>
                      </div>
                      <a
                        href={selectedConsultation.reportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#22623a] hover:bg-[#1a4d2e] text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
                      >
                        <span>View / Download</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Update & Reschedule Form */}
              <form onSubmit={handleSaveChanges} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-sm text-[#14281D] flex items-center gap-1.5">
                    <Edit className="w-4 h-4 text-[#c59b27]" />
                    <span>Hakim Clinical Actions &amp; Prescription</span>
                  </h4>
                </div>

                {saveSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{saveSuccessMsg}</span>
                  </div>
                )}

                {saveErrorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{saveErrorMsg}</span>
                  </div>
                )}

                {/* Status Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#1a1816]">Ticket Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#e6dfd5] rounded-xl text-xs font-semibold text-[#14281D] focus:outline-none focus:border-[#14281D]"
                    >
                      <option value="NEW">NEW REQUEST</option>
                      <option value="CONFIRMED">CONFIRMED (Sends Email)</option>
                      <option value="RESCHEDULED">RESCHEDULED (Sends Email)</option>
                      <option value="PRESCRIBED">PRESCRIBED (Dispatches Rx)</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#1a1816]">Appointment Date</label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#1a1816]">Time Slot</label>
                    <input
                      type="text"
                      value={editSlot}
                      onChange={(e) => setEditSlot(e.target.value)}
                      placeholder="e.g. 11:00 AM - 12:00 PM"
                      className="w-full px-3 py-2 bg-white border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D]"
                    />
                  </div>
                </div>

                {/* Prescription Area */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1a1816] flex items-center justify-between">
                    <span>Prescribed Botanical Protocol (Urdu / English)</span>
                    <span className="text-[10px] text-purple-700 font-bold uppercase">
                      Will be emailed to patient if provided
                    </span>
                  </label>
                  <textarea
                    rows={4}
                    value={editPrescription}
                    onChange={(e) => setEditPrescription(e.target.value)}
                    placeholder="e.g. 1. Majoon Dabeed-ul-Ward (1 teaspoon morning & night with warm water)&#10;2. Arq-e-Gulab (1/2 cup before meals)&#10;3. Sharbat Bazoori Motadil (2 tablespoons daily)..."
                    className="w-full p-3 bg-purple-50/30 border border-purple-200 rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-purple-600 resize-none font-mono"
                  />
                </div>

                {/* Hakim Notes / Dietary Restrictions */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1a1816]">
                    Dietary Restrictions (Parhez) &amp; Clinical Hakim Notes
                  </label>
                  <textarea
                    rows={2}
                    value={editHakimNotes}
                    onChange={(e) => setEditHakimNotes(e.target.value)}
                    placeholder="e.g. Strictly avoid sour items, cold water, and heavy fried foods. Drink barley water (Aab-e-Jau)..."
                    className="w-full p-3 bg-white border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D] resize-none"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#e6dfd5]">
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedConsultation.id, selectedConsultation.ticketNumber)}
                    className="px-3.5 py-2.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Ticket</span>
                  </button>

                  <button
                    type="submit"
                    disabled={savingChanges}
                    className="px-5 py-2.5 bg-[#14281D] hover:bg-[#1e3d2c] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {savingChanges ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating &amp; Dispatched...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Save &amp; Dispatch Patient Email</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
