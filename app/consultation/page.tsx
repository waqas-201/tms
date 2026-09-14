"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CLINIC_INFO, CONSULTATION_AREAS } from "@/app/data/products";
import { useLanguage } from "@/app/context/LanguageContext";
import { useSession } from "@/lib/auth-client";
import {
  Sparkles,
  MessageCircle,
  ShieldCheck,
  Clock,
  Send,
  UserCheck,
  CheckCircle,
  Phone,
  HelpCircle,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";

export default function ConsultationPage() {
  const { t, isUrdu } = useLanguage();
  const { data: sessionData } = useSession();

  const [formData, setFormData] = useState({
    fullName: sessionData?.user?.name || "",
    age: "35",
    gender: "Male",
    city: (sessionData?.user as any)?.city || "Karachi",
    phone: (sessionData?.user as any)?.phone || "",
    email: sessionData?.user?.email || "",
    primaryConcern: "Digestive / Stomach Issues (معدہ و ہاضمہ)",
    duration: "1 to 3 months",
    symptomsDescription: "",
    priorTreatments: "",
    dietHabits: "",
    preferredContact: "WHATSAPP",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedDossier, setSubmittedDossier] = useState<any>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateWhatsAppUrl = (ticket?: string) => {
    const text = `*Assalam-o-Alaikum Hakim Sahib (Tameer-e-Sehat Consultation Request)*\n` +
      (ticket ? `*Ticket Number:* ${ticket}\n` : "") +
      `*Patient Name:* ${formData.fullName}\n` +
      `*Age & Gender:* ${formData.age} yrs · ${formData.gender}\n` +
      `*City:* ${formData.city}\n` +
      `*Phone:* ${formData.phone}\n\n` +
      `*Primary Health Concern:* ${formData.primaryConcern}\n` +
      `*Duration of Illness:* ${formData.duration}\n\n` +
      `*Detailed Symptoms:* ${formData.symptomsDescription || "As discussed"}\n\n` +
      `*Prior Treatments/Medications:* ${formData.priorTreatments || "None"}\n` +
      `*Digestive/Routine Notes:* ${formData.dietHabits || "Standard"}\n\n` +
      `_I am requesting your diagnostic evaluation and tailored herbal prescription. JazakAllah._`;

    return `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          age: Number(formData.age),
          gender: formData.gender,
          phone: formData.phone,
          email: formData.email,
          city: formData.city,
          primarySymptoms: `${formData.primaryConcern}: ${formData.symptomsDescription}`,
          duration: formData.duration,
          previousTreatments: formData.priorTreatments,
          digestiveState: formData.dietHabits,
          preferredContact: formData.preferredContact,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to submit consultation.");
      }

      setSubmittedDossier(json.data);
    } catch (err: any) {
      setError(err.message || "Failed to submit diagnostic questionnaire.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#faf8f5]">
      {/* Hero Header */}
      <section className="relative py-16 sm:py-20 border-b border-[#e6dfd5] overflow-hidden bg-[#123824] text-white">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#1a4d33]/50 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#c59b27]/10 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1a4d33] border border-[#256644] text-[#c59b27] text-xs font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isUrdu ? "طبی تشخیص و معائنہ کا مستند نظام" : "Confidential Unani Diagnostic Portal"}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            {t("consultationHeading")}
          </h1>

          <p className="font-urdu text-xl text-[#f4eee5]/90 font-medium" dir="rtl">
            اپنے امراض و کیفیات کے علاج کے لیے حکیم صاحب سے طبی مشورہ حاصل کریں
          </p>

          <p className="text-xs sm:text-sm text-[#f4eee5]/80 max-w-xl mx-auto leading-relaxed">
            {t("consultationSubtitle")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-[#f4eee5]/70">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#c59b27]" /> {isUrdu ? "مکمل طبی رازداری" : "100% Private & Discreet"}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#c59b27]" /> {isUrdu ? "2 تا 4 گھنٹے میں جواب" : "2-4 Hours Response Time"}
            </span>
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#c59b27]" /> {isUrdu ? "35 سالہ طبی تجربہ" : "35+ Years Certified Practice"}
            </span>
          </div>
        </div>
      </section>

      {/* Main Form Section */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {submittedDossier ? (
          <div className="bg-white rounded-2xl p-8 sm:p-12 border border-[#e6dfd5] shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#256644] text-white flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-semibold text-[#c59b27] tracking-widest">
                {isUrdu ? "طبی معائنہ فارم درج ہو گیا" : "Diagnostic Dossier Saved to Clinical DB"}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#123824]">
                {isUrdu ? "حکیم صاحب کو آپ کا طبی ریکارڈ موصول ہو گیا ہے" : "Consultation Request Received!"}
              </h2>
              <p className="text-xs sm:text-sm text-[#59534b]">
                {isUrdu ? "آپ کا تصدیقی نمبر:" : "Your official consultation reference ticket is:"}{" "}
                <strong className="text-[#123824] font-mono text-sm sm:text-base px-2.5 py-1 bg-[#faf8f5] rounded border border-[#e6dfd5]">
                  {submittedDossier.ticketNumber}
                </strong>
              </p>
            </div>

            <div className="p-5 bg-[#faf8f5] rounded-xl border border-[#e6dfd5] text-left text-xs text-[#59534b] space-y-2 max-w-lg mx-auto">
              <p>
                <strong>{isUrdu ? "مریض کا نام:" : "Patient:"}</strong> {submittedDossier.fullName} ({submittedDossier.age} yrs, {submittedDossier.gender})
              </p>
              <p>
                <strong>{isUrdu ? "شہر و فون:" : "City & Phone:"}</strong> {submittedDossier.city} · {submittedDossier.phone}
              </p>
              <p>
                <strong>{isUrdu ? "طبی کیفیت:" : "Symptoms:"}</strong> {submittedDossier.primarySymptoms}
              </p>
              <p className="text-[11px] text-[#6a6660] pt-1 border-t border-[#e6dfd5]">
                {isUrdu
                  ? "حکیم صاحب خود آپ کے کیس کا جائزہ لے کر واٹس ایپ یا فون پر تفصیلی رہنمائی اور نسخہ تجویز فرمائیں گے۔"
                  : "Hakim Sahib will review your symptomatic profile (Mizaj) and contact you via WhatsApp / phone with customized guidance."}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={generateWhatsAppUrl(submittedDossier.ticketNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{isUrdu ? "واٹس ایپ پر حکیم صاحب کو مطلع کریں" : "Open WhatsApp with Ticket Dossier"}</span>
              </a>

              <button
                onClick={() => setSubmittedDossier(null)}
                className="w-full sm:w-auto px-6 py-3 bg-[#123824] text-white text-xs font-semibold rounded-md"
              >
                {isUrdu ? "نیا فارم پر کریں" : "Submit Another Intake"}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Col: The Medical Intake Form */}
            <div className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-2xl border border-[#e6dfd5] shadow-xs space-y-6">
              <div className="space-y-1 border-b border-[#f4eee5] pb-4">
                <h2 className="font-serif text-xl font-bold text-[#123824]">
                  {isUrdu ? "طبی معائنہ فارم (انتیک فارم)" : "Patient Clinical Intake Questionnaire"}
                </h2>
                <p className="text-xs text-[#6a6660]">
                  {isUrdu
                    ? "تمام معلومات حکیم صاحب کے پاس مکمل راز داری میں محفوظ رہتی ہیں۔"
                    : "Please share accurate health symptoms for personalized Unani Mizaj diagnosis."}
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Section 1: Demographics */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#c59b27]">
                    1. {isUrdu ? "بنیادی معلومات" : "Patient Information"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-[#1a1816]">
                        {t("fullName")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="e.g. Tariq Mehmood"
                        className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#123824] focus:bg-white transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1a1816]">
                        {isUrdu ? "عمر (سال)" : "Age (Years)"} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="120"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#123824] focus:bg-white transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1a1816]">
                        {isUrdu ? "جنس" : "Gender"} <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#123824] focus:bg-white transition-colors"
                      >
                        <option value="Male">{isUrdu ? "مرد (Male)" : "Male"}</option>
                        <option value="Female">{isUrdu ? "خاتون (Female)" : "Female"}</option>
                        <option value="Other">{isUrdu ? "دیگر" : "Other"}</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1a1816]">
                        {t("phone")} / WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="0300-1234567"
                        className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#123824] focus:bg-white transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1a1816]">
                        {t("city")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Karachi, Lahore, Islamabad, etc."
                        className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#123824] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Clinical Details */}
                <div className="space-y-3 pt-3 border-t border-[#f4eee5]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#c59b27]">
                    2. {isUrdu ? "طبی علامات و مرض کی تفصیل" : "Symptom & Disease Details"}
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1a1816]">
                        {isUrdu ? "مرکزی طبی مسئلہ / زمرہ" : "Primary Health Area"} <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="primaryConcern"
                        value={formData.primaryConcern}
                        onChange={handleChange}
                        className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#123824] focus:bg-white transition-colors"
                      >
                        {CONSULTATION_AREAS.map((a) => (
                          <option key={a.title} value={`${a.title} (${a.urduTitle})`}>
                            {a.title} ({a.urduTitle})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1a1816]">
                        {isUrdu ? "مرض کی مدت (Duration of Illness)" : "Duration of Symptoms"} <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#123824] focus:bg-white transition-colors"
                      >
                        <option value="Less than 2 weeks">{isUrdu ? "دو ہفتے سے کم" : "Less than 2 weeks"}</option>
                        <option value="1 to 3 months">{isUrdu ? "ایک سے تین ماہ" : "1 to 3 months"}</option>
                        <option value="6 months to 1 year">{isUrdu ? "چھ ماہ سے ایک سال" : "6 months to 1 year"}</option>
                        <option value="More than 1 year (Chronic)">{isUrdu ? "ایک سال سے زائد (پرانا مرض)" : "More than 1 year (Chronic)"}</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1a1816]">
                        {isUrdu ? "اپنی تمام علامات تفصیل سے تحریر کریں" : "Describe Symptoms & Discomfort in Detail"} <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={3}
                        name="symptomsDescription"
                        value={formData.symptomsDescription}
                        onChange={handleChange}
                        placeholder={
                          isUrdu
                            ? "مثلاً: کھانے کے بعد تیزابیت اور جلن رہتی ہے، رات کو نیند نہیں آتی، جوڑوں میں درد ہوتا ہے وغیرہ..."
                            : "Describe pain location, triggers, burning sensations, digestion issues, energy fluctuations..."
                        }
                        className="w-full text-xs p-3.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#123824] focus:bg-white transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1a1816]">
                        {isUrdu ? "سابقہ ادویات یا دیگر ڈاکٹروں کا علاج (اگر کوئی ہو)" : "Prior Medications or Allopathic Therapies (Optional)"}
                      </label>
                      <input
                        type="text"
                        name="priorTreatments"
                        value={formData.priorTreatments}
                        onChange={handleChange}
                        placeholder="e.g. Taking antacids daily, painkillers for back pain"
                        className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#123824] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#123824] hover:bg-[#0c2719] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{isUrdu ? "فارم محفوظ ہو رہا ہے..." : "Saving Diagnostic Dossier..."}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{isUrdu ? "طبی معائنہ فارم جمع کرائیں" : "Submit Consultation Dossier to Hakim"}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Direct Hotlines & Hakim Ethics */}
            <div className="lg:col-span-4 space-y-6">
              {/* WhatsApp Fast Track Card */}
              <div className="bg-[#123824] text-white p-6 rounded-2xl border border-[#1a4d33] shadow-lg space-y-4">
                <div className="flex items-center gap-2 text-[#c59b27]">
                  <MessageCircle className="w-5 h-5" />
                  <h3 className="font-serif text-sm font-bold">
                    {isUrdu ? "براہِ راست واٹس ایپ رابطہ" : "Instant WhatsApp Desk"}
                  </h3>
                </div>
                <p className="text-xs text-[#f4eee5]/80 leading-relaxed">
                  {isUrdu
                    ? "اگر آپ فارم پر نہیں کرنا چاہتے تو براہِ راست واٹس ایپ پر صوتی پیغام (Voice Note) یا میسج بھیج کر فوری رہنمائی لے سکتے ہیں۔"
                    : "Prefer sending an immediate voice note or prescription image? Connect directly to Hakim Sahib's clinical desk."}
                </p>
                <a
                  href={`https://wa.me/${CLINIC_INFO.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold rounded-md transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{isUrdu ? "واٹس ایپ چیٹ شروع کریں" : "Chat on WhatsApp (0318-2311310)"}</span>
                </a>
              </div>

              {/* Clinic Timings & Physical Consultations */}
              <div className="bg-white p-6 rounded-2xl border border-[#e6dfd5] shadow-xs space-y-3">
                <h3 className="font-serif text-sm font-bold text-[#123824]">
                  {isUrdu ? "مطب میں بالمشافہ معائنہ" : "In-Person Clinic Visit (Karachi)"}
                </h3>
                <p className="text-xs text-[#6a6660] leading-relaxed">
                  {isUrdu
                    ? "کراچی میں مقیم مریض مطب میں تشریف لا کر نبض، مزاج اور طبعی معائنہ کروا سکتے ہیں۔"
                    : "Karachi residents are welcome to visit our physical dispensary for traditional pulse diagnosis (Nabz) and constitutional checkups."}
                </p>
                <div className="pt-2 text-xs space-y-1.5 text-[#59534b] border-t border-[#f4eee5]">
                  <p>
                    <strong>{isUrdu ? "پتہ:" : "Address:"}</strong> {CLINIC_INFO.address}
                  </p>
                  <p>
                    <strong>{isUrdu ? "اوقات:" : "Timings:"}</strong> {CLINIC_INFO.timings}
                  </p>
                  <p className="text-[#c59b27] font-medium">
                    {CLINIC_INFO.fridayTimings}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
