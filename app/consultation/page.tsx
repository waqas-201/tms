"use client";

import React, { useState } from "react";
import { CLINIC_INFO } from "@/app/data/products";
import { useSession } from "@/lib/auth-client";
import {
  Sparkles,
  MessageCircle,
  ShieldCheck,
  Clock,
  Send,
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
  Navigation,
  HelpCircle,
  ChevronDown,
  Building2,
} from "lucide-react";
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
    symptoms: ["Gas & Bloating", "Acid Burning (Seene ki jalan)", "Constipation (Qabz)", "IBS & Stomach heaviness"],
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
    symptoms: ["Everyday exhaustion", "Nervous weakness (Asabi kamzori)", "Brain fog & lack of focus", "Low physical stamina"],
    icon: Zap,
    whatsappMessage: "Assalam-o-Alaikum Hakim Sahib, I feel constant fatigue and weakness. Please guide me on restorative herbal tonics.",
  },
  {
    id: "liver",
    title: "Liver Health & Metabolism",
    urduTitle: "جگر اور میٹابولزم",
    subtitle: "Fatty liver, body heat, sluggish metabolism & appetite loss",
    symptoms: ["Fatty liver discomfort", "Excess body heat (Jigar ki garmi)", "Loss of appetite", "Jaundice recovery"],
    icon: HeartHandshake,
    whatsappMessage: "Assalam-o-Alaikum Hakim Sahib, I need guidance regarding liver health / body heat (Jigar ki garmi).",
  },
  {
    id: "skin-hair",
    title: "Skin, Hair & Allergies",
    urduTitle: "جلد، بال اور الرجی",
    subtitle: "Hair thinning, scalp dandruff, dry eczema & acne",
    symptoms: ["Hair fall & weak roots", "Chronic dandruff & itching", "Acne & blood impurities", "Dry skin & seasonal allergy"],
    icon: Sparkles,
    whatsappMessage: "Assalam-o-Alaikum Hakim Sahib, I would like consultation regarding hair fall / skin health.",
  },
  {
    id: "private",
    title: "Confidential Personal Wellness",
    urduTitle: "مخصوص پوشیدہ طبی رہنمائی",
    subtitle: "100% private discussion for personal health issues",
    symptoms: ["Men's vitality & stamina", "Women's hormonal balance", "Strictly private & discreet", "Direct Hakim consultation"],
    icon: Lock,
    whatsappMessage: "Assalam-o-Alaikum Hakim Sahib, I would like to have a strictly confidential private consultation.",
  },
];

export default function ConsultationPage() {
  const { data: sessionData } = useSession();

  const [selectedCategory, setSelectedCategory] = useState<SymptomCategory>(SYMPTOM_CATEGORIES[0]);
  const [showCallbackForm, setShowCallbackForm] = useState(false);

  // Micro-form for quick callback
  const [callbackName, setCallbackName] = useState(sessionData?.user?.name || "");
  const [callbackPhone, setCallbackPhone] = useState((sessionData?.user as any)?.phone || "");
  const [callbackCity, setCallbackCity] = useState((sessionData?.user as any)?.city || "Karachi");
  const [callbackNotes, setCallbackNotes] = useState("");
  const [submittingCallback, setSubmittingCallback] = useState(false);
  const [callbackSuccess, setCallbackSuccess] = useState<any | null>(null);
  const [callbackError, setCallbackError] = useState<string | null>(null);

  // FAQ Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const getWhatsAppUrl = (category: SymptomCategory, customNotes?: string) => {
    let msg = category.whatsappMessage;
    if (customNotes && customNotes.trim()) {
      msg += `\n\n*Patient Notes:* ${customNotes.trim()}`;
    }
    return `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  };

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCallback(true);
    setCallbackError(null);

    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: callbackName,
          phone: callbackPhone,
          city: callbackCity,
          primarySymptoms: `[Quick Callback Request] ${selectedCategory.title}${
            callbackNotes ? `: ${callbackNotes}` : ""
          }`,
          age: 35,
          gender: "Not Specified",
          duration: "Ongoing",
          preferredContact: "PHONE",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to request callback.");
      }

      setCallbackSuccess(json.data);
    } catch (err: any) {
      setCallbackError(err.message || "Failed to submit callback request. Please connect on WhatsApp instead.");
    } finally {
      setSubmittingCallback(false);
    }
  };

  const faqs = [
    {
      q: "Is the consultation really 100% free with no obligation?",
      a: "Yes, absolutely. In accordance with traditional Tibbi ethics (Bila-Muawza Mashwara), Hakim Muhammad Tariq provides symptom assessment and health guidance completely free. You are never forced to purchase any remedy.",
    },
    {
      q: "Can I send a voice note or pictures of doctor reports on WhatsApp?",
      a: "Yes! Voice notes in Urdu, English, or Punjabi are warmly welcomed. You can also photograph lab reports, ultrasound scans, or current prescriptions and share them directly on WhatsApp.",
    },
    {
      q: "How fast will Hakim Sahib respond to my WhatsApp message?",
      a: "During clinical dispensary hours (10:00 AM – 10:00 PM PKT), initial responses and reviews typically arrive within 2 to 4 hours. Urgent queries are prioritized.",
    },
    {
      q: "Can I visit the clinic in Karachi for in-person pulse diagnosis (Nabz)?",
      a: "Yes, our established physical Matab is located in Korangi No. 4, Karachi. Walk-ins are welcome Monday to Saturday (10:00 AM – 10:00 PM) and Friday after Juma prayer.",
    },
  ];

  return (
    <div className="bg-[#faf8f5] min-h-screen">
      {/* ─── 1. Reassuring Hero Banner (Low-anxiety, zero mental burden) ─── */}
      <section className="relative py-14 sm:py-18 bg-[#22623a] text-white border-b border-[#1b502e] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#143e23]/50 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#c59b27]/10 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#143e23] border border-[#2d7648] text-[#c59b27] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zero-Effort Health Guidance</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            Speak Directly with Hakim Sahib
          </h1>

          <p className="text-sm sm:text-base text-[#f4eee5]/90 max-w-2xl mx-auto leading-relaxed">
            No complicated forms or lengthy questionnaires. Simply pick your health concern below to connect on WhatsApp, or request a quick callback.
          </p>

          {/* 3 Emotional Reassurance Pillars */}
          <div className="pt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto text-left">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
              <div className="w-8 h-8 rounded-lg bg-[#c59b27] text-[#143e23] flex items-center justify-center shrink-0 font-bold">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <strong className="block text-white">100% Free Consultation</strong>
                <span className="text-[#f4eee5]/75 text-[11px]">Bila-Muawza · No obligation</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
              <div className="w-8 h-8 rounded-lg bg-[#c59b27] text-[#143e23] flex items-center justify-center shrink-0 font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <strong className="block text-white">Strictly Confidential</strong>
                <span className="text-[#f4eee5]/75 text-[11px]">Direct Hakim review</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
              <div className="w-8 h-8 rounded-lg bg-[#25D366] text-white flex items-center justify-center shrink-0 font-bold">
                <Mic className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <strong className="block text-white">Voice Notes Welcome</strong>
                <span className="text-[#f4eee5]/75 text-[11px]">Audio in Urdu / English</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. Interactive 2-Tap Diagnostic Triage ─── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
        <div className="space-y-3 text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-widest font-bold text-[#8c6a15]">
            Step 1 of 2 · Choose Your Concern
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#22623a]">
            What is Bothering You Today?
          </h2>
          <p className="text-xs sm:text-sm text-[#59534b]">
            Tap any condition to immediately prepare your consultation.
          </p>
        </div>

        {/* 6 Visual Condition Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SYMPTOM_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory.id === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setCallbackSuccess(null);
                }}
                className={`text-left p-5 rounded-2xl border-2 transition-all relative flex flex-col justify-between group ${
                  isSelected
                    ? "bg-white border-[#22623a] shadow-lg ring-2 ring-[#22623a]/10"
                    : "bg-white/80 hover:bg-white border-[#e6dfd5] hover:border-[#cde4d6] shadow-xs"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-[#22623a] text-[#c59b27]"
                          : "bg-[#eef7f1] text-[#22623a] group-hover:bg-[#22623a] group-hover:text-white"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {isSelected && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#eef7f1] text-[#22623a] text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3 text-[#22623a]" />
                        <span>Selected</span>
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-serif text-base font-bold text-[#22623a]">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-[#8c6a15] font-semibold" dir="rtl">
                      {cat.urduTitle}
                    </p>
                    <p className="text-xs text-[#6a6660] leading-snug">
                      {cat.subtitle}
                    </p>
                  </div>
                </div>

                {/* Symptom Tag Pills */}
                <div className="pt-3 flex flex-wrap gap-1.5 border-t border-[#f4eee5] mt-3">
                  {cat.symptoms.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-[#faf8f5] text-[#59534b] text-[10px] font-medium border border-[#e6dfd5]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* ─── 3. Action Dispatcher for Selected Condition ─── */}
        <div className="bg-white rounded-3xl border border-[#e6dfd5] p-6 sm:p-8 lg:p-10 shadow-lg space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#f4eee5]">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider font-bold text-[#8c6a15]">
                Step 2 of 2 · Ready to Consult
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#22623a]">
                Consult on: <span className="underline decoration-[#c59b27]">{selectedCategory.title}</span>
              </h3>
              <p className="text-xs text-[#6a6660]">
                Choose how you want to connect with Hakim Muhammad Tariq:
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#22623a] bg-[#eef7f1] px-3.5 py-1.5 rounded-xl border border-[#cde4d6] self-start md:self-auto">
              <Clock className="w-3.5 h-3.5 text-[#8c6a15]" />
              <span>Replies in 2–4 Hours</span>
            </div>
          </div>

          {/* Primary 1-Click WhatsApp Action */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="p-4 rounded-2xl bg-[#f6fcf8] border border-[#cde4d6] space-y-2">
                <div className="flex items-center gap-2 text-[#22623a] font-bold text-xs">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>Instant WhatsApp Guidance (Recommended)</span>
                </div>
                <p className="text-xs text-[#59534b] leading-relaxed">
                  Opens WhatsApp with your selected concern pre-composed. You can simply hit send, type extra details, or send an audio voice note.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href={getWhatsAppUrl(selectedCategory)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg group"
                >
                  <MessageCircle className="w-4.5 h-4.5" />
                  <span>Start WhatsApp Consultation</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>

                <button
                  type="button"
                  onClick={() => setShowCallbackForm(!showCallbackForm)}
                  className="px-5 py-3.5 bg-[#faf8f5] hover:bg-[#f4eee5] text-[#22623a] border border-[#e6dfd5] text-xs font-bold rounded-xl transition-all"
                >
                  {showCallbackForm ? "Hide Callback Form" : "Request Phone Callback"}
                </button>
              </div>

              {/* Voice Note Prompt Badge */}
              <div className="flex items-center gap-2 text-xs text-[#6a6660] pt-1">
                <Mic className="w-3.5 h-3.5 text-[#8c6a15]" />
                <span>
                  <strong>Tip:</strong> You don&apos;t need to type in detail — feel free to send a 1-minute voice note on WhatsApp.
                </span>
              </div>
            </div>

            {/* Right Help Box */}
            <div className="lg:col-span-5 bg-[#faf8f5] rounded-2xl p-5 border border-[#e6dfd5] space-y-3">
              <h4 className="font-serif text-sm font-bold text-[#22623a] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#c59b27]" />
                <span>What Happens Next?</span>
              </h4>
              <ul className="text-xs text-[#59534b] space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#22623a] text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">1</span>
                  <span>Hakim Sahib evaluates your symptoms &amp; body temperament (Mizaj).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#22623a] text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">2</span>
                  <span>You receive tailored dietary tips and natural remedy recommendations.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#22623a] text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">3</span>
                  <span>Pure herbal preparations can be dispatched to your doorstep anywhere in Pakistan.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Optional Collapsible Phone Callback Form */}
          {showCallbackForm && (
            <div className="pt-6 border-t border-[#f4eee5] space-y-4">
              <div className="space-y-1">
                <h4 className="font-serif text-base font-bold text-[#22623a]">
                  Request Free Phone Callback
                </h4>
                <p className="text-xs text-[#6a6660]">
                  Enter your contact number. Clinic staff will call you to schedule a call with Hakim Sahib.
                </p>
              </div>

              {callbackSuccess ? (
                <div className="p-5 bg-[#eef7f1] rounded-2xl border border-[#cde4d6] text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[#22623a] mx-auto" />
                  <h5 className="font-serif text-base font-bold text-[#22623a]">
                    Callback Request Received!
                  </h5>
                  <p className="text-xs text-[#59534b]">
                    Ticket Reference: <strong className="font-mono text-[#22623a]">{callbackSuccess.ticketNumber}</strong>. We will call you shortly at <strong>{callbackSuccess.phone}</strong>.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCallbackSubmit} className="space-y-4">
                  {callbackError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{callbackError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#1a1816]">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={callbackName}
                        onChange={(e) => setCallbackName(e.target.value)}
                        placeholder="e.g. Tariq Mehmood"
                        className="w-full text-xs px-3 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#1a1816]">
                        Phone / WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={callbackPhone}
                        onChange={(e) => setCallbackPhone(e.target.value)}
                        placeholder="0300-1234567"
                        className="w-full text-xs px-3 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#1a1816]">
                        City
                      </label>
                      <input
                        type="text"
                        value={callbackCity}
                        onChange={(e) => setCallbackCity(e.target.value)}
                        placeholder="Karachi, Lahore, etc."
                        className="w-full text-xs px-3 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#1a1816]">
                      Additional Notes / Preferred Time (Optional)
                    </label>
                    <input
                      type="text"
                      value={callbackNotes}
                      onChange={(e) => setCallbackNotes(e.target.value)}
                      placeholder="e.g. Please call me after 4:00 PM"
                      className="w-full text-xs px-3 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingCallback}
                    className="w-full sm:w-auto px-6 py-3 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submittingCallback ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Callback Request</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* ─── 4. In-Person Karachi Clinic (Nabz Pulse Examination) ─── */}
        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-[#e6dfd5] shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eef7f1] text-[#22623a] text-xs font-semibold">
                <Building2 className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>Karachi In-Person Clinic Visit</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#22623a]">
                Prefer Traditional Pulse Diagnosis (Nabz)?
              </h3>
              <p className="text-xs sm:text-sm text-[#59534b]">
                Visit our physical clinic in Korangi No. 4, Karachi. Walk-ins are warmly welcome for hands-on pulse diagnosis and freshly compounded herbal preserves.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-[#59534b]">
                <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#e6dfd5] space-y-1">
                  <span className="font-bold text-[#22623a] block flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#c59b27]" /> Clinic Address:
                  </span>
                  <p className="text-[11px] leading-relaxed">{CLINIC_INFO.address}</p>
                </div>
                <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#e6dfd5] space-y-1">
                  <span className="font-bold text-[#22623a] block flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#c59b27]" /> Dispensary Hours:
                  </span>
                  <p className="text-[11px]">Mon – Sat: {CLINIC_INFO.timings}</p>
                  <p className="text-[11px] text-[#8c6a15] font-semibold">Friday: {CLINIC_INFO.fridayTimings}</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-3 text-center lg:text-right">
              <a
                href={CLINIC_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
              >
                <Navigation className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>Open in Google Maps</span>
              </a>

              <a
                href={`tel:${CLINIC_INFO.phone}`}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#faf8f5] hover:bg-[#f4eee5] text-[#22623a] text-xs font-semibold rounded-xl border border-[#e6dfd5] transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-[#8c6a15]" />
                <span>Call Clinic: {CLINIC_INFO.phoneFormatted}</span>
              </a>
            </div>
          </div>
        </div>

        {/* ─── 5. Frequently Asked Questions (Anxiety Reducers) ─── */}
        <div className="space-y-4 max-w-3xl mx-auto pt-4">
          <div className="text-center space-y-1">
            <span className="text-xs uppercase tracking-widest font-bold text-[#8c6a15]">
              Common Questions
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#22623a]">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-[#e6dfd5] overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-serif font-bold text-xs sm:text-sm text-[#22623a] hover:bg-[#faf8f5] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-[#8c6a15] shrink-0" />
                      <span>{faq.q}</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#6a6660] shrink-0 transition-transform ${
                        isOpen ? "rotate-180 text-[#22623a]" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs text-[#59534b] leading-relaxed border-t border-[#f4eee5] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
