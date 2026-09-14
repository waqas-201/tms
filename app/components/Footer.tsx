"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { CLINIC_INFO } from "@/app/data/products";
import { useLanguage } from "@/app/context/LanguageContext";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  MessageCircle,
  Truck,
  Leaf,
  HeartHandshake,
} from "lucide-react";

export default function Footer() {
  const { t, isUrdu } = useLanguage();

  return (
    <footer className="bg-[#123824] text-[#f4eee5] border-t border-[#1a4d33] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Feature Pillars Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-[#1a4d33]/80">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#1a4d33] flex items-center justify-center text-[#c59b27] shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                {isUrdu ? "100% خالص جڑی بوٹیاں" : "100% Pure Botanicals"}
              </h4>
              <p className="text-xs text-[#f4eee5]/70 mt-0.5">
                {isUrdu
                  ? "کیمیکل اور مصنوعی رنگوں سے مکمل پاک دیسی ادویات۔"
                  : "Authentic, chemical-free herbs sourced from certified organic harvests."}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#1a4d33] flex items-center justify-center text-[#c59b27] shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                {isUrdu ? "مستند حکیم کی تیاری" : "Hakim Formulated"}
              </h4>
              <p className="text-xs text-[#f4eee5]/70 mt-0.5">
                {isUrdu
                  ? "کراچی میں 1990ء سے 35 سالہ مستند طبی خدمات۔"
                  : "35+ years of clinical Unani Tibb expertise since 1990 in Karachi."}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#1a4d33] flex items-center justify-center text-[#c59b27] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                {isUrdu ? "ملک گیر کیش آن ڈیلیوری" : "Pakistan-Wide COD"}
              </h4>
              <p className="text-xs text-[#f4eee5]/70 mt-0.5">
                {isUrdu
                  ? "کراچی، لاہور، اسلام آباد اور تمام چھوٹے بڑے شہروں میں ترسیل۔"
                  : "Fast courier dispatch to Karachi, Lahore, Islamabad, and all cities."}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#1a4d33] flex items-center justify-center text-[#c59b27] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                {isUrdu ? "مکمل راز داری کا تحفظ" : "Confidential Care"}
              </h4>
              <p className="text-xs text-[#f4eee5]/70 mt-0.5">
                {isUrdu
                  ? "مریض کی علامات اور ریکارڈ کا مکمل طبی رازداری سے تحفظ۔"
                  : "Discreet health consultations with strict privacy protection."}
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col (2 spans) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white p-1">
                <Image
                  src="/images/cropped-logo.png"
                  alt="Tameer-e-Sehat"
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div>
                <span className="font-serif text-xl font-bold tracking-tight text-white">
                  Tameer-e-Sehat
                </span>
                <span className="block text-xs text-[#c59b27] font-medium tracking-wide">
                  تعمیرِ صحت · مرکزِ علاج بالطب و حکمت
                </span>
              </div>
            </div>

            <p className="text-xs text-[#f4eee5]/80 leading-relaxed max-w-sm">
              {isUrdu
                ? "تعمیرِ صحت 1990ء سے پاکستان میں یونانی حکمت اور قدرتی جڑی بوٹیوں کی خالص تیاری کے لیے ایک بااعتماد ادارہ ہے۔ ہم روایتی حکمت کو دورِ جدید کے معیار کے ساتھ ملا کر عوام تک پہنچاتے ہیں۔"
                : "Established in 1990, Tameer-e-Sehat is a trusted Pakistani botanical health house and clinical practice. We bridge classical Greco-Arab Unani medicine with contemporary quality standards to bring pure, honest remedies to Pakistani households."}
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a
                href={`https://wa.me/${CLINIC_INFO.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold rounded-md transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{isUrdu ? "واٹس ایپ ڈیسک" : "WhatsApp Health Desk"}</span>
              </a>
              <Link
                href="/consultation"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1a4d33] hover:bg-[#256644] text-white text-xs font-semibold rounded-md transition-colors border border-[#256644]"
              >
                <span>{isUrdu ? "طبی معائنہ فارم" : "Request Consultation"}</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-[#c59b27] uppercase tracking-wider">
              {isUrdu ? "اہم لنکس" : "Navigation"}
            </h4>
            <ul className="space-y-2 text-xs text-[#f4eee5]/80">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link href="/consultation" className="hover:text-white transition-colors">
                  {t("consultation")}
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  {t("products")}
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-white transition-colors">
                  {isUrdu ? "آرڈر ٹریکنگ" : "Track Order"}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Formulations / Categories */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-[#c59b27] uppercase tracking-wider">
              {isUrdu ? "ادویات و قرابادین" : "Formulations"}
            </h4>
            <ul className="space-y-2 text-xs text-[#f4eee5]/80">
              <li>
                <Link href="/products?category=murabbajaat" className="hover:text-white transition-colors">
                  Murabbajaat (مربہ جات)
                </Link>
              </li>
              <li>
                <Link href="/products?category=arqiyat" className="hover:text-white transition-colors">
                  Pure Arqiyat (عرق و کشیدات)
                </Link>
              </li>
              <li>
                <Link href="/products?category=oils-marham" className="hover:text-white transition-colors">
                  Pain Relief Oils & Marham (روغنیات)
                </Link>
              </li>
              <li>
                <Link href="/products?category=herbs-seeds" className="hover:text-white transition-colors">
                  Single Herbs & Mufradat (مفردات)
                </Link>
              </li>
              <li>
                <Link href="/products?category=teas-vitality" className="hover:text-white transition-colors">
                  Vitality Teas & Seeds (مقویات)
                </Link>
              </li>
              <li className="pt-2 border-t border-[#1a4d33]/50">
                <Link href="/admin" className="text-[#c59b27] hover:underline font-semibold">
                  {isUrdu ? "حکیم و ایڈمن پورٹل" : "Hakim & Admin Portal"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Clinic & Contact Info */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-[#c59b27] uppercase tracking-wider">
              {t("clinicDispensary")}
            </h4>
            <div className="space-y-2.5 text-xs text-[#f4eee5]/80">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#c59b27] shrink-0 mt-0.5" />
                <span>{CLINIC_INFO.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#c59b27] shrink-0" />
                <a href={`tel:${CLINIC_INFO.phone}`} className="hover:text-white" dir="ltr">
                  {CLINIC_INFO.phoneFormatted}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#c59b27] shrink-0" />
                <a href={`mailto:${CLINIC_INFO.email}`} className="hover:text-white">
                  {CLINIC_INFO.email}
                </a>
              </div>
              <div className="flex items-start gap-2 pt-1 border-t border-[#1a4d33]/50">
                <Clock className="w-4 h-4 text-[#c59b27] shrink-0 mt-0.5" />
                <div>
                  <p>{CLINIC_INFO.timings}</p>
                  <p className="text-[#c59b27]">{CLINIC_INFO.fridayTimings}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Safety & Legal Disclaimer */}
        <div className="pt-8 border-t border-[#1a4d33]/60 space-y-3 text-[11px] text-[#f4eee5]/60 leading-relaxed">
          <p>
            <strong className="text-[#c59b27]">{isUrdu ? "ضروری طبی تنبیہ:" : "Important Healthcare Notice:"}</strong> {isUrdu
              ? "اس ویب سائٹ پر فراہم کردہ معلومات اور یونانی مرکبات قدیم طب کے مستند اصولوں پر مبنی ہیں جو طبعی اعتدال کے لیے تیار کیے گئے ہیں۔ یہ ہنگامی طبی یا جراحی علاج کا متبادل نہیں ہیں۔ حاملہ خواتین یا شدید امراض میں مبتلا افراد استعمال سے قبل اپنے معالج یا حکیم صاحب سے ضرور مشورہ کریں۔"
              : "The traditional Unani/herbal formulations and guidance offered on this website are based on established Eastern herbal pharmacopeia (Tibb-e-Unani). They are designed for holistic wellness and constitutional balance (Mizaj). They are not intended to replace emergency medical treatments or allopathic surgical care. Pregnant women and individuals undergoing critical pharmaceutical therapy should consult their healthcare practitioner before introducing new herbal regimens."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1a4d33]/40 text-xs">
            <p>
              &copy; {new Date().getFullYear()} {CLINIC_INFO.brandName} ({CLINIC_INFO.brandUrdu}). All rights reserved. Registered Herbal Health House, Karachi, Pakistan.
            </p>
            <div className="flex items-center gap-4 text-[#f4eee5]/70">
              <Link href="/consultation" className="hover:text-white transition-colors">
                {isUrdu ? "طبی ضوابط" : "Consultation Ethics"}
              </Link>
              <span>·</span>
              <Link href="/track-order" className="hover:text-white transition-colors">
                {isUrdu ? "آرڈر ٹریکنگ" : "Track Order"}
              </Link>
              <span>·</span>
              <Link href="/contact" className="hover:text-white transition-colors">
                {isUrdu ? "رازداری پالیسی" : "Privacy Policy"}
              </Link>
              <span>·</span>
              <Link href="/login" className="hover:text-white transition-colors">
                {isUrdu ? "لاگ ان" : "Sign In"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
