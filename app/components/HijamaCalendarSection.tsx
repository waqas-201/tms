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
import { useSession, signIn, signUp } from "@/lib/auth-client";
import {
  getHijriDate,
  formatDateStr,
  type HijriDateInfo,
  type UpcomingSunnahDate,
  type HijamaSlotAvailability,
} from "@/lib/hijama-types";
import Reveal from "./motion/Reveal";
import AuthModal from "./AuthModal";

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

  // Step 3 Auth Gating State (when unauthenticated)
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

  // Handle Step 3 Authentication Gate: Inline Sign In
  const handleAuthSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccessMsg(null);

    try {
      const cleanEmail = authEmail.trim().toLowerCase();
      if (!cleanEmail || !authPassword) {
        throw new Error("Please enter both email and password.");
      }

      const res = await signIn.email({
        email: cleanEmail,
        password: authPassword,
      });

      if (res.error) {
        const errorMsg = (res.error.message || "").toLowerCase();
        const errorCode = (res.error as { code?: string })?.code;

        if (errorCode === "EMAIL_NOT_VERIFIED" || errorMsg.includes("email not verified")) {
          throw new Error("Your email address is not verified yet. Please verify your email via the link sent to your inbox before booking.");
        }
        throw new Error(res.error.message || "Invalid email or password.");
      }
    } catch (err: any) {
      setAuthError(err.message || "Sign in failed. Check your credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Step 3 Authentication Gate: Inline Registration
  const handleAuthRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccessMsg(null);

    try {
      const cleanEmail = authEmail.trim().toLowerCase();
      if (!authName.trim()) throw new Error("Full name is required.");
      if (!cleanEmail) throw new Error("Email address is required.");
      if (cleanEmail === "admin@tameeresehat.com") {
        throw new Error("This email is reserved for administrative access. Please use a personal email.");
      }
      if (authPassword.length < 8) {
        throw new Error("Password must be at least 8 characters long.");
      }

      const callbackUrl = typeof window !== "undefined" ? window.location.href : "/#hijama-calendar";

      const res = await signUp.email({
        name: authName.trim(),
        email: cleanEmail,
        password: authPassword,
        phone: authPhone.trim() || undefined,
        callbackURL: callbackUrl,
      } as any);

      if (res.error) {
        throw new Error(res.error.message || "Failed to create account.");
      }

      setAuthSuccessMsg(
        `Account created successfully! A verification link has been sent to ${cleanEmail}. Please click the verification link in your email to activate your account and complete booking.`
      );
    } catch (err: any) {
      setAuthError(err.message || "Registration failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

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
                    ₨ {confirmedBooking.feeAmount.toLocaleString()}
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
              <div className="flex items-center justify-between pb-3 border-b border-sand-100 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={`flex items-center gap-1.5 cursor-pointer ${
                    step >= 1 ? "text-ink font-bold" : "text-ink-subtle"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      step >= 1 ? "bg-surface-inverse text-white" : "bg-line text-ink-body"
                    }`}
                  >
                    1
                  </span>
                  <span>Date &amp; Ward</span>
                </button>

                <span className="text-ink-subtle">──</span>

                <button
                  type="button"
                  disabled={!selectedDate}
                  onClick={() => selectedDate && setStep(2)}
                  className={`flex items-center gap-1.5 ${
                    step >= 2
                      ? "text-ink font-bold cursor-pointer"
                      : "text-ink-subtle cursor-not-allowed"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      step >= 2 ? "bg-surface-inverse text-white" : "bg-line text-ink-body"
                    }`}
                  >
                    2
                  </span>
                  <span>Time Slot</span>
                </button>

                <span className="text-ink-subtle">──</span>

                <span
                  className={`flex items-center gap-1.5 ${
                    step === 3 ? "text-ink font-bold" : "text-ink-subtle"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      step === 3 ? "bg-surface-inverse text-white" : "bg-line text-ink-body"
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
                        ₨ 2,500
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
                            ? "bg-surface-inverse text-white border-ink shadow-xs"
                            : "bg-surface text-ink-body border-line hover:border-ink/40"
                        }`}
                      >
                        <span className="text-xs font-bold">Male Ward</span>
                        <span
                          className={`text-[10px] mt-0.5 ${
                            gender === "MALE" ? "text-brand-gold-500" : "text-ink-subtle"
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
                            ? "bg-surface-inverse text-white border-ink shadow-xs"
                            : "bg-surface text-ink-body border-line hover:border-ink/40"
                        }`}
                      >
                        <span className="text-xs font-bold">Female Ward</span>
                        <span
                          className={`text-[10px] mt-0.5 ${
                            gender === "FEMALE" ? "text-brand-gold-500" : "text-ink-subtle"
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
                                    ? "bg-surface-inverse text-white border-ink shadow-xs"
                                    : "bg-surface text-ink border-line hover:border-ink/40"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`text-[10px] font-bold uppercase tracking-wider ${
                                      isPicked ? "text-secondary-text" : "text-secondary-text"
                                    }`}
                                  >
                                    ★ Sunnah {sd.hijriDay}th
                                  </span>
                                  <span
                                    className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                                      isPicked
                                        ? "bg-white/20 text-white font-medium"
                                        : "bg-surface-inverse/5 text-ink font-semibold"
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
                                      isPicked ? "text-brand-green-300" : "text-ink-subtle"
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
                    onClick={() => setStep(2)}
                    className="w-full py-3 px-4 bg-surface-inverse hover:bg-brand-green-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
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
                      onClick={() => setStep(1)}
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
                        Fee: ₨ 2,500 (Pay at Clinic)
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
                                  ? "bg-brand-green-50 text-primary/70 border-success-line/70 opacity-60 blur-[0.4px] hover:blur-[0.4px] cursor-not-allowed select-none"
                                  : isChosen
                                  ? "bg-surface-inverse text-white border-ink shadow-xs font-semibold cursor-pointer"
                                  : "bg-surface text-ink border-line hover:border-ink cursor-pointer"
                              }`}
                            >
                              <span className="text-xs font-bold leading-tight">
                                {s.startTime || s.slot}
                              </span>
                              <span
                                className={`text-[10px] mt-0.5 ${
                                  isFull
                                    ? "text-primary/60 font-semibold"
                                    : isChosen
                                    ? "text-secondary-text font-semibold"
                                    : "text-ink-subtle"
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
                      className="px-4 py-3 bg-surface border border-line hover:bg-surface-sunken text-ink font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      disabled={!selectedSlot}
                      onClick={() => setStep(3)}
                      className="flex-1 py-3 px-4 bg-surface-inverse hover:bg-brand-green-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <span>Continue to Patient Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* ──────────────── STEP 3: DETAILS & AUTHENTICATION GATE ──────────────── */}
              {step === 3 && (
                <div className="space-y-4 animate-fade-in">
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
                      onClick={() => setStep(2)}
                      className="text-xs text-primary font-semibold hover:underline cursor-pointer"
                    >
                      Change Slot
                    </button>
                  </div>

                  {!session?.user ? (
                    <div className="space-y-4">
                      <div className="p-3.5 bg-success-soft/80 border border-success-line/90 rounded-xl flex items-start gap-2.5 text-xs text-success">
                        <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <strong className="block font-bold text-ink">Sign-In Required to Reserve Hijama</strong>
                          <span className="text-ink-body">
                            Your selected date and slot will stay in place while you sign in or create an account.
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="px-4 py-2.5 bg-surface border border-line hover:bg-surface-sunken text-ink font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Back</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAuthModalOpen(true)}
                          className="flex-1 py-2.5 px-4 bg-surface-inverse hover:bg-brand-green-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                        >
                          Sign In or Create Account
                        </button>
                      </div>
                    </div>
                  ) : false ? (
                    /* Legacy inline auth form retained for compatibility; the shared modal is the live flow. */
                    <div className="space-y-4">
                      {/* Gating info banner */}
                      <div className="p-3.5 bg-success-soft/80 border border-success-line/90 rounded-xl flex items-start gap-2.5 text-xs text-success">
                        <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <strong className="block font-bold text-ink">Sign-In Required to Reserve Hijama</strong>
                          <span className="text-ink-body">
                            An account is required to generate your official clinical appointment ticket, issue SMS/WhatsApp reminders, and keep your Sunnah cupping history secure.
                          </span>
                        </div>
                      </div>

                      {/* Tabs: Sign In vs Create Account */}
                      <div className="grid grid-cols-2 p-1 bg-surface border border-line rounded-xl text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => {
                            setAuthTab("signin");
                            setAuthError(null);
                            setAuthSuccessMsg(null);
                          }}
                          className={`py-2 rounded-lg transition-colors cursor-pointer ${
                            authTab === "signin"
                              ? "bg-surface-inverse text-white shadow-xs"
                              : "text-ink-subtle hover:text-ink"
                          }`}
                        >
                          Sign In
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthTab("signup");
                            setAuthError(null);
                            setAuthSuccessMsg(null);
                          }}
                          className={`py-2 rounded-lg transition-colors cursor-pointer ${
                            authTab === "signup"
                              ? "bg-surface-inverse text-white shadow-xs"
                              : "text-ink-subtle hover:text-ink"
                          }`}
                        >
                          Create Account
                        </button>
                      </div>

                      {/* SIGN IN FORM */}
                      {authTab === "signin" ? (
                        <form onSubmit={handleAuthSignIn} className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-ink-body block">
                              Email Address <span className="text-danger">*</span>
                            </label>
                            <div className="relative">
                              <Mail className="w-4 h-4 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                type="email"
                                required
                                value={authEmail}
                                onChange={(e) => setAuthEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full pl-9 pr-3 py-2 bg-surface border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-ink focus:bg-white"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-semibold text-ink-body">
                                Password <span className="text-danger">*</span>
                              </label>
                              <Link
                                href="/forgot-password"
                                className="text-[10px] text-primary hover:underline"
                              >
                                Forgot password?
                              </Link>
                            </div>
                            <div className="relative">
                              <Lock className="w-4 h-4 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={authPassword}
                                onChange={(e) => setAuthPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full pl-9 pr-9 py-2 bg-surface border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-ink focus:bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink cursor-pointer"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                              >
                                {showPassword ? (
                                  <EyeOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          {authError && (
                            <div className="p-3 bg-danger-soft border border-danger/20 rounded-xl text-xs text-danger flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                              <span>{authError}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2.5 pt-1">
                            <button
                              type="button"
                              onClick={() => setStep(2)}
                              className="px-4 py-2.5 bg-surface border border-line hover:bg-surface-sunken text-ink font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                              <span>Back</span>
                            </button>

                            <button
                              type="submit"
                              disabled={authLoading}
                              className="flex-1 py-2.5 px-4 bg-surface-inverse hover:bg-brand-green-900 disabled:opacity-60 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                            >
                              {authLoading ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Signing In...</span>
                                </>
                              ) : (
                                <>
                                  <span>Sign In &amp; Continue Booking</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      ) : (
                        /* CREATE ACCOUNT FORM */
                        <form onSubmit={handleAuthRegister} className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-ink-body block">
                              Full Name <span className="text-danger">*</span>
                            </label>
                            <div className="relative">
                              <User className="w-4 h-4 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                type="text"
                                required
                                value={authName}
                                onChange={(e) => setAuthName(e.target.value)}
                                placeholder="e.g. Usman Ahmed"
                                className="w-full pl-9 pr-3 py-2 bg-surface border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-ink focus:bg-white"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-ink-body block">
                              Email Address <span className="text-danger">*</span>
                            </label>
                            <div className="relative">
                              <Mail className="w-4 h-4 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                type="email"
                                required
                                value={authEmail}
                                onChange={(e) => setAuthEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full pl-9 pr-3 py-2 bg-surface border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-ink focus:bg-white"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-ink-body block">
                                Password (min 8 chars) <span className="text-danger">*</span>
                              </label>
                              <div className="relative">
                                <Lock className="w-4 h-4 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                  type={showPassword ? "text" : "password"}
                                  required
                                  minLength={8}
                                  value={authPassword}
                                  onChange={(e) => setAuthPassword(e.target.value)}
                                  placeholder="At least 8 characters"
                                  className="w-full pl-9 pr-9 py-2 bg-surface border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-ink focus:bg-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink cursor-pointer"
                                  aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                  {showPassword ? (
                                    <EyeOff className="w-3.5 h-3.5" />
                                  ) : (
                                    <Eye className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-ink-body block">
                                WhatsApp Phone (Optional)
                              </label>
                              <div className="relative">
                                <Phone className="w-4 h-4 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                  type="tel"
                                  value={authPhone}
                                  onChange={(e) => setAuthPhone(e.target.value)}
                                  placeholder="0300 1234567"
                                  className="w-full pl-9 pr-3 py-2 bg-surface border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-ink focus:bg-white"
                                />
                              </div>
                            </div>
                          </div>

                          {authError && (
                            <div className="p-3 bg-danger-soft border border-danger/20 rounded-xl text-xs text-danger flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                              <span>{authError}</span>
                            </div>
                          )}

                          {authSuccessMsg && (
                            <div className="p-3 bg-success-soft border border-success-line rounded-xl text-xs text-success flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-success" />
                              <div className="space-y-1">
                                <strong className="block text-success font-bold">Verification Email Sent</strong>
                                <p className="text-[11px] leading-relaxed">{authSuccessMsg}</p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2.5 pt-1">
                            <button
                              type="button"
                              onClick={() => setStep(2)}
                              className="px-4 py-2.5 bg-surface border border-line hover:bg-surface-sunken text-ink font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                              <span>Back</span>
                            </button>

                            <button
                              type="submit"
                              disabled={authLoading}
                              className="flex-1 py-2.5 px-4 bg-surface-inverse hover:bg-brand-green-900 disabled:opacity-60 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                            >
                              {authLoading ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Creating Account...</span>
                                </>
                              ) : (
                                <>
                                  <span>Create Account &amp; Continue</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Direct Link to full login page */}
                      <div className="text-center pt-1 border-t border-sand-100 text-[11px] text-ink-subtle">
                        <span>Prefer using the full login page? </span>
                        <Link
                          href={`/login?redirect=${encodeURIComponent("/#hijama-calendar")}`}
                          className="font-semibold text-primary hover:underline"
                        >
                          Open Login Page →
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
                          onClick={() => setStep(2)}
                          className="px-4 py-3 bg-surface border border-line hover:bg-surface-sunken text-ink font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Back</span>
                        </button>

                        <button
                          type="submit"
                          disabled={submitting || !selectedSlot}
                          className="flex-1 py-3 px-4 bg-surface-inverse hover:bg-brand-green-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
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
          )}
        </div>
      </div>
      <AuthModal
        isOpen={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
      />
    </section>
  );
}
