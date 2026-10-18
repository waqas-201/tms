"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, MessageCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useConsultation } from "@/app/context/ConsultationContext";

/**
 * Hero v3 — fits exactly one screen, designed phone-first.
 *
 * ① HEADER HEIGHT: the hero fills the viewport MINUS your top banner + navbar.
 *    Set the two values below to the real heights (top bar + nav):
 *      mobile  → --hh on the <section>  (default 5.5rem)
 *      desktop → lg:--hh                (default 6.75rem, measured from your screenshot)
 *
 * ② PORTRAIT: leave PORTRAIT_SRC empty to show the botanical arch artwork.
 *    Set it to a real portrait of the Hakim (e.g. "/images/hakim.png") and the
 *    photo appears inside the arch on desktop instead.
 *
 * Mobile  : heading → line → [Browse remedies] [Consult on WhatsApp]
 *           → concern chips (2 rows, swipe) → one trust line. No image, no clutter.
 * Desktop : same content left, arch right.
 */

const PORTRAIT_SRC = "" as string;

const CONDITIONS = [
  { icon: "🌿", title: "Gastric & digestion", concern: "Stomach, Gas & Acid Relief" },
  { icon: "🦴", title: "Joint & back pain", concern: "Joint, Knee & Back Pain" },
  { icon: "⚡", title: "Fatty liver & heat", concern: "Fatty Liver & Body Heat" },
  { icon: "🩸", title: "Energy & stamina", concern: "Energy, Stamina & Vitality" },
  { icon: "🍯", title: "Murabba & tonics", concern: "Pure Murabbajaat & Tonics" },
  { icon: "🛡️", title: "Immunity & detox", concern: "Immune Health & Detoxification" },
] as const;

/* Leaf sprig inside an arch outline. Pure SVG, no image needed. */
function BotanicalArt({ className = "" }: { className?: string }) {
  const leaves = [
    { y: 440, s: 1.2 },
    { y: 388, s: 1.08 },
    { y: 336, s: 0.97 },
    { y: 284, s: 0.85 },
    { y: 232, s: 0.72 },
    { y: 184, s: 0.58 },
  ];
  const leafPath = "M0 0 C18 -17 54 -17 74 0 C54 17 18 17 0 0 Z";

  return (
    <svg
      viewBox="0 0 400 500"
      aria-hidden
      focusable="false"
      className={className}
      preserveAspectRatio="xMidYMax meet"
    >
      {/* inner arch outline */}
      <path
        d="M16 500 V200 A184 184 0 0 1 384 200 V500"
        fill="none"
        stroke="#c59b27"
        strokeOpacity="0.55"
        strokeWidth="2"
      />
      {/* stem */}
      <path
        d="M200 500 C195 390 206 270 200 150"
        fill="none"
        stroke="#c59b27"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {leaves.map((l, i) => (
        <g key={l.y}>
          <path
            d={leafPath}
            transform={`translate(200 ${l.y}) rotate(-32) scale(${l.s})`}
            fill={i % 2 ? "#3fae6a" : "#2f8a54"}
          />
          <path
            d={leafPath}
            transform={`translate(200 ${l.y - 22}) rotate(-148) scale(${l.s})`}
            fill={i % 2 ? "#2f8a54" : "#3fae6a"}
          />
        </g>
      ))}
      <path
        d={leafPath}
        transform="translate(200 152) rotate(-90) scale(0.62)"
        fill="#3fae6a"
      />
      <circle cx="200" cy="112" r="6" fill="#dcaf38" />
    </svg>
  );
}

export default function HeroSection() {
  const { openConsultation } = useConsultation();
  const reducedMotion = useReducedMotion();

  const startConsultation = () =>
    openConsultation({
      mode: "WHATSAPP",
      message:
        "Assalam-o-Alaikum Hakim Muhammad Tariq Mahmood Sahib, I would like to consult with you regarding authentic herbal guidance for my health.",
    });

  const pickCondition = (c: (typeof CONDITIONS)[number]) =>
    openConsultation({
      mode: "WHATSAPP",
      concern: c.concern,
      message: `Assalam-o-Alaikum Hakim Sahib, I would like consultation and remedy guidance for: ${c.title} (${c.concern}).`,
    });

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-brand-green-900 text-sand-50 [--hh:5.5rem] lg:[--hh:6.75rem] min-h-[calc(100svh-var(--hh))] lg:h-[calc(100svh-var(--hh))] lg:min-h-[34rem]"
    >
      {/* Soft glow + faint diagonal texture (very low contrast) */}
      <div className="pointer-events-none absolute -right-24 bottom-0 h-[30rem] w-[30rem] rounded-full bg-brand-green-600/25 blur-3xl" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, #faf8f5 0 1px, transparent 1px 28px)",
        }}
      />

      {/* Mobile-only backdrop: the sprig in an arch, bleeding off the corner */}
      <BotanicalArt className="pointer-events-none absolute -right-16 bottom-0 aspect-[4/5] h-[72%] opacity-[0.16] lg:hidden" />

      <div className="relative z-10 mx-auto flex min-h-[inherit] max-w-6xl flex-col px-5 sm:px-8 lg:grid lg:h-full lg:min-h-0 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        {/* ───────── Text + actions ───────── */}
        <div className="flex flex-1 flex-col py-6 sm:py-10 lg:justify-center lg:py-0">
          <h1 className="font-serif text-[1.85rem] font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.6rem]">
            Classical Unani Healing &amp; Botanical Care
          </h1>

          <p className="mt-2.5 max-w-md text-sm leading-relaxed text-sand-100/75 sm:mt-4 sm:text-lg">
            Speak with a Hakim. Get a pure herbal remedy made for you, delivered
            across Pakistan.
          </p>

          {/* Primary = Browse remedies · Secondary = Consult on WhatsApp */}
          <div className="mt-5 grid gap-2.5 sm:mt-7 sm:flex sm:gap-3">
            <a
              href="#remedies"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-gold-400 px-8 text-[15px] font-semibold text-brand-green-900 transition hover:bg-brand-gold-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold-400 active:scale-[0.98] sm:h-14 sm:text-base"
            >
              Browse remedies
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </a>

            <button
              type="button"
              onClick={startConsultation}
              className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-sand-50/35 px-7 text-[15px] font-medium text-sand-50 transition hover:border-brand-gold-400 hover:text-brand-gold-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold-400 active:scale-[0.98] sm:h-14 sm:text-base"
            >
              <MessageCircle className="h-[18px] w-[18px]" aria-hidden />
              Consult on WhatsApp
            </button>
          </div>

          {/* Concern chips: 2 swipeable rows on phones, wrapped row on desktop */}
          <div className="mt-6 sm:mt-8">
            <p className="mb-2 text-xs font-medium text-sand-100/65 sm:text-sm">
              What is troubling you?
            </p>
            <div
              className="-mx-5 grid snap-x auto-cols-max grid-flow-col grid-rows-2 gap-2 overflow-x-auto px-5 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:mx-0 lg:flex lg:flex-wrap lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
              role="list"
            >
              {CONDITIONS.map((c) => (
                <button
                  key={c.title}
                  type="button"
                  role="listitem"
                  onClick={() => pickCondition(c)}
                  className="inline-flex h-10 snap-start cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border border-sand-50/20 bg-sand-50/[0.06] px-3.5 text-[13px] font-medium text-sand-50 transition hover:border-brand-gold-400 hover:bg-sand-50/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-gold-400 active:scale-[0.97] sm:text-sm"
                >
                  <span aria-hidden>{c.icon}</span>
                  {c.title}
                </button>
              ))}
            </div>
          </div>

          {/* One trust line (auto-hidden on very short phone screens) */}
          <p className="mt-auto pt-5 text-xs text-sand-100/60 lg:mt-10 lg:pt-0 lg:text-sm [@media(max-height:700px)]:hidden">
            Since 1990 &nbsp;·&nbsp; Matab Korangi, Karachi &nbsp;·&nbsp; Cash on
            delivery
          </p>
        </div>

        {/* ───────── Desktop arch ───────── */}
        <div className="relative hidden lg:block">
          <motion.div
            initial={reducedMotion ? false : { clipPath: "inset(100% 0 0 0)" }}
            animate={{ clipPath: "inset(0% 0 0 0)" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-0 right-0 aspect-[4/5] h-[88%] max-h-[38rem]"
          >
            {/* offset gold outline */}
            <div className="absolute inset-0 -translate-y-3 translate-x-3 rounded-t-full border-2 border-b-0 border-brand-gold-400/70" />

            <div className="relative h-full w-full overflow-hidden rounded-t-full bg-gradient-to-b from-brand-green-700 to-brand-green-800">
              {PORTRAIT_SRC ? (
                <Image
                  src={PORTRAIT_SRC}
                  alt="Hakim Muhammad Tariq Mahmood, senior Tibbi physician at Matab Tameer-e-Sehat, Karachi"
                  fill
                  priority
                  sizes="440px"
                  className="object-cover object-top"
                />
              ) : (
                <BotanicalArt className="absolute inset-0 h-full w-full" />
              )}

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-green-900 via-brand-green-900/70 to-transparent px-6 pb-6 pt-20 text-center">
                <p className="font-serif text-xl font-bold leading-tight">
                  Hakim Muhammad Tariq Mahmood
                </p>
                <p className="mt-1 text-sm text-sand-100/80">
                  Senior Tibbi physician, Karachi
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}