"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  X,
  Calendar,
  Clock,
  User,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Phone,
  Mail,
  FileText,
  Printer,
  CalendarPlus,
  MessageCircle,
  Check,
  Copy,
  HeartPulse,
  Info,
  Building2,
  ExternalLink,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { CLINIC_INFO } from "@/app/data/products";
import {
  formatDateStr,
  getHijriDate,
  type HijamaDateAvailability,
  type HijamaSlotAvailability,
  type UpcomingSunnahDate,
} from "@/lib/hijama-types";

export interface HijamaBookingModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  isInline?: boolean;
  initialDate?: string;
  initialSlot?: string;
  initialGender?: "MALE" | "FEMALE";
  onBookingSuccess?: (booking: any) => void;
}

export const CUPPING_REASONS = [
  { id: "HEADACHE", label: "Headache / Migraine", point: "Al-Yafookh & Al-Akhda'ain" },
  { id: "BACK_PAIN", label: "Back & Neck Pain", point: "Al-Kaahil & Lower Lumbar" },
  { id: "SUNNAH_DETOX", label: "General Sunnah Detox", point: "Sunnah Cleansing Points" },
  { id: "JOINT_SCIATICA", label: "Joint Pain & Sciatica", point: "Knees, Shoulders & Sciatic" },
  { id: "STRESS_FATIGUE", label: "Stress & Chronic Fatigue", point: "Nervous Calming Points" },
  { id: "OTHER", label: "General Health / Other", point: "Personalized Protocol" },
];

export default function HijamaBookingModal({
  isOpen = true,
  onClose,
  isInline = false,
  initialDate,
  initialSlot,
  initialGender = "MALE",
  onBookingSuccess,
}: HijamaBookingModalProps) {
  const { data: session } = useSession();

  // Multi-step progress (1 to 5)
  const [step, setStep] = useState<number>(1);

  // Step 1: Gender / Room Selection
  const [gender, setGender] = useState<"MALE" | "FEMALE">(initialGender);

  // Step 2: Date & Slot Selection
  const todayStr = useMemo(() => formatDateStr(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || todayStr);
  const [selectedSlot, setSelectedSlot] = useState<string>(initialSlot || "");

  // Live upcoming Sunnah quick-picks
  const [sunnahDates, setSunnahDates] = useState<UpcomingSunnahDate[]>([]);
  const [loadingSunnah, setLoadingSunnah] = useState<boolean>(false);

  // Slots availability for current selected date + gender
  const [availability, setAvailability] = useState<HijamaDateAvailability | null>(null);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  // Step 3: Clinical Pre-screening
  const [screening, setScreening] = useState<{
    bloodThinners: boolean | null;
    pregnancy: boolean | null;
    lowBpAnemia: boolean | null;
    cuppingReason: string;
    customReason: string;
  }>({
    bloodThinners: null,
    pregnancy: null,
    lowBpAnemia: null,
    cuppingReason: "General Sunnah Detox",
    customReason: "",
  });

  // Step 4: Patient details
  const [details, setDetails] = useState({
    fullName: "",
    phone: "",
    email: "",
    age: "34",
    notes: "",
  });

  // Submission & Confirmation state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);
  const [copiedTicket, setCopiedTicket] = useState<boolean>(false);

  // Pre-fill user details when session arrives
  useEffect(() => {
    if (session?.user) {
      setDetails((prev) => ({
        ...prev,
        fullName: prev.fullName || session.user.name || "",
        phone: prev.phone || (session.user as any).phone || "",
        email: prev.email || session.user.email || "",
      }));
    }
  }, [session]);

  // Sync initial props
  useEffect(() => {
    if (initialDate) setSelectedDate(initialDate);
    if (initialSlot) setSelectedSlot(initialSlot);
    if (initialGender) setGender(initialGender);
  }, [initialDate, initialSlot, initialGender]);

  // Fetch upcoming Sunnah quick picks
  useEffect(() => {
    let isMounted = true;
    async function loadSunnahDates() {
      setLoadingSunnah(true);
      try {
        const res = await fetch("/api/hijama/sunnah-dates?months=2");
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data)) {
          setSunnahDates(json.data.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to fetch sunnah dates:", err);
      } finally {
        if (isMounted) setLoadingSunnah(false);
      }
    }
    loadSunnahDates();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch availability when date or gender changes
  const fetchDateAvailability = useCallback(
    async (dateStr: string, genderChoice: "MALE" | "FEMALE") => {
      setLoadingSlots(true);
      setSlotsError(null);
      try {
        const res = await fetch(
          `/api/hijama/availability?date=${dateStr}&gender=${genderChoice}`
        );
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Failed to load time slots.");
        }
        setAvailability(json.data);
      } catch (err: any) {
        setSlotsError(err.message || "Unable to check slot availability.");
      } finally {
        setLoadingSlots(false);
      }
    },
    []
  );

  useEffect(() => {
    if (selectedDate && gender) {
      fetchDateAvailability(selectedDate, gender);
    }
  }, [selectedDate, gender, fetchDateAvailability]);

  // Step 1 Validation
  const canProceedStep1 = Boolean(gender);

  // Step 2 Validation
  const canProceedStep2 =
    Boolean(selectedDate) &&
    Boolean(selectedSlot) &&
    Boolean(availability?.isOpen);

  // Step 3 Validation: 3 mandatory safety questions must be answered (not null)
  const canProceedStep3 = useMemo(() => {
    if (screening.bloodThinners === null) return false;
    if (screening.lowBpAnemia === null) return false;
    if (gender === "FEMALE" && screening.pregnancy === null) return false;
    if (!screening.cuppingReason) return false;
    return true;
  }, [screening, gender]);

  // Step 4 Validation: Full Name, Phone, Age
  const canProceedStep4 = useMemo(() => {
    const validName = details.fullName.trim().length >= 3;
    const digits = details.phone.replace(/\D/g, "");
    const validPhone = digits.length >= 10;
    const validAge = Number(details.age) > 0 && Number(details.age) <= 110;
    return validName && validPhone && validAge;
  }, [details]);

  // Handle final booking submission
  const handleSubmitBooking = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!canProceedStep4) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const contraindicationsObj = {
        bloodThinnersOrBleedingDisorder: screening.bloodThinners,
        pregnantOrNursing: gender === "FEMALE" ? screening.pregnancy : false,
        severeLowBpOrAnemia: screening.lowBpAnemia,
        notes: details.notes || null,
      };

      const payload = {
        fullName: details.fullName.trim(),
        phone: details.phone.trim(),
        email: details.email?.trim() || null,
        age: Number(details.age),
        gender,
        appointmentDate: selectedDate,
        appointmentSlot: selectedSlot,
        cuppingReason:
          screening.cuppingReason === "OTHER" && screening.customReason
            ? `Other: ${screening.customReason}`
            : screening.cuppingReason,
        contraindications: contraindicationsObj,
        feeAmount: availability?.standardFee || 2500,
        paymentStatus: "UNPAID",
      };

      const res = await fetch("/api/hijama/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Booking request failed. Please try again.");
      }

      setConfirmedBooking(json.data);
      setStep(5);
      onBookingSuccess?.(json.data);
    } catch (err: any) {
      console.error("Booking submission error:", err);
      setSubmitError(
        err.message || "Could not complete booking. Please verify details."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // WhatsApp Pre-filled message link
  const generateWhatsAppConfirmationUrl = (booking: any) => {
    const isMale = booking.gender === "MALE";
    const wardName = isMale
      ? "Male Practitioner Wing (Certified Hajjam)"
      : "Female Practitioner Wing (Certified Hajjama)";

    const text =
      `*Assalam-o-Alaikum Tameer-e-Sehat Clinic*\n` +
      `*Hijama Session Confirmation*\n\n` +
      `*Ticket Reference:* ${booking.ticketNumber}\n` +
      `*Patient Name:* ${booking.fullName}\n` +
      `*Age:* ${booking.age} yrs · *Ward:* ${wardName}\n` +
      `*Appointment Date:* ${booking.appointmentDate} (${booking.hijriDate || "Sunnah Day"})\n` +
      `*Time Slot:* ${booking.appointmentSlot}\n` +
      `*Cupping Reason:* ${booking.cuppingReason || "Sunnah Detox"}\n` +
      `*Fee:* ₨ ${booking.feeAmount?.toLocaleString() || "2,500"} (Pay at Clinic)\n\n` +
      `_Please confirm my seat reservation. JazakAllah khair._`;

    return `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(
      text
    )}`;
  };

  const copyTicketNumber = () => {
    if (confirmedBooking?.ticketNumber) {
      navigator.clipboard.writeText(confirmedBooking.ticketNumber);
      setCopiedTicket(true);
      setTimeout(() => setCopiedTicket(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Calendar .ics download
  const handleAddToCalendar = () => {
    if (!confirmedBooking) return;
    const title = `Sunnah Hijama Session - Tameer-e-Sehat (${confirmedBooking.ticketNumber})`;
    const desc = `Hijama Cupping Appointment for ${confirmedBooking.fullName}. Slot: ${confirmedBooking.appointmentSlot}. Ward: ${confirmedBooking.gender}. Pay at Clinic: ₨ 2,500.`;
    const loc = "Tameer-e-Sehat Herbal Clinic & Hijama Center, Karachi, Pakistan";

    const cleanDate = confirmedBooking.appointmentDate.replace(/-/g, "");
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Tameer-e-Sehat//Hijama Booking//EN",
      "BEGIN:VEVENT",
      `SUMMARY:${title}`,
      `DESCRIPTION:${desc}`,
      `LOCATION:${loc}`,
      `DTSTART;VALUE=DATE:${cleanDate}`,
      `DTEND;VALUE=DATE:${cleanDate}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${confirmedBooking.ticketNumber}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen && !isInline) return null;

  const content = (
    <div className="bg-white rounded-3xl shadow-2xl border border-[#e6dfd5] overflow-hidden max-w-2xl w-full mx-auto relative flex flex-col max-h-[92vh]">
      {/* ─── Header ─── */}
      <div className="bg-[#0d2818] text-[#f7f4ee] px-6 py-5 border-b border-[#1b432a] flex items-center justify-between shrink-0">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-[#c59b27] font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
            <span>Islamic Sunnah Wet Cupping</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>Book Your Hijama Session</span>
          </h2>
          <p className="text-xs text-[#c4d4c9] mt-0.5">
            Strict gender-segregated wings · Certified Hakims &amp; Hajjama practitioners
          </p>
        </div>

        {!isInline && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#133821] hover:bg-[#1b432a] text-[#c4d4c9] hover:text-white flex items-center justify-center transition-colors border border-[#225534]"
            aria-label="Close booking modal"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ─── Step Indicator (Steps 1 to 5) ─── */}
      <div className="bg-[#faf8f5] px-6 py-3 border-b border-[#e6dfd5] shrink-0">
        <div className="flex items-center justify-between text-xs font-semibold text-[#59534b]">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step >= 1
                  ? "bg-[#22623a] text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              1
            </span>
            <span className={step === 1 ? "text-[#22623a] font-bold" : ""}>
              Wing
            </span>
          </span>

          <span className="text-gray-300">──</span>

          <span className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step >= 2
                  ? "bg-[#22623a] text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              2
            </span>
            <span className={step === 2 ? "text-[#22623a] font-bold" : ""}>
              Date &amp; Slot
            </span>
          </span>

          <span className="text-gray-300">──</span>

          <span className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step >= 3
                  ? "bg-[#22623a] text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              3
            </span>
            <span className={step === 3 ? "text-[#22623a] font-bold" : ""}>
              Screening
            </span>
          </span>

          <span className="text-gray-300">──</span>

          <span className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step >= 4
                  ? "bg-[#22623a] text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              4
            </span>
            <span className={step === 4 ? "text-[#22623a] font-bold" : ""}>
              Details
            </span>
          </span>

          <span className="text-gray-300">──</span>

          <span className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step === 5
                  ? "bg-[#c59b27] text-[#0d2818]"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              5
            </span>
            <span className={step === 5 ? "text-[#8c6a15] font-bold" : ""}>
              Ticket
            </span>
          </span>
        </div>
      </div>

      {/* ─── Scrollable Modal Body ─── */}
      <div className="p-6 overflow-y-auto flex-1 space-y-6">
        {/* ================= STEP 1: PRACTITIONER GENDER & ROOM ================= */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center max-w-md mx-auto space-y-1.5">
              <h3 className="font-serif text-xl font-bold text-[#0d2818]">
                Select Practitioner Gender &amp; Room
              </h3>
              <p className="text-xs text-[#59534b]">
                In accordance with Islamic Shariah modesty standards (Haya), our clinic operates completely segregated clinical suites.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Male Wing */}
              <button
                type="button"
                onClick={() => setGender("MALE")}
                className={`p-5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between min-h-[170px] ${
                  gender === "MALE"
                    ? "border-[#22623a] bg-[#f0f7f2] shadow-md ring-2 ring-[#22623a]/20"
                    : "border-[#e6dfd5] bg-white hover:border-[#22623a]/50 hover:bg-[#faf8f5]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-10 h-10 rounded-xl bg-[#22623a] text-white flex items-center justify-center font-bold">
                      <User className="w-5 h-5" />
                    </span>
                    {gender === "MALE" && (
                      <CheckCircle2 className="w-5 h-5 text-[#22623a]" />
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-[#0d2818]">
                    Male Room — Hajjam
                  </h4>
                  <p className="text-xs text-[#59534b] mt-1 leading-relaxed">
                    Administered exclusively by certified male Hakims &amp; cupping specialists. Private male ward.
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-[#d8e8dc] text-[11px] font-semibold text-[#22623a] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Strict privacy &amp; etiquette guaranteed</span>
                </div>
              </button>

              {/* Female Wing */}
              <button
                type="button"
                onClick={() => setGender("FEMALE")}
                className={`p-5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between min-h-[170px] ${
                  gender === "FEMALE"
                    ? "border-[#c59b27] bg-[#fcf9f0] shadow-md ring-2 ring-[#c59b27]/20"
                    : "border-[#e6dfd5] bg-white hover:border-[#c59b27]/50 hover:bg-[#faf8f5]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-10 h-10 rounded-xl bg-[#8c6a15] text-white flex items-center justify-center font-bold">
                      <User className="w-5 h-5" />
                    </span>
                    {gender === "FEMALE" && (
                      <CheckCircle2 className="w-5 h-5 text-[#c59b27]" />
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-[#0d2818]">
                    Female Room — Hajjama
                  </h4>
                  <p className="text-xs text-[#59534b] mt-1 leading-relaxed">
                    Administered exclusively by certified female Hajjama practitioners in an isolated, confidential female wing.
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-[#f2e6cb] text-[11px] font-semibold text-[#8c6a15] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% Female staff &amp; private entrance</span>
                </div>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#faf8f5] border border-[#e6dfd5] flex items-start gap-2.5 text-xs text-[#59534b]">
              <Info className="w-4 h-4 text-[#c59b27] shrink-0 mt-0.5" />
              <span>
                Standard fee for all sessions is <strong>₨ 2,500</strong>, including medical-grade sterile vacuum cups, surgical precision blades, and anti-bacterial herbal dress kit.
              </span>
            </div>
          </div>
        )}

        {/* ================= STEP 2: DATE & SLOT SELECTION ================= */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            {/* Quick-Pick Sunnah Dates Ribbon */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0d2818] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
                  <span>Upcoming Sunnah Days (Recommended)</span>
                </span>
                <span className="text-[10px] text-[#7a7268]">17th · 19th · 21st</span>
              </div>

              {loadingSunnah ? (
                <div className="p-3 rounded-xl bg-gray-50 text-center text-xs text-[#7a7268] flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#22623a]" />
                  <span>Locating upcoming lunar Sunnah dates...</span>
                </div>
              ) : sunnahDates.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {sunnahDates.map((sd) => {
                    const isPicked = selectedDate === sd.date;
                    return (
                      <button
                        key={sd.date}
                        type="button"
                        onClick={() => {
                          setSelectedDate(sd.date);
                          setSelectedSlot("");
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isPicked
                            ? "border-[#c59b27] bg-[#0d2818] text-white shadow-md ring-1 ring-[#c59b27]"
                            : "border-[#e6dfd5] bg-gradient-to-b from-[#fbf8ed] to-[#faf8f5] hover:border-[#c59b27] text-[#1e1c19]"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] mb-1 font-semibold">
                          <span className={isPicked ? "text-[#c59b27]" : "text-[#8c6a15]"}>
                            {sd.hijriDay}th {sd.hijriMonthName.slice(0, 4)}
                          </span>
                          <span
                            className={`px-1 rounded text-[9px] ${
                              isPicked
                                ? "bg-[#c59b27] text-[#0d2818] font-bold"
                                : "bg-[#22623a]/10 text-[#22623a]"
                            }`}
                          >
                            Sunnah
                          </span>
                        </div>
                        <div className="text-xs font-bold truncate">
                          {sd.dayName.slice(0, 3)}, {sd.date.slice(5)}
                        </div>
                        <div
                          className={`text-[9px] mt-1 ${
                            isPicked ? "text-emerald-300" : "text-[#59534b]"
                          }`}
                        >
                          {sd.totalAvailableSeats === 0 ? "Full" : `${sd.totalAvailableSeats} slots open`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            {/* Custom Date Input Picker */}
            <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e6dfd5] space-y-2">
              <label className="block text-xs font-bold text-[#0d2818]">
                Or Select Any Clinic Operating Date:
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Calendar className="w-4 h-4 text-[#7a7268] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedSlot("");
                    }}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#d6cfc5] bg-white focus:outline-none focus:ring-2 focus:ring-[#22623a] font-medium"
                  />
                </div>
                {availability && (
                  <div className="text-right text-xs">
                    <span className="font-bold text-[#22623a] block">
                      {availability.hijriInfo.hijriFormatted}
                    </span>
                    <span className="text-[10px] text-[#7a7268]">
                      {availability.isSunnahDay ? "Sunnah Day" : "Regular Clinic Day"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Available 45-min slots */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#0d2818]">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#22623a]" />
                  <span>Choose 45-Min Slot ({gender === "MALE" ? "Male Hajjam" : "Female Hajjama"})</span>
                </span>
                {availability?.isOpen && (
                  <span className="text-[11px] text-[#22623a] font-semibold">
                    {availability.totalSeatsRemaining} seats open
                  </span>
                )}
              </div>

              {loadingSlots ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-[#7a7268]">
                  <Loader2 className="w-5 h-5 animate-spin text-[#22623a]" />
                  <span>Checking room capacity...</span>
                </div>
              ) : slotsError ? (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {slotsError}
                </div>
              ) : !availability?.isOpen ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center space-y-1">
                  <AlertCircle className="w-5 h-5 mx-auto text-amber-600" />
                  <p className="font-bold">Clinic Closed on this Date</p>
                  <p className="text-[11px]">
                    {availability?.overrideNote || "Please pick an alternative day."}
                  </p>
                </div>
              ) : availability.slots.length === 0 ? (
                <div className="p-3 text-center text-xs text-[#7a7268]">
                  No slots configured for this date.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {availability.slots.map((slot) => {
                    const isChosen = selectedSlot === slot.slot;
                    const isAvailable = slot.available && slot.seatsRemaining > 0;

                    return (
                      <button
                        key={slot.slot}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setSelectedSlot(slot.slot)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                          isChosen
                            ? "bg-[#22623a] text-white border-[#22623a] shadow-sm font-semibold cursor-pointer"
                            : isAvailable
                            ? "bg-white border-[#e6dfd5] hover:border-[#22623a] hover:bg-emerald-50/50 text-[#1e1c19] cursor-pointer"
                            : "bg-[#eef7f1] text-[#22623a]/60 border-emerald-200/70 opacity-60 blur-[0.4px] hover:blur-[0.4px] cursor-not-allowed select-none"
                        }`}
                      >
                        <span className="truncate">{slot.slot}</span>
                        {isAvailable ? (
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ml-1 ${
                              isChosen
                                ? "bg-white/20 text-white"
                                : "bg-[#eef7f1] text-[#22623a]"
                            }`}
                          >
                            Available
                          </span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-[#eef7f1] text-[#22623a]/70 shrink-0 ml-1">
                            Booked
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= STEP 3: CLINICAL PRE-SCREENING ================= */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center max-w-md mx-auto space-y-1">
              <h3 className="font-serif text-xl font-bold text-[#0d2818] flex items-center justify-center gap-1.5">
                <HeartPulse className="w-5 h-5 text-rose-600" />
                <span>Clinical Safety Pre-Screening</span>
              </h3>
              <p className="text-xs text-[#59534b]">
                Hijama involves superficial wet cupping. For your absolute safety, answer these 3 essential clinical questions.
              </p>
            </div>

            {/* 3 Mandatory Safety Questions */}
            <div className="space-y-3 pt-1">
              {/* Q1: Blood Thinners / Bleeding Disorders */}
              <div className="p-3.5 rounded-xl border border-[#e6dfd5] bg-[#faf8f5] space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#0d2818] block">
                      1. Are you currently taking Blood Thinners (e.g. Aspirin, Warfarin, Plavix) or do you have a Bleeding Disorder (Hemophilia)?
                    </label>
                    <span className="text-[10px] text-[#7a7268]">
                      Crucial to prevent prolonged bleeding or hematoma.
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setScreening({ ...screening, bloodThinners: true })
                      }
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        screening.bloodThinners === true
                          ? "bg-rose-600 text-white shadow-sm"
                          : "bg-white border border-[#d6cfc5] text-[#59534b]"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setScreening({ ...screening, bloodThinners: false })
                      }
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        screening.bloodThinners === false
                          ? "bg-[#22623a] text-white shadow-sm"
                          : "bg-white border border-[#d6cfc5] text-[#59534b]"
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {screening.bloodThinners === true && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <span>
                      <strong>Clinical Precaution:</strong> Patients on anticoagulants require physician clearance and a mild dry cupping evaluation prior to wet incisions. Our Hakim will consult you prior to procedure.
                    </span>
                  </div>
                )}
              </div>

              {/* Q2: Pregnancy (for female patients) */}
              {gender === "FEMALE" && (
                <div className="p-3.5 rounded-xl border border-[#e6dfd5] bg-[#faf8f5] space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#0d2818] block">
                        2. Are you currently Pregnant or within the first 6 weeks Post-Partum?
                      </label>
                      <span className="text-[10px] text-[#7a7268]">
                        Lower abdominal &amp; lumbar cupping is prohibited during pregnancy.
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setScreening({ ...screening, pregnancy: true })
                        }
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          screening.pregnancy === true
                            ? "bg-rose-600 text-white shadow-sm"
                            : "bg-white border border-[#d6cfc5] text-[#59534b]"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setScreening({ ...screening, pregnancy: false })
                        }
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          screening.pregnancy === false
                            ? "bg-[#22623a] text-white shadow-sm"
                            : "bg-white border border-[#d6cfc5] text-[#59534b]"
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {screening.pregnancy === true && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                      <span>
                        <strong>Note:</strong> Wet cupping on the abdomen and lower back is strictly avoided during pregnancy. Only gentle upper back dry therapy is offered upon Hakim clearance.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Q3: Severe Low BP / Extreme Anemia / Dizziness */}
              <div className="p-3.5 rounded-xl border border-[#e6dfd5] bg-[#faf8f5] space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#0d2818] block">
                      3. Do you have Severe Low Blood Pressure, Severe Anemia (Hb &lt; 9), or frequent fainting/dizziness?
                    </label>
                    <span className="text-[10px] text-[#7a7268]">
                      Helps our practitioners calibrate cup vacuum pressure safely.
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setScreening({ ...screening, lowBpAnemia: true })
                      }
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        screening.lowBpAnemia === true
                          ? "bg-rose-600 text-white shadow-sm"
                          : "bg-white border border-[#d6cfc5] text-[#59534b]"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setScreening({ ...screening, lowBpAnemia: false })
                      }
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        screening.lowBpAnemia === false
                          ? "bg-[#22623a] text-white shadow-sm"
                          : "bg-white border border-[#d6cfc5] text-[#59534b]"
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {screening.lowBpAnemia === true && (
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                    <span>
                      <strong>Recommendation:</strong> Drink a honey-water glass 30 minutes prior to session and rest in clinic post-session for 15 minutes.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Cupping Reason Selector */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-[#0d2818]">
                Primary Goal / Reason for Cupping:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CUPPING_REASONS.map((r) => {
                  const isSelected = screening.cuppingReason === r.label;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() =>
                        setScreening({ ...screening, cuppingReason: r.label })
                      }
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-[#22623a] bg-[#22623a] text-white shadow-sm"
                          : "border-[#e6dfd5] bg-white hover:border-[#22623a]/50 text-[#1e1c19]"
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{r.label}</div>
                      <div
                        className={`text-[9px] mt-0.5 truncate ${
                          isSelected ? "text-emerald-200" : "text-[#7a7268]"
                        }`}
                      >
                        {r.point}
                      </div>
                    </button>
                  );
                })}
              </div>

              {screening.cuppingReason === "General Health / Other" && (
                <input
                  type="text"
                  placeholder="Specify your condition or specific pain area..."
                  value={screening.customReason}
                  onChange={(e) =>
                    setScreening({ ...screening, customReason: e.target.value })
                  }
                  className="w-full mt-2 px-3 py-2 text-xs rounded-xl border border-[#d6cfc5] bg-white focus:outline-none focus:ring-2 focus:ring-[#22623a]"
                />
              )}
            </div>
          </div>
        )}

        {/* ================= STEP 4: PATIENT DETAILS ================= */}
        {step === 4 && (
          <form onSubmit={handleSubmitBooking} className="space-y-4 animate-fade-in">
            <div className="text-center max-w-md mx-auto space-y-1">
              <h3 className="font-serif text-xl font-bold text-[#0d2818]">
                Patient Information
              </h3>
              <p className="text-xs text-[#59534b]">
                Enter patient contact details to generate your verified clinical booking ticket.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div>
                <label className="block text-xs font-bold text-[#0d2818] mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#7a7268] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Muhammad Tariq"
                    value={details.fullName}
                    onChange={(e) =>
                      setDetails({ ...details, fullName: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#d6cfc5] bg-white focus:outline-none focus:ring-2 focus:ring-[#22623a]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0d2818] mb-1">
                  Phone (WhatsApp Preferred) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#7a7268] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0300 1234567"
                    value={details.phone}
                    onChange={(e) =>
                      setDetails({ ...details, phone: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#d6cfc5] bg-white focus:outline-none focus:ring-2 focus:ring-[#22623a]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0d2818] mb-1">
                  Age <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="12"
                  max="100"
                  value={details.age}
                  onChange={(e) =>
                    setDetails({ ...details, age: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#d6cfc5] bg-white focus:outline-none focus:ring-2 focus:ring-[#22623a]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0d2818] mb-1">
                  Email Address <span className="text-[#7a7268] font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#7a7268] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="patient@example.com"
                    value={details.email}
                    onChange={(e) =>
                      setDetails({ ...details, email: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#d6cfc5] bg-white focus:outline-none focus:ring-2 focus:ring-[#22623a]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0d2818] mb-1">
                Special Clinical Notes / Pain Points (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Mention specific areas: lower back, neck stiffness, shoulder numbness, or recent surgeries..."
                value={details.notes}
                onChange={(e) =>
                  setDetails({ ...details, notes: e.target.value })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#d6cfc5] bg-white focus:outline-none focus:ring-2 focus:ring-[#22623a]"
              />
            </div>

            {/* Booking Summary Box */}
            <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e6dfd5] space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-[#e6dfd5] pb-2 font-bold text-[#0d2818]">
                <span>Appointment Summary</span>
                <span className="text-[#22623a]">{gender === "MALE" ? "Male Ward (Hajjam)" : "Female Ward (Hajjama)"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[#59534b]">
                <div>
                  <span className="block text-[10px] text-[#7a7268]">Date:</span>
                  <span className="font-semibold text-[#0d2818]">{selectedDate}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#7a7268]">Slot:</span>
                  <span className="font-semibold text-[#0d2818]">{selectedSlot}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#7a7268]">Reason:</span>
                  <span className="font-semibold text-[#0d2818]">{screening.cuppingReason}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#7a7268]">Clinical Fee:</span>
                  <span className="font-bold text-[#22623a]">₨ 2,500 (Pay at Clinic)</span>
                </div>
              </div>
            </div>

            {submitError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{submitError}</span>
              </div>
            )}
          </form>
        )}

        {/* ================= STEP 5: CONFIRMATION TICKET & DISPATCH ================= */}
        {step === 5 && confirmedBooking && (
          <div className="space-y-6 animate-fade-in text-center py-2">
            <div className="w-16 h-16 rounded-full bg-[#eef7f1] text-[#22623a] mx-auto flex items-center justify-center border-2 border-[#22623a]/30 shadow-md">
              <CheckCircle2 className="w-9 h-9 text-[#22623a]" />
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c59b27]/15 text-[#8c6a15] text-xs font-bold uppercase tracking-wider border border-[#c59b27]/30">
                <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
                Appointment Confirmed
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#0d2818]">
                Alhamdulillah, Your Seat is Reserved!
              </h3>
              <p className="text-xs text-[#59534b]">
                Present this digital clinical slip at reception or confirm directly with our clinic Hakim on WhatsApp.
              </p>
            </div>

            {/* Printable Ticket Slip */}
            <div className="max-w-md mx-auto p-5 rounded-2xl bg-[#faf8f5] border-2 border-dashed border-[#c59b27] text-left shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#c59b27]/10 rounded-bl-full pointer-events-none" />

              <div className="flex items-center justify-between border-b border-[#e6dfd5] pb-3 mb-3">
                <div>
                  <span className="text-[10px] text-[#7a7268] uppercase tracking-wider block font-bold">
                    Booking Ticket Reference
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold text-[#0d2818] tracking-wider">
                      {confirmedBooking.ticketNumber}
                    </span>
                    <button
                      type="button"
                      onClick={copyTicketNumber}
                      title="Copy ticket number"
                      className="p-1 rounded-md text-[#7a7268] hover:text-[#22623a] hover:bg-white transition-colors"
                    >
                      {copiedTicket ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full bg-[#22623a] text-white text-[10px] font-bold uppercase">
                    Slot Reserved
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#7a7268] block">Patient Name:</span>
                  <span className="font-bold text-[#0d2818]">{confirmedBooking.fullName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#7a7268] block">Clinical Wing:</span>
                  <span className="font-bold text-[#22623a]">
                    {confirmedBooking.gender === "MALE"
                      ? "Male Ward (Hajjam)"
                      : "Female Ward (Hajjama)"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#7a7268] block">Gregorian Date:</span>
                  <span className="font-semibold text-[#0d2818]">
                    {confirmedBooking.appointmentDate}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#7a7268] block">Islamic Hijri Date:</span>
                  <span className="font-semibold text-[#c59b27]">
                    {confirmedBooking.hijriDate || "Sunnah Day"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#7a7268] block">Session Slot:</span>
                  <span className="font-bold text-[#0d2818]">
                    {confirmedBooking.appointmentSlot}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#7a7268] block">Fee &amp; Payment:</span>
                  <span className="font-bold text-[#22623a]">
                    ₨ {confirmedBooking.feeAmount?.toLocaleString() || "2,500"} (Pay at Clinic)
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#e6dfd5] text-[10px] text-[#59534b] flex items-center justify-between">
                <span>📍 Tameer-e-Sehat Clinic, Karachi</span>
                <span className="font-mono">Est. 1990</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={generateWhatsAppConfirmationUrl(confirmedBooking)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02]"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Send Confirmation on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleAddToCalendar}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white hover:bg-[#faf8f5] text-[#0d2818] border border-[#d6cfc5] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <CalendarPlus className="w-4 h-4 text-[#22623a]" />
                <span>Add to Calendar</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white hover:bg-[#faf8f5] text-[#0d2818] border border-[#d6cfc5] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4 text-[#7a7268]" />
                <span>Print Ticket</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Footer Controls ─── */}
      {step < 5 && (
        <div className="bg-[#faf8f5] px-6 py-4 border-t border-[#e6dfd5] flex items-center justify-between shrink-0">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#59534b] hover:text-[#0d2818] hover:bg-white border border-transparent hover:border-[#d6cfc5] flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div className="text-[11px] text-[#7a7268]">
                Step 1 of 4: Modesty &amp; Wing
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {step === 1 && (
              <button
                type="button"
                disabled={!canProceedStep1}
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl bg-[#22623a] hover:bg-[#1a4f2e] text-white font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50 transition-all"
              >
                <span>Continue to Date &amp; Slot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                disabled={!canProceedStep2}
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl bg-[#22623a] hover:bg-[#1a4f2e] text-white font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50 transition-all"
              >
                <span>Proceed to Safety Check</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                disabled={!canProceedStep3}
                onClick={() => setStep(4)}
                className="px-6 py-2.5 rounded-xl bg-[#22623a] hover:bg-[#1a4f2e] text-white font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50 transition-all"
              >
                <span>Continue to Patient Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 4 && (
              <button
                type="button"
                disabled={!canProceedStep4 || submitting}
                onClick={handleSubmitBooking}
                className="px-6 py-2.5 rounded-xl bg-[#c59b27] hover:bg-[#a8821d] text-[#0d2818] font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50 transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#0d2818]" />
                    <span>Reserving Seat...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Hijama Booking</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#0d2818]" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Done Footer for Step 5 */}
      {step === 5 && !isInline && onClose && (
        <div className="bg-[#faf8f5] px-6 py-3.5 border-t border-[#e6dfd5] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#7a7268]">
            Need changes? Call clinic at {CLINIC_INFO.phoneFormatted}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0d2818] text-white text-xs font-bold hover:bg-[#1b432a] transition-colors"
          >
            Close Window
          </button>
        </div>
      )}
    </div>
  );

  if (isInline) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {content}
    </div>
  );
}
