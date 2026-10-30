"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Moon,
  ShieldCheck,
  Calendar,
  Clock,
  Users,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  RotateCcw,
  Sparkles,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  Shield,
  KeyRound,
} from "lucide-react";
import { CLINIC_INFO } from "@/app/data/products";
import { useSession } from "@/lib/auth-client";
import {
  getHijriDate,
  formatDateStr,
  DEFAULT_PAKISTAN_MOON_OFFSET,
  type HijriDateInfo,
  type UpcomingSunnahDate,
  type HijamaSlotAvailability,
} from "@/lib/hijama-types";
import Reveal from "./motion/Reveal";
import StepTransition from "./motion/StepTransition";
import StepConnector from "./motion/StepConnector";
import SlotStrip from "./SlotStrip";

export default function HijamaCalendarSection() {
  const { data: session } = useSession();

  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => formatDateStr(today), [today]);

  /* ── 3-Step In-Screen State ── */
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [stepDirection, setStepDirection] = useState<1 | -1>(1);

  const goToStep = (next: 1 | 2 | 3) => {
    if (next === step) return;
    setStepDirection(next > step ? 1 : -1);
    setStep(next);
  };

  // Step 1 State: Ward & Date
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isCustomDate, setIsCustomDate] = useState(false);

  // Step 2 State: Slot
  const [selectedSlot, setSelectedSlot] = useState<string>("");

  // Step 3 State: Patient Details
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [healthConfirmed, setHealthConfirmed] = useState(false);


  // Data fetching state
  const [sunnahDates, setSunnahDates] = useState<UpcomingSunnahDate[]>([]);
  const [loadingSunnah, setLoadingSunnah] = useState(true);

  const [slots, setSlots] = useState<HijamaSlotAvailability[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [moonOffset, setMoonOffset] = useState<number>(DEFAULT_PAKISTAN_MOON_OFFSET);

  // Booking submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
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

  // Pre-fill user data if authenticated
  useEffect(() => {
    if (session?.user) {
      if (session.user.name && !fullName) setFullName(session.user.name);
      const userPhone = (session.user as any)?.phone;
      if (userPhone && !phone) setPhone(userPhone);
    }
  }, [session, fullName, phone]);

  // 1. Fetch upcoming Sunnah dates from API
  useEffect(() => {
    let active = true;
    async function loadSunnah() {
      try {
        setLoadingSunnah(true);
        const res = await fetch("/api/hijama/sunnah-dates?months=2");
        const json = await res.json();
        if (active && json.success && Array.isArray(json.data) && json.data.length > 0) {
          setSunnahDates(json.data);
          if (typeof json.meta?.moonSightingOffset === 'number') { setMoonOffset(json.meta.moonSightingOffset); }
          if (!selectedDate) {
            setSelectedDate(json.data[0].date);
          }
        }
      } catch (err) {
        console.error("Failed to fetch sunnah dates:", err);
      } finally {
        if (active) setLoadingSunnah(false);
      }
    }
    loadSunnah();
    return () => {
      active = false;
    };
  }, [selectedDate]);

  // 2. Fetch slots whenever date or gender changes
  const fetchSlots = useCallback(async (dateStr: string, wardGender: "MALE" | "FEMALE") => {
    if (!dateStr) return;
    setLoadingSlots(true);
    setSlotsError(null);
    try {
      const res = await fetch(`/api/hijama/availability?date=${dateStr}&gender=${wardGender}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Unable to check available slots.");
      }
      setSlots(json.data?.slots || []);
    } catch (err: any) {
      setSlotsError(err.message || "Failed to load slots for this date.");
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate, gender);
    }
  }, [selectedDate, gender, fetchSlots]);

  // Days-left countdown calculation for next upcoming Sunnah date
  const nextSunnahCountdown = useMemo(() => {
    if (sunnahDates.length > 0) {
      const first = sunnahDates[0];
      const dateObj = new Date(first.date + "T12:00:00Z");
      const diffMs = dateObj.getTime() - new Date(todayStr + "T12:00:00Z").getTime();
      const daysAway = Math.max(0, Math.round(diffMs / 86400000));
      return {
        ...first,
        daysAway,
      };
    }

    // Client-side fallback
    for (let i = 0; i < 35; i++) {
      const check = new Date(today);
      check.setDate(today.getDate() + i);
      const h = getHijriDate(check, moonOffset);
      if (h.isSunnahDay) {
        return {
          date: formatDateStr(check),
          hijriDay: h.hijriDay,
          hijriMonthName: h.hijriMonthName,
          hijriFormatted: h.hijriFormatted,
          dayName: check.toLocaleDateString("en-US", { weekday: "short" }),
          totalAvailableSeats: 16,
          daysAway: i,
        };
      }
    }
    return null;
  }, [sunnahDates, todayStr, today, moonOffset]);

  // Current selected date Hijri info
  const selectedHijri = useMemo(() => {
    return getHijriDate(selectedDate || todayStr, moonOffset);
  }, [selectedDate, todayStr, moonOffset]);

  // Human readable selected date
  const selectedDateFormatted = useMemo(() => {
    if (!selectedDate) return "";
    try {
      const d = new Date(selectedDate + "T12:00:00Z");
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  // Handle final booking submission
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!selectedDate || !selectedSlot) {
      setSubmitError("Please ensure an appointment date and slot are selected.");
      return;
    }
    if (!fullName.trim() || !phone.trim() || !age.trim()) {
      setSubmitError("Please provide your name, phone number, and age.");
      return;
    }
    if (!healthConfirmed) {
      setSubmitError("Please confirm the medical safety acknowledgement.");
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
          cuppingReason: "Sunnah cupping & general wellness",
          contraindications: {
            confirmedNoBloodThinners: true,
            confirmedNotPregnant: true,
            confirmedNoSevereAnemia: true,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to confirm booking. Please try another slot.");
      }

      setConfirmedBooking(json.data);
      // Re-fetch slots to update availability
      fetchSlots(selectedDate, gender);
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong while booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetBookingForm = () => {
    setConfirmedBooking(null);
    setSelectedSlot("");
    setStepDirection(-1);
    setStep(1);
    setSubmitError(null);
  };

  return (
    <section
      id="hijama-calendar"
      className="py-10 sm:py-14 px-4 bg-surface text-ink border-t border-line"
    >
      <div className="max-w-2xl mx-auto space-y-5">
        {/* ─── Header: Minimalist & Clean ─── */}
        <Reveal>
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-green-50 text-primary text-[11px] font-bold uppercase tracking-wider border border-primary/20">
              <Moon className="w-3.5 h-3.5 text-primary" />
              <span>Prophetic Wet Cupping</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
              Sunnah Hijama Calendar
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted max-w-md mx-auto">
              Blessed lunar dates (17th, 19th &amp; 21st). Separate male &amp; female wings.
            </p>
          </div>
        </Reveal>

        {/* ─── Main In-Screen Card ─── */}
        <div className="bg-white rounded-2xl border border-line p-5 sm:p-7 shadow-xs space-y-6">
          {/* ═══ SUCCESS RECEIPT STATE ═══ */}
          {confirmedBooking ? (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-sand-100">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-green-50 text-primary text-[11px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Appointment Confirmed
                  </span>
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-ink">
                    Ticket #{confirmedBooking.ticketNumber}
                  </h3>
                  <p className="text-xs text-ink-subtle">
                    Please arrive 10 minutes prior to your session time.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-ink-subtle tracking-wider block">
                    Pay at Clinic
                  </span>
                  <span className="text-base sm:text-lg font-bold text-ink">
                    1 cup: ₨ 250 each</span>
                  <span className="text-[10px] text-ink-muted block">
                    5 cups minimum
                  </span>
                </div>
              </div>

              {/* Receipt Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs bg-surface p-3.5 rounded-xl border border-line">
                <div>
                  <span className="text-ink-subtle block">Patient Name:</span>
                  <strong className="text-ink">{confirmedBooking.fullName}</strong>
                </div>
                <div>
                  <span className="text-ink-subtle block">Treatment Wing:</span>
                  <strong className="text-ink">
                    {confirmedBooking.gender === "MALE"
                      ? "Male Ward (Hajjam)"
                      : "Female Ward (Hajjama)"}
                  </strong>
                </div>
                <div>
                  <span className="text-ink-subtle block">Date:</span>
                  <strong className="text-ink">
                    {confirmedBooking.appointmentDate}{" "}
                    {confirmedBooking.hijriDate ? `(${confirmedBooking.hijriDate})` : ""}
                  </strong>
                  {confirmedBooking.isSunnahDay && (
                    <span className="ml-1 text-[10px] font-bold text-secondary-text">
                      ★ Sunnah
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-ink-subtle block">Time Slot:</span>
                  <strong className="text-ink">{confirmedBooking.appointmentSlot}</strong>
                </div>
                <div className="sm:col-span-2 pt-2 border-t border-line text-[11px] text-ink-muted">
                  <strong>Clinic:</strong> {CLINIC_INFO.clinicName} — Plot L-41, Korangi Crossing Rd, Allah Wala Town, Karachi
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                <a
                  href={`https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(
                    `*Assalam-o-Alaikum Tameer-e-Sehat Clinic*\nI have confirmed a Hijama Appointment:\n• Ticket: *${confirmedBooking.ticketNumber}*\n• Name: *${confirmedBooking.fullName}* (${confirmedBooking.gender})\n• Date: *${confirmedBooking.appointmentDate}* (${confirmedBooking.hijriDate || ""})\n• Slot: *${confirmedBooking.appointmentSlot}*`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-whatsapp hover:bg-whatsapp-hover text-on-whatsapp font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Confirmation via WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={resetBookingForm}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-surface-sunken hover:bg-line text-ink font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Book Another</span>
                </button>
              </div>
            </div>
          ) : (
            /* ═══ 3-STEP IN-SCREEN FORM ═══ */
            <div className="space-y-6">
              {/* Minimal Step Indicator */}
              <div className="flex items-center justify-between gap-1 pb-3 border-b border-sand-100 text-xs font-semibold">
                {[
                  { n: 1 as const, label: "Date & Ward", enabled: true },
                  { n: 2 as const, label: "Time Slot", enabled: Boolean(selectedDate) },
                  { n: 3 as const, label: "Details", enabled: false },
                ].map(({ n, label, enabled }, index) => {
                  const isCurrent = step === n;
                  const isReached = step >= n;
                  return (
                    <React.Fragment key={n}>
                      {index > 0 && (
                        <StepConnector
                          done={step >= n}
                          className="mx-1 min-w-2 shrink"
                        />
                      )}
                      <button
                        type="button"
                        disabled={!enabled}
                        onClick={() => enabled && goToStep(n)}
                        className={`flex shrink-0 items-center gap-1.5 ${
                          enabled ? "cursor-pointer" : "cursor-default"
                        } ${isReached ? "text-ink font-bold" : "text-ink-subtle"}`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all duration-200 ${
                            isReached
                              ? "bg-primary text-white"
                              : "bg-line text-ink-body"
                          } ${isCurrent ? "scale-110" : ""}`}
                        >
                          {n}
                        </span>
                        <span className="transition-colors duration-200">{label}</span>
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>

              <StepTransition stepKey={step} direction={stepDirection}>
                {/* ──────────────── STEP 1: DATE & WARD ──────────────── */}
                {step === 1 && (
                  <div className="space-y-5">
                  {/* Countdown notice strip */}
                  {nextSunnahCountdown && (
                    <div className="p-3 bg-surface border border-line rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <Sparkles className="w-4 h-4 text-secondary-text shrink-0" />
                        <span className="text-ink leading-tight">
                          <strong>
                            {nextSunnahCountdown.daysAway === 0
                              ? "Today is a Sunnah Day!"
                              : `${nextSunnahCountdown.daysAway} ${
                                  nextSunnahCountdown.daysAway === 1 ? "day" : "days"
                                } left to Next Sunnah Cupping`}
                          </strong>{" "}
                          <span className="text-ink-muted">
                            ({nextSunnahCountdown.hijriDay}th {nextSunnahCountdown.hijriMonthName})
                          </span>
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-primary shrink-0 self-end sm:self-auto">
                        1 cup: ₨ 250 each (5 cups min.)
                      </span>
                    </div>
                  )}

                  {/* Ward / Gender Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-ink-subtle flex items-center justify-between">
                      <span>Select Treatment Wing</span>
                      <span className="text-[10px] font-normal text-ink-muted">
                        Strict privacy &amp; etiquette
                      </span>
                    </label>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setGender("MALE")}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          gender === "MALE"
                            ? "bg-primary text-white border-primary shadow-xs"
                            : "bg-surface text-ink-body border-line hover:border-primary/50"
                        }`}
                      >
                        <span className="text-xs font-bold">Male Ward</span>
                        <span
                          className={`text-[10px] mt-0.5 ${
                            gender === "MALE" ? "text-brand-gold-200" : "text-ink-body"
                          }`}
                        >
                          Certified Hajjam
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setGender("FEMALE")}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          gender === "FEMALE"
                            ? "bg-primary text-white border-primary shadow-xs"
                            : "bg-surface text-ink-body border-line hover:border-primary/50"
                        }`}
                      >
                        <span className="text-xs font-bold">Female Ward</span>
                        <span
                          className={`text-[10px] mt-0.5 ${
                            gender === "FEMALE" ? "text-brand-gold-200" : "text-ink-body"
                          }`}
                        >
                          Certified Hajjama
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Sunnah Date Cards */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-ink-subtle">
                        Select Date
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
                      loadingSunnah ? (
                        <div className="py-6 flex items-center justify-center gap-2 text-xs text-ink-subtle">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span>Checking upcoming Sunnah dates...</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          {sunnahDates.slice(0, 3).map((sd) => {
                            const isPicked = selectedDate === sd.date;
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
                                  isPicked
                                    ? "bg-primary text-white border-primary shadow-xs"
                                    : "bg-surface text-ink border-line hover:border-primary/50"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`text-[10px] font-bold uppercase tracking-wider ${
                                      isPicked ? "text-brand-gold-200" : "text-secondary-text"
                                    }`}
                                  >
                                    ★ Sunnah {sd.hijriDay}th
                                  </span>
                                  <span
                                    className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                                      isPicked
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
                                    className={`text-[10px] ${
                                      isPicked ? "text-white/80" : "text-ink-body"
                                    }`}
                                  >
                                    {sd.hijriMonthName}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )
                    ) : (
                      <div className="flex items-center gap-3">
                        <input
                          type="date"
                          value={selectedDate}
                          min={todayStr}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="px-3.5 py-2.5 bg-surface border border-line rounded-xl text-xs font-medium text-ink focus:outline-none focus:border-ink"
                        />
                        <span className="text-xs text-ink-body">
                          Hijri: <strong>{selectedHijri.hijriFormatted}</strong>{" "}
                          {selectedHijri.isSunnahDay && (
                            <span className="text-secondary-text font-bold ml-1">★ Sunnah Day</span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Continue Button */}
                  <button
                    type="button"
                    disabled={!selectedDate}
                    onClick={() => goToStep(2)}
                    className="w-full py-3 px-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>Continue to Time Slots</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* ──────────────── STEP 2: TIME SLOTS ──────────────── */}
              {step === 2 && (
                <div className="space-y-5">
                  {/* Selected Date Summary Header */}
                  <div className="flex items-center justify-between p-3 bg-surface border border-line rounded-xl text-xs">
                    <div>
                      <span className="text-ink-subtle block text-[10px]">Chosen Date &amp; Wing</span>
                      <strong className="text-ink">
                        {selectedDateFormatted} ({selectedHijri.hijriFormatted}) ·{" "}
                        {gender === "MALE" ? "Male Ward" : "Female Ward"}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="text-xs text-primary font-semibold hover:underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  {/* Slots list */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-ink">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>Select 45-Minute Session</span>
                      </span>
                      <span className="text-[10px] text-ink-subtle font-normal">
                        1 cup: ₨ 250 each (5 cups min. · Pay at Clinic)
                      </span>
                    </div>

                    {loadingSlots ? (
                      <div className="py-8 flex items-center justify-center gap-2 text-xs text-ink-subtle">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span>Checking available slots...</span>
                      </div>
                    ) : slotsError ? (
                      <div className="p-3 bg-danger-soft border border-danger/20 text-danger text-xs rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{slotsError}</span>
                      </div>
                    ) : slots.length === 0 ? (
                      <div className="p-4 bg-warning-soft border border-warning-line rounded-xl text-xs text-warning">
                        No slots available on this date. The clinic may be closed or fully booked. Please select an alternative date.
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

                  {/* Navigation Buttons */}
                  <div className="flex items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="px-4 py-3 bg-surface border border-line hover:bg-surface-sunken text-ink font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      disabled={!selectedSlot}
                      onClick={() => goToStep(3)}
                      className="flex-1 py-3 px-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <span>Continue to Patient Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* ──────────────── STEP 3: DETAILS & AUTHENTICATION GATE ──────────────── */}
              {step === 3 && (
                <div className="space-y-4">
                  {/* Summary strip */}
                  <div className="flex items-center justify-between p-3 bg-surface border border-line rounded-xl text-xs">
                    <div>
                      <span className="text-ink-subtle block text-[10px]">Session Details</span>
                      <strong className="text-ink">
                        {selectedDateFormatted} · {selectedSlot} ·{" "}
                        {gender === "MALE" ? "Male Ward" : "Female Ward"}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className="text-xs text-primary font-semibold hover:underline cursor-pointer"
                    >
                      Change Slot
                    </button>
                  </div>

                  {!session?.user ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-success-soft/80 border border-success-line/90 rounded-2xl flex items-start gap-3 text-xs text-success">
                        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <strong className="block text-sm font-bold text-ink">Sign-In Required to Reserve Hijama</strong>
                          <span className="text-ink-body leading-relaxed block">
                            An account is required to generate your official clinical appointment ticket, issue SMS/WhatsApp reminders, and keep your Sunnah cupping history secure.
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => goToStep(2)}
                          className="w-full sm:w-auto px-4 py-2.5 bg-surface border border-line hover:bg-surface-sunken text-ink font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Back</span>
                        </button>
                        <Link
                          href={`/register?redirect=${encodeURIComponent("/#hijama-calendar")}`}
                          className="w-full sm:flex-1 py-2.5 px-4 bg-primary hover:bg-brand-green-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-all shadow-xs"
                        >
                          Create Account
                        </Link>
                        <Link
                          href={`/login?redirect=${encodeURIComponent("/#hijama-calendar")}`}
                          className="w-full sm:flex-1 py-2.5 px-4 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-all shadow-xs"
                        >
                          Sign In
                        </Link>
                      </div>
                    </div>
                  ) : (
                    /* ═══ 3B. AUTHENTICATED PATIENT FORM ═══ */
                    <form onSubmit={handleBookingSubmit} className="space-y-4">
                      {/* Identity Chip */}
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

                      {/* Input Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div className="sm:col-span-1">
                          <label className="text-[11px] font-semibold text-ink-body block mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Usman Ahmed"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-ink focus:bg-white"
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
                            className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-ink focus:bg-white"
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
                            placeholder="35"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-ink focus:bg-white"
                          />
                        </div>
                      </div>

                      {/* Safety Checkbox */}
                      <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={healthConfirmed}
                          onChange={(e) => setHealthConfirmed(e.target.checked)}
                          className="mt-0.5 rounded border-secondary text-ink focus:ring-0 cursor-pointer"
                        />
                        <span className="text-[11px] text-ink-body leading-tight">
                          I confirm that I am <strong>not taking blood thinners</strong> (e.g. Warfarin), not pregnant, and do not suffer from severe anemia or hemophilia.
                        </span>
                      </label>

                      {submitError && (
                        <div className="p-3 bg-danger-soft border border-danger/20 text-danger text-xs rounded-xl flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{submitError}</span>
                        </div>
                      )}

                      {/* Submission and Back Buttons */}
                      <div className="flex items-center gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => goToStep(2)}
                          className="px-4 py-3 bg-surface border border-line hover:bg-surface-sunken text-ink font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Back</span>
                        </button>

                        <button
                          type="submit"
                          disabled={submitting || !selectedSlot}
                          className="flex-1 py-3 px-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Confirming Booking...</span>
                            </>
                          ) : (
                            <>
                              <span>Confirm Booking (Pay at Clinic)</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
              </StepTransition>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
