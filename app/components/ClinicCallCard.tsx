"use client";

import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import { CLINIC_INFO } from "@/app/data/products";

/**
 * The single call-to-clinic panel shown next to confirmed appointments.
 * Patients get one obvious way to reach the matab from inside the platform,
 * instead of hunting for the helpline in the footer.
 */
export default function ClinicCallCard() {
  return (
    <div className="rounded-2xl border border-brand-green-200 bg-brand-green-50/60 p-4 sm:p-5 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-sm font-bold text-primary">
            Matab Tameer-e-Sehat · Contact &amp; Call
          </h3>
          <p className="text-[11px] text-ink-muted">
            Quote your ticket number when you call so the clinic can pull up
            your dossier immediately.
          </p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wide text-success bg-success-soft border border-success-line rounded-full px-2 py-0.5">
          Clinic open Mon–Sat
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={`tel:${CLINIC_INFO.phoneFormatted.replace(/[^0-9+]/g, "")}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-inverse text-white text-xs font-bold hover:bg-brand-green-900 transition-colors"
        >
          <Phone className="w-4 h-4" />
          <span>Call {CLINIC_INFO.phoneFormatted}</span>
        </a>
        <a
          href={`https://wa.me/${CLINIC_INFO.whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-whatsapp text-on-whatsapp text-xs font-bold hover:bg-whatsapp-hover transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp the Hakeem</span>
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-ink-body">
        <p className="flex items-start gap-1.5">
          <Clock className="w-3.5 h-3.5 text-secondary-text shrink-0 mt-0.5" />
          <span>
            {CLINIC_INFO.timings}
            <br />
            {CLINIC_INFO.fridayTimings}
          </span>
        </p>
        <p className="flex items-start gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-secondary-text shrink-0 mt-0.5" />
          <span>
            {CLINIC_INFO.address}
            <br />
            <a
              href={CLINIC_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              View on Google Maps
            </a>
          </span>
        </p>
      </div>
    </div>
  );
}
