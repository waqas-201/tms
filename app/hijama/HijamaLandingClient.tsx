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
import { useSession, signIn, signUp } from "@/lib/auth-client";
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

  // Auth gate state (when unauthenticated)
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

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

  // Auth gate handlers
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
          throw new Error("Your email address is not verified yet. Please check your inbox or verify your account before booking.");
        }
        throw new Error(res.error.message || "Invalid email or password.");
      }
    } catch (err: any) {
      setAuthError(err.message || "Sign in failed. Check your credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

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

      const callbackUrl = typeof window !== "undefined" ? window.location.href : "/hijama";

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
        `Account created! A verification link has been sent to ${cleanEmail}. Please verify your email to activate your account and complete booking.`
      );
    } catch (err: any) {
      setAuthError(err.message || "Registration failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

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
    <main className="min-h-screen bg-[#faf8f5] py-8 md:py-14 px-4 text-[#1a1816]">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Breadcrumb & Clean Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-[#7a7268]">
            <Link href="/" className="hover:text-[#22623a]">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#22623a] font-medium">Hijama Cupping</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#14281D]">
                Sunnah Hijama Booking
              </h1>
              <p className="text-xs md:text-sm text-[#59534b] mt-1">
                Authentic wet cupping according to Prophetic lunar timings in Karachi.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-[#14281D]/5 text-[#14281D] text-xs font-semibold rounded-lg border border-[#14281D]/15 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-[#c59b27]" />
                17, 19, 21 Sunnah Focus
              </span>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Segregated Wings
              </span>
            </div>
          </div>
        </div>

        {/* ─── SUCCESS TICKET SCREEN ─── */}
        {confirmedBooking ? (
          <div className="bg-white rounded-2xl border border-[#c59b27]/40 p-6 md:p-8 shadow-sm space-y-6 animate-fade-in">
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#f0eae1]">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Appointment Confirmed
                </span>
                <h2 className="text-xl md:text-2xl font-serif font-bold text-[#14281D]">
                  Booking Reference: {confirmedBooking.ticketNumber}
                </h2>
                <p className="text-xs text-[#7a7268]">
                  Please arrive 10 minutes prior to your time slot.
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#7a7268] tracking-wider block">
                  Fee (Pay at Clinic)
                </span>
                <span className="text-lg md:text-xl font-bold text-[#14281D]">
                  ₨ {confirmedBooking.feeAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Ticket Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#faf8f5] p-4 rounded-xl border border-[#e8e2d8]">
              <div>
                <span className="text-[#7a7268] block">Patient Name:</span>
                <strong className="text-[#14281D] text-sm">
                  {confirmedBooking.fullName}
                </strong>
              </div>
              <div>
                <span className="text-[#7a7268] block">Treatment Wing:</span>
                <strong className="text-[#14281D]">
                  {confirmedBooking.gender === "MALE"
                    ? "Male Ward (Certified Hajjam)"
                    : "Female Ward (Certified Hajjama)"}
                </strong>
              </div>
              <div>
                <span className="text-[#7a7268] block">Appointment Date:</span>
                <strong className="text-[#14281D]">
                  {confirmedBooking.appointmentDate}{" "}
                  {confirmedBooking.hijriDate ? `(${confirmedBooking.hijriDate})` : ""}
                </strong>
                {confirmedBooking.isSunnahDay && (
                  <span className="ml-1.5 text-[10px] font-bold text-[#c59b27]">
                    ★ Sunnah Day
                  </span>
                )}
              </div>
              <div>
                <span className="text-[#7a7268] block">Time Slot:</span>
                <strong className="text-[#14281D] text-sm">
                  {confirmedBooking.appointmentSlot}
                </strong>
              </div>
              <div className="sm:col-span-2 pt-2 border-t border-[#e8e2d8]">
                <span className="text-[#7a7268] block">Clinic Address:</span>
                <span className="text-[#14281D] font-medium">
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
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send Confirmation to Clinic on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#f0eae1] hover:bg-[#e4dcce] text-[#14281D] font-bold text-xs rounded-xl transition-colors cursor-pointer"
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
            className="bg-white rounded-2xl border border-[#e8e2d8] p-5 md:p-8 shadow-xs space-y-7"
          >
            {/* Step 1: Gender / Ward Selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#7a7268] flex items-center justify-between">
                <span>1. Select Treatment Wing</span>
                <span className="text-[11px] font-normal text-[#59534b]">
                  Islamic modesty protocol (Haya)
                </span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGender("MALE")}
                  className={`py-3 px-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    gender === "MALE"
                      ? "bg-[#14281D] text-white border-[#14281D] shadow-xs"
                      : "bg-[#faf8f5] text-[#59534b] border-[#e8e2d8] hover:border-[#14281D]/40"
                  }`}
                >
                  <span className="text-xs font-bold">Male Ward</span>
                  <span
                    className={`text-[11px] mt-0.5 ${
                      gender === "MALE" ? "text-[#c59b27]" : "text-[#7a7268]"
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
                      ? "bg-[#14281D] text-white border-[#14281D] shadow-xs"
                      : "bg-[#faf8f5] text-[#59534b] border-[#e8e2d8] hover:border-[#14281D]/40"
                  }`}
                >
                  <span className="text-xs font-bold">Female Ward</span>
                  <span
                    className={`text-[11px] mt-0.5 ${
                      gender === "FEMALE" ? "text-[#c59b27]" : "text-[#7a7268]"
                    }`}
                  >
                    Certified Hajjama (Female)
                  </span>
                </button>
              </div>
            </div>

            {/* Step 2: Date & Available Slots */}
            <div className="space-y-4 pt-4 border-t border-[#f0eae1]">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#7a7268]">
                    2. Select Date
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
                              ? "bg-[#14281D] text-white border-[#c59b27] shadow-xs"
                              : "bg-[#faf8f5] text-[#1a1816] border-[#e8e2d8] hover:border-[#c59b27]/60"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider ${
                                isSelected ? "text-[#c59b27]" : "text-[#8c6a15]"
                              }`}
                            >
                              ★ Sunnah {sd.hijriDay}th
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                isSelected
                                  ? "bg-[#c59b27]/20 text-[#fcfbf9]"
                                  : "bg-[#14281D]/5 text-[#14281D]"
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
                                isSelected ? "text-[#a3c2b0]" : "text-[#7a7268]"
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
                      className="px-3.5 py-2.5 bg-[#faf8f5] border border-[#e8e2d8] rounded-xl text-xs font-medium text-[#14281D] focus:outline-none focus:border-[#14281D]"
                    />
                    {dateHijri && (
                      <span className="text-xs text-[#59534b]">
                        Hijri: <strong>{dateHijri.hijriFormatted}</strong>{" "}
                        {dateHijri.isSunnahDay && (
                          <span className="text-[#c59b27] font-bold ml-1">★ Sunnah Day</span>
                        )}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Time Slot Chips */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#14281D]">Available Time Slots (45 mins)</span>
                  <span className="text-[#7a7268] text-[11px]">
                    {dateHijri?.isSunnahDay ? "★ Sunnah Day Capacity" : "Regular Capacity"}
                  </span>
                </div>

                {loadingSlots ? (
                  <div className="py-8 flex items-center justify-center gap-2 text-xs text-[#7a7268]">
                    <Loader2 className="w-4 h-4 animate-spin text-[#22623a]" />
                    <span>Loading real-time availability...</span>
                  </div>
                ) : slots.length === 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    No slots available on this date. The clinic may be closed or fully booked. Please pick another date.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {slots.map((s) => {
                      const isSelected = selectedSlot === s.slot;
                      const isFull = s.seatsRemaining <= 0;

                      return (
                        <button
                          key={s.slot}
                          type="button"
                          disabled={isFull}
                          onClick={() => !isFull && setSelectedSlot(s.slot)}
                          title={isFull ? "This slot is fully booked" : `Select ${s.slot}`}
                          className={`py-2 px-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center relative ${
                            isFull
                              ? "bg-[#eef7f1] text-[#22623a]/70 border-emerald-200/70 opacity-60 blur-[0.4px] hover:blur-[0.4px] cursor-not-allowed select-none"
                              : isSelected
                              ? "bg-[#14281D] text-white border-[#14281D] shadow-xs cursor-pointer"
                              : "bg-[#faf8f5] text-[#1a1816] border-[#e8e2d8] hover:border-[#14281D] cursor-pointer"
                          }`}
                        >
                          <span className="text-xs font-bold leading-tight">{s.startTime}</span>
                          <span
                            className={`text-[10px] mt-0.5 ${
                              isFull
                                ? "text-[#22623a]/60 font-semibold"
                                : isSelected
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
            </div>

            {/* Step 3: Patient Details & Confirm / Auth Gate */}
            <div className="space-y-4 pt-4 border-t border-[#f0eae1]">
              <label className="text-xs font-bold uppercase tracking-wider text-[#7a7268] block">
                3. Patient Details &amp; Confirmation
              </label>

              {!session?.user ? (
                /* ── UNAUTHENTICATED: AUTH GATE ── */
                <div className="space-y-4 bg-[#faf8f5] p-5 rounded-2xl border border-[#e8e2d8]">
                  <div className="flex items-start gap-2.5 text-xs text-[#14281D]">
                    <ShieldCheck className="w-5 h-5 text-[#22623a] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Sign-In Required to Book Hijama</strong>
                      <span className="text-[#59534b]">
                        Please sign in or create an account to reserve your clinical session. Your booking will be automatically linked to your account.
                      </span>
                    </div>
                  </div>

                  {/* Auth Tabs */}
                  <div className="grid grid-cols-2 p-1 bg-white border border-[#e8e2d8] rounded-xl text-xs font-bold max-w-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab("signin");
                        setAuthError(null);
                        setAuthSuccessMsg(null);
                      }}
                      className={`py-2 rounded-lg transition-colors cursor-pointer ${
                        authTab === "signin"
                          ? "bg-[#14281D] text-white shadow-xs"
                          : "text-[#7a7268] hover:text-[#14281D]"
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
                          ? "bg-[#14281D] text-white shadow-xs"
                          : "text-[#7a7268] hover:text-[#14281D]"
                      }`}
                    >
                      Create Account
                    </button>
                  </div>

                  {authTab === "signin" ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-[#59534b] block">
                            Email Address *
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-[#7a7268] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="email"
                              value={authEmail}
                              onChange={(e) => setAuthEmail(e.target.value)}
                              placeholder="name@example.com"
                              className="w-full pl-9 pr-3 py-2 bg-white border border-[#d6cfc5] rounded-xl text-xs text-[#14281D] focus:outline-none focus:border-[#14281D]"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-[#59534b]">
                              Password *
                            </label>
                            <Link href="/forgot-password" className="text-[10px] text-[#22623a] hover:underline">
                              Forgot?
                            </Link>
                          </div>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-[#7a7268] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type={showPassword ? "text" : "password"}
                              value={authPassword}
                              onChange={(e) => setAuthPassword(e.target.value)}
                              placeholder="Your password"
                              className="w-full pl-9 pr-9 py-2 bg-white border border-[#d6cfc5] rounded-xl text-xs text-[#14281D] focus:outline-none focus:border-[#14281D]"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a7268] hover:text-[#14281D] cursor-pointer"
                            >
                              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {authError && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{authError}</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleAuthSignIn}
                        disabled={authLoading}
                        className="py-2.5 px-6 bg-[#14281D] hover:bg-[#1f3c2c] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        {authLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Signing In...</span>
                          </>
                        ) : (
                          <>
                            <span>Sign In to Continue Booking</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-[#59534b] block">
                            Full Name *
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-[#7a7268] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              value={authName}
                              onChange={(e) => setAuthName(e.target.value)}
                              placeholder="e.g. Usman Ahmed"
                              className="w-full pl-9 pr-3 py-2 bg-white border border-[#d6cfc5] rounded-xl text-xs text-[#14281D] focus:outline-none focus:border-[#14281D]"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-[#59534b] block">
                            Email Address *
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-[#7a7268] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="email"
                              value={authEmail}
                              onChange={(e) => setAuthEmail(e.target.value)}
                              placeholder="name@example.com"
                              className="w-full pl-9 pr-3 py-2 bg-white border border-[#d6cfc5] rounded-xl text-xs text-[#14281D] focus:outline-none focus:border-[#14281D]"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-[#59534b] block">
                            Password (min 8 chars) *
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-[#7a7268] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type={showPassword ? "text" : "password"}
                              value={authPassword}
                              onChange={(e) => setAuthPassword(e.target.value)}
                              placeholder="At least 8 chars"
                              className="w-full pl-9 pr-9 py-2 bg-white border border-[#d6cfc5] rounded-xl text-xs text-[#14281D] focus:outline-none focus:border-[#14281D]"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a7268] hover:text-[#14281D] cursor-pointer"
                            >
                              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-[#59534b] block">
                            WhatsApp Phone (Optional)
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-[#7a7268] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="tel"
                              value={authPhone}
                              onChange={(e) => setAuthPhone(e.target.value)}
                              placeholder="0300 1234567"
                              className="w-full pl-9 pr-3 py-2 bg-white border border-[#d6cfc5] rounded-xl text-xs text-[#14281D] focus:outline-none focus:border-[#14281D]"
                            />
                          </div>
                        </div>
                      </div>

                      {authError && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{authError}</span>
                        </div>
                      )}

                      {authSuccessMsg && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                          <div className="space-y-1">
                            <strong className="block font-bold">Verification Email Sent</strong>
                            <p className="text-[11px] leading-relaxed">{authSuccessMsg}</p>
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleAuthRegister}
                        disabled={authLoading}
                        className="py-2.5 px-6 bg-[#14281D] hover:bg-[#1f3c2c] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
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
                  )}
                </div>
              ) : (
                /* ── AUTHENTICATED: PATIENT FORM ── */
                <>
                  <div className="p-2.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <ShieldCheck className="w-4 h-4 text-[#22623a] shrink-0" />
                      <span className="text-[#14281D] truncate">
                        Booking as <strong className="font-semibold">{session.user.name || "Patient"}</strong>{" "}
                        <span className="text-[#6a645a]">({session.user.email})</span>
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-[#22623a] bg-white px-2 py-0.5 rounded-md border border-emerald-200/80 shrink-0">
                      Signed In
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="text-[11px] font-semibold text-[#59534b] block mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Muhammad Usman"
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
                        placeholder="e.g. 35"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e8e2d8] rounded-xl text-xs text-[#14281D] focus:outline-none focus:border-[#14281D]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#59534b] block mb-1">
                      Reason for Cupping (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Migraine headache, lower back stiffness, Sunnah revival"
                      value={cuppingReason}
                      onChange={(e) => setCuppingReason(e.target.value)}
                      className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e8e2d8] rounded-xl text-xs text-[#14281D] focus:outline-none focus:border-[#14281D]"
                    />
                  </div>

                  {/* Safety Pre-Screening Checkbox */}
                  <label className="flex items-start gap-2.5 pt-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={healthConfirmed}
                      onChange={(e) => setHealthConfirmed(e.target.checked)}
                      className="mt-0.5 rounded border-[#c59b27] text-[#14281D] focus:ring-0 cursor-pointer"
                    />
                    <span className="text-[11px] text-[#59534b] leading-tight">
                      I confirm that I am <strong>not taking active blood-thinners</strong> (e.g. Warfarin), not pregnant, and do not suffer from severe uncontrolled anemia or hemophilia.
                    </span>
                  </label>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Submit CTA */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting || !selectedSlot}
                      className="w-full py-3.5 px-6 bg-[#14281D] hover:bg-[#1f3c2c] text-white font-bold text-sm rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Confirming Appointment...</span>
                        </>
                      ) : (
                        <>
                          <span>Confirm Hijama Seat (Pay ₨ 2,500 at Clinic)</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <p className="text-center text-[11px] text-[#7a7268] mt-2">
                      No online payment required. Fee includes sterile single-use cups &amp; certified Hakim procedure.
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
