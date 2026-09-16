"use client";

import React, { useState } from "react";
import { CLINIC_INFO, CONSULTATION_AREAS } from "@/app/data/products";
import { useSession } from "@/lib/auth-client";
import {
  Calendar,
  Clock,
  Video,
  Building2,
  CheckCircle2,
  ArrowRight,
  Loader2,
  ShieldCheck,
  AlertCircle,
  MessageCircle,
  Sparkles,
  PhoneCall,
} from "lucide-react";
import Reveal from "./motion/Reveal";

export default function QuickAppointmentBooking() {
  const { data: sessionData } = useSession();

  const [bookingType, setBookingType] = useState<"ONLINE" | "PHYSICAL">("ONLINE");
  const [formData, setFormData] = useState({
    fullName: sessionData?.user?.name || "",
    phone: (sessionData?.user as any)?.phone || "",
    age: "32",
    city: (sessionData?.user as any)?.city || "Karachi",
    primaryConcern: "Stomach, Gas & Acidity (Digestion)",
    preferredSlot: "Morning (10:00 AM - 02:00 PM)",
    symptomsNote: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketResult, setTicketResult] = useState<any>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateWhatsAppUrl = (ticketNumber?: string) => {
    const mode = bookingType === "ONLINE" ? "Online Telehealth Consultation" : "In-Person Clinic Visit (Karachi)";
    const text = `*Assalam-o-Alaikum Hakim Sahib (Appointment Request)*\n` +
      (ticketNumber ? `*Booking Ticket #:* ${ticketNumber}\n` : "") +
      `*Consultation Mode:* ${mode}\n` +
      `*Patient Name:* ${formData.fullName}\n` +
      `*Age & City:* ${formData.age} yrs · ${formData.city}\n` +
      `*Contact:* ${formData.phone}\n` +
      `*Primary Issue:* ${formData.primaryConcern}\n` +
      `*Preferred Slot:* ${formData.preferredSlot}\n` +
      (formData.symptomsNote ? `*Brief Note:* ${formData.symptomsNote}\n` : "") +
      `\n_Please confirm my consultation slot. JazakAllah._`;

    return `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
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
          primarySymptoms: `[${bookingType} APPOINTMENT - ${formData.preferredSlot}] ${formData.primaryConcern}. Details: ${formData.symptomsNote || "N/A"}`,
          duration: "Recent",
          preferredContact: bookingType === "ONLINE" ? "WHATSAPP" : "PHONE",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Unable to register appointment.");
      }

      setTicketResult(json.data);
    } catch (err: any) {
      setError(err.message || "Failed to book appointment. You can also message directly on WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="book-appointment" className="py-14 sm:py-16 bg-white border-b border-[#e6dfd5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* Left Column: Clinical Consultation Philosophy (5 cols) */}
          <Reveal className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eef7f1] border border-[#cde4d6] text-[#22623a] text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 text-[#c59b27]" />
              <span>Direct Hakim Consultation</span>
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#22623a] leading-tight">
                Book Your Health Consultation
              </h2>
              <p className="text-xs sm:text-sm text-[#59534b]">
                Connect via online WhatsApp across Pakistan or visit our Karachi clinic for an in-person pulse diagnosis.
              </p>
            </div>

            {/* Dual Mode Feature Pills */}
            <div className="space-y-2.5 pt-1">
              <div className="p-3.5 rounded-xl bg-[#faf8f5] border border-[#e6dfd5] flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#22623a] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif text-xs sm:text-sm font-bold text-[#22623a]">
                    1. Online Telehealth Consult
                  </h4>
                  <p className="text-xs text-[#6a6660]">
                    WhatsApp voice & symptom review for patients anywhere in Pakistan and overseas.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#faf8f5] border border-[#e6dfd5] flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#8c6a15] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif text-xs sm:text-sm font-bold text-[#22623a]">
                    2. In-Person Karachi Clinic Visit
                  </h4>
                  <p className="text-xs text-[#6a6660]">
                    Pulse diagnosis (Nabz) and custom formulation at Korangi Crossing Clinic, Karachi.
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Points */}
            <div className="pt-2 border-t border-[#f4eee5] grid grid-cols-2 gap-3 text-xs text-[#59534b]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#22623a] shrink-0" />
                <span>100% Confidential</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#22623a] shrink-0" />
                <span>2–4 Hr Response</span>
              </div>
            </div>
          </Reveal>

          {/* Right Column: Interactive Booking Form (7 cols) */}
          <Reveal delay={0.08} className="lg:col-span-7">
            <div className="bg-[#faf8f5] rounded-2xl border border-[#e6dfd5] p-5 sm:p-7 shadow-xs">
              {ticketResult ? (
                /* Success Ticket View */
                <div className="bg-white rounded-xl p-5 sm:p-7 border border-[#cde4d6] text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#22623a] text-white flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs uppercase font-bold tracking-wider text-[#8c6a15]">
                      Slot Registered
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#22623a]">
                      Consultation Request Confirmed
                    </h3>
                    <p className="text-xs text-[#59534b]">
                      Reference Ticket Number:
                    </p>
                    <div className="inline-block font-mono text-sm font-bold px-3 py-1 bg-[#eef7f1] text-[#22623a] rounded-md border border-[#cde4d6]">
                      {ticketResult.ticketNumber}
                    </div>
                  </div>

                  <p className="text-xs text-[#6a6660] max-w-md mx-auto">
                    Click below to open WhatsApp with your ticket for instant response from Hakim Sahib.
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
                    <a
                      href={generateWhatsAppUrl(ticketResult.ticketNumber)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Open WhatsApp with Ticket</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setTicketResult(null)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-white border border-[#e6dfd5] hover:bg-[#faf8f5] text-[#1a1816] text-xs font-semibold rounded-xl"
                    >
                      Book Another Slot
                    </button>
                  </div>
                </div>
              ) : (
                /* Booking Form */
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  {/* Mode Selector Tabs */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#22623a] block">
                      Consultation Mode:
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-white rounded-xl border border-[#e6dfd5]">
                      <button
                        type="button"
                        onClick={() => setBookingType("ONLINE")}
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                          bookingType === "ONLINE"
                            ? "bg-[#22623a] text-white shadow-xs"
                            : "text-[#59534b] hover:text-[#1a1816] hover:bg-[#faf8f5]"
                        }`}
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Online WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBookingType("PHYSICAL")}
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                          bookingType === "PHYSICAL"
                            ? "bg-[#22623a] text-white shadow-xs"
                            : "text-[#59534b] hover:text-[#1a1816] hover:bg-[#faf8f5]"
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Karachi Clinic</span>
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Form Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-[#1a1816]">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="e.g. Muhammad Aslam"
                        className="w-full text-xs px-3 py-2 bg-white border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#1a1816]">
                        Phone / WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="0300-1234567"
                        className="w-full text-xs px-3 py-2 bg-white border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a]"
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
                        placeholder="e.g. Karachi, Lahore, Islamabad"
                        className="w-full text-xs px-3 py-2 bg-white border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a]"
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
                        className="w-full text-xs px-3 py-2 bg-white border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a]"
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
                        Preferred Slot <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="preferredSlot"
                        value={formData.preferredSlot}
                        onChange={handleChange}
                        className="w-full text-xs px-3 py-2 bg-white border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a]"
                      >
                        <option value="Morning (10:00 AM - 02:00 PM)">Morning (10:00 AM – 02:00 PM)</option>
                        <option value="Afternoon (03:00 PM - 06:00 PM)">Afternoon (03:00 PM – 06:00 PM)</option>
                        <option value="Evening (06:00 PM - 09:30 PM)">Evening (06:00 PM – 09:30 PM)</option>
                      </select>
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-[#1a1816]">
                        Brief Symptoms (Optional)
                      </label>
                      <textarea
                        rows={2}
                        name="symptomsNote"
                        value={formData.symptomsNote}
                        onChange={handleChange}
                        placeholder="e.g. Acid burning after dinner, knee stiffness, fatigue..."
                        className="w-full text-xs p-2.5 bg-white border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Registering...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
                        <span>Confirm Appointment Slot</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
