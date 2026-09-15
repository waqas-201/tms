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

export const metadata = {
  title: "About Us · 35+ Years of Herbal Care",
  description:
    "Learn about our clinic history, our Hakim's philosophy, and our pure herbal preparation standards at Tameer-e-Sehat in Karachi.",
};

export default function AboutPage() {
  return (
    <div className="bg-[#faf8f5]">
      {/* Hero Header */}
      <section className="relative py-16 sm:py-24 border-b border-[#e6dfd5] overflow-hidden bg-[#138833] text-white">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#0d5e23]/50 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#c59b27]/10 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0d5e23] border border-[#1b993e] text-[#c59b27] text-xs font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Serving Families Since 1990</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Our Story, Our Hakim, <br />
            <span className="italic font-normal text-[#c59b27]">and the Care in Natural Healing</span>
          </h1>

          <p className="text-sm sm:text-base text-[#f4eee5]/80 max-w-2xl mx-auto leading-relaxed pt-2">
            For more than 35 years in Karachi, Tameer-e-Sehat has been providing pure, honest herbal remedies and personalized health advice for families across Pakistan.
          </p>
        </div>
      </section>

      {/* Main Narrative Section */}
      <section className="py-20 border-b border-[#e6dfd5] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Imagery Grid */}
            <div className="lg:col-span-5 space-y-6">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-xl bg-[#f4eee5] border border-[#e6dfd5]">
                <Image
                  src="/images/1-scaled.png"
                  alt="Tameer-e-Sehat Clinic & Hakim Consultation"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div className="bg-[#faf8f5] p-6 rounded-xl border border-[#e6dfd5] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#138833] text-[#c59b27] flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-[#138833]">
                      Established Herbal Clinic
                    </h4>
                    <p className="text-xs text-[#6a6660]">Karachi, Sindh, Pakistan</p>
                  </div>
                </div>
                <p className="text-xs text-[#59534b] leading-relaxed">
                  Located at Plot no L, 41 Korangi Crossing Rd, Karachi. We maintain clean, hygienic standards for herb preparation, fresh distillations, and patient care.
                </p>
              </div>
            </div>

            {/* Right Editorial Story */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-widest font-semibold text-[#c59b27]">
                  Our Philosophy
                </span>
                <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#138833] leading-tight">
                  Real Care, Pure Herbs, and Honest Advice
                </h2>
              </div>

              <div className="text-sm text-[#59534b] space-y-4 leading-relaxed">
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
              <div className="p-5 rounded-xl bg-[#faf8f5] border-l-4 border-[#c59b27] space-y-2 my-4">
                <p className="font-serif italic text-base text-[#138833]">
                  &ldquo;A good Hakim doesn&apos;t just cover up symptoms — he helps your body recover its own natural strength and vitality.&rdquo;
                </p>
                <span className="text-xs text-[#6a6660] font-medium block">
                  — Hakim Sahib, Founder of Tameer-e-Sehat
                </span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/consultation"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#138833] hover:bg-[#0f7229] text-white text-xs font-semibold tracking-wider uppercase rounded-md transition-colors shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-[#c59b27]" />
                  <span>Request Online Consultation</span>
                </Link>

                <a
                  href={`https://wa.me/${CLINIC_INFO.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-[#faf8f5] text-[#138833] text-xs font-semibold rounded-md border border-[#e6dfd5] transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#1b993e]" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Natural Healing */}
      <section className="py-20 border-b border-[#e6dfd5] bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#c59b27]">
              Our Method
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#138833]">
              How Natural Herbal Medicine Works
            </h2>
            <p className="text-xs sm:text-sm text-[#59534b]">
              Time-tested wisdom refined through decades of hands-on patient care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-6 border border-[#e6dfd5] shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#138833] text-[#c59b27] flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#138833]">
                Personalized Care
              </h3>
              <p className="text-xs text-[#59534b] leading-relaxed">
                Every person is unique. We listen to your symptoms and daily lifestyle first before suggesting remedies.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-[#e6dfd5] shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#138833] text-[#c59b27] flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#138833]">
                Natural Cleansing
              </h3>
              <p className="text-xs text-[#59534b] leading-relaxed">
                Helping your stomach, liver, and digestive system clear out excess heat and waste so you feel light and refreshed.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-[#e6dfd5] shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#138833] text-[#c59b27] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#138833]">
                Strengthening Immunity
              </h3>
              <p className="text-xs text-[#59534b] leading-relaxed">
                Pure herbs support your body&apos;s natural defense system gently without causing unwanted side effects.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-[#e6dfd5] shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#138833] text-[#c59b27] flex items-center justify-center">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#138833]">
                Diet & Daily Habits
              </h3>
              <p className="text-xs text-[#59534b] leading-relaxed">
                Healthy food and good habits are half the cure. We give you easy dietary tips to follow alongside your remedy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Craftsmanship */}
      <section className="py-20 bg-white border-b border-[#e6dfd5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-widest font-semibold text-[#c59b27]">
                  Quality Standards
                </span>
                <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#138833] leading-tight">
                  How We Prepare Our Natural Remedies
                </h2>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-[#59534b] leading-relaxed">
                <p>
                  Most commercial brands use artificial flavorings and chemical preservatives. At Tameer-e-Sehat, we take our time to prepare each remedy using clean, traditional methods.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#138833]/10 text-[#138833] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <strong className="text-[#138833] font-semibold block text-sm">
                        Pure Steam Distilled Waters (Arq)
                      </strong>
                      <span className="text-xs text-[#6a6660]">
                        Fresh herbs like Kasni and Makoh are distilled slowly using steam to capture their natural benefits without alcohol or chemicals.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#138833]/10 text-[#138833] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <strong className="text-[#138833] font-semibold block text-sm">
                        Slow Cooked Fruit Preserves (Murabba)
                      </strong>
                      <span className="text-xs text-[#6a6660]">
                        Fresh Amla, Kashmiri apples, carrots, and Harar berries are slowly simmered in pure honey and natural syrup to protect their vitamins.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#138833]/10 text-[#138833] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <strong className="text-[#138833] font-semibold block text-sm">
                        Cold Steeped Joint & Skin Oils (Roghan)
                      </strong>
                      <span className="text-xs text-[#6a6660]">
                        Herbs are gently steeped in pure olive and sesame oils to create soothing joint and muscle oils that absorb easily.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-[#f4eee5] border-4 border-white">
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
      <section className="py-16 bg-[#138833] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white">
            Experience Natural Healing Today
          </h2>
          <p className="text-xs sm:text-sm text-[#f4eee5]/80 max-w-xl mx-auto leading-relaxed">
            Whether you visit our clinic in Karachi or consult online from anywhere in Pakistan, you receive genuine care and authentic herbal remedies.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/consultation"
              className="w-full sm:w-auto px-7 py-3.5 bg-[#c59b27] hover:bg-[#aa821c] text-[#138833] font-semibold text-xs uppercase tracking-wider rounded-md transition-colors shadow-md"
            >
              Start Free Consultation
            </Link>
            <Link
              href="/products"
              className="w-full sm:w-auto px-7 py-3.5 bg-[#0d5e23] hover:bg-[#1b993e] text-white font-semibold text-xs uppercase tracking-wider rounded-md border border-[#1b993e] transition-colors"
            >
              Explore All Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
