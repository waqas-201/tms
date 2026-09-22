"use client";

import React, { useState, useEffect } from "react";
import { CLINIC_INFO } from "@/app/data/products";
import { useSession } from "@/lib/auth-client";
import {
  X,
  Sparkles,
  Building2,
  CheckCircle2,
  Loader2,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Mic,
  Activity,
  Flame,
  Zap,
  Lock,
  HeartHandshake,
  Calendar,
  Clock,
  Phone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultConcern?: string;
}

const CONCERN_OPTIONS = [
  { id: "stomach", label: "Stomach / Gas", urdu: "معدہ اور گیس", icon: Flame },
  { id: "joints", label: "Joints / Knee Pain", urdu: "جوڑوں کا درد", icon: Activity },
  { id: "vitality", label: "Energy & Stamina", urdu: "قوت اور اعصاب", icon: Zap },
  { id: "liver", label: "Liver / Body Heat", urdu: "جگر کی گرمی", icon: HeartHandshake },
  { id: "skin-hair", label: "Skin & Hair Fall", urdu: "جلد اور بال", icon: Sparkles },
  { id: "private", label: "Private Wellness", urdu: "پوشیدہ امراض", icon: Lock },
];

export default function ConsultationModal({
  isOpen,
  onClose,
  defaultConcern,
}: ConsultationModalProps) {
  const { data: sessionData } = useSession();

  const [mode, setMode] = useState<"WHATSAPP" | "PHYSICAL">("WHATSAPP");
  const [selectedConcern, setSelectedConcern] = useState(
    defaultConcern || CONCERN_OPTIONS[0].label
  );

  // Clinic physical appointment fields
  const [clinicName, setClinicName] = useState(sessionData?.user?.name || "");
  const [clinicPhone, setClinicPhone] = useState((sessionData?.user as any)?.phone || "");
  const [clinicDate, setClinicDate] = useState("Tomorrow");
  const [clinicSlot, setClinicSlot] = useState("Evening (05:00 PM - 09:00 PM)");
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (defaultConcern) {
      setSelectedConcern(defaultConcern);
    }
  }, [defaultConcern]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const getWhatsAppUrl = () => {
    const text = `*Assalam-o-Alaikum Hakim Sahib (Tameer-e-Sehat Consultation)*\n` +
      `*Health Concern:* ${selectedConcern}\n` +
      `_I am reaching out for herbal guidance and remedy advice._`;
    return `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  const handlePhysicalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: clinicName,
          phone: clinicPhone,
          city: "Karachi",
          primarySymptoms: `[In-Person Karachi Clinic Booking - ${clinicDate} ${clinicSlot}] Concern: ${selectedConcern}`,
          age: 35,
          gender: "Not Specified",
          duration: "New Visit",
          preferredContact: "PHONE",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to reserve slot.");
      }

      setBookingSuccess(json.data);
    } catch (err: any) {
      setErrorMessage(err.message || "Could not reserve clinic slot. Please call or WhatsApp us.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#e6dfd5] overflow-hidden max-h-[90vh] flex flex-col z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#22623a] text-white p-5 sm:p-6 flex items-start justify-between relative">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#143e23] text-[#c59b27] text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  <span>Free Consultation · Bila-Muawza</span>
                </div>
                <h3 className="font-serif text-lg sm:text-xl font-bold">
                  Consult Hakim Muhammad Tariq
                </h3>
                <p className="text-xs text-[#f4eee5]/80">
                  Zero forms, zero hassle · Direct guidance on WhatsApp or Karachi Clinic
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="px-5 sm:px-6 pt-4">
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#faf8f5] rounded-xl border border-[#e6dfd5]">
                <button
                  type="button"
                  onClick={() => {
                    setMode("WHATSAPP");
                    setBookingSuccess(null);
                  }}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    mode === "WHATSAPP"
                      ? "bg-[#22623a] text-white shadow-xs"
                      : "text-[#59534b] hover:text-[#1a1816]"
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>WhatsApp Chat</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("PHYSICAL");
                    setBookingSuccess(null);
                  }}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    mode === "PHYSICAL"
                      ? "bg-[#22623a] text-white shadow-xs"
                      : "text-[#59534b] hover:text-[#1a1816]"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-[#c59b27]" />
                  <span>Karachi Clinic Visit</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              {mode === "WHATSAPP" ? (
                /* Mode A: Fast WhatsApp 2-Tap Triage */
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#22623a] uppercase tracking-wider block">
                      Select Health Issue:
                    </label>
                    <p className="text-[11px] text-[#6a6660]">
                      Tap your condition to prepare your instant consultation:
                    </p>
                  </div>

                  {/* 6 Quick Concern Chips */}
                  <div className="grid grid-cols-2 gap-2">
                    {CONCERN_OPTIONS.map((c) => {
                      const Icon = c.icon;
                      const isSelected = selectedConcern === c.label;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedConcern(c.label)}
                          className={`p-2.5 rounded-xl text-left border transition-all flex items-center gap-2.5 ${
                            isSelected
                              ? "bg-[#eef7f1] border-[#22623a] text-[#22623a] font-bold shadow-xs"
                              : "bg-[#faf8f5] hover:bg-white border-[#e6dfd5] text-[#59534b]"
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-[#22623a]" : "text-[#8c6a15]"}`} />
                          <div className="min-w-0">
                            <span className="text-xs block truncate">{c.label}</span>
                            <span className="text-[10px] text-[#8c6a15] block truncate" dir="rtl">{c.urdu}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Voice note tip box */}
                  <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#e6dfd5] flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#25D366] text-white flex items-center justify-center shrink-0">
                      <Mic className="w-4 h-4" />
                    </div>
                    <p className="text-[11px] text-[#59534b] leading-tight">
                      <strong>Voice Notes Welcome:</strong> You can send an audio voice note or pictures of medical reports directly on WhatsApp.
                    </p>
                  </div>

                  {/* 1-Tap CTA */}
                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="w-full py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                  >
                    <MessageCircle className="w-4.5 h-4.5" />
                    <span>Open WhatsApp with Hakim Sahib</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>

                  <div className="text-center pt-1">
                    <span className="text-[11px] text-[#7a7268] inline-flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#22623a]" />
                      100% Free · Strictly Confidential · No Pressure to Buy
                    </span>
                  </div>
                </div>
              ) : (
                /* Mode B: Physical Clinic Visit */
                <div className="space-y-4">
                  {bookingSuccess ? (
                    <div className="text-center space-y-3 py-4">
                      <div className="w-12 h-12 rounded-full bg-[#22623a] text-white flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <h4 className="font-serif text-lg font-bold text-[#22623a]">
                        Appointment Slot Reserved!
                      </h4>
                      <p className="text-xs text-[#59534b]">
                        Ticket: <strong className="font-mono text-[#22623a]">{bookingSuccess.ticketNumber}</strong>
                      </p>
                      <p className="text-xs text-[#6a6660] max-w-xs mx-auto">
                        We look forward to seeing you at our Korangi clinic. Please arrive during your chosen slot.
                      </p>
                      <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-2.5 bg-[#22623a] text-white text-xs font-bold rounded-xl"
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handlePhysicalSubmit} className="space-y-3.5">
                      {errorMessage && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{errorMessage}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-[#1a1816]">
                            Your Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={clinicName}
                            onChange={(e) => setClinicName(e.target.value)}
                            placeholder="e.g. Tariq Mehmood"
                            className="w-full text-xs px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-[#1a1816]">
                            WhatsApp / Phone <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={clinicPhone}
                            onChange={(e) => setClinicPhone(e.target.value)}
                            placeholder="0300-1234567"
                            className="w-full text-xs px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-[#1a1816]">
                            Preferred Day
                          </label>
                          <select
                            value={clinicDate}
                            onChange={(e) => setClinicDate(e.target.value)}
                            className="w-full text-xs px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a]"
                          >
                            <option value="Today">Today</option>
                            <option value="Tomorrow">Tomorrow</option>
                            <option value="This Saturday">This Saturday</option>
                            <option value="Next Week">Next Week</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-[#1a1816]">
                            Time Slot
                          </label>
                          <select
                            value={clinicSlot}
                            onChange={(e) => setClinicSlot(e.target.value)}
                            className="w-full text-xs px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a]"
                          >
                            <option value="Morning (10:00 AM - 02:00 PM)">Morning (10am–2pm)</option>
                            <option value="Evening (05:00 PM - 09:00 PM)">Evening (5pm–9pm)</option>
                          </select>
                        </div>
                      </div>

                      {/* Clinic Info Note */}
                      <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#e6dfd5] text-[11px] text-[#59534b] space-y-0.5">
                        <p className="font-bold text-[#22623a]">Clinic: Korangi No. 4, Karachi</p>
                        <p>Walk-ins welcome · Pulse diagnosis (Nabz) available on-the-spot.</p>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Reserving Slot...</span>
                          </>
                        ) : (
                          <>
                            <Calendar className="w-4 h-4 text-[#c59b27]" />
                            <span>Confirm Clinic Reservation</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
