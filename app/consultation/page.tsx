"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useConsultation } from "@/app/context/ConsultationContext";
import {
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Clock,
  CheckCircle2,
} from "lucide-react";

function ConsultationContent() {
  const searchParams = useSearchParams();
  const { openConsultation } = useConsultation();
  const rawConcern = searchParams.get("concern") || "";
  // Sanitize any trailing newlines or whitespace from query string
  const concern = rawConcern.trim().replace(/[\r\n]+/g, " ");

  const handleStartConsultation = () => {
    openConsultation({
      mode: "WHATSAPP",
      concern: concern || undefined,
      message: concern
        ? `Assalam-o-Alaikum Hakeem Sahib, I would like consultation and remedy guidance for: ${concern}.`
        : "Assalam-o-Alaikum Hakeem Tahir Hameed Sahab, I would like to consult with you regarding authentic herbal guidance for my health.",
    });
  };

  const healthConcerns = [
    {
      name: "Digestive & Stomach Health",
      desc: "Chronic acidity, gastric irritation, IBS, liver heat & constipation.",
    },
    {
      name: "Liver Health & Metabolic Detox",
      desc: "Sluggish liver, elevated enzymes, heat imbalance & poor appetite.",
    },
    {
      name: "Vitality, Energy & Brain Focus",
      desc: "Physical fatigue, general weakness, nervous exhaustion & stamina.",
    },
    {
      name: "Joint & Muscular Comfort",
      desc: "Knee stiffness, back pain, uric acid buildup & muscular inflammation.",
    },
    {
      name: "Chest, Cough & Seasonal Care",
      desc: "Persistent dry cough, phlegm congestion & bronchial sensitivity.",
    },
    {
      name: "Stress, Sleep & Mental Calm",
      desc: "Restlessness, sleep disturbances & mind fatigue.",
    },
  ];

  return (
    <div className="bg-surface min-h-screen">
      {/* Hero Header */}
      <section className="relative py-16 sm:py-24 border-b border-line overflow-hidden bg-primary text-white">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-brand-green-900/50 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-green-900 border border-brand-green-600 text-brand-gold-500 text-xs font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Classical Tibbi Consultation &mdash; 35+ Years of Trust</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Personalized Online Consultation <br />
            <span className="italic font-normal text-brand-gold-300">with Hakeem Tahir Hameed</span>
          </h1>

          <p className="text-sm sm:text-base text-on-inverse/80 max-w-2xl mx-auto leading-relaxed">
            Direct, confidential guidance rooted in classical Unani medicine. We listen to your symptoms, analyze your Mizaj (temperament), and recommend pure small-batch remedies.
          </p>

          {concern && (
            <div className="p-3 max-w-md mx-auto rounded-lg bg-white/10 border border-white/20 text-xs text-brand-gold-300">
              Selected Concern: <strong className="text-white">{concern}</strong>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStartConsultation}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-secondary hover:bg-brand-gold-600 text-on-secondary font-semibold text-xs uppercase tracking-wider rounded-md transition-colors shadow-lg cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-on-secondary" />
              <span>Start Free WhatsApp Consultation</span>
            </button>
            <Link
              href="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 bg-brand-green-900 hover:bg-brand-green-800 text-white font-semibold text-xs uppercase tracking-wider rounded-md border border-brand-green-600 transition-colors"
            >
              <span>Explore Dispensary</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Step Consultation Process */}
      <section className="py-16 border-b border-line bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-secondary-text">
              How It Works
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary">
              Simple 3-Step Consultation Flow
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-line bg-surface space-y-3">
              <div className="w-10 h-10 rounded-full bg-primary text-brand-gold-300 flex items-center justify-center font-serif font-bold text-sm">
                1
              </div>
              <h3 className="font-serif text-base font-bold text-primary">Share Your Symptoms</h3>
              <p className="text-xs text-ink-body leading-relaxed">
                Connect via WhatsApp or consultation form. Tell Hakeem Sahib about your current health issues, duration, and lifestyle.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-line bg-surface space-y-3">
              <div className="w-10 h-10 rounded-full bg-primary text-brand-gold-300 flex items-center justify-center font-serif font-bold text-sm">
                2
              </div>
              <h3 className="font-serif text-base font-bold text-primary">Mizaj & Root Cause Diagnosis</h3>
              <p className="text-xs text-ink-body leading-relaxed">
                Receive personalized medical evaluation based on Unani principles of humoral balance (Safra, Sauda, Balgham, Dam).
              </p>
            </div>

            <div className="p-6 rounded-xl border border-line bg-surface space-y-3">
              <div className="w-10 h-10 rounded-full bg-primary text-brand-gold-300 flex items-center justify-center font-serif font-bold text-sm">
                3
              </div>
              <h3 className="font-serif text-base font-bold text-primary">Personalized Regimen & Delivery</h3>
              <p className="text-xs text-ink-body leading-relaxed">
                Receive an authentic herbal prescription (Arqiyat, Murabba, Joshanda) delivered to your doorstep anywhere in Pakistan with Cash on Delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties Treated */}
      <section className="py-16 border-b border-line bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-secondary-text">
              Clinical Areas
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary">
              Conditions We Frequently Address
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {healthConcerns.map((c) => (
              <div
                key={c.name}
                onClick={handleStartConsultation}
                className="p-5 rounded-xl border border-line bg-white hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-green-600 shrink-0" />
                  <h3 className="font-serif text-sm font-bold text-primary">{c.name}</h3>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed pl-6">{c.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <button
              onClick={handleStartConsultation}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-brand-green-800 text-white text-xs font-semibold rounded-md transition-colors shadow-xs cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-brand-gold-300" />
              <span>Discuss Your Specific Health Needs on WhatsApp</span>
            </button>
          </div>
        </div>
      </section>

      {/* Clinic Timings & Trust */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 p-8 rounded-2xl bg-surface border border-line">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="font-serif text-base font-bold text-primary">Consultation Timings</h3>
              </div>
              <div className="text-xs text-ink-body space-y-1.5 leading-relaxed">
                <p><strong>Monday &ndash; Thursday, Saturday:</strong> 10:00 AM &ndash; 9:00 PM</p>
                <p><strong>Friday:</strong> 3:00 PM &ndash; 9:00 PM</p>
                <p><strong>Sunday:</strong> Closed</p>
              </div>
              <p className="text-xs text-ink-muted">
                Online WhatsApp consultations are addressed during clinic hours. Messages received overnight are answered first thing the next morning.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h3 className="font-serif text-base font-bold text-primary">Our Commitment</h3>
              </div>
              <ul className="text-xs text-ink-body space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-brand-green-600 font-bold">&check;</span>
                  <span>100% natural, unadulterated herbal formulas without synthetic steroids.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-green-600 font-bold">&check;</span>
                  <span>Direct consultation with seasoned Tibbi practitioners in Karachi since 1990.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-green-600 font-bold">&check;</span>
                  <span>Complete confidentiality for all patient discussions and health records.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ConsultationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center bg-surface">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <ConsultationContent />
    </Suspense>
  );
}
