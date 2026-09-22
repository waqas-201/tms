"use client";

import React, { useState } from "react";
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
  Mic,
  Activity,
  Flame,
  Zap,
  Lock,
  ArrowRight,
  ArrowLeft,
  Navigation,
  HelpCircle,
  ChevronDown,
  Building2,
  Calendar,
  RotateCcw,
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

type ConsultationMethod = "WHATSAPP" | "PHYSICAL" | "CALLBACK";

export default function ConsultationPage() {
  const { data: sessionData } = useSession();

  // Wizard State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<SymptomCategory>(SYMPTOM_CATEGORIES[0]);
  const [consultMethod, setConsultMethod] = useState<ConsultationMethod>("WHATSAPP");

  // Physical Clinic Booking state
  const [clinicName, setClinicName] = useState(sessionData?.user?.name || "");
  const [clinicPhone, setClinicPhone] = useState((sessionData?.user as any)?.phone || "");
  const [clinicDate, setClinicDate] = useState("Tomorrow");
  const [clinicSlot, setClinicSlot] = useState("Evening (05:00 PM - 09:00 PM)");

  // Callback form state
  const [callbackName, setCallbackName] = useState(sessionData?.user?.name || "");
  const [callbackPhone, setCallbackPhone] = useState((sessionData?.user as any)?.phone || "");
  const [callbackNotes, setCallbackNotes] = useState("");

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<any | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // FAQ open states
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSelectCategory = (cat: SymptomCategory) => {
    setSelectedCategory(cat);
    setCurrentStep(2);
  };

  const handleSelectMethod = (method: ConsultationMethod) => {
    setConsultMethod(method);
    setSubmissionSuccess(null);
    setSubmissionError(null);
    setCurrentStep(3);
  };

  const getWhatsAppUrl = () => {
    const text = `*Assalam-o-Alaikum Hakim Muhammad Tariq Sahib (Tameer-e-Sehat)*\n\n` +
      `*Health Concern:* ${selectedCategory.title} (${selectedCategory.urduTitle})\n` +
      `*Specific Inquiry:* ${selectedCategory.whatsappMessage}\n\n` +
      `_I would like your herbal advice, dietary guidance, and authentic remedy recommendations._`;
    return `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  const handlePhysicalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmissionError(null);

    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: clinicName,
          phone: clinicPhone,
          city: "Karachi",
          primarySymptoms: `[Karachi Clinic In-Person Booking] Date: ${clinicDate}, Slot: ${clinicSlot}. Concern: ${selectedCategory.title}`,
          age: 35,
          gender: "Not Specified",
          duration: "New Appointment",
          preferredContact: "PHONE",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to reserve slot.");
      }

      setSubmissionSuccess(json.data);
    } catch (err: any) {
      setSubmissionError(err.message || "Failed to book clinic slot. Please reach out on WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmissionError(null);

    try {
      const symptoms = `[Callback Request] Concern: ${selectedCategory.title}. ${callbackNotes ? `Notes: ${callbackNotes}` : ""}`;
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: callbackName,
          phone: callbackPhone,
          city: "Pakistan",
          primarySymptoms: symptoms,
          age: 35,
          gender: "Not Specified",
          duration: "Recent",
          preferredContact: "PHONE",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to submit callback request.");
      }

      setSubmissionSuccess(json.data);
    } catch (err: any) {
      setSubmissionError(err.message || "Failed to request callback. Please reach out via WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  const FAQS = [
    {
      q: "Is the consultation with Hakim Sahib really 100% free?",
      a: "Yes. In authentic Eastern Tibb tradition, pulse diagnosis, symptom evaluation, and initial lifestyle/dietary guidance are completely free (Bila-Muawza). You only pay if you decide to purchase specific prepared botanical remedies.",
    },
    {
      q: "Can I send an audio voice note or photos of medical test reports?",
      a: "Absolutely! We encourage patients to send voice notes in Urdu, Sindhi, or English explaining their symptoms in their own words, as well as blood reports, ultrasound scans, or previous prescriptions on WhatsApp.",
    },
    {
      q: "How soon will Hakim Sahib or the clinic reply on WhatsApp?",
      a: "During clinical hours (10:00 AM – 09:00 PM PKT, Monday to Saturday), we typically review and respond within 15 to 45 minutes.",
    },
    {
      q: "Where is your physical clinic located in Karachi?",
      a: `Our physical dispensary & Matab is at ${CLINIC_INFO.address}. Walk-ins for pulse diagnosis (Nabz) are welcome during opening hours.`,
    },
    {
      q: "Do your remedies contain any steroids, chemicals, or additives?",
      a: "Never. All Tameer-e-Sehat compounds are 100% pure plant botanicals, natural hydro-distillates (Arqiyaat), and herbal preserves (Majoon/Khamira) compounded according to classical Unani pharmacology.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1816]">
      {/* ─── 1. Wizard Anchor Section (Centered, high-focus single viewport) ─── */}
      <section className="pt-6 sm:pt-10 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Wizard Container Card */}
        <div className="bg-white rounded-3xl border border-[#e6dfd5] shadow-xl overflow-hidden">

          {/* Stepper Progress Header */}
          <div className="bg-[#22623a] text-white p-5 sm:p-6 relative">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#143e23] border border-[#2d7648] text-[11px] font-bold text-[#c59b27] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Free Consultation · Bila-Muawza</span>
              </div>

              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#f4eee5] hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous Step</span>
                </button>
              )}
            </div>

            <div className="space-y-1">
              <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold">
                {currentStep === 1 && "Step 1: What is your primary health concern?"}
                {currentStep === 2 && "Step 2: How would you like to consult?"}
                {currentStep === 3 && "Step 3: Direct Connection with Hakim Sahib"}
              </h1>
              <p className="text-xs sm:text-sm text-[#f4eee5]/80">
                {currentStep === 1 && "Tap your condition below for personalized herbal guidance · 1-Tap start"}
                {currentStep === 2 && `Selected: ${selectedCategory.title} · Choose your preferred consultation channel`}
                {currentStep === 3 && "Zero forms, zero hassle · Direct guidance via WhatsApp, Clinic or Call"}
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
                  2. Choose Method
                </span>
              </div>
              <div className="space-y-1.5">
                <div className={`h-1.5 rounded-full transition-all ${currentStep >= 3 ? "bg-[#c59b27]" : "bg-white/20"}`} />
                <span className="text-[10px] sm:text-[11px] font-semibold text-[#f4eee5]/90 block truncate">
                  3. Connect Direct
                </span>
              </div>
            </div>
          </div>

          {/* Wizard Body with Animated Step Switcher */}
          <div className="p-5 sm:p-8">
            <AnimatePresence mode="wait">

              {/* ─────────────────────────────────────────────────────────────
                  STEP 1: 6 Large Visual Concern Cards (1-Tap Auto-Advance)
                 ───────────────────────────────────────────────────────────── */}
              {currentStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="text-center sm:text-left">
                    <p className="text-xs font-bold text-[#8c6a15] uppercase tracking-wider">
                      Please select your condition:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {SYMPTOM_CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = selectedCategory.id === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleSelectCategory(cat)}
                          className={`p-4 rounded-2xl border text-left transition-all relative group flex flex-col justify-between hover:shadow-md ${
                            isSelected
                              ? "bg-[#eef7f1] border-[#22623a] shadow-xs"
                              : "bg-[#faf8f5] hover:bg-white border-[#e6dfd5]"
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                isSelected ? "bg-[#22623a] text-white" : "bg-white text-[#22623a] border border-[#e6dfd5]"
                              }`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <span className="text-xs font-serif text-[#8c6a15] font-bold" dir="rtl">
                                {cat.urduTitle}
                              </span>
                            </div>

                            <div>
                              <h3 className="font-bold text-sm text-[#1a1816] group-hover:text-[#22623a] transition-colors">
                                {cat.title}
                              </h3>
                              <p className="text-[11px] text-[#6a6660] mt-0.5 line-clamp-2">
                                {cat.subtitle}
                              </p>
                            </div>
                          </div>

                          <div className="pt-3 mt-3 border-t border-[#e6dfd5]/60 flex items-center justify-between text-xs font-bold text-[#22623a]">
                            <span>Select &amp; Continue</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Reassurance Footer */}
                  <div className="p-3.5 bg-[#faf8f5] rounded-2xl border border-[#e6dfd5] flex flex-wrap items-center justify-center gap-4 text-xs text-[#59534b]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="w-4 h-4 text-[#22623a]" /> 100% Free &amp; Confidential
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Mic className="w-4 h-4 text-[#25D366]" /> Voice Notes Welcome
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <HeartHandshake className="w-4 h-4 text-[#8c6a15]" /> Zero Pressure to Buy
                    </span>
                  </div>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  STEP 2: Select Consultation Channel (1-Tap Auto-Advance)
                 ───────────────────────────────────────────────────────────── */}
              {currentStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Selected Issue Review Bar */}
                  <div className="p-3 rounded-2xl bg-[#eef7f1] border border-[#cde4d6] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#22623a] text-white flex items-center justify-center shrink-0">
                        {React.createElement(selectedCategory.icon, { className: "w-4 h-4" })}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-[#8c6a15] block">
                          Selected Concern
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-[#22623a] block truncate">
                          {selectedCategory.title} ({selectedCategory.urduTitle})
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-bold text-[#22623a] hover:underline flex items-center gap-1 shrink-0 bg-white px-2.5 py-1 rounded-lg border border-[#cde4d6]"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Change</span>
                    </button>
                  </div>

                  <p className="text-xs font-bold text-[#8c6a15] uppercase tracking-wider pt-1">
                    Select how you would like to connect:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* Method 1: WhatsApp Chat */}
                    <button
                      type="button"
                      onClick={() => handleSelectMethod("WHATSAPP")}
                      className="p-5 rounded-2xl border border-[#e6dfd5] bg-[#faf8f5] hover:bg-white hover:border-[#25D366] hover:shadow-md transition-all text-left space-y-3 group flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#25D366]/15 text-[#1e7e34] text-[10px] font-bold uppercase tracking-wider">
                          <Sparkles className="w-3 h-3" />
                          <span>Recommended · Fast</span>
                        </div>

                        <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center">
                          <MessageCircle className="w-5 h-5" />
                        </div>

                        <h3 className="font-bold text-sm sm:text-base text-[#1a1816] group-hover:text-[#1e7e34] transition-colors">
                          WhatsApp Chat
                        </h3>

                        <p className="text-xs text-[#6a6660] leading-relaxed">
                          Direct chat with Hakim Sahib. Send voice notes or pictures of medical reports easily.
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#e6dfd5]/60 flex items-center justify-between text-xs font-bold text-[#1e7e34]">
                        <span>Open WhatsApp</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>

                    {/* Method 2: Physical Karachi Clinic Visit */}
                    <button
                      type="button"
                      onClick={() => handleSelectMethod("PHYSICAL")}
                      className="p-5 rounded-2xl border border-[#e6dfd5] bg-[#faf8f5] hover:bg-white hover:border-[#22623a] hover:shadow-md transition-all text-left space-y-3 group flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#eef7f1] text-[#22623a] text-[10px] font-bold uppercase tracking-wider">
                          <Building2 className="w-3 h-3 text-[#c59b27]" />
                          <span>Korangi, Karachi</span>
                        </div>

                        <div className="w-10 h-10 rounded-xl bg-[#22623a] text-white flex items-center justify-center">
                          <Building2 className="w-5 h-5" />
                        </div>

                        <h3 className="font-bold text-sm sm:text-base text-[#1a1816] group-hover:text-[#22623a] transition-colors">
                          Karachi Clinic Visit
                        </h3>

                        <p className="text-xs text-[#6a6660] leading-relaxed">
                          In-person pulse diagnosis (Nabz) and freshly prepared botanical remedies at our Matab.
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#e6dfd5]/60 flex items-center justify-between text-xs font-bold text-[#22623a]">
                        <span>Reserve Clinic Slot</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>

                    {/* Method 3: Request Phone Callback */}
                    <button
                      type="button"
                      onClick={() => handleSelectMethod("CALLBACK")}
                      className="p-5 rounded-2xl border border-[#e6dfd5] bg-[#faf8f5] hover:bg-white hover:border-[#c59b27] hover:shadow-md transition-all text-left space-y-3 group flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fdf8ed] text-[#8c6a15] text-[10px] font-bold uppercase tracking-wider">
                          <Phone className="w-3 h-3" />
                          <span>We Call You</span>
                        </div>

                        <div className="w-10 h-10 rounded-xl bg-[#8c6a15] text-white flex items-center justify-center">
                          <Phone className="w-5 h-5" />
                        </div>

                        <h3 className="font-bold text-sm sm:text-base text-[#1a1816] group-hover:text-[#8c6a15] transition-colors">
                          Request Callback
                        </h3>

                        <p className="text-xs text-[#6a6660] leading-relaxed">
                          Leave your name and phone number. Our herbalist team will call you back shortly.
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#e6dfd5]/60 flex items-center justify-between text-xs font-bold text-[#8c6a15]">
                        <span>Leave Phone Number</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  STEP 3: Action & Direct Connection
                 ───────────────────────────────────────────────────────────── */}
              {currentStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  {/* Summary Bar */}
                  <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e6dfd5] flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[#8c6a15] font-bold uppercase text-[10px]">Concern:</span>
                      <strong className="text-[#22623a]">{selectedCategory.title}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#8c6a15] font-bold uppercase text-[10px]">Method:</span>
                      <strong className="text-[#1a1816]">
                        {consultMethod === "WHATSAPP" && "WhatsApp Direct Chat"}
                        {consultMethod === "PHYSICAL" && "In-Person Karachi Clinic"}
                        {consultMethod === "CALLBACK" && "Phone Callback"}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-bold text-[#22623a] hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Change</span>
                    </button>
                  </div>

                  {/* Mode 1: WhatsApp Launch Container */}
                  {consultMethod === "WHATSAPP" && (
                    <div className="space-y-4">
                      {/* Pre-composed message review card */}
                      <div className="p-4 bg-[#eef7f1] rounded-2xl border border-[#cde4d6] space-y-2">
                        <div className="flex items-center gap-2 text-[#22623a] text-xs font-bold">
                          <MessageCircle className="w-4 h-4 text-[#25D366]" />
                          <span>Pre-Formatted Consultation Message:</span>
                        </div>
                        <p className="text-xs text-[#1a1816] italic bg-white p-3 rounded-xl border border-[#cde4d6] leading-relaxed">
                          &quot;{selectedCategory.whatsappMessage}&quot;
                        </p>
                      </div>

                      {/* Voice Note Tip */}
                      <div className="p-3.5 bg-[#faf8f5] rounded-2xl border border-[#e6dfd5] flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0">
                          <Mic className="w-4.5 h-4.5" />
                        </div>
                        <div className="text-xs text-[#59534b] leading-tight">
                          <strong className="text-[#1a1816] block mb-0.5">Voice Notes Welcome on WhatsApp</strong>
                          <span>You can simply record an audio message in Urdu or English or send photos of your medical reports.</span>
                        </div>
                      </div>

                      {/* 1-Tap CTA */}
                      <a
                        href={getWhatsAppUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>Open WhatsApp with Hakim Muhammad Tariq</span>
                        <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                      </a>

                      <div className="text-center pt-1">
                        <span className="text-[11px] text-[#7a7268] inline-flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#22623a]" />
                          100% Free · Strictly Confidential · No Pressure to Buy Remedies
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Mode 2: In-Person Karachi Clinic Reservation */}
                  {consultMethod === "PHYSICAL" && (
                    <div className="space-y-4">
                      {submissionSuccess ? (
                        <div className="text-center space-y-3 py-6 bg-[#eef7f1] rounded-2xl border border-[#cde4d6] p-6">
                          <div className="w-12 h-12 rounded-full bg-[#22623a] text-white flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-7 h-7" />
                          </div>
                          <h3 className="font-serif text-lg font-bold text-[#22623a]">
                            Appointment Slot Reserved!
                          </h3>
                          <p className="text-xs text-[#59534b]">
                            Reservation Ticket: <strong className="font-mono text-[#22623a]">{submissionSuccess.ticketNumber}</strong>
                          </p>
                          <p className="text-xs text-[#6a6660] max-w-sm mx-auto">
                            We look forward to examining your pulse at our Korangi clinic. Please visit us during your reserved slot.
                          </p>
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSubmissionSuccess(null);
                                setCurrentStep(1);
                              }}
                              className="px-6 py-2.5 bg-[#22623a] text-white text-xs font-bold rounded-xl"
                            >
                              Start New Consultation
                            </button>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handlePhysicalSubmit} className="space-y-4">
                          {submissionError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>{submissionError}</span>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                                className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-[#1a1816]">
                                Phone / WhatsApp <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="tel"
                                required
                                value={clinicPhone}
                                onChange={(e) => setClinicPhone(e.target.value)}
                                placeholder="0300-1234567"
                                className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-[#1a1816]">
                                Preferred Day
                              </label>
                              <select
                                value={clinicDate}
                                onChange={(e) => setClinicDate(e.target.value)}
                                className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a]"
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
                                className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a]"
                              >
                                <option value="Morning (10:00 AM - 02:00 PM)">Morning (10:00 AM – 02:00 PM)</option>
                                <option value="Evening (05:00 PM - 09:00 PM)">Evening (05:00 PM – 09:00 PM)</option>
                              </select>
                            </div>
                          </div>

                          {/* Clinic Info Box */}
                          <div className="p-3.5 bg-[#faf8f5] rounded-2xl border border-[#e6dfd5] text-xs text-[#59534b] space-y-1">
                            <p className="font-bold text-[#22623a]">Clinic: Korangi No. 4, Karachi</p>
                            <p>Walk-ins welcome · Pulse diagnosis (Nabz) available on-the-spot.</p>
                          </div>

                          <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3.5 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Reserving Slot...</span>
                              </>
                            ) : (
                              <>
                                <Calendar className="w-4 h-4 text-[#c59b27]" />
                                <span>Confirm In-Person Clinic Slot</span>
                              </>
                            )}
                          </button>
                        </form>
                      )}
                    </div>
                  )}

                  {/* Mode 3: Request Phone Callback */}
                  {consultMethod === "CALLBACK" && (
                    <div className="space-y-4">
                      {submissionSuccess ? (
                        <div className="text-center space-y-3 py-6 bg-[#eef7f1] rounded-2xl border border-[#cde4d6] p-6">
                          <div className="w-12 h-12 rounded-full bg-[#22623a] text-white flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-7 h-7" />
                          </div>
                          <h3 className="font-serif text-lg font-bold text-[#22623a]">
                            Callback Request Received!
                          </h3>
                          <p className="text-xs text-[#59534b]">
                            Ticket: <strong className="font-mono text-[#22623a]">{submissionSuccess.ticketNumber}</strong>
                          </p>
                          <p className="text-xs text-[#6a6660] max-w-sm mx-auto">
                            Our herbalist staff will call you shortly on your provided phone number.
                          </p>
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSubmissionSuccess(null);
                                setCurrentStep(1);
                              }}
                              className="px-6 py-2.5 bg-[#22623a] text-white text-xs font-bold rounded-xl"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handleCallbackSubmit} className="space-y-4">
                          {submissionError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>{submissionError}</span>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-[#1a1816]">
                                Your Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={callbackName}
                                onChange={(e) => setCallbackName(e.target.value)}
                                placeholder="e.g. Muhammad Bilal"
                                className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-[#1a1816]">
                                Phone Number <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="tel"
                                required
                                value={callbackPhone}
                                onChange={(e) => setCallbackPhone(e.target.value)}
                                placeholder="0300-1234567"
                                className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-[#1a1816]">
                              Optional Notes for Hakim Sahib
                            </label>
                            <input
                              type="text"
                              value={callbackNotes}
                              onChange={(e) => setCallbackNotes(e.target.value)}
                              placeholder="e.g. Suffering from acidity since 2 weeks..."
                              className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a]"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3.5 bg-[#8c6a15] hover:bg-[#725510] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Submitting Request...</span>
                              </>
                            ) : (
                              <>
                                <Phone className="w-4 h-4" />
                                <span>Request Free Phone Callback</span>
                              </>
                            )}
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ─── 2. Supporting Tray: Karachi Physical Clinic Details & Pulse Diagnosis ─── */}
      <section className="py-12 sm:py-16 bg-white border-t border-[#e6dfd5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          {/* Physical Matab Card */}
          <Reveal>
            <div className="p-6 sm:p-8 rounded-3xl bg-[#faf8f5] border border-[#e6dfd5] space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eef7f1] border border-[#cde4d6] text-[#22623a] text-xs font-semibold">
                <Building2 className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>Physical Matab &amp; Dispensary in Karachi</span>
              </div>

              <div className="space-y-1.5">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#22623a]">
                  Prefer In-Person Pulse Examination (Nabz)?
                </h2>
                <p className="text-xs sm:text-sm text-[#59534b]">
                  Visit Hakim Muhammad Tariq at our established Korangi clinic in Karachi for classical pulse reading and on-the-spot botanical remedy compounding.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="p-4 rounded-2xl bg-white border border-[#e6dfd5] space-y-1.5">
                  <div className="flex items-center gap-2 text-[#22623a] font-bold text-xs">
                    <MapPin className="w-4 h-4 text-[#c59b27]" />
                    <span>Clinic Address</span>
                  </div>
                  <p className="text-xs text-[#59534b] leading-relaxed">
                    {CLINIC_INFO.address}
                  </p>
                  <a
                    href={CLINIC_INFO.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#22623a] hover:underline pt-0.5"
                  >
                    <Navigation className="w-3 h-3 text-[#8c6a15]" />
                    <span>Open in Google Maps →</span>
                  </a>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#e6dfd5] space-y-1.5">
                  <div className="flex items-center gap-2 text-[#22623a] font-bold text-xs">
                    <Clock className="w-4 h-4 text-[#c59b27]" />
                    <span>Consultation Hours</span>
                  </div>
                  <p className="text-xs text-[#59534b]">
                    <strong>Mon – Sat:</strong> {CLINIC_INFO.timings}
                  </p>
                  <p className="text-xs text-[#8c6a15] font-semibold">
                    <strong>Friday:</strong> {CLINIC_INFO.fridayTimings}
                  </p>
                  <p className="text-[10px] text-[#7a7268]">Walk-ins welcome during dispensary hours.</p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* ─── 3. FAQs Accordion ─── */}
          <Reveal delay={0.1} className="space-y-4">
            <div className="text-center space-y-1">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#8c6a15] flex items-center justify-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Frequently Asked Questions</span>
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#22623a]">
                Everything You Need to Know
              </h3>
            </div>

            <div className="space-y-2.5">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-[#e6dfd5] bg-[#faf8f5] overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-[#1a1816] hover:text-[#22623a] transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#8c6a15] shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-4 pb-4 text-xs text-[#59534b] leading-relaxed border-t border-[#e6dfd5]/60 pt-3"
                        >
                          {faq.a}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </Reveal>

        </div>
      </section>
    </div>
  );
}
