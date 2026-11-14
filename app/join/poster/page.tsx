"use client";

import { QRCodeSVG } from "@/components/membership/QRCodeSVG";
import { Printer, Sparkles, Smartphone, Gift, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

const JOIN_QR_URL = "https://tameeresehat.com/join?src=qr";

export default function ClinicPosterPage() {
  return (
    <div className="min-h-screen bg-sand-100 py-8 px-4 print:p-0 print:bg-white text-neutral-900">
      {/* Print Controls (Hidden on Print) */}
      <div className="max-w-2xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/join"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-green-800 hover:text-brand-green-950 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Join Form</span>
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-green-700 hover:bg-brand-green-800 text-white font-semibold text-xs shadow transition cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Reception Poster (A4 / Standee)</span>
        </button>
      </div>

      {/* Printable Poster Container */}
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border-2 border-brand-green-800 overflow-hidden print:shadow-none print:border-2 print:border-brand-green-900 print:rounded-2xl">
        {/* Top Header Banner */}
        <div className="bg-brand-green-950 text-white p-8 text-center relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-gold-500/20 border border-brand-gold-400/40 text-brand-gold-300 text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold-400" />
            Official Clinic Reception Poster
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-white tracking-tight">
            تعمیرِ صحت ممبرشپ
          </h1>
          <p className="mt-1 text-lg sm:text-xl font-serif text-brand-gold-300 font-semibold">
            Scan to Join Tameer-e-Sehat Membership
          </p>
          <p className="text-xs sm:text-sm text-brand-green-200 mt-2 max-w-md mx-auto">
            Traditional Unani Tibb • Pure Herbal Remedies • Sunnah Cupping & Hijama
          </p>
        </div>

        {/* Central QR Callout Box */}
        <div className="p-8 sm:p-10 text-center space-y-6">
          {/* Benefit Badge */}
          <div className="inline-block bg-brand-gold-50 border-2 border-brand-gold-400 rounded-2xl px-6 py-3 shadow-sm">
            <div className="text-xs uppercase font-extrabold tracking-wider text-brand-gold-800">
              Welcome Benefit
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-brand-green-950 font-serif mt-0.5">
              Instant ₨ 200 Welcome Voucher
            </div>
            <div className="text-xs font-medium text-neutral-600 mt-0.5">
              Delivered immediately to your phone upon scanning
            </div>
          </div>

          {/* High-Resolution Vector QR Code */}
          <div className="flex flex-col items-center justify-center pt-2">
            <div className="p-5 bg-white rounded-3xl border-4 border-brand-green-900 shadow-lg inline-block">
              <QRCodeSVG
                value={JOIN_QR_URL}
                size={230}
                title="Scan to Join Tameer-e-Sehat Membership"
              />
            </div>
            <p className="mt-3 text-xs font-mono font-bold text-brand-green-900 tracking-wider">
              tameeresehat.com/join?src=qr
            </p>
          </div>

          {/* 3 Step Walkthrough */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-sand-200 text-center">
            <div className="p-3 rounded-2xl bg-sand-50 border border-sand-200 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-brand-green-100 text-brand-green-800 font-bold text-xs flex items-center justify-center mb-1.5">
                1
              </div>
              <Smartphone className="w-4 h-4 text-brand-green-700 mb-1" />
              <span className="text-xs font-bold text-neutral-900">Scan QR Code</span>
              <span className="text-[10px] text-neutral-500 mt-0.5">Point mobile camera</span>
            </div>

            <div className="p-3 rounded-2xl bg-sand-50 border border-sand-200 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-brand-green-100 text-brand-green-800 font-bold text-xs flex items-center justify-center mb-1.5">
                2
              </div>
              <ShieldCheck className="w-4 h-4 text-brand-green-700 mb-1" />
              <span className="text-xs font-bold text-neutral-900">Enter Name & Phone</span>
              <span className="text-[10px] text-neutral-500 mt-0.5">Takes under 60 seconds</span>
            </div>

            <div className="p-3 rounded-2xl bg-sand-50 border border-sand-200 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-brand-green-100 text-brand-green-800 font-bold text-xs flex items-center justify-center mb-1.5">
                3
              </div>
              <Gift className="w-4 h-4 text-brand-green-700 mb-1" />
              <span className="text-xs font-bold text-neutral-900">Get ₨ 200 Voucher</span>
              <span className="text-[10px] text-neutral-500 mt-0.5">Redeem on remedies</span>
            </div>
          </div>
        </div>

        {/* Clinic Footer */}
        <div className="bg-sand-50 border-t border-sand-300 p-4 text-center text-xs text-neutral-600">
          <p className="font-semibold text-brand-green-950">
            Tameer-e-Sehat Matab & Hijama Clinic
          </p>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Lahore, Pakistan • Helpline: +92 300 0000000 • tameeresehat.com
          </p>
        </div>
      </div>
    </div>
  );
}
