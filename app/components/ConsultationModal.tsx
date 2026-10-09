"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { CLINIC_INFO } from "@/app/data/products";
import { useSession } from "@/lib/auth-client";
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
  Mic,
  Square,
  Paperclip,
  FileText,
  Trash2,
  Volume2,
  Calendar,
  Phone,
  Clock,
  MapPin,
  Play,
  Pause,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConcern?: string;
  initialMessage?: string;
  initialMode?: "WHATSAPP" | "PHYSICAL";
}

const QUICK_SYMPTOM_TAGS = [
  "Stomach Acidity / Gas",
  "Joint & Knee Pain",
  "Fatty Liver / Body Heat",
  "Vitality & Energy",
  "Hair Fall & Scalp",
  "Chronic Cough / Allergies",
];

export default function ConsultationModal({
  isOpen,
  onClose,
  initialConcern = "",
  initialMessage = "",
  initialMode = "WHATSAPP",
}: ConsultationModalProps) {
  const [mounted, setMounted] = useState(false);
  let sessionData: any = null;
  try {
    const sessionRes = useSession?.();
    sessionData = sessionRes?.data;
  } catch {
    // Graceful fallback if auth provider is not active
  }

  const [mode, setMode] = useState<"WHATSAPP" | "PHYSICAL">(initialMode);
  const [symptomText, setSymptomText] = useState(initialMessage || initialConcern);

  // ── Voice Recording & Speech Recognition State ──
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const speechRecognitionRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // ── Report / Photo File Attachment State ──
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    size: string;
    type: string;
    previewUrl?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clinic physical appointment fields
  const [clinicName, setClinicName] = useState(sessionData?.user?.name || "");
  const [clinicPhone, setClinicPhone] = useState((sessionData?.user as any)?.phone || "");
  const [clinicDate, setClinicDate] = useState("Tomorrow");
  const [clinicSlot, setClinicSlot] = useState("Evening (05:00 PM - 09:00 PM)");
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialMessage || initialConcern) {
      setSymptomText(initialMessage || initialConcern);
    }
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMessage, initialConcern, initialMode, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

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

  // Clean up recording state on modal close or unmount
  useEffect(() => {
    if (!isOpen) {
      if (isRecording) stopRecording();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {}
      }
      if (audioBlobUrl) {
        URL.revokeObjectURL(audioBlobUrl);
      }
    };
  }, [audioBlobUrl]);

  const startRecording = async () => {
    setVoiceNotice(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (audioBlobUrl) URL.revokeObjectURL(audioBlobUrl);
        const url = URL.createObjectURL(audioBlob);
        setAudioBlobUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "ur-PK";

        recognition.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript.trim()) {
            setSymptomText((prev) => {
              const base = prev.trim();
              if (!base) return transcript.trim();
              if (base.endsWith(transcript.trim())) return base;
              return `${base} ${transcript.trim()}`;
            });
          }
        };

        try {
          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch {}
      }
    } catch (err: any) {
      console.warn("Audio recording error:", err);
      setVoiceNotice("Microphone permission needed. You can also send voice notes directly on WhatsApp.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsRecording(false);
  };

  const deleteVoiceRecording = () => {
    if (audioBlobUrl) {
      URL.revokeObjectURL(audioBlobUrl);
    }
    setAudioBlobUrl(null);
    setRecordingDuration(0);
    setIsPlayingAudio(false);
  };

  const togglePlayAudio = () => {
    if (!audioBlobUrl) return;
    if (!audioElementRef.current) {
      const audio = new Audio(audioBlobUrl);
      audio.onended = () => setIsPlayingAudio(false);
      audioElementRef.current = audio;
    }

    if (isPlayingAudio) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioElementRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    });
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
      setSymptomText(symptomText.replace(tag, "").replace(/,\s*,/g, ",").replace(/^,\s*|,\s*$/g, "").trim());
    } else {
      setSymptomText(`${symptomText.trim()}, ${tag}`);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const getWhatsAppUrl = () => {
    let message = "*Assalam-o-Alaikum Hakim Sahib (Tameer-e-Sehat Consultation)*\n\n";

    if (symptomText.trim()) {
      message += `*My Health Concern:*\n${symptomText.trim()}\n\n`;
    } else {
      message += `*Health Consultation Inquiry*\n_I would like to consult with you regarding herbal treatment options._\n\n`;
    }

    if (audioBlobUrl) {
      message += `🎙️ *Voice Note Recorded:* (${formatTimer(recordingDuration)} memo ready - sending audio note in chat)\n`;
    }

    if (attachedFile) {
      message += `📄 *Medical Report/Photo:* ${attachedFile.name} (${attachedFile.size}) - (Attaching file in WhatsApp)\n`;
    }

    message += `\n_Please review my symptoms and provide your authentic Unani guidance._`;

    return `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  const handlePhysicalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: clinicName,
          phone: clinicPhone,
          city: "Karachi",
          primarySymptoms: `[In-Person Karachi Clinic Booking - ${clinicDate} ${clinicSlot}] Details: ${symptomText.trim() || "General Consultation"}`,
          age: 35,
          gender: "Not Specified",
          duration: "New Visit",
          preferredContact: "PHONE",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to reserve slot.");
      }

      setBookingSuccess(json.data);
    } catch (err: any) {
      setErrorMessage(err.message || "Could not reserve clinic slot. Please call or WhatsApp us.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#e6dfd5] overflow-hidden max-h-[92vh] flex flex-col z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#22623a] text-white p-5 sm:p-6 flex items-start justify-between relative shrink-0">
              <div className="space-y-1 pr-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#143e23] text-[#c59b27] text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  <span>Free Consultation · Bila-Muawza</span>
                </div>
                <h3 className="font-serif text-lg sm:text-xl font-bold">
                  Consult Hakim Muhammad Tariq
                </h3>
                <p className="text-xs text-[#f4eee5]/80 leading-relaxed">
                  Direct herbal diagnosis on WhatsApp or book an in-person Karachi clinic visit.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="px-5 sm:px-6 pt-4 shrink-0">
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#faf8f5] rounded-xl border border-[#e6dfd5]">
                <button
                  type="button"
                  onClick={() => {
                    setMode("WHATSAPP");
                    setBookingSuccess(null);
                  }}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === "WHATSAPP"
                      ? "bg-[#22623a] text-white shadow-xs"
                      : "text-[#59534b] hover:text-[#1a1816]"
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>WhatsApp Chat</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("PHYSICAL");
                    setBookingSuccess(null);
                  }}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === "PHYSICAL"
                      ? "bg-[#22623a] text-white shadow-xs"
                      : "text-[#59534b] hover:text-[#1a1816]"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-[#c59b27]" />
                  <span>Karachi Clinic Visit</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div data-lenis-prevent className="p-5 sm:p-6 overflow-y-auto space-y-4">
              {mode === "WHATSAPP" ? (
                /* Mode A: Fast WhatsApp Free Input Consultation */
                <div className="space-y-4">

                  {/* Input & Voice Controls Container */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#22623a] uppercase tracking-wider block">
                        Describe your symptoms:
                      </label>

                      {/* Micro Actions */}
                      <div className="flex items-center gap-2">
                        {!isRecording ? (
                          <button
                            type="button"
                            onClick={startRecording}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#eef7f1] hover:bg-[#d8edd0] text-[#22623a] border border-[#cde4d6] text-[11px] font-semibold transition-all cursor-pointer"
                            title="Speak your symptoms"
                          >
                            <Mic className="w-3 h-3 text-[#22623a]" />
                            <span>Record Voice</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={stopRecording}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-600 text-white text-[11px] font-bold transition-all animate-pulse cursor-pointer"
                          >
                            <Square className="w-2.5 h-2.5 fill-current" />
                            <span>Stop ({formatTimer(recordingDuration)})</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#faf8f5] hover:bg-[#f4eee5] text-[#59534b] border border-[#e6dfd5] text-[11px] font-semibold transition-all cursor-pointer"
                        >
                          <Paperclip className="w-3 h-3 text-[#8c6a15]" />
                          <span>Attach</span>
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

                    {/* Textarea with active recording overlay */}
                    <div className="relative">
                      <textarea
                        rows={3}
                        value={symptomText}
                        onChange={(e) => setSymptomText(e.target.value)}
                        placeholder="e.g. Chronic stomach burning for 6 months, knee joint stiffness when climbing stairs, or fatigue..."
                        className="w-full text-xs sm:text-sm p-3.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] placeholder:text-[#8c827a] focus:outline-none focus:border-[#22623a] focus:bg-white resize-none transition-colors"
                      />

                      {isRecording && (
                        <div className="absolute inset-0 bg-[#22623a]/90 backdrop-blur-xs rounded-xl flex items-center justify-between px-4 text-white">
                          <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                            <div>
                              <p className="text-xs font-bold">Listening &amp; Recording Voice Note...</p>
                              <p className="text-[10px] text-white/80">Speak naturally in Urdu or English</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={stopRecording}
                            className="px-3 py-1 bg-white text-[#22623a] text-xs font-bold rounded-lg shadow-sm hover:bg-gray-100 cursor-pointer"
                          >
                            Done ({formatTimer(recordingDuration)})
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Voice Note Ready Preview */}
                  {audioBlobUrl && !isRecording && (
                    <div className="p-2.5 bg-[#eef7f1] rounded-xl border border-[#cde4d6] flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-[#22623a] font-medium min-w-0">
                        <Volume2 className="w-4 h-4 text-[#22623a] shrink-0" />
                        <span className="truncate">
                          Voice Note Ready ({formatTimer(recordingDuration)})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={togglePlayAudio}
                          className="p-1.5 rounded-lg bg-[#22623a] text-white hover:bg-[#1a4d2e] cursor-pointer"
                          title={isPlayingAudio ? "Pause" : "Play"}
                        >
                          {isPlayingAudio ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={deleteVoiceRecording}
                          className="p-1.5 rounded-lg bg-white text-red-600 border border-red-200 hover:bg-red-50 cursor-pointer"
                          title="Delete voice note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Attached File Preview */}
                  {attachedFile && (
                    <div className="p-2.5 bg-[#fdfbf7] rounded-xl border border-[#e6dfd5] flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-[#f4eee5] text-[#8c6a15] flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#1a1816] truncate">
                            {attachedFile.name}
                          </p>
                          <p className="text-[10px] text-[#6a6660]">
                            {attachedFile.size} · Attached for consultation
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={removeAttachedFile}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {voiceNotice && (
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{voiceNotice}</span>
                    </div>
                  )}

                  {/* Quick Select Tags */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-[#6a6660] block">
                      Or tap quick common concerns:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_SYMPTOM_TAGS.map((tag) => {
                        const isSelected = symptomText.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleTagClick(tag)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
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

                  {/* Action Button */}
                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="w-full py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                  >
                    <MessageCircle className="w-4.5 h-4.5" />
                    <span>Send to Hakim on WhatsApp</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>

                  {/* Trust Footer */}
                  <div className="text-center pt-1">
                    <span className="text-[11px] text-[#7a7268] inline-flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#22623a]" />
                      100% Free · Strictly Confidential · 2–4 Hr Response
                    </span>
                  </div>
                </div>
              ) : (
                /* Mode B: Physical Clinic Visit */
                <div className="space-y-4">
                  {bookingSuccess ? (
                    <div className="text-center space-y-3 py-4">
                      <div className="w-12 h-12 rounded-full bg-[#22623a] text-white flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <h4 className="font-serif text-lg font-bold text-[#22623a]">
                        Appointment Slot Reserved!
                      </h4>
                      <p className="text-xs text-[#59534b]">
                        Ticket: <strong className="font-mono text-[#22623a]">{bookingSuccess.ticketNumber}</strong>
                      </p>
                      <p className="text-xs text-[#6a6660] max-w-xs mx-auto">
                        We look forward to seeing you at Matab Tameer-e-Sehat in Korangi, Karachi. Please arrive during your chosen slot.
                      </p>
                      <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-2.5 bg-[#22623a] text-white text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handlePhysicalSubmit} className="space-y-3.5">
                      {errorMessage && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{errorMessage}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-[#1a1816]">
                            Your Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={clinicName}
                            onChange={(e) => setClinicName(e.target.value)}
                            placeholder="e.g. Tariq Mehmood"
                            className="w-full text-xs px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-[#1a1816]">
                            WhatsApp / Phone <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={clinicPhone}
                            onChange={(e) => setClinicPhone(e.target.value)}
                            placeholder="0300-1234567"
                            className="w-full text-xs px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-[#1a1816]">
                            Preferred Day
                          </label>
                          <select
                            value={clinicDate}
                            onChange={(e) => setClinicDate(e.target.value)}
                            className="w-full text-xs px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a]"
                          >
                            <option value="Today">Today</option>
                            <option value="Tomorrow">Tomorrow</option>
                            <option value="This Saturday">This Saturday</option>
                            <option value="Next Week">Next Week</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-[#1a1816]">
                            Time Slot
                          </label>
                          <select
                            value={clinicSlot}
                            onChange={(e) => setClinicSlot(e.target.value)}
                            className="w-full text-xs px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a]"
                          >
                            <option value="Morning (10:00 AM - 02:00 PM)">Morning (10am–2pm)</option>
                            <option value="Evening (05:00 PM - 09:00 PM)">Evening (5pm–9pm)</option>
                          </select>
                        </div>
                      </div>

                      {/* Symptoms for clinic visit */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#1a1816]">
                          Primary Health Concern / Reason for Visit
                        </label>
                        <input
                          type="text"
                          value={symptomText}
                          onChange={(e) => setSymptomText(e.target.value)}
                          placeholder="e.g. Joint pain, stomach burning, pulse diagnosis"
                          className="w-full text-xs px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white"
                        />
                      </div>

                      {/* Clinic Info Note */}
                      <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#e6dfd5] text-[11px] text-[#59534b] space-y-0.5">
                        <p className="font-bold text-[#22623a]">Clinic: Korangi Crossing Rd, Karachi</p>
                        <p>Walk-ins welcome · Pulse diagnosis (Nabz) available on-the-spot.</p>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Reserving Slot...</span>
                          </>
                        ) : (
                          <>
                            <Calendar className="w-4 h-4 text-[#c59b27]" />
                            <span>Confirm Clinic Reservation</span>
                          </>
                        )}
                      </button>
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
