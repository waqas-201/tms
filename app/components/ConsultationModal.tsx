"use client";

import React, { useState, useEffect, useRef, useContext } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { CLINIC_INFO } from "@/app/data/products";
import { useSession } from "@/lib/auth-client";
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
  ArrowLeft,
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
  // Access global context if available
  const context = useContext(ConsultationContext);

  const isControlled = propIsOpen !== undefined;
  const isOpen = isControlled ? propIsOpen : (context?.isOpen ?? false);
  const handleClose = propOnClose || context?.closeConsultation || (() => {});

  const contextMessage = context?.initialMessage ?? "";
  const contextMode = context?.initialMode ?? "WHATSAPP";

  const resolvedInitialMessage =
    initialMessage || initialConcern || contextMessage || "";
  const resolvedInitialMode = initialMode || contextMode || "WHATSAPP";

  const [mounted, setMounted] = useState(false);
  let sessionData: any = null;
  try {
    const sessionRes = useSession?.();
    sessionData = sessionRes?.data;
  } catch {
    // Graceful fallback if auth provider is not active
  }

  // ── 3-Step Flow: Step 1: Symptoms -> Step 2: Channel -> Step 3: Clinic Details ──
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [channel, setChannel] = useState<ConsultationMode>(resolvedInitialMode);
  const [symptomText, setSymptomText] = useState(resolvedInitialMessage);

  // ── Report / Photo File Attachment State ──
  const [attachedFile, setAttachedFile] =
    useState<AttachedReportFile | null>(null);
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

  // ── Clinic physical appointment fields (Step 3) ──
  const [clinicName, setClinicName] = useState(sessionData?.user?.name || "");
  const [clinicPhone, setClinicPhone] = useState(
    (sessionData?.user as any)?.phone || ""
  );
  const [clinicEmail, setClinicEmail] = useState(
    sessionData?.user?.email || ""
  );
  const [clinicDate, setClinicDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return toDateInputValue(tomorrow);
  });
  const [clinicSlot, setClinicSlot] = useState("");
  const [clinicAvailability, setClinicAvailability] = useState<any | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // ── WhatsApp path patient identity (Step 2) ──
  const [waName, setWaName] = useState(sessionData?.user?.name || "");
  const [waPhone, setWaPhone] = useState(
    (sessionData?.user as any)?.phone || ""
  );
  const [waEmail, setWaEmail] = useState(sessionData?.user?.email || "");

  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync inputs when modal opens or initial values change
  useEffect(() => {
    if (isOpen) {
      if (resolvedInitialMessage) {
        setSymptomText(resolvedInitialMessage);
      }
      if (resolvedInitialMode) {
        setChannel(resolvedInitialMode);
      }
      setStep(1);
      setBookingSuccess(null);
      setErrorMessage(null);
    }
  }, [isOpen, resolvedInitialMessage, resolvedInitialMode]);

  // Sync user profile if available
  useEffect(() => {
    if (sessionData?.user?.name && !clinicName) {
      setClinicName(sessionData.user.name);
    }
    if ((sessionData?.user as any)?.phone && !clinicPhone) {
      setClinicPhone((sessionData.user as any).phone);
    }
    if (sessionData?.user?.name && !waName) {
      setWaName(sessionData.user.name);
    }
    if ((sessionData?.user as any)?.phone && !waPhone) {
      setWaPhone((sessionData.user as any).phone);
    }
    if (sessionData?.user?.email && !clinicEmail) {
      setClinicEmail(sessionData.user.email);
    }
    if (sessionData?.user?.email && !waEmail) {
      setWaEmail(sessionData.user.email);
    }
  }, [sessionData, clinicName, clinicPhone, waName, waPhone, clinicEmail, waEmail]);

  // Load real slot availability for the selected clinic date
  useEffect(() => {
    if (!isOpen || step !== 3 || !clinicDate) return;
    let cancelled = false;

    setAvailabilityLoading(true);
    setAvailabilityError(null);

    fetch(`/api/consultations/availability?date=${encodeURIComponent(clinicDate)}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Could not load clinic availability.");
        }
        return json.data;
      })
      .then((data) => {
        if (cancelled) return;
        setClinicAvailability(data);
        const availableSlots = (data.slots || []).filter(
          (slot: any) => slot.available
        );
        setClinicSlot((previous) =>
          availableSlots.some((slot: any) => slot.slot === previous)
            ? previous
            : availableSlots[0]?.slot || ""
        );
      })
      .catch((err: any) => {
        if (cancelled) return;
        setClinicAvailability(null);
        setAvailabilityError(
          err.message || "Could not load clinic availability."
        );
      })
      .finally(() => {
        if (!cancelled) setAvailabilityLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, step, clinicDate]);

  // Escape key listener to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  // Lock body scroll when modal is open
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
              uploadError:
                err?.message || "Failed to upload to server. You can retry.",
            }
          : null
      );
    }
  };

  const retryUpload = async () => {
    if (!attachedFile?.file) {
      fileInputRef.current?.click();
      return;
    }

    setAttachedFile((prev) =>
      prev
        ? {
            ...prev,
            isUploading: true,
            uploadError: null,
          }
        : null
    );

    try {
      const res = await startUpload([attachedFile.file]);
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
              uploadError: err?.message || "Failed to upload file.",
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

  const getWhatsAppUrl = (ticketOverride?: string) => {
    let message =
      "*Assalam-o-Alaikum Hakim Tahir Hameed Sahib (Tameer-e-Sehat Consultation)*\n\n";

    const patientName =
      waName.trim() ||
      (sessionData?.user?.name && sessionData.user.name !== "WhatsApp Patient"
        ? sessionData.user.name
        : "");
    const activeTicket = ticketOverride || bookingSuccess?.ticketNumber;

    if (patientName) {
      message += `*Patient:* ${patientName}\n`;
    }
    if (activeTicket) {
      message += `*Booking Ticket:* ${activeTicket}\n`;
    }
    if (patientName || activeTicket) {
      message += "\n";
    }

    if (symptomText.trim()) {
      message += `*My Health Concern / Notes:*\n${symptomText.trim()}\n\n`;
    } else {
      message += `*Health Consultation Inquiry*\n_I would like to consult with you regarding herbal treatment options._\n\n`;
    }

    if (attachedFile) {
      if (attachedFile.url) {
        message += `📄 *Attached Medical Report:* ${attachedFile.name} (${attachedFile.size})\n🔗 *Document Link:* ${attachedFile.url}\n\n`;
      } else {
        message += `📄 *Medical Report/Photo:* ${attachedFile.name} (${attachedFile.size}) - (Attaching file in WhatsApp)\n\n`;
      }
    }

    message += `_Please review and provide your authentic Unani guidance._`;

    return `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;
  };

  const handleWhatsAppSubmit = async () => {
    setErrorMessage(null);

    // If report is still uploading, notify user
    if (attachedFile?.isUploading) {
      setErrorMessage(
        "Please wait a moment while your report finishes uploading to generate the link."
      );
      return;
    }

    const resolvedName =
      waName.trim() || sessionData?.user?.name?.trim() || "";
    const resolvedPhone =
      waPhone.trim() || (sessionData?.user as any)?.phone?.trim() || "";

    if (!resolvedName) {
      setErrorMessage(
        "Please enter your name so we can create your booking ticket."
      );
      return;
    }

    if (resolvedPhone.replace(/\D/g, "").length < 7) {
      setErrorMessage(
        "Please enter a valid WhatsApp / phone number so the clinic can confirm your booking."
      );
      return;
    }

    setSubmitting(true);

    try {
      const patientName = resolvedName;
      const patientPhone = resolvedPhone;

      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: patientName,
          phone: patientPhone,
          email: waEmail.trim() || undefined,
          city: (sessionData?.user as any)?.city || "Pakistan",
          primarySymptoms:
            symptomText.trim() ||
            "General Health Consultation & Herbal Assessment",
          channel: "WHATSAPP",
          consultationType: "ONLINE",
          preferredContact: "WHATSAPP",
          duration: "Recent / Ongoing",
          reportUrl: attachedFile?.url || undefined,
          reportName: attachedFile?.name || undefined,
          reportSize: attachedFile?.size || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Could not create your booking ticket.");
      }

      setBookingSuccess(json.data);

      // Open WhatsApp directly with the new ticket
      const targetUrl = getWhatsAppUrl(json.data?.ticketNumber);
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          "Could not create your booking ticket. You can still WhatsApp us directly."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhysicalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!clinicName.trim()) {
      setErrorMessage("Please enter your name for the clinic reservation.");
      return;
    }

    if (!clinicEmail.trim()) {
      setErrorMessage(
        "Please enter your email address for appointment confirmation."
      );
      return;
    }

    if (!clinicSlot) {
      setErrorMessage(
        "Please select an available appointment slot for your clinic visit."
      );
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: clinicName.trim(),
          phone: clinicPhone.trim() || undefined,
          email: clinicEmail.trim(),
          city: "Karachi",
          primarySymptoms:
            symptomText.trim() || "General In-Person Consultation",
          age: 35,
          gender: "Not Specified",
          duration: "New Visit",
          channel: "EMAIL",
          consultationType: "IN_PERSON",
          appointmentDate: clinicDate,
          appointmentSlot: clinicSlot,
          preferredContact: "EMAIL",
          reportUrl: attachedFile?.url || undefined,
          reportName: attachedFile?.name || undefined,
          reportSize: attachedFile?.size || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to submit booking request.");
      }

      setBookingSuccess(json.data);
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          "Could not submit your booking request. Please call or WhatsApp us."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinueToStep2 = () => {
    if (!symptomText.trim()) {
      setSymptomText("General Health Consultation & Herbal Assessment");
    }
    setStep(2);
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
          aria-labelledby="consultation-modal-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal Card - Sized to never require scrolling on standard screens */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#e6dfd5] overflow-hidden flex flex-col z-10 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#22623a] text-white px-4 py-3 sm:px-5 sm:py-3.5 flex items-start justify-between relative shrink-0">
              <div className="space-y-0.5 pr-4">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#143e23] text-[#c59b27] text-[10px] font-bold tracking-wide">
                  <Sparkles className="w-3 h-3" />
                  <span>Free Initial Assessment · Bila-Muawza</span>
                </div>
                <h3
                  id="consultation-modal-title"
                  className="font-serif text-base sm:text-lg font-bold leading-snug"
                >
                  Consult Hakim Tahir Hameed
                </h3>
                <p className="text-[11px] text-[#f4eee5]/80 leading-tight">
                  35+ Years Classical Unani Wisdom · Karachi Dispensary &amp; Telehealth
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Mobile-First Clean 3-Step Progress Indicator */}
            <div className="px-4 sm:px-5 py-2.5 bg-[#fdfbf7] border-b border-[#e6dfd5] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold text-[#22623a] bg-[#eef7f1] border border-[#cde4d6] px-2 py-0.5 rounded-full shrink-0">
                  Step {step} of 3
                </span>
                <span className="text-xs font-semibold text-[#1a1816] truncate">
                  {step === 1 && "Describe Health Concern"}
                  {step === 2 && "Choose Consultation Channel"}
                  {step === 3 && "Clinic Appointment Details"}
                </span>
              </div>

              {/* Progress Indicator Bars */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    step === 1
                      ? "w-6 bg-[#22623a]"
                      : step > 1
                      ? "w-3 bg-[#22623a]"
                      : "w-2 bg-[#e6dfd5]"
                  }`}
                />
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    step === 2
                      ? "w-6 bg-[#22623a]"
                      : step > 2
                      ? "w-3 bg-[#22623a]"
                      : "w-2 bg-[#e6dfd5]"
                  }`}
                />
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    step === 3
                      ? "w-6 bg-[#22623a]"
                      : "w-2 bg-[#e6dfd5]"
                  }`}
                />
              </div>
            </div>

            {/* Modal Body - Designed to fit comfortably in a single view without scrolling */}
            <div data-lenis-prevent className="p-4 sm:p-5 max-h-[calc(100vh-11rem)] overflow-y-auto">
              {step === 1 && (
                /* ═══════════════════════════════════════════════════════
                   STEP 1: WhatsApp-Style Integrated Input
                   ═══════════════════════════════════════════════════════ */
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] sm:text-xs font-bold text-[#22623a] uppercase tracking-wider block mb-1">
                      Describe your health concern:
                    </label>

                    {/* WhatsApp-Style Input Container */}
                    <div className="rounded-2xl border border-[#e6dfd5] bg-[#faf8f5] focus-within:border-[#22623a] focus-within:bg-white transition-all overflow-hidden flex flex-col shadow-inner">
                      <textarea
                        rows={3}
                        value={symptomText}
                        onChange={(e) => setSymptomText(e.target.value)}
                        placeholder="Type your symptoms, how long you've felt unwell, or attach a report below..."
                        className="w-full bg-transparent p-3 text-xs sm:text-sm text-[#1a1816] placeholder:text-[#8c827a] resize-none focus:outline-none min-h-[75px] max-h-[85px] leading-relaxed"
                      />

                      {/* Attached Medical Report Chip (Inside Box) */}
                      {attachedFile && (
                        <div className="px-3 pb-2 pt-0.5 flex flex-col gap-1">
                          <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs max-w-full ${
                              attachedFile.uploadError
                                ? "bg-red-50 border-red-200 text-red-700"
                                : attachedFile.url
                                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                : "bg-[#fdfbf7] border-[#e6dfd5] text-[#59534b]"
                            }`}
                          >
                            {attachedFile.isUploading ? (
                              <Loader2 className="w-3.5 h-3.5 text-[#22623a] animate-spin shrink-0" />
                            ) : attachedFile.uploadError ? (
                              <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                            ) : attachedFile.url ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 text-[#8c6a15] shrink-0" />
                            )}
                            <span className="font-medium text-[11px] truncate max-w-[140px]">
                              {attachedFile.name}
                            </span>
                            <span className="text-[10px] opacity-75 shrink-0">
                              ({attachedFile.size})
                            </span>
                            {attachedFile.isUploading && (
                              <span className="text-[10px] font-semibold text-[#22623a] animate-pulse shrink-0">
                                Uploading...
                              </span>
                            )}
                            {attachedFile.url && (
                              <span className="text-[10px] font-semibold text-emerald-700 shrink-0">
                                Ready
                              </span>
                            )}
                            {attachedFile.uploadError && (
                              <button
                                type="button"
                                onClick={retryUpload}
                                className="text-[10px] underline font-bold text-red-700 hover:text-red-900 cursor-pointer ml-1 shrink-0"
                              >
                                Retry
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={removeAttachedFile}
                              className="p-0.5 text-gray-400 hover:text-red-600 cursor-pointer ml-auto shrink-0"
                              title="Remove file"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {attachedFile.uploadError && (
                            <span className="text-[10px] text-red-600 px-1">
                              {attachedFile.uploadError} (You can still chat directly on WhatsApp.)
                            </span>
                          )}
                        </div>
                      )}

                      {/* WhatsApp Integrated Bottom Action Bar */}
                      <div className="border-t border-[#e6dfd5] bg-[#f7f4ee]/80 px-3 py-1.5 flex items-center">
                        {/* Attach Report / Photo (Paperclip) */}
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              attachedFile
                                ? "bg-[#eef7f1] text-[#22623a] border border-[#cde4d6]"
                                : "text-[#59534b] hover:text-[#1a1816] hover:bg-[#eae4d9]"
                            }`}
                            title="Attach lab report, prescription, or tongue/skin photo"
                          >
                            <Paperclip className="w-3.5 h-3.5 text-[#8c6a15]" />
                            <span className="text-[11px]">
                              {attachedFile ? "Report Attached" : "Attach Report / Photo"}
                            </span>
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Common Symptom Quick-Add Chips */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-[#6a6660] block">
                      Or tap quick common concerns to add:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {QUICK_SYMPTOM_TAGS.map((tag) => {
                        const isSelected = symptomText.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleTagClick(tag)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#22623a] text-white shadow-xs"
                                : "bg-[#f4eee5] hover:bg-[#e6dfd5] text-[#59534b] border border-[#e6dfd5]"
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Primary Continue Button to Step 2 */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleContinueToStep2}
                      className="w-full h-11 bg-[#22623a] hover:bg-[#1a4d2e] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      <span>Continue to Choose Channel</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Trust Micro-Copy */}
                  <div className="text-center pt-0.5">
                    <span className="text-[10px] sm:text-[11px] text-[#7a7268] inline-flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#22623a]" />
                      Strictly Confidential · 100% Free Initial Assessment
                    </span>
                  </div>
                </div>
              )}

              {step === 2 && (
                /* ═══════════════════════════════════════════════════════
                   STEP 2: Choose Consultation Channel
                   ═══════════════════════════════════════════════════════ */
                <div className="space-y-3">
                  {/* Compact Symptom Summary Pill */}
                  <div className="px-3 py-2 bg-[#faf8f5] rounded-xl border border-[#e6dfd5] flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-[#8c6a15] tracking-wider block">
                        Health Concern:
                      </span>
                      <p className="text-[#1a1816] font-medium truncate text-xs">
                        {symptomText.trim() || "General Health Consultation"}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-[#6a6660]">
                        {attachedFile && (
                          <span
                            className={`inline-flex items-center gap-1 font-semibold ${
                              attachedFile.url
                                ? "text-emerald-700"
                                : attachedFile.uploadError
                                ? "text-red-600"
                                : "text-[#8c6a15]"
                            }`}
                          >
                            {attachedFile.isUploading ? (
                              <Loader2 className="w-3 h-3 animate-spin text-[#22623a]" />
                            ) : attachedFile.url ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : attachedFile.uploadError ? (
                              <AlertCircle className="w-3 h-3 text-red-600" />
                            ) : (
                              <FileText className="w-3 h-3" />
                            )}
                            <span className="truncate max-w-[150px]">
                              {attachedFile.name}
                            </span>
                            <span>
                              {attachedFile.url
                                ? "(Uploaded)"
                                : attachedFile.isUploading
                                ? "(Uploading...)"
                                : attachedFile.uploadError
                                ? "(Upload Error)"
                                : ""}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-2 py-0.5 text-[10px] font-bold text-[#22623a] hover:text-[#1a4d2e] bg-white border border-[#cde4d6] rounded-md shrink-0 cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Channel Switcher Cards */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] sm:text-xs font-bold text-[#22623a] uppercase tracking-wider block">
                      Select How You Want to Consult:
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* WhatsApp Channel Card */}
                      <button
                        type="button"
                        onClick={() => {
                          setChannel("WHATSAPP");
                          setBookingSuccess(null);
                          setErrorMessage(null);
                        }}
                        className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                          channel === "WHATSAPP"
                            ? "bg-[#eef7f1] border-[#25D366] shadow-xs"
                            : "bg-[#faf8f5] border-[#e6dfd5] hover:border-[#22623a]/40"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="w-7 h-7 rounded-lg bg-[#25D366] text-white flex items-center justify-center shrink-0">
                              <MessageCircle className="w-4 h-4 fill-current" />
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#25D366]/20 text-[#157338]">
                              Recommended
                            </span>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#1a1816]">
                              Instant WhatsApp
                            </h4>
                            <p className="text-[10px] sm:text-[11px] text-[#59534b] leading-tight">
                              Direct chat with Hakim Tahir Hameed. Send voice notes &amp; photos.
                            </p>
                          </div>
                        </div>
                      </button>

                      {/* Karachi Clinic Visit Card */}
                      <button
                        type="button"
                        onClick={() => {
                          setChannel("PHYSICAL");
                          setBookingSuccess(null);
                          setErrorMessage(null);
                        }}
                        className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                          channel === "PHYSICAL"
                            ? "bg-[#fdfbf7] border-[#22623a] shadow-xs"
                            : "bg-[#faf8f5] border-[#e6dfd5] hover:border-[#22623a]/40"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="w-7 h-7 rounded-lg bg-[#22623a] text-[#c59b27] flex items-center justify-center shrink-0">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f4eee5] text-[#8c6a15]">
                              Karachi Matab
                            </span>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#1a1816]">
                              In-Person Visit
                            </h4>
                            <p className="text-[10px] sm:text-[11px] text-[#59534b] leading-tight">
                              Pulse diagnosis (Nabz) at Korangi Crossing Road clinic.
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Channel Action */}
                  <div className="pt-1">
                    {channel === "WHATSAPP" ? (
                      bookingSuccess ? (
                        <div className="space-y-2.5">
                          <div className="text-center space-y-2.5 py-3 bg-[#eef7f1] rounded-2xl border border-[#cde4d6] p-4">
                            <div className="w-10 h-10 rounded-full bg-[#22623a] text-white flex items-center justify-center mx-auto">
                              <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h4 className="font-serif text-base sm:text-lg font-bold text-[#22623a]">
                              Booking Request Received
                            </h4>
                            <p className="text-xs text-[#59534b]">
                              Ticket Number:{" "}
                              <strong className="font-mono text-[#22623a] bg-white px-2 py-0.5 rounded border border-[#cde4d6]">
                                {bookingSuccess.ticketNumber}
                              </strong>
                            </p>
                            <p className="text-[11px] text-[#6a6660] max-w-xs mx-auto leading-relaxed">
                              Status:{" "}
                              <strong className="text-[#22623a]">
                                Awaiting confirmation
                              </strong>{" "}
                              — Hakim Tahir Hameed&apos;s team will reply on
                              WhatsApp. Keep your ticket to check updates
                              anytime.
                            </p>
                            <a
                              href={getWhatsAppUrl()}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={handleClose}
                              className="w-full h-10 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                            >
                              <MessageCircle className="w-4 h-4 fill-current" />
                              <span>Open WhatsApp Consultation</span>
                              <ArrowRight className="w-4 h-4" />
                            </a>
                            <div className="flex items-center justify-center gap-3 text-[11px] font-semibold">
                              <Link
                                href={`/track-order?ref=${encodeURIComponent(
                                  bookingSuccess.ticketNumber
                                )}`}
                                onClick={handleClose}
                                className="text-[#22623a] underline underline-offset-2 hover:text-[#1a4d2e]"
                              >
                                Track this booking
                              </Link>
                              {sessionData?.user && (
                                <Link
                                  href="/account"
                                  onClick={handleClose}
                                  className="text-[#22623a] underline underline-offset-2 hover:text-[#1a4d2e]"
                                >
                                  View in My Account
                                </Link>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleClose}
                            className="w-full h-9 bg-[#f4eee5] hover:bg-[#e6dfd5] text-[#59534b] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                          >
                            Done / Close
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {errorMessage && (
                            <div className="p-2 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-700 flex items-center gap-2">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{errorMessage}</span>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="space-y-0.5">
                              <label className="text-[11px] font-semibold text-[#1a1816]">
                                Your Name{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <User className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                  type="text"
                                  value={waName}
                                  onChange={(e) => setWaName(e.target.value)}
                                  placeholder="e.g. Ahmed Khan"
                                  className="w-full text-xs pl-8 pr-2.5 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white"
                                />
                              </div>
                            </div>

                            <div className="space-y-0.5">
                              <label className="text-[11px] font-semibold text-[#1a1816]">
                                WhatsApp / Phone{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                  type="tel"
                                  value={waPhone}
                                  onChange={(e) => setWaPhone(e.target.value)}
                                  placeholder="0300-1234567"
                                  className="w-full text-xs pl-8 pr-2.5 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <label className="text-[11px] font-semibold text-[#1a1816]">
                              Email{" "}
                              <span className="text-[#8c827a] font-normal">
                                (optional — for confirmations)
                              </span>
                            </label>
                            <div className="relative">
                              <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                type="email"
                                value={waEmail}
                                onChange={(e) => setWaEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full text-xs pl-8 pr-2.5 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white"
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleWhatsAppSubmit}
                            disabled={submitting}
                            className="w-full h-11 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                                <span>Creating booking ticket...</span>
                              </>
                            ) : (
                              <>
                                <MessageCircle className="w-4 h-4 fill-current" />
                                <span>Start WhatsApp Consultation</span>
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>

                          <p className="text-[10px] text-center text-[#6a6660] leading-relaxed">
                            We save a ticket so you can track this consultation
                            anytime. Your symptoms are pre-typed into WhatsApp
                            automatically.
                          </p>

                          <div className="flex items-center justify-center pt-1 border-t border-[#f4eee5]">
                            <a
                              href={getWhatsAppUrl()}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={handleClose}
                              className="text-[11px] text-[#22623a] hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>Or launch WhatsApp directly without ticket</span>
                              <ArrowRight className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="w-full h-11 bg-[#22623a] hover:bg-[#1a4d2e] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
                      >
                        <span>Continue to Clinic Reservation</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </div>

                  {/* Back Navigation Button */}
                  {!(channel === "WHATSAPP" && bookingSuccess) && (
                    <div className="pt-2 border-t border-[#f4eee5] flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setBookingSuccess(null);
                          setErrorMessage(null);
                          setStep(1);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#59534b] hover:text-[#1a1816] transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Step 1 (Edit Concern)</span>
                      </button>

                      <span className="text-[10px] text-[#8c827a]">
                        Step 2 of 3
                      </span>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                /* ═══════════════════════════════════════════════════════
                   STEP 3: Dedicated In-Person Clinic Reservation Form
                   ═══════════════════════════════════════════════════════ */
                <div className="space-y-3">
                  {bookingSuccess ? (
                    <div className="space-y-2.5">
                      <div className="text-center space-y-2.5 py-3 bg-[#eef7f1] rounded-2xl border border-[#cde4d6] p-4">
                        <div className="w-10 h-10 rounded-full bg-[#22623a] text-white flex items-center justify-center mx-auto">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h4 className="font-serif text-base sm:text-lg font-bold text-[#22623a]">
                          Booking Request Received
                        </h4>
                        <p className="text-xs text-[#59534b]">
                          Ticket Number:{" "}
                          <strong className="font-mono text-[#22623a] bg-white px-2 py-0.5 rounded border border-[#cde4d6]">
                            {bookingSuccess.ticketNumber}
                          </strong>
                        </p>
                        <p className="text-[11px] text-[#6a6660] max-w-xs mx-auto leading-relaxed">
                          Status:{" "}
                          <strong className="text-[#22623a]">
                            Awaiting confirmation
                          </strong>{" "}
                          — Hakim Tahir Hameed&apos;s team will confirm your
                          slot on WhatsApp or phone. Keep your ticket to check
                          updates anytime.
                        </p>
                        {bookingSuccess.appointmentDate && (
                          <p className="text-[11px] text-[#44403c] bg-white border border-[#e6dfd5] rounded-lg px-2.5 py-1.5 inline-flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#22623a] shrink-0" />
                            <span>
                              {bookingSuccess.appointmentDate}
                              {bookingSuccess.appointmentSlot
                                ? ` · ${bookingSuccess.appointmentSlot}`
                                : ""}
                            </span>
                          </p>
                        )}
                        <div className="flex items-center justify-center gap-3 text-[11px] font-semibold">
                          <Link
                            href={`/track-order?ref=${encodeURIComponent(
                              bookingSuccess.ticketNumber
                            )}`}
                            onClick={handleClose}
                            className="text-[#22623a] underline underline-offset-2 hover:text-[#1a4d2e]"
                          >
                            Track this booking
                          </Link>
                          {sessionData?.user && (
                            <Link
                              href="/account"
                              onClick={handleClose}
                              className="text-[#22623a] underline underline-offset-2 hover:text-[#1a4d2e]"
                            >
                              View in My Account
                            </Link>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleClose}
                        className="w-full h-10 bg-[#22623a] text-white text-xs font-bold rounded-xl hover:bg-[#1a4d2e] cursor-pointer"
                      >
                        Done / Close
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handlePhysicalSubmit} className="space-y-2.5">
                      {errorMessage && (
                        <div className="p-2 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-700 flex items-center gap-2">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errorMessage}</span>
                        </div>
                      )}

                      {/* Patient Name and Mandatory Email in 2 columns */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-0.5">
                          <label className="text-[11px] font-semibold text-[#1a1816]">
                            Patient Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <User className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              required
                              value={clinicName}
                              onChange={(e) => setClinicName(e.target.value)}
                              placeholder="e.g. Tahir Hameed"
                              className="w-full text-xs pl-8 pr-2.5 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <label className="text-[11px] font-semibold text-[#1a1816]">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="email"
                              required
                              value={clinicEmail}
                              onChange={(e) => setClinicEmail(e.target.value)}
                              placeholder="you@example.com"
                              className="w-full text-xs pl-8 pr-2.5 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Optional WhatsApp / Phone */}
                      <div className="space-y-0.5">
                        <label className="text-[11px] font-semibold text-[#1a1816]">
                          WhatsApp / Phone{" "}
                          <span className="text-[#8c827a] font-normal">
                            (optional)
                          </span>
                        </label>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="tel"
                            value={clinicPhone}
                            onChange={(e) => setClinicPhone(e.target.value)}
                            placeholder="0300-1234567"
                            className="w-full text-xs pl-8 pr-2.5 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white"
                          />
                        </div>
                      </div>

                      {/* Appointment Date and Available Time Slot */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-0.5">
                          <label className="text-[11px] font-semibold text-[#1a1816]">
                            Appointment Date
                          </label>
                          <div className="relative">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="date"
                              min={toDateInputValue(new Date())}
                              value={clinicDate}
                              onChange={(e) => {
                                setClinicDate(e.target.value);
                                setClinicSlot("");
                              }}
                              className="w-full text-xs pl-8 pr-2 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a]"
                            />
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <label className="text-[11px] font-semibold text-[#1a1816]">
                            Time Slot
                          </label>
                          <div className="relative">
                            <Clock className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <select
                              value={clinicSlot}
                              onChange={(e) => setClinicSlot(e.target.value)}
                              disabled={
                                availabilityLoading ||
                                !clinicAvailability?.isOpen
                              }
                              className="w-full text-xs pl-8 pr-2 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a] disabled:opacity-60"
                            >
                              {availabilityLoading ? (
                                <option value="">Loading slots…</option>
                              ) : !clinicAvailability?.isOpen ? (
                                <option value="">Clinic closed</option>
                              ) : (
                                <>
                                  <option value="">Select a time…</option>
                                  {clinicAvailability.slots.map((slot: any) => (
                                    <option
                                      key={slot.slot}
                                      value={slot.slot}
                                      disabled={!slot.available}
                                    >
                                      {slot.slot}
                                      {slot.available ? "" : " — Booked"}
                                    </option>
                                  ))}
                                </>
                              )}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Availability status */}
                      {availabilityError && (
                        <p className="text-[10px] text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          {availabilityError}
                        </p>
                      )}
                      {!availabilityLoading &&
                        clinicAvailability &&
                        !clinicAvailability.isOpen && (
                          <p className="text-[10px] text-amber-700 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            {clinicAvailability.isHoliday
                              ? `Clinic is closed on this date (${
                                  clinicAvailability.holidayReason || "holiday"
                                }). Please pick another day.`
                              : `Clinic is closed on ${clinicAvailability.dayName}s. Please pick a Monday–Saturday date.`}
                          </p>
                        )}
                      {!availabilityLoading &&
                        clinicAvailability?.isOpen &&
                        clinicAvailability.slots.every(
                          (slot: any) => !slot.available
                        ) && (
                          <p className="text-[10px] text-amber-700 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            All slots for this day are booked. Please pick
                            another date.
                          </p>
                        )}

                      {/* Clinic Location Pill */}
                      <div className="px-3 py-1.5 bg-[#faf8f5] rounded-xl border border-[#e6dfd5] text-[10px] text-[#59534b] flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#22623a] shrink-0" />
                        <span className="truncate">
                          Matab Tameer-e-Sehat · Plot L-41 Korangi Crossing Rd, Karachi
                        </span>
                      </div>

                      {/* Fixed height submit button with centered spinner prevents layout jumps */}
                      <button
                        type="submit"
                        disabled={submitting || availabilityLoading || !clinicSlot}
                        className="w-full h-11 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-[#c59b27] shrink-0" />
                            <span>Submitting Booking Request...</span>
                          </>
                        ) : (
                          <>
                            <Calendar className="w-4 h-4 text-[#c59b27] shrink-0" />
                            <span>Request Clinic Appointment</span>
                          </>
                        )}
                      </button>

                      <p className="text-[10px] text-center text-[#6a6660] leading-relaxed">
                        You receive a ticket instantly. The clinic confirms your
                        slot on WhatsApp or phone — track its status anytime.
                      </p>

                      {/* Back Navigation Button */}
                      <div className="pt-2 border-t border-[#f4eee5] flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#59534b] hover:text-[#1a1816] transition-colors cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Back to Step 2 (Channel)</span>
                        </button>

                        <span className="text-[10px] text-[#8c827a]">
                          Step 3 of 3
                        </span>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
