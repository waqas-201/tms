import type { Metadata } from "next";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CLINIC_INFO } from "@/app/data/products";
import {
  Sparkles,
  Award,
  Leaf,
  ShieldCheck,
  Heart,
  Activity,
  MessageCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us · 35+ Years of Honest Herbal Care in Karachi",
  description:
    "Learn about our clinic history, our Hakim's philosophy, and our pure herbal preparation standards at Tameer-e-Sehat in Karachi, Pakistan since 1990.",
  alternates: {
    canonical: "https://tameeresehat.com/about",
  },
  openGraph: {
    title: "About Tameer-e-Sehat · 35+ Years of Herbal Care",
    description:
      "Bridging 35+ years of classical Eastern Tibbi wisdom with modern purity. Pure steam distillates, artisanal herbal preserves, and honest healthcare.",
    url: "https://tameeresehat.com/about",
    siteName: "Tameer-e-Sehat",
    locale: "en_PK",
    type: "website",
    images: [
      {
        url: "/images/Natures-Pharmacy-Floral-Bottle-with-Herbs-and-Medicine.jpg",
        width: 1200,
        height: 630,
        alt: "About Tameer-e-Sehat Herbal Clinic Karachi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Tameer-e-Sehat · 35+ Years of Herbal Care",
    description:
      "Learn about our clinic history, our Hakim's philosophy, and our pure herbal preparation standards in Karachi.",
    images: ["/images/Natures-Pharmacy-Floral-Bottle-with-Herbs-and-Medicine.jpg"],
  },
};

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        name: "About Tameer-e-Sehat",
        description:
          "History, ethos, Hakim lineage, and apothecary compounding standards of Matab Tameer-e-Sehat in Karachi.",
        url: "https://tameeresehat.com/about",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://tameeresehat.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "About Us",
            item: "https://tameeresehat.com/about",
          },
        ],
      },
    ],
  };

  return (
    <div className="bg-surface">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Header */}
      <section className="relative py-16 sm:py-24 border-b border-line overflow-hidden bg-primary text-white">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-brand-green-900/50 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-green-900 border border-brand-green-600 text-brand-gold-500 text-xs font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Serving Families Since 1990</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Our Story, Our Hakim, <br />
            <span className="italic font-normal text-brand-gold-300">and the Care in Natural Healing</span>
          </h1>

          <p className="text-sm sm:text-base text-on-inverse/80 max-w-2xl mx-auto leading-relaxed pt-2">
            For more than 35 years in Karachi, Tameer-e-Sehat has been providing pure, honest herbal remedies and personalized health advice for families across Pakistan.
          </p>
        </div>
      </section>

      {/* Main Narrative Section */}
      <section className="py-20 border-b border-line bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Imagery Grid */}
            <div className="lg:col-span-5 space-y-6">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-xl bg-surface-sunken border border-line">
                <Image
                  src="/images/1-scaled.png"
                  alt="Tameer-e-Sehat Clinic & Hakim Consultation"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div className="bg-surface p-6 rounded-xl border border-line space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-brand-gold-300 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-primary">
                      Established Herbal Clinic
                    </h4>
                    <p className="text-xs text-ink-muted">Karachi, Sindh, Pakistan</p>
                  </div>
                </div>
                <p className="text-xs text-ink-body leading-relaxed">
                  Located at Plot no L, 41 Korangi Crossing Rd, Karachi. We maintain clean, hygienic standards for herb preparation, fresh distillations, and patient care.
                </p>
              </div>
            </div>

            {/* Right Editorial Story */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-widest font-semibold text-secondary-text">
                  Our Philosophy
                </span>
                <h2 className="font-serif text-2xl sm:text-4xl font-bold text-primary leading-tight">
                  Real Care, Pure Herbs, and Honest Advice
                </h2>
              </div>

              <div className="text-sm text-ink-body space-y-4 leading-relaxed">
                <p>
                  In a world where quick medicines often just hide symptoms, <strong>Tameer-e-Sehat</strong> was founded with a clear goal: to understand why your body feels unwell and help it recover naturally.
                </p>

                <p>
                  Our clinic began over 35 years ago in Karachi. Through thousands of personal checkups, pulse examinations, and patient conversations, our Hakims noticed that many everyday health problems — like stomach gas, acidity, liver heat, knee stiffness, and low energy — can be healed with the right daily habits and clean, natural herbs.
                </p>

                <p>
                  Instead of mass-producing chemical products, we prepare traditional small-batch remedies: pure steam-distilled herbal waters (<em>Arq</em>), sweet fruit preserves in honey (<em>Murabba</em>), and soothing joint oils (<em>Roghan</em>).
                </p>
              </div>

              {/* Quote callout */}
              <div className="p-5 rounded-xl bg-surface border-l-4 border-secondary space-y-2 my-4">
                <p className="font-serif italic text-base text-primary">
                  &ldquo;A good Hakim doesn&apos;t just cover up symptoms — he helps your body recover its own natural strength and vitality.&rdquo;
                </p>
                <span className="text-xs text-ink-muted font-medium block">
                  — Hakim Sahib, Founder of Tameer-e-Sehat
                </span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/consultation"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-brand-green-800 text-white text-xs font-semibold tracking-wider uppercase rounded-md transition-colors shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-brand-gold-300" />
                  <span>Request Online Consultation</span>
                </Link>

                <a
                  href={`https://wa.me/${CLINIC_INFO.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-surface text-primary text-xs font-semibold rounded-md border border-line transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-brand-green-600" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Natural Healing */}
      <section className="py-20 border-b border-line bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-widest font-semibold text-secondary-text">
              Our Method
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-primary">
              How Natural Herbal Medicine Works
            </h2>
            <p className="text-xs sm:text-sm text-ink-body">
              Time-tested wisdom refined through decades of hands-on patient care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-6 border border-line shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-lg bg-primary text-brand-gold-300 flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-base font-bold text-primary">
                Personalized Care
              </h3>
              <p className="text-xs text-ink-body leading-relaxed">
                Every person is unique. We listen to your symptoms and daily lifestyle first before suggesting remedies.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-line shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-lg bg-primary text-brand-gold-300 flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-base font-bold text-primary">
                Natural Cleansing
              </h3>
              <p className="text-xs text-ink-body leading-relaxed">
                Helping your stomach, liver, and digestive system clear out excess heat and waste so you feel light and refreshed.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-line shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-lg bg-primary text-brand-gold-300 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-base font-bold text-primary">
                Strengthening Immunity
              </h3>
              <p className="text-xs text-ink-body leading-relaxed">
                Pure herbs support your body&apos;s natural defense system gently without causing unwanted side effects.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-line shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-lg bg-primary text-brand-gold-300 flex items-center justify-center">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-base font-bold text-primary">
                Diet & Daily Habits
              </h3>
              <p className="text-xs text-ink-body leading-relaxed">
                Healthy food and good habits are half the cure. We give you easy dietary tips to follow alongside your remedy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Craftsmanship */}
      <section className="py-20 bg-white border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-widest font-semibold text-secondary-text">
                  Quality Standards
                </span>
                <h2 className="font-serif text-2xl sm:text-4xl font-bold text-primary leading-tight">
                  How We Prepare Our Natural Remedies
                </h2>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-ink-body leading-relaxed">
                <p>
                  Most commercial brands use artificial flavorings and chemical preservatives. At Tameer-e-Sehat, we take our time to prepare each remedy using clean, traditional methods.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <strong className="text-primary font-semibold block text-sm">
                        Pure Steam Distilled Waters (Arq)
                      </strong>
                      <span className="text-xs text-ink-muted">
                        Fresh herbs like Kasni and Makoh are distilled slowly using steam to capture their natural benefits without alcohol or chemicals.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <strong className="text-primary font-semibold block text-sm">
                        Slow Cooked Fruit Preserves (Murabba)
                      </strong>
                      <span className="text-xs text-ink-muted">
                        Fresh Amla, Kashmiri apples, carrots, and Harar berries are slowly simmered in pure honey and natural syrup to protect their vitamins.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <strong className="text-primary font-semibold block text-sm">
                        Cold Steeped Joint & Skin Oils (Roghan)
                      </strong>
                      <span className="text-xs text-ink-muted">
                        Herbs are gently steeped in pure olive and sesame oils to create soothing joint and muscle oils that absorb easily.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-surface-sunken border-4 border-white">
                <Image
                  src="/images/3-scaled.png"
                  alt="Tameer-e-Sehat Herbal Preparation Process"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clinic Details & CTA */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white">
            Experience Natural Healing Today
          </h2>
          <p className="text-xs sm:text-sm text-on-inverse/80 max-w-xl mx-auto leading-relaxed">
            Whether you visit our clinic in Karachi or consult online from anywhere in Pakistan, you receive genuine care and authentic herbal remedies.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/consultation"
              className="w-full sm:w-auto px-7 py-3.5 bg-secondary hover:bg-brand-gold-600 text-on-secondary font-semibold text-xs uppercase tracking-wider rounded-md transition-colors shadow-md"
            >
              Start Free Consultation
            </Link>
            <Link
              href="/products"
              className="w-full sm:w-auto px-7 py-3.5 bg-brand-green-900 hover:bg-brand-green-600 text-white font-semibold text-xs uppercase tracking-wider rounded-md border border-brand-green-600 transition-colors"
            >
              Explore All Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
