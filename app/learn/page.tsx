"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Sparkles,
  Droplets,
  Leaf,
  Heart,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Moon,
  Sun,
  Activity,
  Flame,
  Coffee,
  Check,
} from "lucide-react";

type LearnTab = "hijama" | "remedies" | "principles" | "disclaimer";

interface BotanicalItem {
  id: string;
  nameUrdu: string;
  nameArabic: string;
  nameEnglish: string;
  scientificName: string;
  hadithCitation: string;
  benefits: string[];
  usageGuidelines: string;
  matchedProductLink: string;
  productBadge: string;
}

const PROPHETIC_REMEDIES: BotanicalItem[] = [
  {
    id: "ajwa",
    nameUrdu: "عجوہ کھجور مدینہ منورہ",
    nameArabic: "العجوة",
    nameEnglish: "Ajwa Dates of Al-Madinah",
    scientificName: "Phoenix dactylifera",
    hadithCitation:
      'Sahih Bukhari 5445: "Whoever takes seven Ajwa dates in the morning, neither magic nor poison will harm him that day."',
    benefits: [
      "Potent antioxidant rich in polyphenols and flavonoids",
      "Strengthens cardiac muscles and arterial compliance",
      "Natural sustained glycemic index for healthy energy",
      "Essential minerals: potassium, magnesium, and dietary fibre",
    ],
    usageGuidelines: "Eat 7 whole dates every morning on an empty stomach with a glass of lukewarm water.",
    matchedProductLink: "/products?search=ajwa",
    productBadge: "Cardiovascular Health",
  },
  {
    id: "sidr-honey",
    nameUrdu: "خالص بیری کا شہد",
    nameArabic: "عسل السدر",
    nameEnglish: "Pure Wild Sidr Honey",
    scientificName: "Ziziphus spina-christi nectar",
    hadithCitation:
      'Surah An-Nahl 16:69: "...There comes forth from their bellies, a drink of varying colour wherein is healing for men."',
    benefits: [
      "Natural broad-spectrum antibacterial and enzymatic activity",
      "Promotes rapid gastric ulcer and mucosal lining repair",
      "Soothes respiratory tract inflammation and chronic cough",
      "Low moisture content with high natural prebiotic density",
    ],
    usageGuidelines: "Dissolve 1 tablespoon in warm (not boiling) water and drink 30 minutes before breakfast.",
    matchedProductLink: "/products?search=honey",
    productBadge: "Gut & Immunity",
  },
  {
    id: "kalonji",
    nameUrdu: "کلونجی (سیاہ دانہ)",
    nameArabic: "الحبة السوداء",
    nameEnglish: "Black Seed / Nigella Sativa",
    scientificName: "Nigella sativa",
    hadithCitation:
      'Sahih Bukhari 5688: "Use this Black Seed, for indeed it contains a cure for every disease except death."',
    benefits: [
      "High concentration of Thymoquinone (TQ) bioactive compound",
      "Powerful anti-inflammatory and immunomodulatory action",
      "Bronchodilator supporting asthma and seasonal allergy relief",
      "Supports liver detoxification and blood sugar regulation",
    ],
    usageGuidelines: "Take 1/4 teaspoon ground seed with pure Sidr honey, or 3-5 drops of cold-pressed oil daily.",
    matchedProductLink: "/products?search=kalonji",
    productBadge: "Immune Defense",
  },
  {
    id: "talbina",
    nameUrdu: "تلبینہ نبوی (جو کا دلیہ)",
    nameArabic: "التلبينة",
    nameEnglish: "Talbina Barley Porridge",
    scientificName: "Hordeum vulgare",
    hadithCitation:
      'Sahih Bukhari 5417: "The Talbina brings comfort to the grieving heart and relieves sorrow as water washes away dirt from your face."',
    benefits: [
      "Rich in beta-glucan soluble fibre for cholesterol reduction",
      "Contains tryptophan and zinc to alleviate stress and mild depression",
      "Soothes irritable bowel, colitis, and digestive inflammation",
      "Gentle nutrient absorption suitable for recovering convalescents",
    ],
    usageGuidelines: "Slow-cook whole barley flour with organic milk and sweeten gently with pure honey.",
    matchedProductLink: "/products?search=talbina",
    productBadge: "Mental & Gut Wellness",
  },
  {
    id: "senna",
    nameUrdu: "سنا مکی",
    nameArabic: "السنا والموت",
    nameEnglish: "Senna Leaves / Sanā Makkī",
    scientificName: "Senna alexandrina",
    hadithCitation:
      'Sunan Ibn Majah 3457: "Upon you is Senna and Sanoot (cumin/honey), for in both of them is a cure for every ailment except death."',
    benefits: [
      "Anthraquinone glycosides promote healthy bowel motility",
      "Assists in clearing toxic stagnant residues from colon",
      "Classical gentle purgative when formulated with carminative herbs",
    ],
    usageGuidelines: "Infuse leaves in hot water with fennel or ginger. Use intermittently under clinical guidance.",
    matchedProductLink: "/products?search=senna",
    productBadge: "Digestive Detox",
  },
];

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState<LearnTab>("hijama");

  return (
    <div className="min-h-screen bg-surface-subtle py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Hero */}
        <div className="bg-gradient-to-br from-emerald-900 via-primary to-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-gold-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tameer-e-Sehat Health Academy (تعلیم و حکمت)</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
              Tibb-e-Nabawi &amp; Holistic Medicine Knowledge Hub
            </h1>
            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
              Authentic prophetic wisdom, Sunnah Hijama guidelines, and scientifically-substantiated
              herbal therapies curated by experienced Unani physicians and certified practitioners.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-line">
          <button
            onClick={() => setActiveTab("hijama")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "hijama"
                ? "bg-primary text-white shadow-sm"
                : "bg-white text-ink-body hover:bg-surface-sunken border border-line"
            }`}
          >
            <Droplets className="w-4 h-4 text-emerald-400" />
            <span>Sunnah Cupping (حجامہ سنت)</span>
          </button>

          <button
            onClick={() => setActiveTab("remedies")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "remedies"
                ? "bg-primary text-white shadow-sm"
                : "bg-white text-ink-body hover:bg-surface-sunken border border-line"
            }`}
          >
            <Leaf className="w-4 h-4 text-emerald-500" />
            <span>Prophetic Remedies (مفرداتِ نبوی)</span>
          </button>

          <button
            onClick={() => setActiveTab("principles")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "principles"
                ? "bg-primary text-white shadow-sm"
                : "bg-white text-ink-body hover:bg-surface-sunken border border-line"
            }`}
          >
            <Activity className="w-4 h-4 text-amber-500" />
            <span>Holistic Lifestyle (اصولِ صحت)</span>
          </button>

          <button
            onClick={() => setActiveTab("disclaimer")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "disclaimer"
                ? "bg-primary text-white shadow-sm"
                : "bg-white text-ink-body hover:bg-surface-sunken border border-line"
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span>Clinical Disclaimer (طبی وضاحت)</span>
          </button>
        </div>

        {/* Tab 1: Hijama Guidelines */}
        {activeTab === "hijama" && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-line shadow-2xs space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary flex items-center gap-2">
                    <Droplets className="w-6 h-6 text-emerald-600" />
                    Sunnah Hijama (Islamic Wet Cupping) Protocols
                  </h2>
                  <p className="text-sm text-ink-body">
                    Hijama is a celebrated prophetic therapy designed to release stagnant interstitial fluid,
                    stimulate subcutaneous microcirculation, and prompt endogenous immune regeneration.
                  </p>
                </div>
                <Link
                  href="/hijama"
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
                >
                  Book Session Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Hadith Citation Banner */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm italic">
                &ldquo;Indeed, the best of remedies you have is Hijama (cupping)&rdquo; — Sahih al-Bukhari 5696.
              </div>

              {/* 3 Phases: Days, Pre-Care, Post-Care */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-3">
                <div className="p-5 rounded-2xl bg-surface border border-line space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                    <Moon className="w-5 h-5 text-emerald-700" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-primary">
                    Recommended Sunnah Days
                  </h3>
                  <p className="text-xs text-ink-body leading-relaxed">
                    According to prophetic tradition, the <strong>17th, 19th, and 21st</strong> of the Islamic lunar
                    month correspond with optimal lunar-gravitational fluid balance. Cupping for urgent clinical relief
                    is permissible on any day.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-surface border border-line space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                    <Coffee className="w-5 h-5 text-amber-700" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-primary">
                    Pre-Session Preparation
                  </h3>
                  <ul className="text-xs text-ink-body space-y-1.5 list-disc list-inside">
                    <li>Fasting: 2 to 3 hours empty stomach prior to session.</li>
                    <li>Hydration: Drink water or honey water beforehand.</li>
                    <li>Perform fresh ablution (wudhu) for spiritual serenity.</li>
                    <li>Disclose blood thinners or diabetes to the physician.</li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-surface border border-line space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
                    <Heart className="w-5 h-5 text-blue-700" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-primary">
                    Post-Session Aftercare
                  </h3>
                  <ul className="text-xs text-ink-body space-y-1.5 list-disc list-inside">
                    <li>Drink honey dissolved in warm water immediately after.</li>
                    <li>Avoid dairy, beef, and spicy foods for 24 hours.</li>
                    <li>Keep cupping sites dry and apply black seed or olive oil.</li>
                    <li>Avoid heavy physical exertion or hot showers on day 1.</li>
                  </ul>
                </div>
              </div>

              <div className="pt-2 sm:hidden">
                <Link
                  href="/hijama"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-700 text-white font-bold text-sm rounded-xl"
                >
                  Book Hijama Cupping Session
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Prophetic Remedies */}
        {activeTab === "remedies" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PROPHETIC_REMEDIES.map((botanical) => (
                <div
                  key={botanical.id}
                  className="bg-white p-6 sm:p-7 rounded-2xl border border-line shadow-2xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          {botanical.productBadge}
                        </span>
                        <h3 className="font-serif font-bold text-xl text-primary mt-1.5">
                          {botanical.nameEnglish}
                        </h3>
                        <p className="text-xs font-arabic text-ink-subtle">
                          {botanical.nameUrdu} • {botanical.nameArabic}
                        </p>
                      </div>
                      <span className="text-[11px] font-mono text-ink-subtle italic bg-surface px-2 py-1 rounded">
                        {botanical.scientificName}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-subtle border border-line text-xs italic text-ink-body">
                      {botanical.hadithCitation}
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-ink-subtle">
                        Key Health Benefits
                      </h4>
                      <ul className="text-xs text-ink-body space-y-1">
                        {botanical.benefits.map((b, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs text-ink-body">
                      <strong>Recommended Usage:</strong> {botanical.usageGuidelines}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-line">
                    <Link
                      href={botanical.matchedProductLink}
                      className="inline-flex items-center justify-between w-full text-xs font-bold text-primary hover:text-emerald-700 transition-colors"
                    >
                      <span>Explore Authentic Remedies in Apothecary</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Holistic Lifestyle Principles */}
        {activeTab === "principles" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-line shadow-2xs space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary">
                Foundational Principles of Prophetic Hygiene &amp; Dietetics
              </h2>
              <p className="text-sm text-ink-body mt-1">
                Classical Unani medicine and Tibb-e-Nabawi emphasize prevention, moderation, and systemic equilibrium.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-5 rounded-xl bg-surface border border-line space-y-2">
                <h3 className="font-serif font-bold text-base text-primary flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-600" />
                  The Rule of Thirds (ثلث لطعامه)
                </h3>
                <p className="text-xs text-ink-body leading-relaxed">
                  <em>&ldquo;A human fills no vessel worse than his stomach. A few morsels to keep his back upright are sufficient. If he must, then one third for food, one third for drink, and one third for breath.&rdquo;</em> — Jami` at-Tirmidhi 2380.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-surface border border-line space-y-2">
                <h3 className="font-serif font-bold text-base text-primary flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  Temperament Balancing (تعدیل مزاج)
                </h3>
                <p className="text-xs text-ink-body leading-relaxed">
                  The Prophet (ﷺ) paired foods of opposing natures (e.g. fresh moist dates with cooling cucumber or watermelon) to neutralize excessive internal heat or cold and prevent gastric distress.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-surface border border-line space-y-2">
                <h3 className="font-serif font-bold text-base text-primary flex items-center gap-2">
                  <Moon className="w-5 h-5 text-blue-600" />
                  Restorative Sleep Architecture
                </h3>
                <p className="text-xs text-ink-body leading-relaxed">
                  Early retirement after Isha prayers and awakening prior to dawn synchronizes cortisol rhythm, accelerates cellular repair, and optimizes human growth hormone release.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-surface border border-line space-y-2">
                <h3 className="font-serif font-bold text-base text-primary flex items-center gap-2">
                  <Sun className="w-5 h-5 text-gold-600" />
                  Active Physical Vitality
                </h3>
                <p className="text-xs text-ink-body leading-relaxed">
                  Walking with purposeful stride, archery, horse riding, and swimming were encouraged as vital pursuits to preserve lean muscle mass, cardiovascular reserve, and joint flexibility.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Clinical Disclaimer */}
        {activeTab === "disclaimer" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-line shadow-2xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary">
                  Statutory Clinical &amp; Legal Disclaimer (طبی و قانونی وضاحت)
                </h2>
                <p className="text-xs text-ink-subtle">Last reviewed: November 2026</p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-surface border border-line space-y-3 text-xs sm:text-sm text-ink-body leading-relaxed">
              <p>
                <strong>Educational Purpose:</strong> The health guides, prophetic botanical profiles, and Hijama protocols published on this website are provided strictly for educational, informational, and historical health awareness purposes.
              </p>
              <p>
                <strong>Not a Substitute for Emergency Medical Care:</strong> None of the articles or statements here are intended to diagnose, treat, cure, or prevent acute medical emergencies, surgical conditions, oncological diseases, or acute cardiovascular events. If you are experiencing chest pain, severe shortness of breath, sudden neurological deficits, or high persistent fever, call local emergency medical services immediately.
              </p>
              <p>
                <strong>Physician Consultation:</strong> Individuals who are pregnant, nursing, taking anticoagulant (blood-thinning) medications, managing insulin-dependent diabetes, or recovering from recent major surgery must consult their primary medical physician and our certified Hakeems prior to undergoing wet cupping or starting intensive herbal regimens.
              </p>
              <p className="text-xs text-ink-subtle italic">
                Matab Tameer-e-Sehat operates under licensed Unani practitioners compliant with Pakistani statutory guidelines for traditional Eastern medicine.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
