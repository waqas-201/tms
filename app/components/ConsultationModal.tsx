"use client";

import React, { useState, useEffect, useRef, useContext } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { CLINIC_INFO } from "@/app/data/products";
import { useSession, signIn, signUp } from "@/lib/auth-client";
import ConsultationContext, {
  ConsultationMode,
} from "@/app/context/ConsultationContext";
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
  Paperclip,
  FileText,
  Calendar,
  Phone,
  Clock,
  MapPin,
  User,
  Mail,
  Lock,
  Globe,
  Video,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUploadThing } from "@/lib/uploadthing";

export interface AttachedReportFile {
  name: string;
  size: string;
  type: string;
  url?: string;
  isUploading?: boolean;
  uploadError?: string | null;
  previewUrl?: string;
  file?: File;
}

export interface ConsultationModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialConcern?: string;
  initialMessage?: string;
  initialMode?: ConsultationMode;
}

const QUICK_SYMPTOM_TAGS = [
  "Stomach & Digestion",
  "Joint & Knee Pain",
  "Fatty Liver & Heat",
  "Vitality & Energy",
  "Hair Fall & Scalp",
];

function toDateInputValue(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export default function ConsultationModal({
  isOpen: propIsOpen,
  onClose: propOnClose,
  initialConcern = "",
  initialMessage = "",
  initialMode,
}: ConsultationModalProps) {
  const context = useContext(ConsultationContext);

  const isControlled = propIsOpen !== undefined;
  const isOpen = isControlled ? propIsOpen : (context?.isOpen ?? false);
  const handleClose = propOnClose || context?.closeConsultation || (() => {});

  const contextMessage = context?.initialMessage ?? "";
  const resolvedInitialMessage =
    initialMessage || initialConcern || contextMessage || "";

  const [mounted, setMounted] = useState(false);

  // Auth session
  let sessionData: any = null;
  try {
    const sessionRes = useSession?.();
    sessionData = sessionRes?.data;
  } catch {
    // Graceful fallback
  }

  // Auth gating state (for unauthenticated users)
  const [authTab, setAuthTab] = useState<"signup" | "signin">("signup");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Booking details state
  const [consultationType, setConsultationType] = useState<"ONLINE" | "IN_PERSON">(
    initialMode === "PHYSICAL" ? "IN_PERSON" : "ONLINE"
  );
  const [appointmentDate, setAppointmentDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return toDateInputValue(tomorrow);
  });
  const [appointmentSlot, setAppointmentSlot] = useState("");
  const [symptomText, setSymptomText] = useState(resolvedInitialMessage);

  // Live availability state
  const [availability, setAvailability] = useState<any | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // Report upload state
  const [attachedFile, setAttachedFile] = useState<AttachedReportFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { startUpload } = useUploadThing("consultationReportUploader", {
    onClientUploadComplete: (res) => {
      if (res && res.length > 0) {
        const uploaded = res[0];
        const finalUrl = (uploaded as any).ufsUrl || uploaded.url;
        setAttachedFile((prev) =>
          prev
            ? {
                ...prev,
                url: finalUrl,
                isUploading: false,
                uploadError: null,
              }
            : null
        );
      }
    },
    onUploadError: (err: Error) => {
      setAttachedFile((prev) =>
        prev
          ? {
              ...prev,
              isUploading: false,
              uploadError: err?.message || "Upload failed. You can retry.",
            }
          : null
      );
    },
  });

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync initial message if changed
  useEffect(() => {
    if (isOpen) {
      if (resolvedInitialMessage) {
        setSymptomText(resolvedInitialMessage);
      }
      setBookingSuccess(null);
      setBookingError(null);
      setAuthError(null);
    }
  }, [isOpen, resolvedInitialMessage]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  // Fetch real slot availability when date changes and user is signed in
  useEffect(() => {
    if (!isOpen || !sessionData?.user || !appointmentDate) return;
    let cancelled = false;

    setAvailabilityLoading(true);
    setAvailabilityError(null);

    fetch(`/api/consultations/availability?date=${encodeURIComponent(appointmentDate)}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Could not load clinic availability.");
        }
        return json.data;
      })
      .then((data) => {
        if (cancelled) return;
        setAvailability(data);
        const availableSlots = (data.slots || []).filter((s: any) => s.available);
        setAppointmentSlot((prev) =>
          availableSlots.some((s: any) => s.slot === prev)
            ? prev
            : availableSlots[0]?.slot || ""
        );
      })
      .catch((err: any) => {
        if (cancelled) return;
        setAvailability(null);
        setAvailabilityError(err.message || "Could not load clinic availability.");
      })
      .finally(() => {
        if (!cancelled) setAvailabilityLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, sessionData?.user, appointmentDate]);

  // Handle Signup
  const handleAuthRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const lowerEmail = authEmail.trim().toLowerCase();
      if (!authName.trim()) {
        throw new Error("Please enter your full name.");
      }
      if (!lowerEmail) {
        throw new Error("Please enter your email address.");
      }
      if (authPassword.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      const res = await signUp.email({
        name: authName.trim(),
        email: lowerEmail,
        password: authPassword,
        phone: authPhone.trim() || undefined,
      } as any);

      if (res.error) {
        throw new Error(res.error.message || "Failed to create account.");
      }

      // Successful registration sets active session in Better-Auth
    } catch (err: any) {
      setAuthError(err.message || "Registration failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Sign In
  const handleAuthSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const lowerEmail = authEmail.trim().toLowerCase();
      if (!lowerEmail || !authPassword) {
        throw new Error("Please enter both email and password.");
      }

      const res = await signIn.email({
        email: lowerEmail,
        password: authPassword,
      });

      if (res.error) {
        throw new Error(res.error.message || "Invalid email or password.");
      }
    } catch (err: any) {
      setAuthError(err.message || "Sign in failed. Check your credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle file attachment
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    let previewUrl: string | undefined;
    if (file.type.startsWith("image/")) {
      previewUrl = URL.createObjectURL(file);
    }

    setAttachedFile({
      name: file.name,
      size: sizeFormatted,
      type: file.type,
      previewUrl,
      isUploading: true,
      uploadError: null,
      file,
    });

    try {
      const res = await startUpload([file]);
      if (res && res.length > 0) {
        const uploaded = res[0];
        const finalUrl = (uploaded as any).ufsUrl || uploaded.url;
        setAttachedFile((prev) =>
          prev
            ? {
                ...prev,
                url: finalUrl,
                isUploading: false,
                uploadError: null,
              }
            : null
        );
      }
    } catch (err: any) {
      setAttachedFile((prev) =>
        prev
          ? {
              ...prev,
              isUploading: false,
              uploadError: err?.message || "Failed to upload to server. You can retry.",
            }
          : null
      );
    }
  };

  const removeAttachedFile = () => {
    if (attachedFile?.previewUrl) {
      URL.revokeObjectURL(attachedFile.previewUrl);
    }
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTagClick = (tag: string) => {
    if (!symptomText.trim()) {
      setSymptomText(tag);
    } else if (symptomText.includes(tag)) {
      setSymptomText(
        symptomText
          .replace(tag, "")
          .replace(/,\s*,/g, ",")
          .replace(/^,\s*|,\s*$/g, "")
          .trim()
      );
    } else {
      setSymptomText(`${symptomText.trim()}, ${tag}`);
    }
  };

  // Submit consultation booking
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!appointmentSlot) {
      setBookingError("Please select an available consultation time slot.");
      return;
    }

    if (attachedFile?.isUploading) {
      setBookingError("Please wait for your medical report to finish uploading.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentDate,
          appointmentSlot,
          consultationType,
          primarySymptoms: symptomText.trim() || undefined,
          reportUrl: attachedFile?.url || undefined,
          reportName: attachedFile?.name || undefined,
          reportSize: attachedFile?.size || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to book your consultation slot.");
      }

      setBookingSuccess(json.data);
    } catch (err: any) {
      setBookingError(err.message || "Failed to book slot. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getWhatsAppShareUrl = (ticket: string) => {
    const patientName = sessionData?.user?.name || "Patient";
    const modeLabel =
      consultationType === "ONLINE"
        ? "Online Telehealth Consultation"
        : "In-Person Karachi Clinic Visit";

    const msg = `Assalam-o-Alaikum Hakim Tahir Hameed Sahib,
I have booked a consultation slot on Tameer-e-Sehat:

🎫 *Booking Ticket:* ${ticket}
👤 *Patient:* ${patientName}
📅 *Date:* ${appointmentDate}
⏰ *Time Slot:* ${appointmentSlot}
🩺 *Type:* ${modeLabel}${symptomText.trim() ? `\n📝 *Notes:* ${symptomText.trim()}` : ""}${attachedFile?.url ? `\n📄 *Report:* ${attachedFile.url}` : ""}

Please confirm my appointment.`;

    return `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  };

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#e6dfd5] overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-[#22623a] text-white p-5 sm:p-6 shrink-0 relative">
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close dialog"
                className="absolute top-4 right-4 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-1.5 text-[#c59b27] text-xs uppercase tracking-widest font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Hakim Tahir Hameed Matab</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold leading-tight">
                {bookingSuccess
                  ? "Consultation Slot Confirmed"
                  : !sessionData?.user
                  ? "Book Your Consultation"
                  : "Select Your Consultation Slot"}
              </h2>
              <p className="text-white/80 text-xs mt-1">
                {bookingSuccess
                  ? "Your clinical appointment ticket has been issued."
                  : !sessionData?.user
                  ? "Create an account or sign in to reserve your dedicated clinical slot."
                  : `Booking for ${sessionData.user.name} (${sessionData.user.email})`}
              </p>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* ── SCREEN 1: SUCCESS CONFIRMATION ── */}
              {bookingSuccess ? (
                <div className="space-y-5 py-2 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#22623a] flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#14281D]">
                      Appointment Slot Reserved!
                    </h3>
                    <p className="text-xs text-[#59534b] max-w-md mx-auto">
                      A confirmation email has been sent to{" "}
                      <strong>{sessionData?.user?.email}</strong>. Our clinical team
                      has registered your slot.
                    </p>
                  </div>

                  {/* Ticket Card */}
                  <div className="bg-[#faf8f5] border border-[#e6dfd5] rounded-xl p-4 text-left space-y-3">
                    <div className="flex items-center justify-between border-b border-[#e6dfd5] pb-2">
                      <span className="text-xs font-semibold text-[#7a7268] uppercase tracking-wider">
                        Ticket Number
                      </span>
                      <span className="font-mono text-sm font-bold text-[#22623a]">
                        {bookingSuccess.ticketNumber}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[#7a7268] block">Date</span>
                        <strong className="text-[#14281D]">
                          {bookingSuccess.appointmentDate}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#7a7268] block">Time Slot</span>
                        <strong className="text-[#14281D]">
                          {bookingSuccess.appointmentSlot}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#7a7268] block">Type</span>
                        <strong className="text-[#14281D]">
                          {bookingSuccess.consultationType === "ONLINE"
                            ? "Online Telehealth"
                            : "In-Person Clinic Visit"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#7a7268] block">Status</span>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                          {bookingSuccess.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2.5 pt-2">
                    <a
                      href={getWhatsAppShareUrl(bookingSuccess.ticketNumber)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Message Hakim on WhatsApp with Ticket</span>
                    </a>

                    <div className="flex gap-2">
                      <Link
                        href="/account"
                        onClick={handleClose}
                        className="flex-1 py-2.5 px-4 bg-white hover:bg-[#faf8f5] border border-[#e6dfd5] text-[#14281D] rounded-xl text-xs font-semibold text-center transition-colors"
                      >
                        View in My Account
                      </Link>
                      <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 py-2.5 px-4 bg-[#22623a] hover:bg-[#1b502e] text-white rounded-xl text-xs font-semibold transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              ) : !sessionData?.user ? (
                /* ── SCREEN 2: AUTH GATING (UNAUTHENTICATED) ── */
                <div className="space-y-4">
                  {/* Tabs */}
                  <div className="grid grid-cols-2 p-1 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab("signup");
                        setAuthError(null);
                      }}
                      className={`py-2 rounded-lg transition-colors ${
                        authTab === "signup"
                          ? "bg-[#22623a] text-white shadow-xs"
                          : "text-[#7a7268] hover:text-[#14281D]"
                      }`}
                    >
                      Create Account
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab("signin");
                        setAuthError(null);
                      }}
                      className={`py-2 rounded-lg transition-colors ${
                        authTab === "signin"
                          ? "bg-[#22623a] text-white shadow-xs"
                          : "text-[#7a7268] hover:text-[#14281D]"
                      }`}
                    >
                      Sign In
                    </button>
                  </div>

                  <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-[11px] text-emerald-950 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#22623a] shrink-0 mt-0.5" />
                    <span>
                      An account keeps your health records, consultation tickets, and
                      remedy prescriptions organized in one private portal.
                    </span>
                  </div>

                  {authError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {authTab === "signup" ? (
                    <form onSubmit={handleAuthRegister} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#14281D]">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-[#7a7268] absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={authName}
                            onChange={(e) => setAuthName(e.target.value)}
                            placeholder="e.g. Muhammad Bilal"
                            className="w-full pl-9 pr-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-xs text-[#14281D] focus:outline-none focus:border-[#22623a] focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#14281D]">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-[#7a7268] absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full pl-9 pr-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-xs text-[#14281D] focus:outline-none focus:border-[#22623a] focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#14281D]">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-[#7a7268] absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            className="w-full pl-9 pr-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-xs text-[#14281D] focus:outline-none focus:border-[#22623a] focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#14281D]">
                          Phone / WhatsApp <span className="text-xs font-normal text-[#7a7268]">(Optional)</span>
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-[#7a7268] absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            value={authPhone}
                            onChange={(e) => setAuthPhone(e.target.value)}
                            placeholder="0300-1234567"
                            className="w-full pl-9 pr-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-xs text-[#14281D] focus:outline-none focus:border-[#22623a] focus:bg-white"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full mt-2 py-3 px-4 bg-[#22623a] hover:bg-[#1b502e] disabled:opacity-60 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-sm"
                      >
                        {authLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Creating Account...</span>
                          </>
                        ) : (
                          <>
                            <span>Create Account &amp; Book Slot</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleAuthSignIn} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#14281D]">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-[#7a7268] absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full pl-9 pr-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-xs text-[#14281D] focus:outline-none focus:border-[#22623a] focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#14281D]">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-[#7a7268] absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="password"
                            required
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            placeholder="Your account password"
                            className="w-full pl-9 pr-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-xs text-[#14281D] focus:outline-none focus:border-[#22623a] focus:bg-white"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full mt-2 py-3 px-4 bg-[#22623a] hover:bg-[#1b502e] disabled:opacity-60 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-sm"
                      >
                        {authLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Signing In...</span>
                          </>
                        ) : (
                          <>
                            <span>Sign In &amp; Continue</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                /* ── SCREEN 3: AUTHENTICATED SLOT BOOKING ── */
                <form onSubmit={handleConfirmBooking} className="space-y-4">
                  {bookingError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  {/* Consultation Mode Picker */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#14281D] uppercase tracking-wider">
                      1. Consultation Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setConsultationType("ONLINE")}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          consultationType === "ONLINE"
                            ? "bg-emerald-50/70 border-[#22623a] ring-1 ring-[#22623a]"
                            : "bg-[#faf8f5] border-[#e6dfd5] hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-[#22623a]" />
                          <span className="text-xs font-bold text-[#14281D]">
                            Online Telehealth
                          </span>
                        </div>
                        <p className="text-[11px] text-[#7a7268] mt-1">
                          Via WhatsApp Call / Video consultation from anywhere.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setConsultationType("IN_PERSON")}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          consultationType === "IN_PERSON"
                            ? "bg-emerald-50/70 border-[#22623a] ring-1 ring-[#22623a]"
                            : "bg-[#faf8f5] border-[#e6dfd5] hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#22623a]" />
                          <span className="text-xs font-bold text-[#14281D]">
                            In-Person Clinic
                          </span>
                        </div>
                        <p className="text-[11px] text-[#7a7268] mt-1">
                          Visit Hakim Tahir Hameed at DHA Phase 6, Karachi.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Date & Slot Picker */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#14281D] uppercase tracking-wider flex items-center justify-between">
                      <span>2. Select Appointment Date &amp; Slot</span>
                      {availability && (
                        <span className="text-[11px] font-normal text-[#7a7268]">
                          {availability.dayName} Clinical Hours
                        </span>
                      )}
                    </label>

                    <div className="relative">
                      <Calendar className="w-4 h-4 text-[#7a7268] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        required
                        min={toDateInputValue(new Date())}
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-xs text-[#14281D] focus:outline-none focus:border-[#22623a] focus:bg-white font-medium"
                      />
                    </div>

                    {/* Slots List */}
                    <div className="mt-2">
                      {availabilityLoading ? (
                        <div className="p-4 bg-[#faf8f5] rounded-xl border border-[#e6dfd5] text-center space-y-1.5">
                          <Loader2 className="w-4 h-4 animate-spin text-[#22623a] mx-auto" />
                          <span className="text-xs text-[#7a7268]">
                            Checking available slots for {appointmentDate}...
                          </span>
                        </div>
                      ) : availabilityError ? (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{availabilityError}</span>
                        </div>
                      ) : availability && !availability.isOpen ? (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                          The clinic is closed on {availability.dayName}s. Please choose
                          Monday to Saturday.
                        </div>
                      ) : availability && availability.isHoliday ? (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                          Clinic Holiday: {availability.holidayReason || "Official Holiday"}.
                          Please pick another date.
                        </div>
                      ) : availability && availability.slots?.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {availability.slots.map((s: any) => {
                            const isSelected = appointmentSlot === s.slot;
                            return (
                              <button
                                key={s.slot}
                                type="button"
                                disabled={!s.available}
                                onClick={() => setAppointmentSlot(s.slot)}
                                className={`p-2.5 rounded-lg border text-center transition-all ${
                                  !s.available
                                    ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed line-through"
                                    : isSelected
                                    ? "bg-[#22623a] text-white border-[#22623a] shadow-xs"
                                    : "bg-white border-[#e6dfd5] text-[#14281D] hover:border-[#22623a]"
                                }`}
                              >
                                <span className="block text-xs font-bold font-mono">
                                  {s.slot}
                                </span>
                                <span
                                  className={`block text-[10px] mt-0.5 ${
                                    isSelected
                                      ? "text-white/80"
                                      : s.available
                                      ? "text-emerald-700 font-semibold"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {s.available ? "Available" : "Booked"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-[#7a7268]">
                          No slots available for this date.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Health Concern / Symptoms (Optional) */}
                  <div className="space-y-2 pt-1 border-t border-[#f0eae1]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#14281D] uppercase tracking-wider">
                        3. Health Concern / Notes{" "}
                        <span className="text-[11px] font-normal text-[#7a7268]">
                          (Optional)
                        </span>
                      </label>
                    </div>

                    {/* Quick Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_SYMPTOM_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagClick(tag)}
                          className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${
                            symptomText.includes(tag)
                              ? "bg-[#22623a] text-white border-[#22623a]"
                              : "bg-[#faf8f5] border-[#e6dfd5] text-[#59534b] hover:bg-white"
                          }`}
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>

                    <textarea
                      rows={2}
                      value={symptomText}
                      onChange={(e) => setSymptomText(e.target.value)}
                      placeholder="e.g. Chronic acidity for 2 months, knee joint stiffness, or general health inquiry..."
                      className="w-full p-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-xs text-[#14281D] focus:outline-none focus:border-[#22623a] focus:bg-white resize-none"
                    />

                    {/* Attachment Upload */}
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      {attachedFile ? (
                        <div className="flex items-center justify-between p-2 bg-emerald-50/80 border border-emerald-200 rounded-lg text-xs">
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-[#22623a] shrink-0" />
                            <span className="font-medium text-emerald-950 truncate">
                              {attachedFile.name} ({attachedFile.size})
                            </span>
                            {attachedFile.isUploading && (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#22623a]" />
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={removeAttachedFile}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 text-[11px] text-[#22623a] font-semibold hover:underline"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          <span>Attach previous medical lab report or prescription (Optional)</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting || !appointmentSlot}
                      className="w-full py-3 px-4 bg-[#22623a] hover:bg-[#1b502e] disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Reserving Your Slot...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm Consultation Slot</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
