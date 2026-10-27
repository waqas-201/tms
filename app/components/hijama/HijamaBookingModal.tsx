"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  Lock,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { CLINIC_INFO } from "@/app/data/products";
import { isStaffRole } from "@/lib/rbac-base";
import {
  HIJAMA_BOOKING_DRAFT_KEY,
  saveBookingDraft,
  getBookingDraft,
  clearBookingDraft,
  buildAuthUrl,
} from "@/lib/auth-redirect";
import StepTransition from "@/app/components/motion/StepTransition";
import SlotStrip from "@/app/components/SlotStrip";
import StepConnector from "@/app/components/motion/StepConnector";
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
  const isStaff = isStaffRole((session?.user as { role?: string })?.role);

  // Multi-step progress (1 to 5)
  const [step, setStep] = useState<number>(1);
  const [stepDirection, setStepDirection] = useState<1 | -1>(1);
  const stepBodyRef = useRef<HTMLDivElement>(null);

  const goToStep = (next: number) => {
    if (next === step) return;
    setStepDirection(next > step ? 1 : -1);
    setStep(next);
  };

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

  const router = useRouter();

  // Restore saved booking draft if returning from auth redirect
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const shouldResume = params.get("resumeBooking");
    if (shouldResume === "hijama" || shouldResume === "true") {
      const draft = getBookingDraft<any>(HIJAMA_BOOKING_DRAFT_KEY);
      if (draft) {
        if (draft.gender) setGender(draft.gender);
        if (draft.selectedDate) setSelectedDate(draft.selectedDate);
        if (draft.screening) setScreening(draft.screening);
        if (draft.selectedSlot) setSelectedSlot(draft.selectedSlot);
        if (draft.details) {
          setDetails((prev) => ({
            ...prev,
            ...draft.details,
          }));
        }
        if (session?.user) {
          setStep(4);
        }
      }
    }
  }, [session]);

  const handleRedirectToAuth = (type: "login" | "register") => {
    if (typeof window === "undefined") return;
    saveBookingDraft(HIJAMA_BOOKING_DRAFT_KEY, {
      gender,
      selectedDate,
      screening,
      selectedSlot,
      details,
    });
    const currentPath = window.location.pathname + window.location.hash;
    const targetUrl = buildAuthUrl(type, {
      redirect: currentPath,
      resumeBooking: "hijama",
    });
    onClose?.();
    router.push(targetUrl);
  };

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

  // Step 4 Validation: User must be signed in, and have valid Name, Phone, Age
  const canProceedStep4 = useMemo(() => {
    if (!session?.user) return false;
    // Staff accounts manage the clinic and cannot book as patients.
    if (isStaff) return false;
    const validName = details.fullName.trim().length >= 3;
    const digits = details.phone.replace(/\D/g, "");
    const validPhone = digits.length >= 10;
    const validAge = Number(details.age) > 0 && Number(details.age) <= 110;
    return validName && validPhone && validAge;
  }, [details, session, isStaff]);

  // Handle final booking submission
  const handleSubmitBooking = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (isStaff) {
      setSubmitError(
        "Staff accounts cannot book Hijama sessions as patients. Use the admin dashboard to create a booking on behalf of a patient."
      );
      return;
    }

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
      setStepDirection(1);
      setStep(5);
      clearBookingDraft(HIJAMA_BOOKING_DRAFT_KEY);
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
    <div className="bg-white rounded-3xl shadow-2xl border border-line overflow-hidden max-w-2xl w-full mx-auto relative flex flex-col max-h-[92vh]">
      {/* ─── Header ─── */}
      <div className="bg-surface-inverse text-on-inverse px-6 py-5 border-b border-brand-green-900 flex items-center justify-between shrink-0">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-brand-gold-500 font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold-500" />
            <span>Islamic Sunnah Wet Cupping</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>Book Your Hijama Session</span>
          </h2>
          <p className="text-xs text-brand-green-300 mt-0.5">
            Strict gender-segregated wings · Certified Hakeems &amp; Hajjama practitioners
          </p>
        </div>

        {!isInline && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-inverse hover:bg-brand-green-900 text-brand-green-300 hover:text-white flex items-center justify-center transition-colors border border-brand-green-800"
            aria-label="Close booking modal"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ─── Step Indicator (Steps 1 to 5) ─── */}
      <div className="bg-surface px-6 py-3 border-b border-line shrink-0">
        <div className="flex items-center justify-between gap-1 text-xs font-semibold text-ink-body">
          {[
            { n: 1, label: "Wing" },
            { n: 2, label: "Date & Slot" },
            { n: 3, label: "Screening" },
            { n: 4, label: "Details" },
            { n: 5, label: "Ticket" },
          ].map(({ n, label }, index) => (
            <React.Fragment key={n}>
              {index > 0 && (
                <StepConnector done={step >= n} className="mx-1 min-w-2 shrink" />
              )}
              <span className="flex shrink-0 items-center gap-1.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-200 ${
                    n === 5
                      ? step === 5
                        ? "bg-secondary text-ink"
                        : "bg-line text-ink-body"
                      : step >= n
                      ? "bg-primary text-white"
                      : "bg-line text-ink-body"
                  } ${step === n ? "scale-110" : ""}`}
                >
                  {n}
                </span>
                <span
                  className={`transition-colors duration-200 ${
                    step === n
                      ? n === 5
                        ? "text-secondary-text font-bold"
                        : "text-primary font-bold"
                      : ""
                  }`}
                >
                  {label}
                </span>
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ─── Scrollable Modal Body ─── */}
      <div
        ref={stepBodyRef}
        data-lenis-prevent
        className="p-6 overflow-y-auto flex-1"
      >
        <StepTransition
          stepKey={step}
          direction={stepDirection}
          scrollRef={stepBodyRef}
        >
        {/* ================= STEP 1: PRACTITIONER GENDER & ROOM ================= */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="text-center max-w-md mx-auto space-y-1.5">
              <h3 className="font-serif text-xl font-bold text-ink">
                Select Practitioner Gender &amp; Room
              </h3>
              <p className="text-xs text-ink-body">
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
                    ? "border-primary bg-brand-green-50 shadow-md ring-2 ring-primary/20"
                    : "border-line bg-white hover:border-primary/50 hover:bg-surface"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
                      <User className="w-5 h-5" />
                    </span>
                    {gender === "MALE" && (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-ink">
                    Male Room — Hajjam
                  </h4>
                  <p className="text-xs text-ink-body mt-1 leading-relaxed">
                    Administered exclusively by certified male Hakeems &amp; cupping specialists. Private male ward.
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-brand-green-100 text-[11px] font-semibold text-primary flex items-center gap-1">
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
                    ? "border-secondary bg-brand-gold-50 shadow-md ring-2 ring-secondary/20"
                    : "border-line bg-white hover:border-secondary/50 hover:bg-surface"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-10 h-10 rounded-xl bg-brand-gold-700 text-white flex items-center justify-center font-bold">
                      <User className="w-5 h-5" />
                    </span>
                    {gender === "FEMALE" && (
                      <CheckCircle2 className="w-5 h-5 text-secondary-text" />
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-ink">
                    Female Room — Hajjama
                  </h4>
                  <p className="text-xs text-ink-body mt-1 leading-relaxed">
                    Administered exclusively by certified female Hajjama practitioners in an isolated, confidential female wing.
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-brand-gold-100 text-[11px] font-semibold text-secondary-text flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% Female staff &amp; private entrance</span>
                </div>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-line flex items-start gap-2.5 text-xs text-ink-body">
              <Info className="w-4 h-4 text-secondary-text shrink-0 mt-0.5" />
              <span>
                Standard fee for all sessions is <strong>₨ 2,500</strong>, including medical-grade sterile vacuum cups, surgical precision blades, and anti-bacterial herbal dress kit.
              </span>
            </div>
          </div>
        )}

        {/* ================= STEP 2: DATE & SLOT SELECTION ================= */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Quick-Pick Sunnah Dates Ribbon */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-secondary-text" />
                  <span>Upcoming Sunnah Days (Recommended)</span>
                </span>
                <span className="text-[10px] text-ink-subtle">17th · 19th · 21st</span>
              </div>

              {loadingSunnah ? (
                <div className="p-3 rounded-xl bg-surface text-center text-xs text-ink-subtle flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
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
                            ? "border-secondary bg-surface-inverse text-white shadow-md ring-1 ring-secondary"
                            : "border-line bg-gradient-to-b from-brand-gold-50 to-sand-50 hover:border-secondary text-ink"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] mb-1 font-semibold">
                          <span className={isPicked ? "text-brand-gold-500" : "text-secondary-text"}>
                            {sd.hijriDay}th {sd.hijriMonthName.slice(0, 4)}
                          </span>
                          <span
                            className={`px-1 rounded text-[9px] ${
                              isPicked
                                ? "bg-secondary text-ink font-bold"
                                : "bg-primary/10 text-primary"
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
                            isPicked ? "text-brand-green-300 font-semibold" : "text-ink-body"
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
            <div className="p-4 rounded-2xl bg-surface border border-line space-y-2">
              <label className="block text-xs font-bold text-ink">
                Or Select Any Clinic Operating Date:
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Calendar className="w-4 h-4 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedSlot("");
                    }}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-line-strong bg-white focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                  />
                </div>
                {availability && (
                  <div className="text-right text-xs">
                    <span className="font-bold text-primary block">
                      {availability.hijriInfo.hijriFormatted}
                    </span>
                    <span className="text-[10px] text-ink-subtle">
                      {availability.isSunnahDay ? "Sunnah Day" : "Regular Clinic Day"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Available 45-min slots */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-ink">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>Choose 45-Min Slot ({gender === "MALE" ? "Male Hajjam" : "Female Hajjama"})</span>
                </span>
                {availability?.isOpen && (
                  <span className="text-[11px] text-primary font-semibold">
                    {availability.totalSeatsRemaining} seats open
                  </span>
                )}
              </div>

              {loadingSlots ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-ink-subtle">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span>Checking room capacity...</span>
                </div>
              ) : slotsError ? (
                <div className="p-3 rounded-xl bg-danger-soft border border-danger/20 text-danger text-xs">
                  {slotsError}
                </div>
              ) : !availability?.isOpen ? (
                <div className="p-4 rounded-xl bg-warning-soft border border-warning-line text-warning text-xs text-center space-y-1">
                  <AlertCircle className="w-5 h-5 mx-auto text-warning" />
                  <p className="font-bold">Clinic Closed on this Date</p>
                  <p className="text-[11px]">
                    {availability?.overrideNote || "Please pick an alternative day."}
                  </p>
                </div>
              ) : availability.slots.length === 0 ? (
                <div className="p-3 text-center text-xs text-ink-subtle">
                  No slots configured for this date.
                </div>
              ) : (
                <SlotStrip
                  slots={availability.slots}
                  selectedSlot={selectedSlot}
                  onSelectSlot={(slot) => setSelectedSlot(slot)}
                  variant="primary"
                  bgFadeClass="from-white"
                  showClockIcon
                />
              )}
            </div>
          </div>
        )}

        {/* ================= STEP 3: CLINICAL PRE-SCREENING ================= */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="text-center max-w-md mx-auto space-y-1">
              <h3 className="font-serif text-xl font-bold text-ink flex items-center justify-center gap-1.5">
                <HeartPulse className="w-5 h-5 text-danger" />
                <span>Clinical Safety Pre-Screening</span>
              </h3>
              <p className="text-xs text-ink-body">
                Hijama involves superficial wet cupping. For your absolute safety, answer these 3 essential clinical questions.
              </p>
            </div>

            {/* 3 Mandatory Safety Questions */}
            <div className="space-y-3 pt-1">
              {/* Q1: Blood Thinners / Bleeding Disorders */}
              <div className="p-3.5 rounded-xl border border-line bg-surface space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <label className="text-xs font-bold text-ink block">
                      1. Are you currently taking Blood Thinners (e.g. Aspirin, Warfarin, Plavix) or do you have a Bleeding Disorder (Hemophilia)?
                    </label>
                    <span className="text-[10px] text-ink-subtle">
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
                          ? "bg-danger text-white shadow-sm"
                          : "bg-white border border-line-strong text-ink-body"
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
                          ? "bg-primary text-white shadow-sm"
                          : "bg-white border border-line-strong text-ink-body"
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {screening.bloodThinners === true && (
                  <div className="p-2.5 rounded-lg bg-danger-soft border border-danger/20 text-danger text-[11px] flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-danger" />
                    <span>
                      <strong>Clinical Precaution:</strong> Patients on anticoagulants require physician clearance and a mild dry cupping evaluation prior to wet incisions. Our Hakeem will consult you prior to procedure.
                    </span>
                  </div>
                )}
              </div>

              {/* Q2: Pregnancy (for female patients) */}
              {gender === "FEMALE" && (
                <div className="p-3.5 rounded-xl border border-line bg-surface space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <label className="text-xs font-bold text-ink block">
                        2. Are you currently Pregnant or within the first 6 weeks Post-Partum?
                      </label>
                      <span className="text-[10px] text-ink-subtle">
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
                            ? "bg-danger text-white shadow-sm"
                            : "bg-white border border-line-strong text-ink-body"
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
                            ? "bg-primary text-white shadow-sm"
                            : "bg-white border border-line-strong text-ink-body"
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {screening.pregnancy === true && (
                    <div className="p-2.5 rounded-lg bg-warning-soft border border-warning-line text-warning text-[11px] flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-warning" />
                      <span>
                        <strong>Note:</strong> Wet cupping on the abdomen and lower back is strictly avoided during pregnancy. Only gentle upper back dry therapy is offered upon Hakeem clearance.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Q3: Severe Low BP / Extreme Anemia / Dizziness */}
              <div className="p-3.5 rounded-xl border border-line bg-surface space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <label className="text-xs font-bold text-ink block">
                      3. Do you have Severe Low Blood Pressure, Severe Anemia (Hb &lt; 9), or frequent fainting/dizziness?
                    </label>
                    <span className="text-[10px] text-ink-subtle">
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
                          ? "bg-danger text-white shadow-sm"
                          : "bg-white border border-line-strong text-ink-body"
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
                          ? "bg-primary text-white shadow-sm"
                          : "bg-white border border-line-strong text-ink-body"
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {screening.lowBpAnemia === true && (
                  <div className="p-2.5 rounded-lg bg-warning-soft border border-warning-line text-warning text-[11px] flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-warning" />
                    <span>
                      <strong>Recommendation:</strong> Drink a honey-water glass 30 minutes prior to session and rest in clinic post-session for 15 minutes.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Cupping Reason Selector */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-ink">
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
                          ? "border-primary bg-primary text-white shadow-sm"
                          : "border-line bg-white hover:border-primary/50 text-ink"
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{r.label}</div>
                      <div
                        className={`text-[9px] mt-0.5 truncate ${
                          isSelected ? "text-success" : "text-ink-subtle"
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
                  className="w-full mt-2 px-3 py-2 text-xs rounded-xl border border-line-strong bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
            </div>
          </div>
        )}

        {/* ================= STEP 4: PATIENT DETAILS & AUTH GATING ================= */}
        {step === 4 && (
          <div className="space-y-4">
            {!session?.user ? (
              <div className="space-y-4 max-w-md mx-auto py-2">
                <div className="flex items-start gap-3 rounded-2xl border border-success-line bg-success-soft p-5 text-xs">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div className="space-y-1">
                    <strong className="block text-sm font-bold text-ink">
                      Account Required to Reserve Slot
                    </strong>
                    <span className="text-ink-body leading-relaxed block">
                      An account is required to generate your official clinical appointment ticket, issue SMS/WhatsApp reminders, and keep your Sunnah cupping history secure.
                    </span>
                    <span className="text-secondary-text font-medium block pt-1">
                      Your selected wing, date, package, and slot will stay saved while you authenticate.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleRedirectToAuth("register")}
                    className="w-full rounded-xl bg-primary px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-brand-green-800 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Create Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRedirectToAuth("login")}
                    className="w-full rounded-xl border border-line-strong bg-white px-4 py-3 text-xs font-bold uppercase tracking-wider text-ink shadow-xs transition-all hover:bg-surface flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : isStaff ? (
              <div className="p-5 rounded-2xl bg-warning-soft border border-warning-line text-center space-y-3">
                <Shield className="w-8 h-8 text-warning mx-auto" />
                <h3 className="font-serif text-lg font-bold text-ink">
                  Staff accounts cannot book sessions
                </h3>
                <p className="text-xs text-ink-body max-w-sm mx-auto">
                  You are signed in with a staff account. Hijama bookings are
                  created by patients, or by staff from the admin dashboard on
                  behalf of a patient.
                </p>
                <a
                  href="/admin?tab=hijama"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-brand-green-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Go to Hijama Dashboard</span>
                </a>
              </div>
            ) : (
              /* ── AUTHENTICATED: PATIENT FORM ── */
              <form onSubmit={handleSubmitBooking} className="space-y-4">
                <div className="text-center max-w-md mx-auto space-y-1">
                  <h3 className="font-serif text-xl font-bold text-ink">
                    Patient Information
                  </h3>
                  <div className="p-2 bg-success-soft border border-success-line/80 rounded-xl text-xs inline-flex items-center gap-2 text-success mx-auto">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                    <span>Booking as <strong>{session.user.name || "Patient"}</strong> ({session.user.email})</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Muhammad Tariq"
                        value={details.fullName}
                        onChange={(e) =>
                          setDetails({ ...details, fullName: e.target.value })
                        }
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-line-strong bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      Phone (WhatsApp Preferred) <span className="text-danger">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 0300 1234567"
                        value={details.phone}
                        onChange={(e) =>
                          setDetails({ ...details, phone: e.target.value })
                        }
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-line-strong bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      Age <span className="text-danger">*</span>
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
                      className="w-full px-3 py-2 text-xs rounded-xl border border-line-strong bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      Email Address <span className="text-ink-subtle font-normal">(Verified Account Email)</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        readOnly
                        value={details.email}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-line-strong bg-surface-sunken text-ink-body cursor-not-allowed font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1">
                    Special Clinical Notes / Pain Points (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Mention specific areas: lower back, neck stiffness, shoulder numbness, or recent surgeries..."
                    value={details.notes}
                    onChange={(e) =>
                      setDetails({ ...details, notes: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-line-strong bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </form>
            )}

            {/* Booking Summary Box */}
            <div className="p-4 rounded-2xl bg-surface border border-line space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-line pb-2 font-bold text-ink">
                <span>Appointment Summary</span>
                <span className="text-primary">{gender === "MALE" ? "Male Ward (Hajjam)" : "Female Ward (Hajjama)"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-ink-body">
                <div>
                  <span className="block text-[10px] text-ink-subtle">Date:</span>
                  <span className="font-semibold text-ink">{selectedDate}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-ink-subtle">Slot:</span>
                  <span className="font-semibold text-ink">{selectedSlot}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-ink-subtle">Reason:</span>
                  <span className="font-semibold text-ink">{screening.cuppingReason}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-ink-subtle">Clinical Fee:</span>
                  <span className="font-bold text-primary">₨ 2,500 (Pay at Clinic)</span>
                </div>
              </div>
            </div>

            {submitError && (
              <div className="p-3 rounded-xl bg-danger-soft border border-danger/20 text-danger text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-danger" />
                <span>{submitError}</span>
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 5: CONFIRMATION TICKET & DISPATCH ================= */}
        {step === 5 && confirmedBooking && (
          <div className="space-y-6 text-center py-2">
            <div className="w-16 h-16 rounded-full bg-brand-green-50 text-primary mx-auto flex items-center justify-center border-2 border-primary/30 shadow-md">
              <CheckCircle2 className="w-9 h-9 text-primary" />
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/15 text-brand-gold-800 text-xs font-bold uppercase tracking-wider border border-secondary/30">
                <Sparkles className="w-3.5 h-3.5 text-secondary-text" />
                Appointment Confirmed
              </span>
              <h3 className="font-serif text-2xl font-bold text-ink">
                Alhamdulillah, Your Seat is Reserved!
              </h3>
              <p className="text-xs text-ink-body">
                Present this digital clinical slip at reception or confirm directly with our clinic Hakeem on WhatsApp.
              </p>
            </div>

            {/* Printable Ticket Slip */}
            <div className="max-w-md mx-auto p-5 rounded-2xl bg-surface border-2 border-dashed border-secondary text-left shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 rounded-bl-full pointer-events-none" />

              <div className="flex items-center justify-between border-b border-line pb-3 mb-3">
                <div>
                  <span className="text-[10px] text-ink-subtle uppercase tracking-wider block font-bold">
                    Booking Ticket Reference
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold text-ink tracking-wider">
                      {confirmedBooking.ticketNumber}
                    </span>
                    <button
                      type="button"
                      onClick={copyTicketNumber}
                      title="Copy ticket number"
                      className="p-1 rounded-md text-ink-subtle hover:text-primary hover:bg-white transition-colors"
                    >
                      {copiedTicket ? (
                        <Check className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full bg-primary text-white text-[10px] font-bold uppercase">
                    Slot Reserved
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-ink-subtle block">Patient Name:</span>
                  <span className="font-bold text-ink">{confirmedBooking.fullName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-ink-subtle block">Clinical Wing:</span>
                  <span className="font-bold text-primary">
                    {confirmedBooking.gender === "MALE"
                      ? "Male Ward (Hajjam)"
                      : "Female Ward (Hajjama)"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-ink-subtle block">Gregorian Date:</span>
                  <span className="font-semibold text-ink">
                    {confirmedBooking.appointmentDate}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-ink-subtle block">Islamic Hijri Date:</span>
                  <span className="font-semibold text-secondary-text">
                    {confirmedBooking.hijriDate || "Sunnah Day"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-ink-subtle block">Session Slot:</span>
                  <span className="font-bold text-ink">
                    {confirmedBooking.appointmentSlot}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-ink-subtle block">Fee &amp; Payment:</span>
                  <span className="font-bold text-primary">
                    ₨ {confirmedBooking.feeAmount?.toLocaleString() || "2,500"} (Pay at Clinic)
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-line text-[10px] text-ink-body flex items-center justify-between">
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
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-whatsapp hover:bg-whatsapp-hover text-on-whatsapp font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02]"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Send Confirmation on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleAddToCalendar}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white hover:bg-surface text-ink border border-line-strong font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <CalendarPlus className="w-4 h-4 text-primary" />
                <span>Add to Calendar</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white hover:bg-surface text-ink border border-line-strong font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4 text-ink-subtle" />
                <span>Print Ticket</span>
              </button>
            </div>
          </div>
        )}
        </StepTransition>
      </div>

      {/* ─── Footer Controls ─── */}
      {step < 5 && (
        <div className="bg-surface px-6 py-4 border-t border-line flex items-center justify-between shrink-0">
          <div>
            {step > 1 ? (
              <button
                type="button"
                disabled={submitting}
                onClick={() => goToStep(step - 1)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-ink-body hover:text-ink hover:bg-white border border-transparent hover:border-line-strong flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div className="text-[11px] text-ink-subtle">
                Step 1 of 4: Modesty &amp; Wing
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {step === 1 && (
              <button
                type="button"
                disabled={!canProceedStep1}
                onClick={() => goToStep(2)}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-brand-green-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50 transition-all"
              >
                <span>Continue to Date &amp; Slot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                disabled={!canProceedStep2}
                onClick={() => goToStep(3)}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-brand-green-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50 transition-all"
              >
                <span>Proceed to Safety Check</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                disabled={!canProceedStep3}
                onClick={() => goToStep(4)}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-brand-green-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50 transition-all"
              >
                <span>Continue to Patient Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 4 && (
              session?.user ? (
                <button
                  type="button"
                  disabled={!canProceedStep4 || submitting}
                  onClick={handleSubmitBooking}
                  className="px-6 py-2.5 rounded-xl bg-secondary hover:bg-brand-gold-600 text-ink font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50 transition-all cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-ink" />
                      <span>Reserving Seat...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm Hijama Booking</span>
                      <Sparkles className="w-3.5 h-3.5 text-ink" />
                    </>
                  )}
                </button>
              ) : (
                <span className="text-[11px] text-ink-subtle font-medium">
                  Step 4 of 4: Sign in above to confirm booking
                </span>
              )
            )}
          </div>
        </div>
      )}

      {/* Done Footer for Step 5 */}
      {step === 5 && !isInline && onClose && (
        <div className="bg-surface px-6 py-3.5 border-t border-line flex items-center justify-between shrink-0">
          <span className="text-[11px] text-ink-subtle">
            Need changes? Call clinic at {CLINIC_INFO.phoneFormatted}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-surface-inverse text-white text-xs font-bold hover:bg-brand-green-900 transition-colors"
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
