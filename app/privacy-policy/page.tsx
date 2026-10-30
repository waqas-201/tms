import type { Metadata } from "next";
import React from "react";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { CLINIC_INFO } from "@/app/data/products";
import { ShieldCheck, Lock, HeartHandshake, FileText, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy · Patient Confidentiality & Data Security",
  description:
    "Learn how Tameer-e-Sehat protects your personal medical consultations, contact details, and Cash on Delivery order information with complete confidentiality.",
  alternates: {
    canonical: `${SITE_URL}/privacy-policy`,
  },
  openGraph: {
    title: "Privacy Policy · Tameer-e-Sehat Herbal Clinic",
    description:
      "Patient confidentiality, secure health records, and privacy practices at Tameer-e-Sehat in Karachi, Pakistan since 1990.",
    url: `${SITE_URL}/privacy-policy`,
    siteName: "Tameer-e-Sehat",
    locale: "en_PK",
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-surface-subtle text-ink">
      <div className="bg-brand-green-950 text-white py-12 md:py-16 border-b border-brand-green-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-brand-gold-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-green-900/80 border border-brand-gold-500/30 text-brand-gold-300 text-xs font-medium mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Confidentiality & Privacy</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm md:text-base text-white/80 max-w-2xl leading-relaxed">
            At Tameer-e-Sehat (established in 1990 in Karachi, Pakistan), your health concerns, medical history, and personal details are handled with strict privacy and care.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="bg-surface rounded-xl shadow-xs border border-border p-6 md:p-10 space-y-8">
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-brand-green-800">
              <Lock className="w-5 h-5 text-brand-gold-600" />
              <h2 className="font-serif text-lg md:text-xl font-bold text-ink">
                1. Patient Consultation Confidentiality
              </h2>
            </div>
            <p className="text-sm text-ink-muted leading-relaxed">
              When you consult with our Hakeem sahib via online forms, voice messages, or WhatsApp, all health symptoms, medical conditions, and lifestyle information shared remain strictly private between you and the practitioner. We do not sell, rent, or disclose your clinical consultations to third parties.
            </p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <div className="flex items-center gap-2.5 text-brand-green-800">
              <FileText className="w-5 h-5 text-brand-gold-600" />
              <h2 className="font-serif text-lg md:text-xl font-bold text-ink">
                2. Information We Collect For Order Delivery
              </h2>
            </div>
            <p className="text-sm text-ink-muted leading-relaxed">
              To deliver remedies and natural distillates to your doorstep across Pakistan via Cash on Delivery (COD) courier partners, we collect:
            </p>
            <ul className="list-disc pl-5 text-sm text-ink-muted space-y-1.5 leading-relaxed">
              <li>Full Name and Contact Phone Number for courier verification and dispatch SMS updates.</li>
              <li>Complete shipping address including street, landmark, and city.</li>
              <li>Order history and remedy preferences for customer support.</li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <div className="flex items-center gap-2.5 text-brand-green-800">
              <HeartHandshake className="w-5 h-5 text-brand-gold-600" />
              <h2 className="font-serif text-lg md:text-xl font-bold text-ink">
                3. Courier & Third-Party Disclosure
              </h2>
            </div>
            <p className="text-sm text-ink-muted leading-relaxed">
              We only share necessary delivery information (recipient name, address, and phone number) with trusted Pakistani courier partners (such as Leopard, Trax, PostEx, or TCS) solely for package transit and cash collection. Parcels are packaged discreetly with no sensitive health details visible on the outer shipping label.
            </p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <div className="flex items-center gap-2.5 text-brand-green-800">
              <ShieldCheck className="w-5 h-5 text-brand-gold-600" />
              <h2 className="font-serif text-lg md:text-xl font-bold text-ink">
                4. Data Retention & Your Rights
              </h2>
            </div>
            <p className="text-sm text-ink-muted leading-relaxed">
              You may request an update or deletion of your contact records or order details at any time by contacting our support team or visiting our Karachi clinic.
            </p>
            <div className="bg-surface-subtle p-4 rounded-lg border border-border mt-3 text-xs md:text-sm text-ink-muted space-y-1">
              <p><strong>Clinic Address:</strong> {CLINIC_INFO.address}</p>
              <p><strong>Phone / WhatsApp:</strong> {CLINIC_INFO.phone}</p>
              <p><strong>Timings:</strong> {CLINIC_INFO.timings}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
