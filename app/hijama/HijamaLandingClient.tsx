"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Moon,
  ShieldCheck,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  RotateCcw,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";
import { CLINIC_INFO } from "@/app/data/products";
import { useSession } from "@/lib/auth-client";
import SlotStrip from "@/app/components/SlotStrip";
import {
  getHijriDate,
  formatDateStr,
  type HijriDateInfo,
  type UpcomingSunnahDate,
  type HijamaSlotAvailability,
} from "@/lib/hijama-types";

export default function HijamaLandingClient() {
  const { data: session } = useSession();

  // Booking state
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [isCustomDate, setIsCustomDate] = useState(false);

  // Patient inputs
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [cuppingReason, setCuppingReason] = useState("");
  const [healthConfirmed, setHealthConfirmed] = useState(false);


  // Data fetching state
  const [sunnahDates, setSunnahDates] = useState<UpcomingSunnahDate[]>([]);
  const [slots, setSlots] = useState<HijamaSlotAvailability[]>([]);
  const [dateHijri, setDateHijri] = useState<HijriDateInfo | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Confirmation state
  const [confirmedBooking, setConfirmedBooking] = useState<{
    ticketNumber: string;
    fullName: string;
    gender: string;
    appointmentDate: string;
    appointmentSlot: string;
    hijriDate?: string | null;
    isSunnahDay: boolean;
    feeAmount: number;
  } | null>(null);

  // 1. Fetch upcoming Sunnah dates on load
  useEffect(() => {
    async function loadSunnah() {
      try {
        const res = await fetch("/api/hijama/availability?upcomingSunnah=true");
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.upcomingSunnahDates)) {
          const dates: UpcomingSunnahDate[] = json.data.upcomingSunnahDates;
          setSunnahDates(dates);
          if (dates.length > 0 && !selectedDate) {
            setSelectedDate(dates[0].date);
          }
        }
      } catch (err) {
        console.error("Failed to fetch Sunnah dates:", err);
      }
    }
    loadSunnah();
  }, []);

  // 2. Fetch slots when date or gender changes
  useEffect(() => {
    if (!selectedDate) return;

    let active = true;
    setLoadingSlots(true);
    setSelectedSlot("");
    setError(null);

    // Compute Hijri info
    try {
      const h = getHijriDate(selectedDate, 0);
      setDateHijri(h);
    } catch {
      setDateHijri(null);
    }

    async function loadSlots() {
      try {
        const res = await fetch(
          `/api/hijama/availability?date=${selectedDate}&gender=${gender}`
        );
        const json = await res.json();
        if (active) {
          if (json.success && json.data?.slots) {
            setSlots(json.data.slots);
          } else {
            setSlots([]);
          }
        }
      } catch (err) {
        if (active) setSlots([]);
      } finally {
        if (active) setLoadingSlots(false);
      }
    }

    loadSlots();
    return () => {
      active = false;
    };
  }, [selectedDate, gender]);

  // Pre-fill user data when session arrives
  useEffect(() => {
    if (session?.user) {
      if (session.user.name && !fullName) setFullName(session.user.name);
      const userPhone = (session.user as any)?.phone;
      if (userPhone && !phone) setPhone(userPhone);
    }
  }, [session, fullName, phone]);

  // Handle booking form submission
  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedDate) {
      setError("Please select an appointment date.");
      return;
    }
    if (!selectedSlot) {
      setError("Please select a time slot.");
      return;
    }
    if (!fullName.trim() || !phone.trim() || !age.trim()) {
      setError("Please fill in your name, phone number, and age.");
      return;
    }
    if (!healthConfirmed) {
      setError("Please confirm the medical contraindications acknowledgement.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/hijama/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          age: parseInt(age, 10),
          gender,
          appointmentDate: selectedDate,
          appointmentSlot: selectedSlot,
          cuppingReason: cuppingReason.trim() || "Sunnah cupping & general wellness",
          contraindications: JSON.stringify({
            confirmedNoBloodThinners: true,
            confirmedNotPregnant: true,
            confirmedNoSevereAnemia: true,
          }),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to confirm booking. Please try another slot.");
      }

      setConfirmedBooking(json.data);
      window.scrollTo({ top: 120, behavior: "smooth" });
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setConfirmedBooking(null);
    setSelectedSlot("");
    setError(null);
  };

  return (
    <main className="min-h-screen bg-surface py-8 md:py-14 px-4 text-ink">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Breadcrumb & Clean Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-ink-subtle">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span>/</span>
            <span className="text-primary font-medium">Hijama Cupping</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-ink">
                Sunnah Hijama Booking
              </h1>
              <p className="text-xs md:text-sm text-ink-body mt-1">
                Authentic wet cupping according to Prophetic lunar timings in Karachi.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-surface-inverse/5 text-ink text-xs font-semibold rounded-lg border border-ink/15 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-secondary-text" />
                17, 19, 21 Sunnah Focus
              </span>
              <span className="px-2.5 py-1 bg-success-soft text-success text-xs font-semibold rounded-lg border border-success-line flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-success" />
                Segregated Wings
              </span>
            </div>
          </div>
        </div>

        {/* ─── SUCCESS TICKET SCREEN ─── */}
        {confirmedBooking ? (
          <div className="bg-white rounded-2xl border border-secondary/40 p-6 md:p-8 shadow-sm space-y-6 animate-fade-in">
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-sand-100">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-success-soft text-success text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Appointment Confirmed
                </span>
                <h2 className="text-xl md:text-2xl font-serif font-bold text-ink">
                  Booking Reference: {confirmedBooking.ticketNumber}
                </h2>
                <p className="text-xs text-ink-subtle">
                  Please arrive 10 minutes prior to your time slot.
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-ink-subtle tracking-wider block">
                  Fee (Pay at Clinic)
                </span>
                <span className="text-lg md:text-xl font-bold text-ink">
                  ₨ {confirmedBooking.feeAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Ticket Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-surface p-4 rounded-xl border border-line">
              <div>
                <span className="text-ink-subtle block">Patient Name:</span>
                <strong className="text-ink text-sm">
                  {confirmedBooking.fullName}
                </strong>
              </div>
              <div>
                <span className="text-ink-subtle block">Treatment Wing:</span>
                <strong className="text-ink">
                  {confirmedBooking.gender === "MALE"
                    ? "Male Ward (Certified Hajjam)"
                    : "Female Ward (Certified Hajjama)"}
                </strong>
              </div>
              <div>
                <span className="text-ink-subtle block">Appointment Date:</span>
                <strong className="text-ink">
                  {confirmedBooking.appointmentDate}{" "}
                  {confirmedBooking.hijriDate ? `(${confirmedBooking.hijriDate})` : ""}
                </strong>
                {confirmedBooking.isSunnahDay && (
                  <span className="ml-1.5 text-[10px] font-bold text-secondary-text">
                    ★ Sunnah Day
                  </span>
                )}
              </div>
              <div>
                <span className="text-ink-subtle block">Time Slot:</span>
                <strong className="text-ink text-sm">
                  {confirmedBooking.appointmentSlot}
                </strong>
              </div>
              <div className="sm:col-span-2 pt-2 border-t border-line">
                <span className="text-ink-subtle block">Clinic Address:</span>
                <span className="text-ink font-medium">
                  {CLINIC_INFO.clinicName} — Plot L-41, Korangi Crossing Rd, Allah Wala Town, Karachi
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <a
                href={`https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(
                  `*Assalam-o-Alaikum Tameer-e-Sehat Clinic*\nI have confirmed a Hijama Appointment:\n• Ticket: *${confirmedBooking.ticketNumber}*\n• Name: *${confirmedBooking.fullName}* (${confirmedBooking.gender})\n• Date: *${confirmedBooking.appointmentDate}* (${confirmedBooking.hijriDate || ""})\n• Slot: *${confirmedBooking.appointmentSlot}*`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-whatsapp hover:bg-whatsapp-hover text-on-whatsapp font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send Confirmation to Clinic on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-surface-sunken hover:bg-line text-ink font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Book Another</span>
              </button>
            </div>
          </div>
        ) : (
          /* ─── INLINE 3-STEP BOOKING CARD ─── */
          <form
            onSubmit={handleBooking}
            className="bg-white rounded-2xl border border-line p-5 md:p-8 shadow-xs space-y-7"
          >
            {/* Step 1: Gender / Ward Selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-subtle flex items-center justify-between">
                <span>1. Select Treatment Wing</span>
                <span className="text-[11px] font-normal text-ink-body">
                  Islamic modesty protocol (Haya)
                </span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGender("MALE")}
                  className={`py-3 px-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    gender === "MALE"
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-surface text-ink-body border-line hover:border-primary/50"
                  }`}
                >
                  <span className="text-xs font-bold">Male Ward</span>
                  <span
                    className={`text-[11px] mt-0.5 ${
                      gender === "MALE" ? "text-brand-gold-500" : "text-ink-subtle"
                    }`}
                  >
                    Certified Hajjam (Male)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setGender("FEMALE")}
                  className={`py-3 px-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    gender === "FEMALE"
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-surface text-ink-body border-line hover:border-primary/50"
                  }`}
                >
                  <span className="text-xs font-bold">Female Ward</span>
                  <span
                    className={`text-[11px] mt-0.5 ${
                      gender === "FEMALE" ? "text-brand-gold-500" : "text-ink-subtle"
                    }`}
                  >
                    Certified Hajjama (Female)
                  </span>
                </button>
              </div>
            </div>

            {/* Step 2: Date & Available Slots */}
            <div className="space-y-4 pt-4 border-t border-sand-100">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink-subtle">
                    2. Select Date
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomDate(!isCustomDate)}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    {isCustomDate ? "← Back to Sunnah Dates" : "Choose Custom Date"}
                  </button>
                </div>

                {!isCustomDate ? (
                  /* Quick-Pick Sunnah Date Pills */
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {sunnahDates.slice(0, 3).map((sd) => {
                      const isSelected = selectedDate === sd.date;
                      const dateObj = new Date(sd.date + "T12:00:00Z");
                      const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
                      const monthDay = dateObj.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });

                      return (
                        <button
                          key={sd.date}
                          type="button"
                          onClick={() => setSelectedDate(sd.date)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "bg-primary text-white border-primary shadow-xs"
                              : "bg-surface text-ink border-line hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider ${
                                isSelected ? "text-brand-gold-500" : "text-secondary-text"
                              }`}
                            >
                              ★ Sunnah {sd.hijriDay}th
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                isSelected
                                  ? "bg-white/20 text-white font-medium"
                                  : "bg-primary/10 text-primary font-semibold"
                              }`}
                            >
                              {sd.totalAvailableSeats === 0 ? "Full" : `${sd.totalAvailableSeats} slots`}
                            </span>
                          </div>

                          <div className="mt-1">
                            <div className="text-sm font-bold">
                              {dayName}, {monthDay}
                            </div>
                            <div
                              className={`text-[11px] ${
                                isSelected ? "text-brand-green-300" : "text-ink-subtle"
                              }`}
                            >
                              {sd.hijriFormatted}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* Native Date Input */
                  <div className="flex items-center gap-3">
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-3.5 py-2.5 bg-surface border border-line rounded-xl text-xs font-medium text-ink focus:outline-none focus:border-ink"
                    />
                    {dateHijri && (
                      <span className="text-xs text-ink-body">
                        Hijri: <strong>{dateHijri.hijriFormatted}</strong>{" "}
                        {dateHijri.isSunnahDay && (
                          <span className="text-secondary-text font-bold ml-1">★ Sunnah Day</span>
                        )}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Time Slot Chips */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-ink">Available Time Slots (45 mins)</span>
                  <span className="text-ink-subtle text-[11px]">
                    {dateHijri?.isSunnahDay ? "★ Sunnah Day Capacity" : "Regular Capacity"}
                  </span>
                </div>

                {loadingSlots ? (
                  <div className="py-8 flex items-center justify-center gap-2 text-xs text-ink-subtle">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span>Loading real-time availability...</span>
                  </div>
                ) : slots.length === 0 ? (
                  <div className="p-4 bg-warning-soft border border-warning-line rounded-xl text-xs text-warning">
                    No slots available on this date. The clinic may be closed or fully booked. Please pick another date.
                  </div>
                ) : (
                  <SlotStrip
                    slots={slots}
                    selectedSlot={selectedSlot}
                    onSelectSlot={(slot) => setSelectedSlot(slot)}
                    variant="primary"
                    bgFadeClass="from-surface"
                  />
                )}
              </div>
            </div>

            {/* Step 3: Patient Details & Confirm / Auth Gate */}
            <div className="space-y-4 pt-4 border-t border-sand-100">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-subtle block">
                3. Patient Details &amp; Confirmation
              </label>

              {!session?.user ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 bg-surface p-5 rounded-2xl border border-line text-xs">
                    <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <strong className="block text-sm font-bold text-ink">Sign-In Required to Book Hijama</strong>
                      <span className="text-ink-body leading-relaxed block">
                        An account is required to generate your official clinical appointment ticket and link your session history.
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link
                      href={`/register?redirect=${encodeURIComponent("/hijama#hijama-booking")}`}
                      className="w-full py-3 px-6 bg-primary hover:bg-brand-green-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
                    >
                      <span>Create Account</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={`/login?redirect=${encodeURIComponent("/hijama#hijama-booking")}`}
                      className="w-full py-3 px-6 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
                    >
                      <span>Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                /* ── AUTHENTICATED: PATIENT FORM ── */
                <>
                  <div className="p-2.5 bg-success-soft/80 border border-success-line/80 rounded-xl text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-ink truncate">
                        Booking as <strong className="font-semibold">{session.user.name || "Patient"}</strong>{" "}
                        <span className="text-ink-muted">({session.user.email})</span>
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-primary bg-white px-2 py-0.5 rounded-md border border-success-line/80 shrink-0">
                      Signed In
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="text-[11px] font-semibold text-ink-body block mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Muhammad Usman"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-ink"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <label className="text-[11px] font-semibold text-ink-body block mb-1">
                        WhatsApp Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="0300 1234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-ink"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <label className="text-[11px] font-semibold text-ink-body block mb-1">
                        Age *
                      </label>
                      <input
                        type="number"
                        required
                        min={12}
                        max={95}
                        placeholder="e.g. 35"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-ink"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-ink-body block mb-1">
                      Reason for Cupping (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Migraine headache, lower back stiffness, Sunnah revival"
                      value={cuppingReason}
                      onChange={(e) => setCuppingReason(e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-ink"
                    />
                  </div>

                  {/* Safety Pre-Screening Checkbox */}
                  <label className="flex items-start gap-2.5 pt-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={healthConfirmed}
                      onChange={(e) => setHealthConfirmed(e.target.checked)}
                      className="mt-0.5 rounded border-secondary text-ink focus:ring-0 cursor-pointer"
                    />
                    <span className="text-[11px] text-ink-body leading-tight">
                      I confirm that I am <strong>not taking active blood-thinners</strong> (e.g. Warfarin), not pregnant, and do not suffer from severe uncontrolled anemia or hemophilia.
                    </span>
                  </label>

                  {error && (
                    <div className="p-3 bg-danger-soft border border-danger/20 text-danger text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Submit CTA */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting || !selectedSlot}
                      className="w-full py-3.5 px-6 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Confirming Appointment...</span>
                        </>
                      ) : (
                        <>
                          <span>Confirm Hijama Seat (Pay at Clinic)</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <p className="text-center text-[11px] text-ink-subtle mt-2">
                      No online payment required. Fee includes sterile single-use cups &amp; certified Hakeem procedure.
                    </p>
                  </div>
                </>
              )}
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
