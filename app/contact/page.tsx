"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CLINIC_INFO } from "@/app/data/products";
import { useLanguage } from "@/app/context/LanguageContext";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Sparkles,
  Send,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  Building2,
  Loader2,
  AlertCircle,
} from "lucide-react";

const FAQS = [
  {
    q: "Do you offer in-person pulse diagnosis and physical consultations?",
    qUrdu: "کیا مطب میں نبض شناسی اور بالمشافہ معائنہ کی سہولت موجود ہے؟",
    a: "Yes. Our physical clinic is located at Plot no L, 41 Korangi Crossing Rd, Sector 31 B Korangi, Karachi. We welcome walk-in patients from Monday to Saturday between 10:00 AM and 9:00 PM. Prior appointment via phone or WhatsApp is recommended to avoid wait times.",
    aUrdu: "جی ہاں! ہمارا مطب کورنگی کراسنگ روڈ سیکٹر 31 بی کورنگی کراچی میں واقع ہے۔ پیر تا ہفتہ صبح 10 بجے سے رات 9 بجے تک مریض تشریف لا سکتے ہیں۔",
  },
  {
    q: "How does the online Hakim consultation work for patients outside Karachi?",
    qUrdu: "کراچی سے باہر کے مریضوں کے لیے آن لائن طبی مشورے کا طریقہ کار کیا ہے؟",
    a: "Patients across Pakistan (Lahore, Islamabad, Peshawar, Quetta, etc.) fill out our detailed clinical intake form. Hakim Sahib reviews your thermal temperament (Mizaj) and conducts a direct WhatsApp audio/text consultation to prescribe customized herbal remedies.",
    aUrdu: "پورے پاکستان سے مریض ہماری ویب سائٹ پر طبی معائنہ فارم پر کرتے ہیں۔ حکیم صاحب علامات اور مزاج کا جائزہ لے کر واٹس ایپ پر براہ راست نسخہ تجویز فرماتے ہیں۔",
  },
  {
    q: "What are your delivery timelines and Cash on Delivery (COD) policies?",
    qUrdu: "ترسیل (Delivery) کے اوقات اور کیش آن ڈیلیوری کے کیا ضوابط ہیں؟",
    a: "Karachi deliveries arrive within 24 to 48 hours. Orders to all other cities in Pakistan take 2 to 4 business days via reliable tracked courier services. You pay cash upon receiving the sealed parcel.",
    aUrdu: "کراچی میں 24 سے 48 گھنٹے اور دیگر شہروں میں 2 تا 4 دن میں پارسل پہنچ جاتا ہے۔ ترسیل پر کیش آن ڈیلیوری کی سہولت میسر ہے۔",
  },
  {
    q: "Are all formulations completely free of steroids and synthetic chemicals?",
    qUrdu: "کیا تمام ادویات سٹیرائیڈ اور مصنوعی کیمیکلز سے مکمل پاک ہیں؟",
    a: "Strictly 100%. Tameer-e-Sehat has operated continuously since 1990 adhering to classical Unani pharmacopeia. Our distillates, preserves, and oils are prepared in small artisanal batches with zero chemical adulteration.",
    aUrdu: "سو فیصد خالص۔ تعمیر صحت 1990ء سے خالص جڑی بوٹیوں اور یونانی اصولوں کے مطابق ادویات تیار کر رہا ہے جن میں کوئی نقصان دہ کیمیکل شامل نہیں۔",
  },
];

export default function ContactPage() {
  const { t, isUrdu } = useLanguage();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "Karachi",
    subject: "General Clinical Inquiry",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to submit message.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppDirect = () => {
    const text = `*Assalam-o-Alaikum Tameer-e-Sehat Clinic,*\n*Name:* ${formData.name || "Patient"}\n*Phone:* ${formData.phone || "—"}\n*City:* ${formData.city || "Karachi"}\n*Topic:* ${formData.subject}\n*Message:* ${formData.message || "I would like to inquire regarding clinic consultation and herbal remedies."}`;
    window.open(
      `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  return (
    <div className="bg-[#faf8f5]">
      {/* Hero Header */}
      <section className="relative py-16 sm:py-20 bg-[#123824] text-white border-b border-[#1a4d33] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#1a4d33]/50 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#c59b27]/10 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1a4d33] border border-[#256644] text-[#c59b27] text-xs font-medium tracking-wide">
            <Building2 className="w-3.5 h-3.5" />
            <span>{isUrdu ? "مرکزِ علاج بالطب و دواخانہ" : "Clinic & Apothecary Dispensary"}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            {t("contactHeading")}
          </h1>

          <p className="font-urdu text-xl text-[#f4eee5]/90 font-medium" dir="rtl">
            رابطہ و طبی معائنہ · کراچی مطب و آن لائن رہنمائی
          </p>

          <p className="text-xs sm:text-sm text-[#f4eee5]/80 max-w-xl mx-auto leading-relaxed">
            {t("contactSubtitle")}
          </p>
        </div>
      </section>

      {/* Main Contact Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left: Clinic Details & Timings (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#e6dfd5] shadow-xs space-y-6">
              <div className="space-y-1 border-b border-[#f4eee5] pb-4">
                <h3 className="font-serif text-lg font-bold text-[#123824]">
                  {t("clinicDispensary")}
                </h3>
                <p className="text-xs text-[#6a6660]">
                  {isUrdu
                    ? "کورنگی کراچی میں 35 سال سے قائم مستند دواخانہ و مطب۔"
                    : "Serving Karachi patients continuously since 1990."}
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#faf8f5] border border-[#e6dfd5] flex items-center justify-center text-[#c59b27] shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1a1816]">{t("address")}</h4>
                    <p className="text-[#59534b] leading-relaxed mt-0.5">
                      {CLINIC_INFO.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#faf8f5] border border-[#e6dfd5] flex items-center justify-center text-[#c59b27] shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1a1816]">{t("phone")}</h4>
                    <a
                      href={`tel:${CLINIC_INFO.phone}`}
                      className="text-[#123824] hover:text-[#c59b27] font-medium block mt-0.5"
                      dir="ltr"
                    >
                      {CLINIC_INFO.phoneFormatted}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#faf8f5] border border-[#e6dfd5] flex items-center justify-center text-[#c59b27] shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1a1816]">{t("timings")}</h4>
                    <p className="text-[#59534b] mt-0.5">{CLINIC_INFO.timings}</p>
                    <p className="text-[#c59b27] font-medium mt-0.5">{CLINIC_INFO.fridayTimings}</p>
                  </div>
                </div>
              </div>

              {/* Fast WhatsApp Box */}
              <div className="pt-4 border-t border-[#f4eee5] space-y-2">
                <a
                  href={`https://wa.me/${CLINIC_INFO.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{isUrdu ? "واٹس ایپ پر فوری رابطہ کریں" : "Chat Directly on WhatsApp"}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right: Message Form (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-2xl border border-[#e6dfd5] shadow-xs space-y-6">
            <div className="space-y-1 border-b border-[#f4eee5] pb-4">
              <h3 className="font-serif text-lg font-bold text-[#123824]">
                {t("sendMessage")}
              </h3>
              <p className="text-xs text-[#6a6660]">
                {isUrdu
                  ? "کسی بھی سوال، دوا کی تفصیل یا مشاورت کے لیے پیغام بھیجیں۔"
                  : "Send your inquiries, formulation questions, or appointment requests."}
              </p>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#256644] text-white flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-lg font-bold text-[#123824]">
                  {isUrdu ? "شکریہ! آپ کا پیغام موصول ہو گیا ہے" : "Thank You! Your message has been received."}
                </h4>
                <p className="text-xs text-[#59534b] max-w-sm mx-auto">
                  {isUrdu
                    ? "ہماری طبی ٹیم جلد آپ سے رابطہ کرے گی۔"
                    : "Our clinical support team will review your inquiry and get back to you shortly."}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2 bg-[#123824] text-white text-xs font-semibold rounded-md"
                >
                  {isUrdu ? "نیا پیغام بھیجیں" : "Send Another Message"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1a1816]">
                      {t("fullName")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Asad Ali"
                      className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#123824] focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1a1816]">
                      {t("phone")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0300-1234567"
                      className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#123824] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1a1816]">
                    {isUrdu ? "موضوع (Subject)" : "Subject / Reason for Inquiry"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Consultation availability, Product dosage inquiry"
                    className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#123824] focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1a1816]">
                    {isUrdu ? "پیغام (Message)" : "Your Message"} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Write your health inquiry, order query, or question..."
                    className="w-full text-xs p-3.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#123824] focus:bg-white transition-colors"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#123824] hover:bg-[#0c2719] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-all shadow-xs disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{isUrdu ? "بھیج رہے ہیں..." : "Submitting to DB..."}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{isUrdu ? "پیغام بھیجیں" : "Submit Inquiry to Clinic"}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsAppDirect}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold rounded-md transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#e6dfd5] shadow-xs space-y-6">
          <div className="space-y-1 text-center max-w-2xl mx-auto">
            <span className="text-xs font-semibold text-[#c59b27] uppercase tracking-widest">
              {isUrdu ? "عام سوالات و جوابات" : "Patient Queries"}
            </span>
            <h3 className="font-serif text-2xl font-bold text-[#123824]">
              {isUrdu ? "اکثر پوچھے جانے والے طبی سوالات" : "Frequently Asked Questions"}
            </h3>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="border border-[#e6dfd5] rounded-xl overflow-hidden bg-[#faf8f5]"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-serif text-xs sm:text-sm font-semibold text-[#123824] hover:text-[#c59b27] transition-colors"
                >
                  <span>{isUrdu ? faq.qUrdu : faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#6a6660] transition-transform duration-200 shrink-0 ${
                      openFaq === idx ? "rotate-180 text-[#123824]" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 pt-1 text-xs text-[#59534b] leading-relaxed border-t border-[#e6dfd5] bg-white">
                    {isUrdu ? faq.aUrdu : faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
