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
    <section id="clinic-location" className="py-16 sm:py-20 lg:py-24 bg-[#faf8f5] border-b border-[#e6dfd5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">

          {/* Left Column: Karachi Physical Dispensary Information (7 cols) */}
          <Reveal className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eef7f1] border border-[#cde4d6] text-[#22623a] text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5 text-[#c59b27]" />
              <span>In-Person Physical Clinic</span>
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#22623a] leading-tight">
                Visit Our Clinic in Karachi
              </h2>
              <p className="text-xs sm:text-sm text-[#59534b]">
                In-person pulse examination (Nabz) and freshly prepared botanical remedies at our Korangi clinic.
              </p>
            </div>

            {/* Structured Clinic Timings & Location Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {/* Location Card */}
              <div className="p-4 rounded-2xl bg-white border border-[#e6dfd5] space-y-2">
                <div className="flex items-center gap-2 text-[#22623a]">
                  <MapPin className="w-4 h-4 text-[#c59b27]" />
                  <h4 className="font-serif text-xs sm:text-sm font-bold">Clinic Address</h4>
                </div>
                <p className="text-xs text-[#59534b] leading-relaxed">
                  {CLINIC_INFO.address}
                </p>
                <div className="pt-1">
                  <a
                    href={CLINIC_INFO.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#22623a] hover:text-[#1b502e]"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get Directions on Google Maps</span>
                  </a>
                </div>
              </div>

              {/* Consultation Hours Card */}
              <div className="p-4 rounded-2xl bg-white border border-[#e6dfd5] space-y-2">
                <div className="flex items-center gap-2 text-[#22623a]">
                  <Clock className="w-4 h-4 text-[#c59b27]" />
                  <h4 className="font-serif text-xs sm:text-sm font-bold">Visiting Hours</h4>
                </div>
                <p className="text-xs text-[#59534b]">
                  <strong>Mon – Sat:</strong> {CLINIC_INFO.timings}
                </p>
                <p className="text-xs text-[#8c6a15] font-semibold">
                  <strong>Friday:</strong> {CLINIC_INFO.fridayTimings}
                </p>
                <p className="text-[11px] text-[#7a7268]">
                  Walk-ins welcome. Booking recommended.
                </p>
              </div>
            </div>

            {/* Checklist of What to Expect */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-2 text-xs text-[#59534b]">
                <CheckCircle2 className="w-4 h-4 text-[#22623a] shrink-0" />
                <span>Personal pulse diagnosis & Mizaj (temperament) assessment.</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#59534b]">
                <CheckCircle2 className="w-4 h-4 text-[#22623a] shrink-0" />
                <span>Custom herbal mixtures prepared on-the-spot.</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href={`tel:${CLINIC_INFO.phone}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call: {CLINIC_INFO.phoneFormatted}</span>
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

          {/* Right Column: Physical Clinic Visiting Card (5 cols) */}
          <Reveal delay={0.08} className="lg:col-span-5">
            <div className="bg-[#22623a] rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#143e23]/60 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#c59b27]/20 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-3.5">
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#143e23] border border-[#2d7648] text-[#c59b27] text-xs font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Karachi In-Person</span>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight">
                  Prefer an in-person checkup?
                </h3>

                <p className="text-xs sm:text-sm text-[#f4eee5]/90 leading-relaxed">
                  Reserve a dedicated time slot with Hakim Muhammad Tariq to avoid wait times.
                </p>

                <div className="p-3.5 rounded-xl bg-[#143e23]/80 border border-[#2d7648] text-xs space-y-1.5">
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

                <div className="pt-1">
                  <Link
                    href="/consultation"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-white hover:bg-[#faf8f5] text-[#22623a] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md text-center"
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
