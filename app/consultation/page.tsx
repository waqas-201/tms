"use client";

import React, { useState } from "react";
import { CLINIC_INFO, CONSULTATION_AREAS } from "@/app/data/products";
import { useSession } from "@/lib/auth-client";
import {
  Sparkles,
  MessageCircle,
  ShieldCheck,
  Clock,
  Send,
  UserCheck,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function ConsultationPage() {
  const { data: sessionData } = useSession();

  const [formData, setFormData] = useState({
    fullName: sessionData?.user?.name || "",
    age: "35",
    gender: "Male",
    city: (sessionData?.user as any)?.city || "Karachi",
    phone: (sessionData?.user as any)?.phone || "",
    email: sessionData?.user?.email || "",
    primaryConcern: "Stomach, Gas & Acidity (Digestion)",
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
    const text = `*Assalam-o-Alaikum Hakim Sahib (Tameer-e-Sehat Health Consultation)*\n` +
      (ticket ? `*Ticket Number:* ${ticket}\n` : "") +
      `*Name:* ${formData.fullName}\n` +
      `*Age & Gender:* ${formData.age} yrs · ${formData.gender}\n` +
      `*City:* ${formData.city}\n` +
      `*Phone:* ${formData.phone}\n\n` +
      `*Main Health Issue:* ${formData.primaryConcern}\n` +
      `*Duration:* ${formData.duration}\n\n` +
      `*Symptoms Description:* ${formData.symptomsDescription || "As discussed"}\n\n` +
      `*Current/Past Medicines:* ${formData.priorTreatments || "None"}\n\n` +
      `_I am requesting your guidance and recommended herbal remedy. Thank you._`;

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
      setError(err.message || "Failed to submit consultation form. Please try again or message on WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#faf8f5]">
      {/* Hero Header */}
      <section className="relative py-16 sm:py-20 border-b border-[#e6dfd5] overflow-hidden bg-[#22623a] text-white">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#143e23]/50 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#c59b27]/10 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#143e23] border border-[#2d7648] text-[#c59b27] text-xs font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Free Online Health Consultation</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Talk to Our Hakim Online
          </h1>

          <p className="text-base sm:text-lg text-[#f4eee5]/90 font-serif italic max-w-xl mx-auto">
            Get personalized health guidance, dietary tips, and the right natural remedies for your body.
          </p>

          <p className="text-xs sm:text-sm text-[#f4eee5]/80 max-w-xl mx-auto leading-relaxed">
            Fill out the quick form below. Our experienced Hakim will review your symptoms carefully and guide you towards natural recovery.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-[#f4eee5]/70">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#c59b27]" /> 100% Private & Confidential
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#c59b27]" /> 2 to 4 Hours Response Time
            </span>
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#c59b27]" /> 35+ Years Clinical Experience
            </span>
          </div>
        </div>
      </section>

      {/* Main Form Section */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {submittedDossier ? (
          <div className="bg-white rounded-2xl p-8 sm:p-12 border border-[#e6dfd5] shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#2d7648] text-white flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-semibold text-[#c59b27] tracking-widest">
                Form Saved Successfully
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#22623a]">
                Consultation Request Received!
              </h2>
              <p className="text-xs sm:text-sm text-[#59534b]">
                Your reference ticket number is:{" "}
                <strong className="text-[#22623a] font-mono text-sm sm:text-base px-2.5 py-1 bg-[#faf8f5] rounded border border-[#e6dfd5]">
                  {submittedDossier.ticketNumber}
                </strong>
              </p>
            </div>

            <div className="p-5 bg-[#faf8f5] rounded-xl border border-[#e6dfd5] text-left text-xs text-[#59534b] space-y-2 max-w-lg mx-auto">
              <p>
                <strong>Name:</strong> {submittedDossier.fullName} ({submittedDossier.age} yrs, {submittedDossier.gender})
              </p>
              <p>
                <strong>City & Phone:</strong> {submittedDossier.city} · {submittedDossier.phone}
              </p>
              <p>
                <strong>Symptoms:</strong> {submittedDossier.primarySymptoms}
              </p>
              <p className="text-[11px] text-[#6a6660] pt-1 border-t border-[#e6dfd5]">
                Hakim Sahib will review your symptoms and contact you via WhatsApp / phone with honest guidance and natural recommendations.
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
                <span>Open WhatsApp with Ticket</span>
              </a>

              <button
                onClick={() => setSubmittedDossier(null)}
                className="w-full sm:w-auto px-6 py-3 bg-[#22623a] text-white text-xs font-semibold rounded-md"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Col: The Medical Intake Form */}
            <div className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-2xl border border-[#e6dfd5] shadow-xs space-y-6">
              <div className="space-y-1 border-b border-[#f4eee5] pb-4">
                <h2 className="font-serif text-xl font-bold text-[#22623a]">
                  Health & Symptoms Form
                </h2>
                <p className="text-xs text-[#6a6660]">
                  Please share your symptoms honestly so our Hakim can give you accurate guidance.
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
                    1. Your Contact Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-[#1a1816]">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="e.g. Tariq Mehmood"
                        className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1a1816]">
                        Age (Years) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="120"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1a1816]">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white transition-colors"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1a1816]">
                        Phone / WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="0300-1234567"
                        className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1a1816]">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Karachi, Lahore, Islamabad, etc."
                        className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Clinical Details */}
                <div className="space-y-3 pt-3 border-t border-[#f4eee5]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#c59b27]">
                    2. Your Symptoms & Health Concerns
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1a1816]">
                        Main Health Concern <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="primaryConcern"
                        value={formData.primaryConcern}
                        onChange={handleChange}
                        className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white transition-colors"
                      >
                        {CONSULTATION_AREAS.map((a) => (
                          <option key={a.title} value={a.title}>
                            {a.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1a1816]">
                        How long have you felt this way? <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white transition-colors"
                      >
                        <option value="Less than 2 weeks">Less than 2 weeks</option>
                        <option value="1 to 3 months">1 to 3 months</option>
                        <option value="6 months to 1 year">6 months to 1 year</option>
                        <option value="More than 1 year (Chronic)">More than 1 year</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1a1816]">
                        Describe your symptoms in detail <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={3}
                        name="symptomsDescription"
                        value={formData.symptomsDescription}
                        onChange={handleChange}
                        placeholder="Tell us what you feel — such as stomach burning, gas, joint pain, fatigue, sleep trouble, or skin issues..."
                        className="w-full text-xs p-3.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1a1816]">
                        Current or Past Medicines You Take (Optional)
                      </label>
                      <input
                        type="text"
                        name="priorTreatments"
                        value={formData.priorTreatments}
                        onChange={handleChange}
                        placeholder="e.g. Taking antacids daily, pain tablets for back pain"
                        className="w-full text-xs px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending to Hakim...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Health Details to Hakim</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Direct WhatsApp & Clinic Details */}
            <div className="lg:col-span-4 space-y-6">
              {/* WhatsApp Fast Track Card */}
              <div className="bg-[#22623a] text-white p-6 rounded-2xl border border-[#143e23] shadow-lg space-y-4">
                <div className="flex items-center gap-2 text-[#c59b27]">
                  <MessageCircle className="w-5 h-5" />
                  <h3 className="font-serif text-sm font-bold">
                    Prefer WhatsApp Directly?
                  </h3>
                </div>
                <p className="text-xs text-[#f4eee5]/80 leading-relaxed">
                  Want to send a voice note or share your prescription image? Connect directly with Hakim Sahib on WhatsApp.
                </p>
                <a
                  href={`https://wa.me/${CLINIC_INFO.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold rounded-md transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp ({CLINIC_INFO.phoneFormatted})</span>
                </a>
              </div>

              {/* Clinic Timings & Physical Consultations */}
              <div className="bg-white p-6 rounded-2xl border border-[#e6dfd5] shadow-xs space-y-3">
                <h3 className="font-serif text-sm font-bold text-[#22623a]">
                  In-Person Clinic Visit (Karachi)
                </h3>
                <p className="text-xs text-[#6a6660] leading-relaxed">
                  Karachi residents are warmly welcome to visit our physical clinic for traditional pulse diagnosis and personal checkups.
                </p>
                <div className="pt-2 text-xs space-y-1.5 text-[#59534b] border-t border-[#f4eee5]">
                  <p>
                    <strong>Address:</strong> {CLINIC_INFO.address}
                  </p>
                  <p>
                    <strong>Timings:</strong> {CLINIC_INFO.timings}
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
