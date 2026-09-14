"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "ur";

export interface Translations {
  // Navigation & Header
  freeShippingNotice: string;
  freeShippingAbove: string;
  callUs: string;
  whatsAppConsultation: string;
  home: string;
  about: string;
  consultation: string;
  products: string;
  contact: string;
  consultHakimBtn: string;
  cart: string;
  searchRemedies: string;
  tagline: string;
  est: string;

  // Hero Section
  heroBadge: string;
  heroHeading: string;
  heroHeadingSub: string;
  heroSubtext: string;
  heroUrduPoem: string;
  bookConsultationBtn: string;
  exploreApothecaryBtn: string;
  statExperience: string;
  statPatients: string;
  statFormulations: string;
  statDelivery: string;

  // Trust Pillars
  pillar1Title: string;
  pillar1Urdu: string;
  pillar1Desc: string;
  pillar2Title: string;
  pillar2Urdu: string;
  pillar2Desc: string;
  pillar3Title: string;
  pillar3Urdu: string;
  pillar3Desc: string;
  pillar4Title: string;
  pillar4Urdu: string;
  pillar4Desc: string;

  // Hakim Section
  hakimBadge: string;
  hakimHeading: string;
  hakimQuote: string;
  hakimP1: string;
  hakimP2: string;
  hakimPoint1Title: string;
  hakimPoint1Desc: string;
  hakimPoint2Title: string;
  hakimPoint2Desc: string;
  hakimPoint3Title: string;
  hakimPoint3Desc: string;
  readLineageBtn: string;

  // Featured Products
  featuredBadge: string;
  featuredHeading: string;
  featuredSubtitle: string;
  viewAllFormulations: string;
  inStock: string;
  addToBag: string;
  addedToBag: string;
  instantWhatsAppOrder: string;
  savePercent: string;
  mizajLabel: string;

  // Consultation Process
  processBadge: string;
  processHeading: string;
  processSubtitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;
  startIntakeBtn: string;

  // Testimonials
  testimonialsBadge: string;
  testimonialsHeading: string;
  testimonialsSubtitle: string;
  verifiedPatient: string;

  // Banner
  bannerBadge: string;
  bannerHeading: string;
  bannerSubtitle: string;
  bannerWhatsAppBtn: string;
  bannerOnlineFormBtn: string;

  // Cart & Checkout
  apothecaryBag: string;
  cartEmpty: string;
  cartEmptyDesc: string;
  subtotal: string;
  deliveryCharges: string;
  free: string;
  totalPayable: string;
  checkoutCod: string;
  orderOnWhatsApp: string;
  addMoreForFreeDelivery: string;
  codNotice: string;
  recipientName: string;
  fullName: string;
  mobileNumber: string;
  phone: string;
  deliveryAddress: string;
  completeStreetAddress: string;
  deliveryCity: string;
  city: string;
  emailOptional: string;
  specialInstructions: string;
  placeOrderBtn: string;
  confirmCodOrder: string;
  orderConfirmed: string;
  orderNumber: string;
  orderSummary: string;
  paymentMethod: string;
  continueBrowsing: string;

  // Contact
  clinicDispensary: string;
  physicalAddress: string;
  directHotline: string;
  hoursTitle: string;
  hoursText: string;
  sendInquiry: string;
  faqTitle: string;

  // Consultation Page
  consultationHeading: string;
  consultationSubtitle: string;

  // Contact Page
  contactHeading: string;
  contactSubtitle: string;
  address: string;
  timings: string;
  sendMessage: string;
}

export const DICTIONARY: Record<Language, Translations> = {
  en: {
    // Navigation & Header
    freeShippingNotice: "Free Delivery",
    freeShippingAbove: "across Pakistan on orders above ₨ 2,000 · Cash on Delivery (COD)",
    callUs: "Call Hotline",
    whatsAppConsultation: "WhatsApp Consultation",
    home: "Home",
    about: "The Hakim & Heritage",
    consultation: "Online Consultation",
    products: "Herbal Apothecary",
    contact: "Clinic & Contact",
    consultHakimBtn: "Consult Hakim",
    cart: "Apothecary Bag",
    searchRemedies: "Search remedies, herbs, illnesses...",
    tagline: "Traditional Unani Medicine & Small-Batch Apothecary",
    est: "Est. 1990 · Karachi",

    // Hero Section
    heroBadge: "Classical Unani Medicine · Karachi, Pakistan",
    heroHeading: "Restore Innate Vitality with",
    heroHeadingSub: "35+ Years of Classical Tibb",
    heroSubtext:
      "Bridging authentic Greco-Arab healing with small-batch herbal purity. Personalized Hakim pulse consultations, steam distillates, and traditional fruit preserves across Pakistan.",
    heroUrduPoem: "مستند قرابادین و قدیم نسخہ جات · 35 سالہ طبیب کا اعتماد",
    bookConsultationBtn: "Consult Hakim Online",
    exploreApothecaryBtn: "Explore Formulations",
    statExperience: "Years Clinical Heritage",
    statPatients: "Patients Treated",
    statFormulations: "Pure Formulations",
    statDelivery: "Cash on Delivery",

    // Trust Pillars
    pillar1Title: "Artisanal Small Batches",
    pillar1Urdu: "خالص روایتی تیاری",
    pillar1Desc: "Crafted in small quantities using traditional steam distillations and unfiltered wild honey.",
    pillar2Title: "35+ Years Registered Practice",
    pillar2Urdu: "مستند تجربہ کار حکماء",
    pillar2Desc: "Decades of clinical pulse diagnosis (*Nabz*) and temperament balancing in Karachi.",
    pillar3Title: "Zero Synthetic Chemicals",
    pillar3Urdu: "کیمیکل و سٹیرائیڈ سے پاک",
    pillar3Desc: "No steroids, chemical preservatives, or synthetic binders. Pure, potent botanicals.",
    pillar4Title: "Nationwide Tracked Dispatch",
    pillar4Urdu: "ملک گیر کیش آن ڈیلیوری",
    pillar4Desc: "Free delivery across Pakistan on orders above ₨ 2,000 with Cash on Delivery (COD).",

    // Hakim Section
    hakimBadge: "Clinical Philosophy · کراچی کا مستند مطب",
    hakimHeading: "The Philosophy of Tabiat: Healing from the Roots",
    hakimQuote: "“A true physician does not merely suppress symptoms; he restores the innate vital intelligence (*Tabiat*) of the body.”",
    hakimP1:
      "At Tameer-e-Sehat, every remedy is rooted in centuries-old Unani medicine (Tibb-e-Unani). For more than 35 years in Karachi, our dispensary has maintained strict classical standards in herb selection, maceration, and patient diagnostics.",
    hakimP2:
      "Whether addressing chronic digestive heat, hepatic fatigue, joint inflammation, or vitality decline, our approach treats the patient's individual constitution (*Mizaj*) rather than just isolated symptoms.",
    hakimPoint1Title: "Temperament-Based Diagnosis (Mizaj)",
    hakimPoint1Desc: "Matching warm, cold, dry, and moist herbal preparations to your internal biological state.",
    hakimPoint2Title: "Classical Steam Distillation (Arqiyat)",
    hakimPoint2Desc: "Using traditional Deg-Bhabka methods to extract delicate aromatic volatile essences.",
    hakimPoint3Title: "Dietary Guidance & Parhez",
    hakimPoint3Desc: "Providing comprehensive dietary guidelines alongside herbal remedies for enduring relief.",
    readLineageBtn: "Read Full Hakim Dossier",

    // Featured Products
    featuredBadge: "Handcrafted Apothecary",
    featuredHeading: "Signature Classical Formulations",
    featuredSubtitle: "Carefully formulated, slow-simmered, and steam-distilled for maximum bio-available efficacy.",
    viewAllFormulations: "View All Formulations",
    inStock: "In Stock · Dispatches in 24h",
    addToBag: "Add to Bag",
    addedToBag: "Added to Bag",
    instantWhatsAppOrder: "Instant WhatsApp Order",
    savePercent: "Save",
    mizajLabel: "Mizaj",

    // Consultation Process
    processBadge: "How It Works · طریقہ علاج",
    processHeading: "Your 4-Step Healing Journey",
    processSubtitle: "Experience individualized Eastern healthcare from the comfort of your home anywhere in Pakistan.",
    step1Title: "Submit Health Intake",
    step1Desc: "Fill out our confidential questionnaire describing your symptoms, duration, and lifestyle.",
    step2Title: "Hakim's Case Analysis",
    step2Desc: "Hakim Sahib reviews your case to determine your thermal temperament and root imbalance.",
    step3Title: "Consultation & Prescription",
    step3Desc: "Receive detailed audio/text guidance on WhatsApp with custom dietary rules (*Parhez*).",
    step4Title: "Doorstep Herbal Delivery",
    step4Desc: "Your freshly packed, sealed remedies arrive via express courier with Cash on Delivery.",
    startIntakeBtn: "Start Patient Questionnaire",

    // Testimonials
    testimonialsBadge: "Patient Experiences · شکریہ و تاثرات",
    testimonialsHeading: "Trusted by Generations Across Pakistan",
    testimonialsSubtitle: "Real stories of relief, restored vitality, and balanced health under our clinical guidance.",
    verifiedPatient: "Verified Patient",

    // Banner
    bannerBadge: "Direct Clinical Hotline",
    bannerHeading: "Have a Health Concern? Speak Directly with Our Clinic",
    bannerSubtitle: "Get honest, classical guidance for chronic gastric, liver, joint, or lifestyle issues.",
    bannerWhatsAppBtn: "WhatsApp Audio / Message",
    bannerOnlineFormBtn: "Submit Health Questionnaire",

    // Cart & Checkout
    apothecaryBag: "Your Apothecary Bag",
    cartEmpty: "Your Apothecary Bag is Empty",
    cartEmptyDesc: "Please select your desired herbal preserves, distillates, or pain relief oils before checking out.",
    subtotal: "Subtotal",
    deliveryCharges: "Delivery Charges",
    free: "FREE",
    totalPayable: "Total Amount (COD)",
    checkoutCod: "Proceed to Checkout (COD)",
    orderOnWhatsApp: "Order All Items on WhatsApp",
    addMoreForFreeDelivery: "Add ₨ {amount} more products for FREE Delivery!",
    codNotice: "Cash on Delivery (COD) · Pay when parcel arrives at your doorstep",
    recipientName: "Full Recipient Name",
    fullName: "Full Name",
    mobileNumber: "Mobile Phone / WhatsApp Number",
    phone: "Phone / WhatsApp",
    deliveryAddress: "Delivery & Shipping Address",
    completeStreetAddress: "Complete Street Address & Landmark",
    deliveryCity: "City",
    city: "City / Town",
    emailOptional: "Email Address (Optional)",
    specialInstructions: "Special Delivery Instructions (Optional)",
    placeOrderBtn: "Confirm & Place Order",
    confirmCodOrder: "Confirm Cash on Delivery Order",
    orderConfirmed: "JazakAllah, Your Order is Confirmed!",
    orderNumber: "Order Number",
    orderSummary: "Order Summary",
    paymentMethod: "Payment Method",
    continueBrowsing: "Continue Browsing Apothecary",

    // Contact
    clinicDispensary: "Karachi Clinic & Dispensary",
    physicalAddress: "Physical Address",
    directHotline: "Direct Hotline & Appointments",
    hoursTitle: "Dispensary & Clinic Hours",
    hoursText: "Monday – Saturday: 10:00 AM – 9:00 PM PST",
    sendInquiry: "Send a Message to Clinic",
    faqTitle: "Frequently Asked Patient Questions",

    // Consultation Page
    consultationHeading: "Confidential Online Hakim Consultation",
    consultationSubtitle:
      "Complete this confidential diagnostic questionnaire and receive a personalized Unani temperament (Mizaj) assessment and herbal prescription via WhatsApp, usually within 2–4 hours.",
    contactHeading: "Contact Our Clinic & Dispensary",
    contactSubtitle:
      "Reach the Hakim's clinical desk directly for appointments, prescription queries, and nationwide herbal medicine delivery.",
    address: "Address",
    timings: "Timings",
    sendMessage: "Send a Message to the Clinic",
  },

  ur: {
    // Navigation & Header
    freeShippingNotice: "مفت ہوم ڈیلیوری",
    freeShippingAbove: "پورے پاکستان میں 2,000 روپے سے زائد کے آرڈر پر مفت ڈیلیوری · کیش آن ڈیلیوری",
    callUs: "طبی ہیلپ لائن",
    whatsAppConsultation: "واٹس ایپ طبی مشورہ",
    home: "صفحۂ اول",
    about: "حکیم و تاریخ",
    consultation: "آن لائن طبی معائنہ",
    products: "یونانی ادویات و قرابادین",
    contact: "مطب و رابطہ",
    consultHakimBtn: "حکیم صاحب سے مشورہ",
    cart: "آپ کا تھیلا",
    searchRemedies: "ادویات، جڑی بوٹیاں اور امراض تلاش کریں...",
    tagline: "مستند یونانی ادویات، کشیدات و روایتی مربہ جات",
    est: "قیام 1990ء · کراچی",

    // Hero Section
    heroBadge: "مستند یونانی حکمت · کراچی مطب",
    heroHeading: "قدرتی شفا اور طبعی توازن کا حصول",
    heroHeadingSub: "35 سالہ مستند طبی تجربہ اور اعتماد",
    heroSubtext:
      "خالص یونانی نباتاتی ادویات، کشیدہ عرقات اور ہاتھ سے تیار کردہ مربہ جات کے ذریعے صحت کی بحالی۔ کراچی میں بالمشافہ معائنہ اور پورے پاکستان میں آن لائن مشورہ اور ترسیل۔",
    heroUrduPoem: "مستند قرابادین و قدیم نسخہ جات · 35 سالہ طبیب کا اعتماد",
    bookConsultationBtn: "آن لائن طبی مشورہ حاصل کریں",
    exploreApothecaryBtn: "ادویات و نسخہ جات دیکھیں",
    statExperience: "سالہ طبی خدمات",
    statPatients: "صحت یاب مریض",
    statFormulations: "خالص قدرتی مرکبات",
    statDelivery: "کیش آن ڈیلیوری پاکستان",

    // Trust Pillars
    pillar1Title: "خالص روایتی تیاری",
    pillar1Urdu: "دستکاری و پاکیزگی",
    pillar1Desc: "قدیم دیگ بھبکہ کے عرقات اور خالص شہد میں بنے مربہ جات کی محدود دستکاری تیاری۔",
    pillar2Title: "35 سالہ مطب و معائنہ",
    pillar2Urdu: "مستند حکماء کا اعتماد",
    pillar2Desc: "کراچی میں دہائیوں سے نبض شناسی، تشخیصِ مزاج اور مخلصانہ معالجاتی خدمات۔",
    pillar3Title: "کیمیکل و سٹیرائیڈ سے پاک",
    pillar3Urdu: "100% قدرتی جڑی بوٹیاں",
    pillar3Desc: "کسی مصنوعی رنگ، کیمیکل یا سٹیرائیڈ کی ملاوٹ کے بغیر خالص نباتاتی ادویات۔",
    pillar4Title: "ملک گیر کیش آن ڈیلیوری",
    pillar4Urdu: "محفوظ ترین ترسیل",
    pillar4Desc: "پورے پاکستان میں تیز رفتار کوریئر کے ذریعے پارسل کی وصولی پر رقم کی ادائیگی۔",

    // Hakim Section
    hakimBadge: "طبی فلسفہ · طبعی اعتدال",
    hakimHeading: "طبیعتِ مدبرۂ بدن: مرض کی جڑ سے شفا",
    hakimQuote: "”ایک سچا طبیب علامات کو دبانے کے بجائے جسم کی قدرتی دفاعی قوت (طبیعت) کو بیدار کرتا ہے۔“",
    hakimP1:
      "تعمیرِ صحت میں ہر دوا طبِ یونانی کے مستند اصولوں کے عین مطابق تیار کی جاتی ہے۔ 35 سال سے زائد عرصے سے ہمارا مطب جڑی بوٹیوں کے انتخاب، کشید کاری اور نبض شناسی میں اعلیٰ ترین معیار پر قائم ہے۔",
    hakimP2:
      "چاہے معدے اور جگر کی گرمی ہو، جوڑوں کا پرانا درد ہو یا اعصابی کمزوری—ہمارا طریقہ علاج وقتی تسکین کے بجائے آپ کے انفرادی مزاج کو معتدل کرتا ہے۔",
    hakimPoint1Title: "تشخیصِ مزاج (Mizaj)",
    hakimPoint1Desc: "آپ کی جسمانی کیفیت کے مطابق گرم، سرد، تر یا خشک ادویات کا درست انتخاب۔",
    hakimPoint2Title: "قدیم کشیدات (Arqiyat)",
    hakimPoint2Desc: "دیگ بھبکہ طریقہ کار سے مکو اور کاسنی کے لطیف جوہرات کو محفوظ بنانا۔",
    hakimPoint3Title: "پرہیز اور غذائی رہنمائی",
    hakimPoint3Desc: "علاج کے ساتھ ساتھ موافق اور ناموافق غذاؤں کی تفصیلی فہمائش۔",
    readLineageBtn: "حکیم صاحب اور تاریخ کا مطالعہ کریں",

    // Featured Products
    featuredBadge: "منتخب یونانی ادویات",
    featuredHeading: "مستند قرابادینی مرکبات",
    featuredSubtitle: "خالص جڑی بوٹیوں سے تیار کردہ اکسیر عرقات، دیسی مربہ جات اور روغنیات۔",
    viewAllFormulations: "تمام ادویات دیکھیں",
    inStock: "دستیاب ہے · 24 گھنٹے میں روانگی",
    addToBag: "تھیلے میں شامل کریں",
    addedToBag: "شامل ہو گیا",
    instantWhatsAppOrder: "واٹس ایپ پر فوری آرڈر",
    savePercent: "رعایت",
    mizajLabel: "مزاج",

    // Consultation Process
    processBadge: "طریقہ علاج و مشورہ",
    processHeading: "شفا کی جانب 4 آسان مراحل",
    processSubtitle: "اپنے گھر بیٹھے پاکستان کے کسی بھی شہر سے مستند حکیم صاحب سے رہنمائی حاصل کریں۔",
    step1Title: "طبی فارم پر کریں",
    step1Desc: "اپنی علامات، مدتِ مرض اور موجودہ ادویات کا آسان سوالنامہ مکمل کریں۔",
    step2Title: "حکیم صاحب کا جائزہ",
    step2Desc: "حکیم صاحب آپ کے مزاج اور مرض کے اصل اسباب کا باریک بینی سے جائزہ لیتے ہیں۔",
    step3Title: "مفصل مشورہ و نسخہ",
    step3Desc: "واٹس ایپ پر آڈیو اور تحریری نسخہ مع پرہیز کی تفصیلی معلومات موصول کریں۔",
    step4Title: "گھر پر دوائی کی وصولی",
    step4Desc: "تازہ تیار شدہ ادویات کوریئر کے ذریعے آپ کے پتے پر کیش آن ڈیلیوری پہنچائی جاتی ہیں۔",
    startIntakeBtn: "طبی سوالنامہ شروع کریں",

    // Testimonials
    testimonialsBadge: "مریضوں کے تاثرات و شکریہ",
    testimonialsHeading: "پاکستان بھر میں دہائیوں کا اعتماد",
    testimonialsSubtitle: "شفا پانے والے مریضوں کے حقیقی اور مستند بیانات۔",
    verifiedPatient: "مستند مریض",

    // Banner
    bannerBadge: "مطب ہیلپ لائن",
    bannerHeading: "صحت کا کوئی بھی مسئلہ ہو؟ براہِ راست رابطہ کریں",
    bannerSubtitle: "معدہ، جگر، جوڑوں کے درد یا عمومی کمزوری کے لیے مخلصانہ اور بے لوث رہنمائی۔",
    bannerWhatsAppBtn: "واٹس ایپ پر رابطہ کریں",
    bannerOnlineFormBtn: "آن لائن طبی فارم پُر کریں",

    // Cart & Checkout
    apothecaryBag: "آپ کا ادویاتی تھیلا",
    cartEmpty: "آپ کا تھیلا ابھی خالی ہے",
    cartEmptyDesc: "براہِ کرم آرڈر کرنے کے لیے اپنی مطلوبہ یونانی ادویات یا مربہ جات منتخب کریں۔",
    subtotal: "کل رقم (سب ٹوٹل)",
    deliveryCharges: "کوریئر ترسیل چارجز",
    free: "مفت",
    totalPayable: "کل واجب الادا رقم",
    checkoutCod: "کیش آن ڈیلیوری آرڈر کریں",
    orderOnWhatsApp: "تمام اشیاء کا واٹس ایپ آرڈر",
    addMoreForFreeDelivery: "مفت ڈیلیوری کے لیے مزید {amount} روپے کی خریداری کریں!",
    codNotice: "کیش آن ڈیلیوری · پارسل ملنے پر رقم ادا کریں",
    recipientName: "خریدار کا مکمل نام",
    fullName: "مکمل نام",
    mobileNumber: "موبائل فون / واٹس ایپ نمبر",
    phone: "فون نمبر / واٹس ایپ",
    deliveryAddress: "گھر یا دکان کا مکمل پتہ",
    completeStreetAddress: "گھر کا مکمل پتہ اور قریبی مشہور جگہ",
    deliveryCity: "شہر",
    city: "شہر / قصبہ",
    emailOptional: "ای میل پتہ (اختیاری)",
    specialInstructions: "ڈیلیوری کے لیے خاص ہدایات (اختیاری)",
    placeOrderBtn: "آرڈر کی حتمی تصدیق کریں",
    confirmCodOrder: "کیش آن ڈیلیوری آرڈر کنفرم کریں",
    orderConfirmed: "جزاک اللہ! آپ کا آرڈر کامیابی سے موصول ہو گیا ہے",
    orderNumber: "آرڈر نمبر",
    orderSummary: "خلاصۂ آرڈر",
    paymentMethod: "طریقہ ادائیگی",
    continueBrowsing: "مزید ادویات دیکھیں",

    // Contact
    clinicDispensary: "کراچی مطب و ڈسپنسری",
    physicalAddress: "مطب کا پتہ",
    directHotline: "مطب ٹیلیفون و اپائنٹمنٹ",
    hoursTitle: "مطب اور ڈسپنسری کے اوقات",
    hoursText: "پیر تا ہفتہ: صبح 10:00 بجے تا رات 9:00 بجے",
    sendInquiry: "مطب کو براہِ راست پیغام بھیجیں",
    faqTitle: "مریضوں کے عام اور اہم سوالات",

    // Consultation Page
    consultationHeading: "حکیم صاحب سے خفیہ آن لائن طبی معائنہ",
    consultationSubtitle:
      "یہ خفیہ طبی سوالنامہ مکمل کریں اور واٹس ایپ کے ذریعے حکیم صاحب کی طرف سے آپ کے مزاج کی تشخیص اور ذاتی نسخہ حاصل کریں، عموماً 2 تا 4 گھنٹے میں۔",
    contactHeading: "ہمارے مطب و ڈسپنسری سے رابطہ کریں",
    contactSubtitle:
      "اپائنٹمنٹ، نسخہ جات اور ملک گیر ادویات کی ترسیل کے لیے براہِ راست حکیم صاحب کی کلینکل ڈیسک سے رابطہ کریں۔",
    address: "پتہ",
    timings: "اوقات",
    sendMessage: "مطب کو پیغام بھیجیں",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isUrdu: boolean;
  t: (key: keyof Translations, params?: Record<string, string | number>) => string;
  translations: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("tms_language") as Language | null;
    if (saved === "en" || saved === "ur") {
      setLanguageState(saved);
      document.documentElement.dir = saved === "ur" ? "rtl" : "ltr";
      document.documentElement.lang = saved;
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("tms_language", lang);
      document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
      document.documentElement.lang = lang;
    }
  };

  const toggleLanguage = () => {
    const nextLang: Language = language === "en" ? "ur" : "en";
    setLanguage(nextLang);
  };

  const isUrdu = language === "ur";
  const translations = DICTIONARY[language];

  const t = (key: keyof Translations, params?: Record<string, string | number>): string => {
    let text = translations[key] || DICTIONARY.en[key] || "";
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        isUrdu,
        t,
        translations,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
