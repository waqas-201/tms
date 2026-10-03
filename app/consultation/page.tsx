"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CLINIC_INFO } from "@/app/data/products";
import { useSession } from "@/lib/auth-client";
import {
  Sparkles,
  MessageCircle,
  ShieldCheck,
  Clock,
  Phone,
  CheckCircle2,
  Loader2,
  AlertCircle,
  MapPin,
  HeartHandshake,
  Activity,
  Flame,
  Zap,
  Lock,
  ArrowRight,
  ArrowLeft,
  Calendar as CalendarIcon,
  RotateCcw,
  PlusCircle,
  HeartPulse,
  Mail,
  Video,
  Building2,
  User,
  Info,
  ChevronRight,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "@/app/components/motion/Reveal";

interface SymptomCategory {
  id: string;
  title: string;
  urduTitle: string;
  subtitle: string;
  symptoms: string[];
  icon: typeof Activity;
  whatsappMessage: string;
}

const COMMON_CUSTOM_SUGGESTIONS = [
  { label: "Kidney Stones (گردے کی پتھری)", urdu: "گردے کی پتھری اور پیشاب کی جلن" },
  { label: "Diabetes Support (شوگر)", urdu: "ذیابیطس اور شوگر کنٹرول" },
  { label: "Blood Pressure (بلڈ پریشر)", urdu: "بلڈ پریشر اور دل کی صحت" },
  { label: "Asthma & Cough (دمہ اور نزلہ)", urdu: "دمہ، دائمی نزلہ اور کھانسی" },
  { label: "Migraine & Sinus (درد شقیقہ)", urdu: "آدھے سر کا درد اور سائنس" },
  { label: "Thyroid & Hormones (تھائرائڈ)", urdu: "تھائرائڈ اور ہارمونل توازن" },
  { label: "Weight & Obesity (موٹاپا)", urdu: "موٹاپا اور چربی پگھلانا" },
  { label: "Piles / Hemorrhoids (بواسیر)", urdu: "بواسیر اور مقعد کی جلن" },
];

const SYMPTOM_CATEGORIES: SymptomCategory[] = [
  {
    id: "stomach",
    title: "Stomach, Gas & Digestion",
    urduTitle: "معدہ، گیس اور تیزابیت",
    subtitle: "Bloating, acid reflux, burning, constipation & IBS",
    symptoms: ["Gas & Bloating", "Acid Burning (Seene ki jalan)", "Constipation (Qabz)", "IBS & Heaviness"],
    icon: Flame,
    whatsappMessage: "Assalam-o-Alaikum Hakim Sahib, I am experiencing stomach digestion/gas/acidity issues and would like your herbal guidance.",
  },
  {
    id: "joints",
    title: "Joints, Knees & Back Pain",
    urduTitle: "جوڑوں، گھٹنوں اور کمر کا درد",
    subtitle: "Stiff knees, swelling, arthritis, sciatica & backache",
    symptoms: ["Knee pain & stiffness", "Lower backache", "Uric acid & swelling", "Muscle tiredness"],
    icon: Activity,
    whatsappMessage: "Assalam-o-Alaikum Hakim Sahib, I am suffering from joint/knee/back pain and need your advice on natural remedies.",
  },
  {
    id: "vitality",
    title: "Energy & Nervous Vitality",
    urduTitle: "طاقت اور اعصابی کمزوری",
    subtitle: "Chronic fatigue, low stamina, brain fog & weakness",
    symptoms: ["Everyday exhaustion", "Nervous weakness (Asabi kamzori)", "Brain fog", "Low stamina"],
    icon: Zap,
    whatsappMessage: "Assalam-o-Alaikum Hakim Sahib, I feel constant fatigue and weakness. Please guide me on restorative herbal tonics.",
  },
  {
    id: "liver",
    title: "Liver Health & Metabolism",
    urduTitle: "جگر اور میٹابولزم",
    subtitle: "Fatty liver, body heat, sluggish metabolism & appetite loss",
    symptoms: ["Fatty liver discomfort", "Body heat (Jigar ki garmi)", "Loss of appetite", "Jaundice recovery"],
    icon: HeartHandshake,
    whatsappMessage: "Assalam-o-Alaikum Hakim Sahib, I need guidance regarding liver health / body heat (Jigar ki garmi).",
  },
  {
    id: "skin-hair",
    title: "Skin, Hair & Allergies",
    urduTitle: "جلد، بال اور الرجی",
    subtitle: "Hair thinning, scalp dandruff, dry eczema & acne",
    symptoms: ["Hair fall & weak roots", "Chronic dandruff", "Acne & skin heat", "Dry eczema"],
    icon: Sparkles,
    whatsappMessage: "Assalam-o-Alaikum Hakim Sahib, I would like consultation regarding hair fall / skin health.",
  },
  {
    id: "private",
    title: "Confidential Personal Wellness",
    urduTitle: "مخصوص پوشیدہ طبی رہنمائی",
    subtitle: "100% private discussion for personal health concerns",
    symptoms: ["Men's vitality", "Women's hormonal balance", "Strictly private", "Direct Hakim consultation"],
    icon: Lock,
    whatsappMessage: "Assalam-o-Alaikum Hakim Sahib, I would like to have a strictly confidential private consultation.",
  },
];

interface TimeSlot {
  slot: string;
  startTime: string;
  endTime: string;
  available: boolean;
  capacityRemaining: number;
  maxCapacity: number;
  bookedCount: number;
}

export default function ConsultationPage() {
  const { data: sessionData } = useSession();

  // Stepper State (1: Concern, 2: Channel, 3: Booking Form, 4: Confirmed)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCategory, setSelectedCategory] = useState<SymptomCategory>(SYMPTOM_CATEGORIES[0]);

  // Custom Condition State
  const [isCustomExpanded, setIsCustomExpanded] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customUrdu, setCustomUrdu] = useState("");
  const [customDetails, setCustomDetails] = useState("");
  const [customError, setCustomError] = useState<string | null>(null);

  // Appointment Booking State
  const [consultationType, setConsultationType] = useState<"ONLINE" | "IN_PERSON">("ONLINE");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [dateAvailabilityInfo, setDateAvailabilityInfo] = useState<any>(null);

  // Patient Form Fields
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    city: "Karachi",
    age: "35",
    gender: "Male",
    duration: "1 to 3 Months",
    previousTreatments: "",
    currentMedications: "",
    digestiveState: "Normal",
    sleepEnergyState: "Normal",
    additionalNotes: "",
  });

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<any | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // FAQ open states
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Generate next 14 days dates list
  const next14Days = React.useMemo(() => {
    const days: { dateStr: string; dayName: string; formatted: string; isSunday: boolean }[] = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const date = String(d.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${date}`;
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const formatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      days.push({
        dateStr,
        dayName: i === 0 ? "Today" : i === 1 ? "Tmrw" : dayName,
        formatted,
        isSunday: d.getDay() === 0,
      });
    }
    return days;
  }, []);

  // Set default initial date to today or tomorrow if Sunday
  useEffect(() => {
    if (!selectedDate && next14Days.length > 0) {
      const firstActive = next14Days.find((d) => !d.isSunday) || next14Days[0];
      setSelectedDate(firstActive.dateStr);
    }
  }, [next14Days, selectedDate]);

  // Pre-fill user details when logged in
  useEffect(() => {
    if (sessionData?.user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || sessionData.user.name || "",
        email: prev.email || sessionData.user.email || "",
        phone: prev.phone || (sessionData.user as any)?.phone || "",
        city: prev.city || (sessionData.user as any)?.city || "Karachi",
      }));
    }
  }, [sessionData]);

  // Fetch slots whenever selectedDate changes
  const fetchSlotsForDate = useCallback(async (dateStr: string) => {
    setSlotsLoading(true);
    setSelectedSlot("");
    try {
      const res = await fetch(`/api/consultations/availability?date=${dateStr}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setDateAvailabilityInfo(json.data);
        setAvailableSlots(json.data.slots || []);
        // Auto-select first available slot if any
        const firstAvail = (json.data.slots || []).find((s: TimeSlot) => s.available);
        if (firstAvail) {
          setSelectedSlot(firstAvail.slot);
        }
      } else {
        setAvailableSlots([]);
        setDateAvailabilityInfo(null);
      }
    } catch {
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDate && currentStep === 3) {
      fetchSlotsForDate(selectedDate);
    }
  }, [selectedDate, currentStep, fetchSlotsForDate]);

  const handleSelectCategory = (cat: SymptomCategory) => {
    setIsCustomExpanded(false);
    setSelectedCategory(cat);
    setCurrentStep(2);
  };

  const handleSelectSuggestion = (sug: { label: string; urdu: string }) => {
    setCustomTitle(sug.label);
    setCustomUrdu(sug.urdu);
    setCustomError(null);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) {
      setCustomError("Please enter your health condition or choose a suggestion below.");
      return;
    }

    const cleanTitle = customTitle.trim();
    const cleanUrdu = customUrdu.trim() || "دیگر طبی مسئلہ";
    const cleanDetails = customDetails.trim();

    const customCategory: SymptomCategory = {
      id: "custom",
      title: cleanTitle,
      urduTitle: cleanUrdu,
      subtitle: cleanDetails || "Patient-specified custom health concern",
      symptoms: [cleanTitle, ...(cleanDetails ? [cleanDetails] : [])],
      icon: HeartPulse,
      whatsappMessage: `Assalam-o-Alaikum Hakim Sahib, I need herbal guidance regarding: ${cleanTitle}.${cleanDetails ? ` Additional symptoms/notes: ${cleanDetails}` : ""}`,
    };

    setSelectedCategory(customCategory);
    setCustomError(null);
    setCurrentStep(2);
  };

  const getWhatsAppUrl = () => {
    const concernDetail =
      selectedCategory.id === "custom" && customDetails.trim()
        ? `${selectedCategory.title} (${customDetails.trim()})`
        : selectedCategory.title;

    const text =
      `*Assalam-o-Alaikum Hakim Muhammad Tariq Sahib (Tameer-e-Sehat)*\n\n` +
      `*Primary Health Concern:* ${concernDetail} (${selectedCategory.urduTitle})\n` +
      `*Consultation Mode:* Instant WhatsApp Consultation\n` +
      `*Inquiry:* ${selectedCategory.whatsappMessage}\n\n` +
      `_I would like your herbal guidance, pulse evaluation, and authentic Unani remedy recommendations. JazakAllah._`;
    return `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  const handleAppointmentBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmissionError(null);

    try {
      if (!formData.fullName.trim() || !formData.phone.trim() || !formData.email.trim()) {
        throw new Error("Please provide your full name, phone number, and email address.");
      }

      if (!selectedSlot) {
        throw new Error("Please select an available appointment time slot.");
      }

      const concernDetail =
        selectedCategory.id === "custom" && customDetails.trim()
          ? `${selectedCategory.title} (${customDetails.trim()})`
          : selectedCategory.title;

      const fullSymptoms =
        `[${consultationType === "ONLINE" ? "Online Telehealth" : "In-Person Clinic Visit"}] ` +
        `Concern: ${concernDetail}. ` +
        (formData.additionalNotes ? `Notes: ${formData.additionalNotes.trim()}` : "");

      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          city: formData.city.trim(),
          age: Number(formData.age) || 35,
          gender: formData.gender,
          primarySymptoms: fullSymptoms,
          duration: formData.duration,
          previousTreatments: formData.previousTreatments || null,
          currentMedications: formData.currentMedications || null,
          digestiveState: formData.digestiveState || null,
          sleepEnergyState: formData.sleepEnergyState || null,
          channel: "EMAIL",
          consultationType,
          appointmentDate: selectedDate,
          appointmentSlot: selectedSlot,
          preferredContact: "EMAIL",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to book appointment.");
      }

      setSubmissionSuccess(json.data);
      setCurrentStep(4);
    } catch (err: any) {
      setSubmissionError(err.message || "An error occurred while booking your appointment.");
    } finally {
      setSubmitting(false);
    }
  };

  const FAQS = [
    {
      q: "What is the difference between WhatsApp and Email Appointment Booking?",
      a: "Instant WhatsApp connects you immediately to Hakim Sahib for real-time voice notes, chat, and quick photo/report sharing. Email Appointment Booking reserves a dedicated clinical time slot (Online Telehealth or Physical Clinic Visit in Karachi), sends an official ticket with confirmation emails, and locks your appointment in the clinic ledger.",
    },
    {
      q: "Is the consultation with Hakim Sahib really 100% free?",
      a: "Yes. In authentic Eastern Tibb tradition, pulse diagnosis, symptom evaluation, and initial lifestyle/dietary guidance are completely free (Bila-Muawza). You only pay if you decide to purchase specific prepared botanical remedies.",
    },
    {
      q: "Where is your physical clinic located in Karachi?",
      a: `Our physical dispensary & Matab is at ${CLINIC_INFO.address}. Walk-ins for pulse diagnosis (Nabz) and booked in-person patients are welcome during clinical hours (10:00 AM – 09:00 PM, Mon to Sat).`,
    },
    {
      q: "Can I send medical test reports or previous prescriptions?",
      a: "Yes! You can reply directly to your appointment confirmation email with scanned test reports or send voice notes and ultrasound images on WhatsApp quoting your ticket reference.",
    },
    {
      q: "Do your remedies contain any steroids, chemicals, or additives?",
      a: "Never. All Tameer-e-Sehat compounds are 100% pure plant botanicals, natural hydro-distillates (Arqiyaat), and herbal preserves (Majoon/Khamira) compounded according to classical Unani pharmacology.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1816]">
      {/* ─── 1. Wizard Section (Centered, high-focus single viewport) ─── */}
      <section className="pt-6 sm:pt-10 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Wizard Container Card */}
        <div className="bg-white rounded-3xl border border-[#e6dfd5] shadow-xl overflow-hidden">

          {/* Stepper Progress Header */}
          <div className="bg-[#14281D] text-white p-5 sm:p-6 relative">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e3d2c] border border-[#2d5c43] text-[11px] font-bold text-[#c59b27] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Free Consultation · Bila-Muawza</span>
              </div>

              {currentStep > 1 && currentStep < 4 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#f4eee5] hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous Step</span>
                </button>
              )}
            </div>

            <div className="space-y-1">
              <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold">
                {currentStep === 1 && "Step 1: Select Your Health Concern"}
                {currentStep === 2 && "Step 2: Choose Consultation Channel"}
                {currentStep === 3 && "Step 3: Schedule Appointment & Details"}
                {currentStep === 4 && "Appointment Confirmed & Ticket Issued"}
              </h1>
              <p className="text-xs sm:text-sm text-[#f4eee5]/80">
                {currentStep === 1 && "Tap your condition below for personalized Unani guidance"}
                {currentStep === 2 && `Selected: ${selectedCategory.title} · Choose between Instant WhatsApp or Email Appointment`}
                {currentStep === 3 && "Select your preferred date, available clinical hours, and patient information"}
                {currentStep === 4 && "Your clinical dossier is booked. Check your email for full confirmation"}
              </p>
            </div>

            {/* Step Progress Indicators */}
            <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/15">
              <div className="space-y-1.5">
                <div className={`h-1.5 rounded-full transition-all ${currentStep >= 1 ? "bg-[#c59b27]" : "bg-white/20"}`} />
                <span className="text-[10px] sm:text-[11px] font-semibold text-[#f4eee5]/90 block truncate">
                  1. Health Issue
                </span>
              </div>
              <div className="space-y-1.5">
                <div className={`h-1.5 rounded-full transition-all ${currentStep >= 2 ? "bg-[#c59b27]" : "bg-white/20"}`} />
                <span className="text-[10px] sm:text-[11px] font-semibold text-[#f4eee5]/90 block truncate">
                  2. Channel Choice
                </span>
              </div>
              <div className="space-y-1.5">
                <div className={`h-1.5 rounded-full transition-all ${currentStep >= 3 ? "bg-[#c59b27]" : "bg-white/20"}`} />
                <span className="text-[10px] sm:text-[11px] font-semibold text-[#f4eee5]/90 block truncate">
                  3. Slot &amp; Details
                </span>
              </div>
            </div>
          </div>

          {/* Wizard Body with Animated Step Switcher */}
          <div className="p-5 sm:p-8">
            <AnimatePresence mode="wait">

              {/* ─────────────────────────────────────────────────────────────
                  STEP 1: Health Concern Selection
                 ───────────────────────────────────────────────────────────── */}
              {currentStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <p className="text-xs font-bold text-[#8c6a15] uppercase tracking-wider">
                      Please select your condition:
                    </p>
                    <p className="text-xs text-[#6a6660] mt-0.5">
                      Choose from our common Unani specialties or specify your custom concern below.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {SYMPTOM_CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = selectedCategory.id === cat.id && !isCustomExpanded;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleSelectCategory(cat)}
                          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between relative ${
                            isSelected
                              ? "border-[#14281D] bg-emerald-50/50 shadow-md ring-2 ring-[#14281D]/20"
                              : "border-[#e6dfd5] bg-[#faf8f5] hover:border-[#14281D]/60 hover:bg-white hover:shadow-sm"
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="w-9 h-9 rounded-xl bg-white border border-[#e6dfd5] flex items-center justify-center text-[#14281D] group-hover:bg-[#14281D] group-hover:text-white transition-colors shadow-xs">
                                <Icon className="w-5 h-5" />
                              </div>
                              <span className="font-serif text-sm font-semibold text-[#8c6a15] dir-rtl text-right">
                                {cat.urduTitle}
                              </span>
                            </div>

                            <div>
                              <h3 className="font-serif text-sm font-bold text-[#1a1816] group-hover:text-[#14281D] transition-colors">
                                {cat.title}
                              </h3>
                              <p className="text-[11px] text-[#6a6660] mt-0.5 line-clamp-2 leading-relaxed">
                                {cat.subtitle}
                              </p>
                            </div>
                          </div>

                          <div className="pt-3 mt-3 border-t border-[#e6dfd5]/60 flex items-center justify-between text-[11px] font-semibold text-[#14281D]">
                            <span>Select &amp; Proceed</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Condition Accordion */}
                  <div className="border border-[#e6dfd5] rounded-2xl p-4 sm:p-5 bg-white">
                    {!isCustomExpanded ? (
                      <button
                        type="button"
                        onClick={() => setIsCustomExpanded(true)}
                        className="w-full flex items-center justify-between text-left cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
                            <PlusCircle className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-[#1a1816] group-hover:text-[#14281D]">
                              Have another illness or specific diagnosis? (دیگر طبی مسئلہ)
                            </h4>
                            <p className="text-[11px] text-[#6a6660]">
                              Type your symptoms or select from common conditions.
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-[#14281D] underline shrink-0 ml-2">
                          Specify Custom
                        </span>
                      </button>
                    ) : (
                      <form onSubmit={handleCustomSubmit} className="space-y-3.5">
                        <div className="flex items-center justify-between pb-2 border-b border-[#e6dfd5]">
                          <span className="text-xs font-bold text-[#14281D] flex items-center gap-1.5">
                            <HeartPulse className="w-4 h-4" />
                            <span>Custom Health Issue (اپنا طبی مسئلہ درج کریں)</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsCustomExpanded(false)}
                            className="text-[11px] text-[#8c6a15] hover:underline"
                          >
                            Close
                          </button>
                        </div>

                        {customError && (
                          <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{customError}</span>
                          </div>
                        )}

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-[#1a1816]">
                            Health Issue / Diagnosis Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={customTitle}
                            onChange={(e) => setCustomTitle(e.target.value)}
                            placeholder="e.g. Kidney Stones, High Blood Pressure, Migraine..."
                            className="w-full px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D] focus:bg-white"
                          />
                        </div>

                        {/* Quick suggestions pills */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] text-[#6a6660] font-medium">Quick suggestions:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {COMMON_CUSTOM_SUGGESTIONS.map((sug) => (
                              <button
                                key={sug.label}
                                type="button"
                                onClick={() => handleSelectSuggestion(sug)}
                                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                                  customTitle === sug.label
                                    ? "bg-[#14281D] text-white border-[#14281D]"
                                    : "bg-[#faf8f5] text-[#44403C] border-[#e6dfd5] hover:border-[#14281D]"
                                }`}
                              >
                                {sug.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-[#1a1816]">
                            Briefly describe your symptoms (Optional)
                          </label>
                          <textarea
                            rows={2}
                            value={customDetails}
                            onChange={(e) => setCustomDetails(e.target.value)}
                            placeholder="How long have you had this? Any specific pain or severity..."
                            className="w-full px-3.5 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D] focus:bg-white resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 bg-[#14281D] hover:bg-[#1e3d2c] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                        >
                          <span>Proceed to Consultation Channels</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </form>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  STEP 2: Dual Consultation Channel Selector (WhatsApp vs Email)
                 ───────────────────────────────────────────────────────────── */}
              {currentStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#14281D] text-white flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-[#14281D] uppercase tracking-wider">
                          Selected Condition:
                        </span>
                        <h4 className="font-serif text-sm font-bold text-[#1a1816]">
                          {selectedCategory.title} ({selectedCategory.urduTitle})
                        </h4>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-semibold text-[#14281D] hover:underline shrink-0"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#1a1816]">
                      Choose Your Preferred Consultation Method:
                    </h3>
                    <p className="text-xs text-[#6a6660] mt-0.5">
                      Connect immediately via WhatsApp or schedule an official Email &amp; Time-Slot appointment.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* CHANNEL 1: Instant WhatsApp Consultation */}
                    <div className="p-6 rounded-3xl border-2 border-emerald-500 bg-white shadow-lg flex flex-col justify-between space-y-5 hover:border-emerald-600 transition-all relative overflow-hidden group">
                      <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-bl-xl">
                        Fastest · Instant Reply
                      </div>

                      <div className="space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                          <MessageCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-serif text-lg font-bold text-[#14281D]">
                            Instant WhatsApp Consultation
                          </h4>
                          <p className="text-xs font-semibold text-[#8c6a15] dir-rtl">
                            فوری واٹس ایپ رابطہ (براہِ راست حکیم صاحب)
                          </p>
                        </div>
                        <p className="text-xs text-[#59534b] leading-relaxed">
                          Connect directly with Hakim Muhammad Tariq. Send voice notes in your own words, share medical reports, or chat in real-time.
                        </p>
                        <ul className="space-y-1.5 text-xs text-[#44403C] pt-2">
                          <li className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Voice notes &amp; photo reports accepted</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>15 – 45 min response during clinic hours</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>100% Free pulse evaluation &amp; advice</span>
                          </li>
                        </ul>
                      </div>

                      <a
                        href={getWhatsAppUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer text-center"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Chat on WhatsApp Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>

                    {/* CHANNEL 2: Email & Appointment Booking */}
                    <div className="p-6 rounded-3xl border-2 border-[#14281D] bg-[#faf8f5] shadow-lg flex flex-col justify-between space-y-5 hover:border-[#1e3d2c] transition-all relative overflow-hidden group">
                      <div className="absolute top-0 right-0 px-3 py-1 bg-[#14281D] text-white text-[10px] font-bold uppercase tracking-wider rounded-bl-xl">
                        Official Scheduled Slot
                      </div>

                      <div className="space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#14281D]/10 text-[#14281D] flex items-center justify-center">
                          <CalendarIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-serif text-lg font-bold text-[#14281D]">
                            Email &amp; Appointment Booking
                          </h4>
                          <p className="text-xs font-semibold text-[#8c6a15] dir-rtl">
                            ای میل اور اپوائنٹمنٹ بکنگ (مقررہ وقت)
                          </p>
                        </div>
                        <p className="text-xs text-[#59534b] leading-relaxed">
                          Book a reserved time slot for Online Telehealth or In-Person Clinic Visit (Karachi). Receive official ticket and email confirmation.
                        </p>
                        <ul className="space-y-1.5 text-xs text-[#44403C] pt-2">
                          <li className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-[#14281D] shrink-0" />
                            <span>Choose available date &amp; clinical hours</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-[#14281D] shrink-0" />
                            <span>Online Telehealth or Physical Clinic visit</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-[#14281D] shrink-0" />
                            <span>Official ticket (`CON-2026-XXXX`) + email alerts</span>
                          </li>
                        </ul>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="w-full py-3.5 bg-[#14281D] hover:bg-[#1e3d2c] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer text-center"
                      >
                        <CalendarIcon className="w-4 h-4" />
                        <span>Schedule Appointment</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  STEP 3: Appointment Scheduling & Patient Dossier Form
                 ───────────────────────────────────────────────────────────── */}
              {currentStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Mode Selector Toggle */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#1a1816] uppercase tracking-wider">
                      1. Consultation Mode:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setConsultationType("ONLINE")}
                        className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                          consultationType === "ONLINE"
                            ? "border-[#14281D] bg-emerald-50/60 ring-2 ring-[#14281D]/20 shadow-sm"
                            : "border-[#e6dfd5] bg-[#faf8f5] hover:border-[#14281D]/60"
                        }`}
                      >
                        <div className="w-9 h-9 rounded-xl bg-white border border-[#e6dfd5] flex items-center justify-center text-[#14281D] shrink-0 mt-0.5">
                          <Video className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-[#14281D]">
                            Online Telehealth Consultation
                          </h4>
                          <p className="text-[11px] text-[#6a6660] mt-0.5">
                            Follow-up via Video/Audio call &amp; Email. For patients across Pakistan &amp; Overseas.
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setConsultationType("IN_PERSON")}
                        className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                          consultationType === "IN_PERSON"
                            ? "border-[#14281D] bg-emerald-50/60 ring-2 ring-[#14281D]/20 shadow-sm"
                            : "border-[#e6dfd5] bg-[#faf8f5] hover:border-[#14281D]/60"
                        }`}
                      >
                        <div className="w-9 h-9 rounded-xl bg-white border border-[#e6dfd5] flex items-center justify-center text-[#14281D] shrink-0 mt-0.5">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-[#14281D]">
                            In-Person Clinic Visit (Karachi)
                          </h4>
                          <p className="text-[11px] text-[#6a6660] mt-0.5">
                            Physical Matab visit for traditional pulse diagnosis (Nabz) and botanical dispensary.
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* 14-Day Date Strip */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#1a1816] uppercase tracking-wider flex items-center justify-between">
                      <span>2. Select Appointment Date:</span>
                      <span className="text-[11px] font-normal text-[#6a6660]">
                        Clinic Open: Mon – Sat (10:00 AM – 09:00 PM)
                      </span>
                    </label>

                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                      {next14Days.map((d) => {
                        const isSelected = selectedDate === d.dateStr;
                        return (
                          <button
                            key={d.dateStr}
                            type="button"
                            onClick={() => !d.isSunday && setSelectedDate(d.dateStr)}
                            disabled={d.isSunday}
                            className={`shrink-0 px-3.5 py-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                              d.isSunday
                                ? "opacity-40 bg-gray-100 border-gray-200 cursor-not-allowed"
                                : isSelected
                                ? "bg-[#14281D] text-white border-[#14281D] shadow-md scale-102"
                                : "bg-[#faf8f5] text-[#1a1816] border-[#e6dfd5] hover:border-[#14281D]/60 hover:bg-white"
                            }`}
                          >
                            <span className="text-[10px] uppercase font-bold block opacity-80">
                              {d.dayName}
                            </span>
                            <span className="text-xs font-bold block mt-0.5">
                              {d.formatted}
                            </span>
                            {d.isSunday && (
                              <span className="text-[9px] block text-red-500 font-semibold mt-0.5">
                                Closed
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Slots Grid */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#1a1816] uppercase tracking-wider flex items-center justify-between">
                      <span>3. Select Available Time Slot (PKT):</span>
                      {slotsLoading && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#8c6a15]">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Checking slot capacity...</span>
                        </span>
                      )}
                    </label>

                    {dateAvailabilityInfo?.isHoliday ? (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>
                          The clinic is closed on {selectedDate} ({dateAvailabilityInfo.holidayReason || "Official Clinic Holiday"}). Please select another date.
                        </span>
                      </div>
                    ) : !dateAvailabilityInfo?.isOpen && !slotsLoading ? (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700">
                        Clinic is off on this day. Please select Monday to Saturday.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                        {availableSlots.map((slot) => {
                          const isSelected = selectedSlot === slot.slot;
                          return (
                            <button
                              key={slot.slot}
                              type="button"
                              onClick={() => slot.available && setSelectedSlot(slot.slot)}
                              disabled={!slot.available}
                              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                                !slot.available
                                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through"
                                  : isSelected
                                  ? "bg-[#14281D] text-white border-[#14281D] shadow-sm font-bold ring-2 ring-[#14281D]/20"
                                  : "bg-[#faf8f5] text-[#1a1816] border-[#e6dfd5] hover:border-[#14281D] hover:bg-white text-xs font-medium"
                              }`}
                            >
                              <span className="text-xs block">{slot.slot}</span>
                              <span className={`text-[10px] block mt-0.5 ${
                                !slot.available ? "text-red-500 font-semibold" : isSelected ? "text-[#c59b27]" : "text-[#166534]"
                              }`}>
                                {slot.available ? "✓ Available" : "Booked"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Patient Details Form */}
                  <form onSubmit={handleAppointmentBookingSubmit} className="space-y-4 pt-4 border-t border-[#e6dfd5]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1a1816] uppercase tracking-wider">
                        4. Patient Information:
                      </span>
                      {sessionData?.user && (
                        <span className="text-[11px] text-[#166534] font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Logged in as {sessionData.user.name}</span>
                        </span>
                      )}
                    </div>

                    {submissionError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{submissionError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#1a1816]">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="e.g. Muhammad Bilal"
                          className="w-full px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D] focus:bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#1a1816]">
                          Phone / WhatsApp <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="0300-1234567"
                          className="w-full px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D] focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-semibold text-[#1a1816]">
                          Email Address (for appointment confirmation ticket) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="bilal@example.com"
                          className="w-full px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D] focus:bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#1a1816]">
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="Karachi, Lahore..."
                          className="w-full px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D] focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#1a1816]">Age</label>
                        <input
                          type="number"
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                          className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D] focus:bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#1a1816]">Gender</label>
                        <select
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D] focus:bg-white"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#1a1816]">Duration</label>
                        <select
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                          className="w-full px-3 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D] focus:bg-white"
                        >
                          <option value="Recent (< 1 Month)">Recent (&lt; 1 Month)</option>
                          <option value="1 to 3 Months">1 to 3 Months</option>
                          <option value="6+ Months">6+ Months</option>
                          <option value="Chronic (1+ Year)">Chronic (1+ Year)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#1a1816]">
                        Additional Symptoms or Current Medications (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={formData.additionalNotes}
                        onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                        placeholder="Mention any existing English medicines, past surgeries, or allergies..."
                        className="w-full px-3.5 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-xs text-[#1a1816] focus:outline-none focus:border-[#14281D] focus:bg-white resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !selectedSlot}
                      className="w-full py-3.5 bg-[#14281D] hover:bg-[#1e3d2c] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Booking Your Appointment...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm &amp; Book Appointment</span>
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  STEP 4: Booking Confirmation Screen
                 ───────────────────────────────────────────────────────────── */}
              {currentStep === 4 && submissionSuccess && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center space-y-6 py-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <span className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-[#166534] uppercase tracking-wider">
                      Appointment Confirmed
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#14281D]">
                      JazakAllah Khair, {submissionSuccess.fullName}!
                    </h2>
                    <p className="text-xs sm:text-sm text-[#59534b] max-w-md mx-auto">
                      Your consultation appointment with <strong>Hakim Muhammad Tariq</strong> has been successfully booked in our clinical ledger.
                    </p>
                  </div>

                  {/* Summary Box */}
                  <div className="max-w-md mx-auto bg-[#faf8f5] border border-[#e6dfd5] rounded-2xl p-5 text-left space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-[#e6dfd5]">
                      <span className="text-xs text-[#78716C] uppercase font-semibold">Ticket Reference:</span>
                      <strong className="text-sm font-mono text-[#14281D]">
                        {submissionSuccess.ticketNumber}
                      </strong>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[#78716C] block">Consultation Mode:</span>
                        <strong className="text-[#14281D] font-semibold">
                          {submissionSuccess.consultationType === "ONLINE" ? "Online Telehealth" : "Karachi Clinic Visit"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#78716C] block">Scheduled Slot:</span>
                        <strong className="text-[#14281D] font-semibold">
                          {submissionSuccess.appointmentDate} · {submissionSuccess.appointmentSlot}
                        </strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#e6dfd5] text-xs text-[#59534b]">
                      <strong>Email Confirmation Sent to:</strong> {submissionSuccess.email}
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 max-w-md mx-auto text-left space-y-1">
                    <h4 className="font-bold flex items-center gap-1.5 text-amber-950">
                      <Info className="w-4 h-4" />
                      <span>Next Steps:</span>
                    </h4>
                    <p className="text-[11px] leading-relaxed">
                      Our dispensary team or Hakim Sahib will contact you via WhatsApp / Phone at <strong>{submissionSuccess.phone}</strong> during your designated time slot. You may reply to your email confirmation with test reports in advance.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Link
                      href="/products"
                      className="w-full sm:w-auto px-6 py-3 bg-[#14281D] hover:bg-[#1e3d2c] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md text-center"
                    >
                      Browse Botanical Apothecary
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep(1);
                        setSubmissionSuccess(null);
                      }}
                      className="w-full sm:w-auto px-6 py-3 bg-white text-[#14281D] border border-[#e6dfd5] hover:bg-[#faf8f5] text-xs font-bold uppercase tracking-wider rounded-xl transition-all text-center cursor-pointer"
                    >
                      Book Another Consultation
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ─── 2. Hakim Authority & Clinic Information Section ─── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-3xl border border-[#e6dfd5] p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-[#8c6a15] uppercase tracking-wider">
                Clinical Matab &amp; Dispensary
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#14281D]">
                Visit Matab Tameer-e-Sehat
              </h3>
              <p className="text-xs text-[#59534b] leading-relaxed">
                Experience authentic pulse diagnosis (Nabz) and classical compounding by certified Tabibs under Eastern Unani medicine tradition.
              </p>
              <div className="space-y-2 pt-2 text-xs text-[#44403C]">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#14281D] shrink-0 mt-0.5" />
                  <span>{CLINIC_INFO.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#14281D] shrink-0" />
                  <span>Mon – Sat: 10:00 AM – 09:00 PM (Sunday Closed)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#14281D] shrink-0" />
                  <span>{CLINIC_INFO.phone} / WhatsApp: {CLINIC_INFO.whatsappNumber}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#faf8f5] p-5 rounded-2xl border border-[#e6dfd5] space-y-3">
              <h4 className="font-serif text-sm font-bold text-[#14281D]">
                Tibb-e-Unani Consultation Principles
              </h4>
              <ul className="space-y-2 text-xs text-[#59534b]">
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#166534] shrink-0 mt-0.5" />
                  <span><strong>Holistic Evaluation:</strong> We diagnose root temperamental imbalances (Mizaj) rather than masking symptoms.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#166534] shrink-0 mt-0.5" />
                  <span><strong>Zero Chemical Additives:</strong> Compounded purely with therapeutic grade botanicals and hydro-distillates.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#166534] shrink-0 mt-0.5" />
                  <span><strong>Bila-Muawza Advice:</strong> Consultations and pulse assessment are free of charge.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#14281D]">
              Frequently Asked Questions
            </h3>
            <p className="text-xs text-[#6a6660]">
              Everything you need to know about our Unani consultations &amp; appointments.
            </p>
          </div>

          <div className="space-y-2.5">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-[#e6dfd5] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <span className="font-serif text-xs sm:text-sm font-bold text-[#1a1816]">
                      {faq.q}
                    </span>
                    <span className={`text-xs font-bold transition-transform ${isOpen ? "rotate-180" : ""}`}>
                      ▼
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 text-xs text-[#59534b] leading-relaxed border-t border-[#faf8f5] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
