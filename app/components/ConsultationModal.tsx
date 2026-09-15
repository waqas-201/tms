"use client";

import React, { useState, useEffect } from "react";
import { CLINIC_INFO, CONSULTATION_AREAS } from "@/app/data/products";
import { useSession } from "@/lib/auth-client";
import {
  X,
  Sparkles,
  Video,
  Building2,
  Calendar,
  CheckCircle2,
  Loader2,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultConcern?: string;
}

export default function ConsultationModal({
  isOpen,
  onClose,
  defaultConcern,
}: ConsultationModalProps) {
  const { data: sessionData } = useSession();

  const [bookingMode, setBookingMode] = useState<"ONLINE" | "PHYSICAL">("ONLINE");
  const [formData, setFormData] = useState({
    fullName: sessionData?.user?.name || "",
    phone: (sessionData?.user as any)?.phone || "",
    age: "35",
    city: (sessionData?.user as any)?.city || "Karachi",
    primaryConcern: defaultConcern || "Stomach, Gas & Acidity (Digestion)",
    preferredSlot: "Morning (10:00 AM - 02:00 PM)",
    symptomsDescription: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketResult, setTicketResult] = useState<any>(null);

  useEffect(() => {
    if (defaultConcern) {
      setFormData((prev) => ({ ...prev, primaryConcern: defaultConcern }));
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

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateWhatsAppUrl = (ticket?: string) => {
    const mode = bookingMode === "ONLINE" ? "Online Consultation" : "Clinic Visit (Karachi)";
    const text = `*Assalam-o-Alaikum Hakim Sahib (Direct Consultation Request)*\n` +
      (ticket ? `*Ticket Number:* ${ticket}\n` : "") +
      `*Mode:* ${mode}\n` +
      `*Name:* ${formData.fullName}\n` +
      `*Age & City:* ${formData.age} yrs · ${formData.city}\n` +
      `*Phone:* ${formData.phone}\n` +
      `*Issue:* ${formData.primaryConcern}\n` +
      `*Preferred Slot:* ${formData.preferredSlot}\n` +
      (formData.symptomsDescription ? `*Details:* ${formData.symptomsDescription}\n` : "") +
      `\n_Please guide me on the next available slot and herbal course._`;

    return `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          age: Number(formData.age) || 30,
          gender: "Not Specified",
          phone: formData.phone,
          city: formData.city,
          primarySymptoms: `[${bookingMode} MODAL - ${formData.preferredSlot}] ${formData.primaryConcern}: ${formData.symptomsDescription || "N/A"}`,
          duration: "Recent",
          preferredContact: bookingMode === "ONLINE" ? "WHATSAPP" : "PHONE",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to submit booking.");
      }

      setTicketResult(json.data);
    } catch (err: any) {
      setError(err.message || "Failed to submit consultation. You can also message via WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#e6dfd5] overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#138833] text-white p-5 sm:p-6 flex items-start justify-between relative">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0d5e23] text-[#c59b27] text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Hakim Consultation</span>
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold">
              Book Health Consultation
            </h3>
            <p className="text-xs text-[#f4eee5]/80">
              Personalized health guidance from experienced Tibbi practitioners.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {ticketResult ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 rounded-full bg-[#138833] text-white flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="font-serif text-xl font-bold text-[#138833]">
                  Consultation Request Received!
                </h4>
                <p className="text-xs text-[#59534b]">
                  Ticket Reference:{" "}
                  <strong className="font-mono text-[#138833] px-2 py-0.5 bg-[#faf8f5] border border-[#e6dfd5] rounded">
                    {ticketResult.ticketNumber}
                  </strong>
                </p>
              </div>

              <p className="text-xs text-[#6a6660] leading-relaxed max-w-sm mx-auto">
                Click below to immediately initiate WhatsApp chat with the Hakim and share any previous test reports or prescriptions.
              </p>

              <div className="pt-2 flex flex-col gap-2.5">
                <a
                  href={generateWhatsAppUrl(ticketResult.ticketNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Open WhatsApp Consultation</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setTicketResult(null);
                    onClose();
                  }}
                  className="w-full py-2.5 bg-[#faf8f5] hover:bg-[#f4eee5] text-[#59534b] text-xs font-semibold rounded-xl border border-[#e6dfd5]"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Mode Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#faf8f5] rounded-xl border border-[#e6dfd5]">
                <button
                  type="button"
                  onClick={() => setBookingMode("ONLINE")}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    bookingMode === "ONLINE"
                      ? "bg-[#138833] text-white shadow-xs"
                      : "text-[#59534b] hover:text-[#1a1816]"
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Online Telehealth</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBookingMode("PHYSICAL")}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    bookingMode === "PHYSICAL"
                      ? "bg-[#138833] text-white shadow-xs"
                      : "text-[#59534b] hover:text-[#1a1816]"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Karachi Clinic Visit</span>
                </button>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-[#1a1816]">
                    Patient Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Tariq Mehmood"
                    className="w-full text-xs px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#138833]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1a1816]">
                    WhatsApp / Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0300-1234567"
                    className="w-full text-xs px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#138833]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1a1816]">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Karachi, Lahore, etc."
                    className="w-full text-xs px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#138833]"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-[#1a1816]">
                    Primary Health Concern <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="primaryConcern"
                    value={formData.primaryConcern}
                    onChange={handleChange}
                    className="w-full text-xs px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#138833]"
                  >
                    {CONSULTATION_AREAS.map((a) => (
                      <option key={a.title} value={a.title}>
                        {a.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-[#1a1816]">
                    Symptoms & Details (Optional)
                  </label>
                  <textarea
                    rows={2}
                    name="symptomsDescription"
                    value={formData.symptomsDescription}
                    onChange={handleChange}
                    placeholder="Briefly describe your symptoms or past medications..."
                    className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#138833]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#138833] hover:bg-[#0f7229] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting to Hakim...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm & Book Consultation</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-1">
                <span className="text-[11px] text-[#7a7268] flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#138833]" />
                  100% Private, Safe & Free Medical Review
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
