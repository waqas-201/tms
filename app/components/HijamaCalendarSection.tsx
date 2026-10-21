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
} from "lucide-react";
import { CLINIC_INFO } from "@/app/data/products";
import { useSession } from "@/lib/auth-client";
import {
  getHijriDate,
  formatDateStr,
  type HijriDateInfo,
  type UpcomingSunnahDate,
  type HijamaSlotAvailability,
} from "@/lib/hijama-types";
import Reveal from "./motion/Reveal";

export default function HijamaCalendarSection() {
  const { data: session } = useSession();

  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => formatDateStr(today), [today]);

  /* ── 3-Step In-Screen State ── */
  const [step, setStep] = useState<1 | 2 | 3>(1);

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
      const h = getHijriDate(check, 0);
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
  }, [sunnahDates, todayStr, today]);

  // Current selected date Hijri info
  const selectedHijri = useMemo(() => {
    return getHijriDate(selectedDate || todayStr, 0);
  }, [selectedDate, todayStr]);

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
    setStep(1);
    setSubmitError(null);
  };

  return (
    <section
      id="hijama-calendar"
      className="py-10 sm:py-14 px-4 bg-[#faf8f5] text-[#1e1c19] border-t border-[#e6dfd5]"
    >
      <div className="max-w-2xl mx-auto space-y-5">
        {/* ─── Header: Minimalist & Clean ─── */}
        <Reveal>
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eef7f1] text-[#22623a] text-[11px] font-bold uppercase tracking-wider border border-[#22623a]/20">
              <Moon className="w-3.5 h-3.5 text-[#22623a]" />
              <span>Prophetic Wet Cupping</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#14281D]">
              Sunnah Hijama Calendar
            </h2>
            <p className="text-xs sm:text-sm text-[#6a645a] max-w-md mx-auto">
              Blessed lunar dates (17th, 19th &amp; 21st). Separate male &amp; female wings.
            </p>
          </div>
        </Reveal>

        {/* ─── Main In-Screen Card ─── */}
        <div className="bg-white rounded-2xl border border-[#e6dfd5] p-5 sm:p-7 shadow-xs space-y-6">
          {/* ═══ SUCCESS RECEIPT STATE ═══ */}
          {confirmedBooking ? (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#f0eae1]">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#eef7f1] text-[#22623a] text-[11px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Appointment Confirmed
                  </span>
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-[#14281D]">
                    Ticket #{confirmedBooking.ticketNumber}
                  </h3>
                  <p className="text-xs text-[#7a7268]">
                    Please arrive 10 minutes prior to your session time.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#7a7268] tracking-wider block">
                    Pay at Clinic
                  </span>
                  <span className="text-base sm:text-lg font-bold text-[#14281D]">
                    ₨ {confirmedBooking.feeAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Receipt Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs bg-[#faf8f5] p-3.5 rounded-xl border border-[#e8e2d8]">
                <div>
                  <span className="text-[#7a7268] block">Patient Name:</span>
                  <strong className="text-[#14281D]">{confirmedBooking.fullName}</strong>
                </div>
                <div>
                  <span className="text-[#7a7268] block">Treatment Wing:</span>
                  <strong className="text-[#14281D]">
                    {confirmedBooking.gender === "MALE"
                      ? "Male Ward (Hajjam)"
                      : "Female Ward (Hajjama)"}
                  </strong>
                </div>
                <div>
                  <span className="text-[#7a7268] block">Date:</span>
                  <strong className="text-[#14281D]">
                    {confirmedBooking.appointmentDate}{" "}
                    {confirmedBooking.hijriDate ? `(${confirmedBooking.hijriDate})` : ""}
                  </strong>
                  {confirmedBooking.isSunnahDay && (
                    <span className="ml-1 text-[10px] font-bold text-[#8c6a15]">
                      ★ Sunnah
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-[#7a7268] block">Time Slot:</span>
                  <strong className="text-[#14281D]">{confirmedBooking.appointmentSlot}</strong>
                </div>
                <div className="sm:col-span-2 pt-2 border-t border-[#e8e2d8] text-[11px] text-[#6a645a]">
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
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Confirmation via WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={resetBookingForm}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#f0eae1] hover:bg-[#e4dcce] text-[#14281D] font-bold text-xs rounded-xl transition-colors cursor-pointer"
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
              <div className="flex items-center justify-between pb-3 border-b border-[#f0eae1] text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={`flex items-center gap-1.5 cursor-pointer ${
                    step >= 1 ? "text-[#14281D] font-bold" : "text-[#9a9388]"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      step >= 1 ? "bg-[#14281D] text-white" : "bg-stone-200 text-stone-600"
                    }`}
                  >
                    1
                  </span>
                  <span>Date &amp; Ward</span>
                </button>

                <span className="text-stone-300">──</span>

                <button
                  type="button"
                  disabled={!selectedDate}
                  onClick={() => selectedDate && setStep(2)}
                  className={`flex items-center gap-1.5 ${
                    step >= 2
                      ? "text-[#14281D] font-bold cursor-pointer"
                      : "text-[#9a9388] cursor-not-allowed"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      step >= 2 ? "bg-[#14281D] text-white" : "bg-stone-200 text-stone-600"
                    }`}
                  >
                    2
                  </span>
                  <span>Time Slot</span>
                </button>

                <span className="text-stone-300">──</span>

                <span
                  className={`flex items-center gap-1.5 ${
                    step === 3 ? "text-[#14281D] font-bold" : "text-[#9a9388]"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      step === 3 ? "bg-[#14281D] text-white" : "bg-stone-200 text-stone-600"
                    }`}
                  >
                    3
                  </span>
                  <span>Details</span>
                </span>
              </div>

              {/* ──────────────── STEP 1: DATE & WARD ──────────────── */}
              {step === 1 && (
                <div className="space-y-5 animate-fade-in">
                  {/* Countdown notice strip */}
                  {nextSunnahCountdown && (
                    <div className="p-3 bg-[#f7f5f0] border border-[#e6dfd5] rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <Sparkles className="w-4 h-4 text-[#8c6a15] shrink-0" />
                        <span className="text-[#14281D] truncate">
                          <strong>
                            {nextSunnahCountdown.daysAway === 0
                              ? "Today is a Sunnah Day!"
                              : `${nextSunnahCountdown.daysAway} ${
                                  nextSunnahCountdown.daysAway === 1 ? "day" : "days"
                                } left to Next Sunnah Cupping`}
                          </strong>{" "}
                          <span className="text-[#6a645a]">
                            ({nextSunnahCountdown.hijriDay}th {nextSunnahCountdown.hijriMonthName})
                          </span>
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-[#22623a] shrink-0">
                        ₨ 2,500
                      </span>
                    </div>
                  )}

                  {/* Ward / Gender Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#7a7268] flex items-center justify-between">
                      <span>Select Treatment Wing</span>
                      <span className="text-[10px] font-normal text-[#6a645a]">
                        Strict privacy &amp; etiquette
                      </span>
                    </label>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setGender("MALE")}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          gender === "MALE"
                            ? "bg-[#14281D] text-white border-[#14281D] shadow-xs"
                            : "bg-[#faf8f5] text-[#59534b] border-[#e8e2d8] hover:border-[#14281D]/40"
                        }`}
                      >
                        <span className="text-xs font-bold">Male Ward</span>
                        <span
                          className={`text-[10px] mt-0.5 ${
                            gender === "MALE" ? "text-[#c59b27]" : "text-[#7a7268]"
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
                            ? "bg-[#14281D] text-white border-[#14281D] shadow-xs"
                            : "bg-[#faf8f5] text-[#59534b] border-[#e8e2d8] hover:border-[#14281D]/40"
                        }`}
                      >
                        <span className="text-xs font-bold">Female Ward</span>
                        <span
                          className={`text-[10px] mt-0.5 ${
                            gender === "FEMALE" ? "text-[#c59b27]" : "text-[#7a7268]"
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
                      <label className="text-xs font-bold uppercase tracking-wider text-[#7a7268]">
                        Select Date
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCustomDate(!isCustomDate)}
                        className="text-xs font-semibold text-[#22623a] hover:underline cursor-pointer"
                      >
                        {isCustomDate ? "← Back to Sunnah Dates" : "Choose Custom Date"}
                      </button>
                    </div>

                    {!isCustomDate ? (
                      loadingSunnah ? (
                        <div className="py-6 flex items-center justify-center gap-2 text-xs text-[#7a7268]">
                          <Loader2 className="w-4 h-4 animate-spin text-[#22623a]" />
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
                                    ? "bg-[#14281D] text-white border-[#14281D] shadow-xs"
                                    : "bg-[#faf8f5] text-[#1e1c19] border-[#e8e2d8] hover:border-[#14281D]/40"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`text-[10px] font-bold uppercase tracking-wider ${
                                      isPicked ? "text-[#c59b27]" : "text-[#8c6a15]"
                                    }`}
                                  >
                                    ★ Sunnah {sd.hijriDay}th
                                  </span>
                                  <span
                                    className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                                      isPicked
                                        ? "bg-white/20 text-white font-medium"
                                        : "bg-[#14281D]/5 text-[#14281D] font-semibold"
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
                                      isPicked ? "text-[#a3c2b0]" : "text-[#7a7268]"
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
                          className="px-3.5 py-2.5 bg-[#faf8f5] border border-[#e8e2d8] rounded-xl text-xs font-medium text-[#14281D] focus:outline-none focus:border-[#14281D]"
                        />
                        <span className="text-xs text-[#59534b]">
                          Hijri: <strong>{selectedHijri.hijriFormatted}</strong>{" "}
                          {selectedHijri.isSunnahDay && (
                            <span className="text-[#8c6a15] font-bold ml-1">★ Sunnah Day</span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Continue Button */}
                  <button
                    type="button"
                    disabled={!selectedDate}
                    onClick={() => setStep(2)}
                    className="w-full py-3 px-4 bg-[#14281D] hover:bg-[#1f3c2c] disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>Continue to Time Slots</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* ──────────────── STEP 2: TIME SLOTS ──────────────── */}
              {step === 2 && (
                <div className="space-y-5 animate-fade-in">
                  {/* Selected Date Summary Header */}
                  <div className="flex items-center justify-between p-3 bg-[#faf8f5] border border-[#e8e2d8] rounded-xl text-xs">
                    <div>
                      <span className="text-[#7a7268] block text-[10px]">Chosen Date &amp; Wing</span>
                      <strong className="text-[#14281D]">
                        {selectedDateFormatted} ({selectedHijri.hijriFormatted}) ·{" "}
                        {gender === "MALE" ? "Male Ward" : "Female Ward"}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs text-[#22623a] font-semibold hover:underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  {/* Slots list */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#14281D]">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#22623a]" />
                        <span>Select 45-Minute Session</span>
                      </span>
                      <span className="text-[10px] text-[#7a7268] font-normal">
                        Fee: ₨ 2,500 (Pay at Clinic)
                      </span>
                    </div>

                    {loadingSlots ? (
                      <div className="py-8 flex items-center justify-center gap-2 text-xs text-[#7a7268]">
                        <Loader2 className="w-4 h-4 animate-spin text-[#22623a]" />
                        <span>Checking available slots...</span>
                      </div>
                    ) : slotsError ? (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{slotsError}</span>
                      </div>
                    ) : slots.length === 0 ? (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                        No slots available on this date. The clinic may be closed or fully booked. Please select an alternative date.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[220px] overflow-y-auto pr-1">
                        {slots.map((s) => {
                          const isChosen = selectedSlot === s.slot;
                          const isFull = s.seatsRemaining <= 0 || !s.available;

                          return (
                            <button
                              key={s.slot}
                              type="button"
                              disabled={isFull}
                              onClick={() => !isFull && setSelectedSlot(s.slot)}
                              title={isFull ? "This slot is fully booked" : `Select ${s.slot}`}
                              className={`py-2 px-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center relative ${
                                isFull
                                  ? "bg-[#eef7f1] text-[#22623a]/70 border-emerald-200/70 opacity-60 blur-[0.4px] hover:blur-[0.4px] cursor-not-allowed select-none"
                                  : isChosen
                                  ? "bg-[#14281D] text-white border-[#14281D] shadow-xs font-semibold cursor-pointer"
                                  : "bg-[#faf8f5] text-[#1a1816] border-[#e8e2d8] hover:border-[#14281D] cursor-pointer"
                              }`}
                            >
                              <span className="text-xs font-bold leading-tight">
                                {s.startTime || s.slot}
                              </span>
                              <span
                                className={`text-[10px] mt-0.5 ${
                                  isFull
                                    ? "text-[#22623a]/60 font-semibold"
                                    : isChosen
                                    ? "text-[#c59b27] font-semibold"
                                    : "text-[#7a7268]"
                                }`}
                              >
                                {isFull ? "Booked" : "Available"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-3 bg-[#faf8f5] border border-[#e8e2d8] hover:bg-[#f0eae1] text-[#14281D] font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      disabled={!selectedSlot}
                      onClick={() => setStep(3)}
                      className="flex-1 py-3 px-4 bg-[#14281D] hover:bg-[#1f3c2c] disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <span>Continue to Patient Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* ──────────────── STEP 3: PATIENT DETAILS ──────────────── */}
              {step === 3 && (
                <form onSubmit={handleBookingSubmit} className="space-y-4 animate-fade-in">
                  {/* Summary strip */}
                  <div className="flex items-center justify-between p-3 bg-[#faf8f5] border border-[#e8e2d8] rounded-xl text-xs">
                    <div>
                      <span className="text-[#7a7268] block text-[10px]">Session Details</span>
                      <strong className="text-[#14281D]">
                        {selectedDateFormatted} · {selectedSlot} ·{" "}
                        {gender === "MALE" ? "Male Ward" : "Female Ward"}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-xs text-[#22623a] font-semibold hover:underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  {/* Input Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-1">
                      <label className="text-[11px] font-semibold text-[#59534b] block mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Usman Ahmed"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e8e2d8] rounded-xl text-xs text-[#14281D] focus:outline-none focus:border-[#14281D]"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <label className="text-[11px] font-semibold text-[#59534b] block mb-1">
                        WhatsApp Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="0300 1234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e8e2d8] rounded-xl text-xs text-[#14281D] focus:outline-none focus:border-[#14281D]"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <label className="text-[11px] font-semibold text-[#59534b] block mb-1">
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
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e8e2d8] rounded-xl text-xs text-[#14281D] focus:outline-none focus:border-[#14281D]"
                      />
                    </div>
                  </div>

                  {/* Safety Checkbox */}
                  <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={healthConfirmed}
                      onChange={(e) => setHealthConfirmed(e.target.checked)}
                      className="mt-0.5 rounded border-[#c59b27] text-[#14281D] focus:ring-0 cursor-pointer"
                    />
                    <span className="text-[11px] text-[#59534b] leading-tight">
                      I confirm that I am <strong>not taking blood thinners</strong> (e.g. Warfarin), not pregnant, and do not suffer from severe anemia or hemophilia.
                    </span>
                  </label>

                  {submitError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Submission and Back Buttons */}
                  <div className="flex items-center gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-4 py-3 bg-[#faf8f5] border border-[#e8e2d8] hover:bg-[#f0eae1] text-[#14281D] font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      disabled={submitting || !selectedSlot}
                      className="flex-1 py-3 px-4 bg-[#14281D] hover:bg-[#1f3c2c] disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Confirming Booking...</span>
                        </>
                      ) : (
                        <>
                          <span>Confirm Booking (Pay ₨ 2,500 at Clinic)</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
