"use client";

import React from "react";
import Link from "next/link";
import { CLINIC_INFO } from "@/app/data/products";
import {
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Navigation,
  Building2,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import Reveal from "./motion/Reveal";

export default function ClinicVisitingSection() {
  return (
    <section id="clinic-location" className="py-16 sm:py-20 bg-white border-b border-[#e6dfd5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

          {/* Left Column: Karachi Physical Dispensary Information (7 cols) */}
          <Reveal className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0f7f3] border border-[#c5e4d1] text-[#138833] text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5 text-[#c59b27]" />
              <span>In-Person Physical Clinic & Dispensary</span>
            </div>

            <div className="space-y-3">
              <h2 className="font-serif text-2xl sm:text-4xl lg:text-[38px] font-bold text-[#138833] leading-tight">
                Visit Our Physical Clinic in Karachi
              </h2>
              <p className="text-xs sm:text-sm text-[#59534b] leading-relaxed">
                Karachi residents and visiting patients can experience classical Unani pulse diagnosis (Nabz Shinasi), physical consultations, and collect fresh apothecary preparations directly from our dispensary.
              </p>
            </div>

            {/* Structured Clinic Timings & Location Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Location Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#faf8f5] border border-[#e6dfd5] space-y-2">
                <div className="flex items-center gap-2 text-[#138833]">
                  <MapPin className="w-4 h-4 text-[#c59b27]" />
                  <h4 className="font-serif text-sm font-bold">Clinic Address</h4>
                </div>
                <p className="text-xs text-[#59534b] leading-relaxed">
                  {CLINIC_INFO.address}
                </p>
                <div className="pt-2">
                  <a
                    href="https://maps.google.com/?q=Korangi+Crossing+Karachi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#138833] hover:text-[#0f7229]"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get Directions on Google Maps</span>
                  </a>
                </div>
              </div>

              {/* Consultation Hours Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#faf8f5] border border-[#e6dfd5] space-y-2">
                <div className="flex items-center gap-2 text-[#138833]">
                  <Clock className="w-4 h-4 text-[#c59b27]" />
                  <h4 className="font-serif text-sm font-bold">Visiting Hours</h4>
                </div>
                <p className="text-xs text-[#59534b]">
                  <strong>Monday – Saturday:</strong> {CLINIC_INFO.timings}
                </p>
                <p className="text-xs text-[#8c6a15] font-semibold">
                  <strong>Friday:</strong> {CLINIC_INFO.fridayTimings}
                </p>
                <p className="text-[11px] text-[#7a7268] pt-1">
                  Walk-in patients welcome. Prior booking recommended to avoid wait.
                </p>
              </div>
            </div>

            {/* Checklist of What to Expect */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs text-[#59534b]">
                <CheckCircle2 className="w-4 h-4 text-[#138833] shrink-0" />
                <span>Detailed personal pulse & temperament evaluation (Mizaj assessment).</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#59534b]">
                <CheckCircle2 className="w-4 h-4 text-[#138833] shrink-0" />
                <span>On-the-spot freshly prepared distillates and custom herbal mixtures.</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#59534b]">
                <CheckCircle2 className="w-4 h-4 text-[#138833] shrink-0" />
                <span>Dedicated dietary plan and lifestyle guidance sheet provided.</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href={`tel:${CLINIC_INFO.phone}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#138833] hover:bg-[#0f7229] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Clinic: {CLINIC_INFO.phoneFormatted}</span>
              </a>

              <a
                href={`https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent("Assalam-o-Alaikum Hakim Sahib, I would like to visit your Karachi clinic for a consultation.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Appointment</span>
              </a>
            </div>
          </Reveal>

          {/* Right Column: Physical Clinic Visiting Card & Callout (5 cols) */}
          <Reveal delay={0.1} className="lg:col-span-5">
            <div className="bg-[#138833] rounded-3xl p-8 sm:p-10 text-white shadow-xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#0d5e23]/60 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#c59b27]/20 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0d5e23] border border-[#1b993e] text-[#c59b27] text-xs font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Karachi Patients</span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
                  Prefer an in-person checkup?
                </h3>

                <p className="text-xs sm:text-sm text-[#f4eee5]/90 leading-relaxed">
                  Avoid long clinic wait times by scheduling your visit in advance. Our clinic coordinator will reserve a dedicated time slot for you with Hakim Muhammad Tariq.
                </p>

                <div className="p-4 rounded-xl bg-[#0d5e23]/80 border border-[#1b993e] text-xs space-y-2">
                  <div className="flex justify-between items-center text-[#f4eee5]">
                    <span>Monday – Thursday:</span>
                    <span className="font-bold">10 AM – 9 PM</span>
                  </div>
                  <div className="flex justify-between items-center text-[#c59b27]">
                    <span>Friday:</span>
                    <span className="font-bold">3 PM – 9 PM</span>
                  </div>
                  <div className="flex justify-between items-center text-[#f4eee5]">
                    <span>Saturday:</span>
                    <span className="font-bold">10 AM – 9 PM</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/consultation"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-white hover:bg-[#faf8f5] text-[#138833] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md text-center"
                  >
                    <span>Schedule Physical Visit</span>
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
