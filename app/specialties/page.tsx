import React from "react";
import Link from "next/link";
import Image from "next/image";
import { CLINIC_INFO } from "@/app/data/products";
import { CLINICAL_SPECIALTIES } from "@/app/data/specialties";
import Reveal from "@/app/components/motion/Reveal";
import {
  Stethoscope,
  Activity,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  Calendar,
  Sparkles,
  HeartHandshake,
  Clock,
  Award,
  ExternalLink,
} from "lucide-react";

export const metadata = {
  title: "Clinical Specialties & Chronic Health Care | Tameer-e-Sehat",
  description:
    "Explore our 6 specialized clinical departments: Stomach & GERD, Knee & Joint Pain, Liver Detox, Vitality & Energy, Allergies, and Hair Health. 35+ years of Unani healing in Karachi.",
};

export default function SpecialtiesPage() {
  return (
    <div className="bg-[#faf8f5]">
      {/* ─── 1. HERO HEADER ─── */}
      <section className="relative py-14 sm:py-20 bg-[#22623a] text-white border-b border-[#143e23] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#143e23]/50 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#c59b27]/10 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#143e23] border border-[#2d7648] text-[#c59b27] text-xs font-semibold tracking-wide">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Classical Unani Tibbi Practice · Est. 1990</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Specialized Clinical Departments
          </h1>

          <p className="text-sm sm:text-base text-[#f4eee5]/85 max-w-2xl mx-auto leading-relaxed">
            Targeting the root cause of chronic ailments with individualized herbal regimens, pure hydro-distillates (Arqiyat), and 35+ years of clinical Hakim expertise.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/consultation"
              className="px-6 py-3 bg-[#c59b27] hover:bg-[#aa821c] text-[#22623a] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
            >
              Book Health Consultation
            </Link>
            <a
              href={`https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent("Assalam-o-Alaikum Hakim Sahib, I would like to inquire regarding clinical treatment for my symptoms.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Hakim Now</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── 2. CLINICAL STATS BAR ─── */}
      <section className="bg-white border-b border-[#e6dfd5] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center divide-y lg:divide-y-0 lg:divide-x divide-[#e6dfd5]">
            <div className="p-2 space-y-1">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#22623a] block">
                6
              </span>
              <span className="text-xs text-[#6a6660]">Core Clinical Departments</span>
            </div>
            <div className="p-2 space-y-1">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#22623a] block">
                35+
              </span>
              <span className="text-xs text-[#6a6660]">Years Clinical Practice</span>
            </div>
            <a
              href={CLINIC_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 space-y-1 block hover:bg-[#faf8f5] rounded-xl transition-all group cursor-pointer"
              title="View verified reviews on Google Business Profile"
            >
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#22623a] group-hover:underline flex items-center justify-center gap-1">
                <span>150K+</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#c59b27] opacity-60 group-hover:opacity-100 transition-opacity inline" />
              </span>
              <span className="text-xs text-[#6a6660] block">Patients Successfully Treated</span>
            </a>
            <div className="p-2 space-y-1">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#22623a] block">
                0%
              </span>
              <span className="text-xs text-[#6a6660]">Steroids & Synthetic Chemicals</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. DETAILED SPECIALTIES GRID ─── */}
      <section className="py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <Reveal className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#8c6a15]">
              Conditions We Treat
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#22623a]">
              Our Clinical Areas of Care
            </h2>
            <p className="text-xs sm:text-sm text-[#59534b]">
              Click on any department to review symptoms treated, classical Tibbi protocols, and direct consultation options.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {CLINICAL_SPECIALTIES.map((spec, index) => {
              const Icon = spec.icon;
              return (
                <Reveal key={spec.id} delay={index * 0.04} className="h-full">
                  <div className="bg-white rounded-3xl border border-[#e6dfd5] p-6 sm:p-7 shadow-xs hover:shadow-luxury-hover transition-all duration-300 flex flex-col justify-between h-full group hover:border-[#22623a]/40 space-y-6">
                    <div className="space-y-4">
                      {/* Department Icon & Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#eef7f1] border border-[#cde4d6] text-[#22623a] flex items-center justify-center shrink-0 group-hover:bg-[#22623a] group-hover:text-white transition-colors duration-300 shadow-2xs">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#fdfbf3] text-[#8c6a15] border border-[#fbf3dc]">
                          {spec.badge}
                        </span>
                      </div>

                      {/* Header Info */}
                      <div>
                        <div className="text-[11px] text-[#8c6a15] font-semibold mb-0.5">
                          {spec.urduTitle}
                        </div>
                        <h3 className="font-serif text-lg font-bold text-[#22623a] group-hover:text-[#1b502e] transition-colors">
                          {spec.title}
                        </h3>
                        <p className="text-xs text-[#59534b] mt-1 leading-relaxed">
                          {spec.tagline}
                        </p>
                      </div>

                      {/* Symptoms Treated List */}
                      <div className="space-y-2 pt-3 border-t border-[#f4eee5]">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#8c6a15] block">
                          Primary Indications:
                        </span>
                        <ul className="space-y-1.5">
                          {spec.symptoms.map((sym, i) => (
                            <li key={i} className="text-xs text-[#3f3b35] flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#22623a] shrink-0 mt-0.5" />
                              <span>{sym}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Prescribed Course & Recovery Timeline */}
                      <div className="p-3.5 bg-[#faf8f5] rounded-2xl border border-[#e6dfd5] text-xs space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-bold text-[#22623a]">
                          <span>Typical Tibbi Course:</span>
                          <span className="text-[#8c6a15] font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {spec.recoveryTimeline}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#59534b] leading-relaxed">
                          {spec.treatmentCourse}
                        </p>
                      </div>
                    </div>

                    {/* Booking Buttons */}
                    <div className="pt-3 border-t border-[#f4eee5] space-y-2">
                      <Link
                        href={`/consultation?concern=${encodeURIComponent(spec.title)}`}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs group/btn"
                      >
                        <span>Book Consultation</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>

                      <a
                        href={`https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(`*Assalam-o-Alaikum Hakim Sahib*\nI would like to inquire about herbal treatment for: *${spec.title}*`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-[#eef7f1] hover:bg-[#d8ecde] text-[#22623a] text-xs font-semibold rounded-xl border border-[#cde4d6] transition-colors text-center"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                        <span>Quick WhatsApp Inquiry</span>
                      </a>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 4. HOW TIBBI DIAGNOSIS WORKS ─── */}
      <section className="py-14 sm:py-16 bg-white border-y border-[#e6dfd5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <Reveal className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#8c6a15]">
              Clinical Methodology
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#22623a]">
              The Classical Unani Diagnostic Method
            </h2>
            <p className="text-xs sm:text-sm text-[#59534b]">
              Rather than suppressing symptoms with synthetic pills, we diagnose internal imbalances and guide your body toward complete equilibrium.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#faf8f5] p-6 rounded-2xl border border-[#e6dfd5] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#22623a] text-[#c59b27] flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-serif text-base font-bold text-[#22623a]">
                Mizaj &amp; Root Assessment
              </h3>
              <p className="text-xs text-[#59534b] leading-relaxed">
                We evaluate your internal temperament (Hot/Cold, Dry/Moist) alongside your diet and daily stress to locate the true root of dysfunction.
              </p>
            </div>

            <div className="bg-[#faf8f5] p-6 rounded-2xl border border-[#e6dfd5] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#22623a] text-[#c59b27] flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-serif text-base font-bold text-[#22623a]">
                Pure Small-Batch Formulations
              </h3>
              <p className="text-xs text-[#59534b] leading-relaxed">
                Hydro-distillates (<em>Arq</em>) and natural fruit preserves (<em>Murabba</em>) prepared with zero preservatives or synthetic steroids.
              </p>
            </div>

            <div className="bg-[#faf8f5] p-6 rounded-2xl border border-[#e6dfd5] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#22623a] text-[#c59b27] flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-serif text-base font-bold text-[#22623a]">
                Direct WhatsApp Recovery Tracking
              </h3>
              <p className="text-xs text-[#59534b] leading-relaxed">
                Ongoing guidance, dietary adjustments, and dosage monitoring directly with our clinic team throughout your course.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. BOTTOM URGENT CALLOUT ─── */}
      <section className="py-14 sm:py-16 bg-[#22623a] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            Unsure Which Clinical Category Fits Your Condition?
          </h2>
          <p className="text-xs sm:text-sm text-[#f4eee5]/85 max-w-xl mx-auto leading-relaxed">
            Send a brief description of your symptoms directly to Hakim Muhammad Tariq on WhatsApp for a confidential, no-obligation medical review.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/consultation"
              className="w-full sm:w-auto px-7 py-3.5 bg-[#c59b27] hover:bg-[#aa821c] text-[#22623a] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
            >
              Fill Online Symptom Form
            </Link>
            <a
              href={`https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent("Assalam-o-Alaikum Hakim Sahib, I need guidance regarding my health symptoms.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-7 py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Instant WhatsApp Review</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
