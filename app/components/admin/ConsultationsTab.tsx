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

  const getWhatsAppContactLink = (c: Consultation) => {
    const text =
      `*Assalam-o-Alaikum ${c.fullName} Sahib/Sahiba*\n` +
      `This is Matab Tameer-e-Sehat (Hakim Muhammad Tariq) regarding your Consultation Ticket *${c.ticketNumber}* for: *${c.primarySymptoms}*.\n\n` +
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
