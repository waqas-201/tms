"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, MessageCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useConsultation } from "@/app/context/ConsultationContext";

/**
 * Hero v5 — mobile-first. Desktop (lg+) is unchanged.
 *
 * Phones: heading → tagline → two CTAs → ONE slim row of concern pills
 * (swipes inside itself, never moves the page) → one tiny trust line.
 *
 * Height: instead of guessing the header size, the hero measures where it
 * starts on the page and fills exactly the rest of the screen on phones and
 * tablets. No gap below it, whatever your banner/navbar height is.
 * Desktop keeps the original fixed calc (--hh, lg:--hh).
 *
 * PORTRAIT: leave PORTRAIT_SRC empty for the botanical arch, or set a real
 * portrait path (e.g. "/images/hakim.png") to show it in the desktop arch.
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

/* Extra pills for phones/tablets only (lg+ keeps the original six). */
const EXTRA_CONDITIONS = [
  { icon: "🌸", title: "Skin & hair", concern: "Skin & Hair Care" },
  { icon: "🍃", title: "Sugar & weight", concern: "Sugar Balance & Weight Management" },
  { icon: "❤️", title: "Heart & BP", concern: "Heart Health & Blood Pressure" },
  { icon: "🌙", title: "Sleep & stress", concern: "Sleep, Stress & Anxiety" },
  { icon: "🫁", title: "Cough & chest", concern: "Cough, Cold & Chest Relief" },
  { icon: "🌺", title: "Women's wellness", concern: "Women's Health & Wellness" },
];

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
  const sectionRef = useRef<HTMLElement>(null);
  const colRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLParagraphElement>(null);
  // How many rows of concern pills fit on phones/tablets: 0 = hidden, 1, or 2.
  const [chipRows, setChipRows] = useState<0 | 1 | 2>(1);

  // Phones/tablets: fill exactly the remaining screen height below the header,
  // then use whatever space is left over for the concern pills.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    let lastWidth = window.innerWidth;

    const fit = () => {
      if (desktop.matches) {
        el.style.minHeight = "";
        return;
      }
      const top = el.getBoundingClientRect().top + window.scrollY;
      const minH = Math.max(window.innerHeight - top, 460);
      el.style.minHeight = `${minH}px`;

      const col = colRef.current;
      const main = mainRef.current;
      if (!col || !main) return;
      const cs = getComputedStyle(col);
      const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      const trust = trustRef.current;
      const trustH = trust && trust.offsetParent !== null ? trust.offsetHeight + 24 : 0;
      const free = minH - pad - main.offsetHeight - trustH;
      // one row needs ~80px (+ breathing room), two rows ~125px (+ breathing room)
      setChipRows(free >= 156 ? 2 : free >= 110 ? 1 : 0);
    };
    const onResize = () => {
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        fit();
      }
    };

    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    if (mainRef.current) ro.observe(mainRef.current);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", fit);
    };
  }, []);

  const startConsultation = () =>
    openConsultation({
      mode: "WHATSAPP",
      message:
        "Assalam-o-Alaikum Hekeem Tahir Hameed Sahab, I would like to consult with you regarding authentic herbal guidance for my health.",
    });

  const pickCondition = (c: { title: string; concern: string }) =>
    openConsultation({
      mode: "WHATSAPP",
      concern: c.concern,
      message: `Assalam-o-Alaikum Hakim Sahib, I would like consultation and remedy guidance for: ${c.title} (${c.concern}).`,
    });

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative w-full max-w-full overflow-hidden bg-brand-green-900 text-sand-50 [--hh:4rem] lg:[--hh:6.75rem] min-h-[calc(100svh-var(--hh))] lg:h-[calc(100svh-var(--hh))] lg:min-h-[34rem]"
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

      {/* Phone/tablet backdrop: the sprig in an arch, bleeding off the corner.
          Clipped by the section's overflow-hidden, so it can never cause side-scroll. */}
      <BotanicalArt className="pointer-events-none absolute -right-20 bottom-0 aspect-[4/5] h-[68%] opacity-[0.14] sm:-right-10 sm:h-[78%] lg:hidden" />

      <div className="relative z-10 mx-auto flex min-h-[inherit] w-full max-w-6xl flex-col px-5 sm:px-8 lg:grid lg:h-full lg:min-h-0 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        {/* ───────── Text + actions ───────── */}
        <div ref={colRef} className="flex min-w-0 flex-1 flex-col pb-5 pt-8 sm:pb-8 sm:pt-12 lg:justify-center lg:py-0">
          {/* Main block: centred in the free height on phones */}
          <div ref={mainRef} className="my-auto min-w-0 lg:my-0">
            <h1 className="text-balance font-serif text-[clamp(1.95rem,8.6vw,2.75rem)] font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.6rem] lg:leading-[1.1]">
              Heal Naturally with{" "}
              <span className="whitespace-nowrap">Tameer-e-Sehat</span>
            </h1>

            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-sand-100/80 sm:mt-4 sm:text-lg lg:text-sand-100/75">
              Explore pure herbs, traditional Unani care, and herbal products
              for your everyday wellness needs.
            </p>

            {/* Primary = CONSULT NOW (gold, first) · Secondary = Browse remedies (outline).
                Phone: stacked, full width. sm+: side by side. */}
            <div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={startConsultation}
                className="inline-flex h-14 w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-brand-gold-400 px-8 text-base font-bold text-brand-green-900 shadow-lg shadow-black/20 transition hover:bg-brand-gold-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold-400 active:scale-[0.98] sm:w-auto"
              >
                CONSULT NOW
              </button>

              <a
                href="#remedies"
                className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-sand-50/35 px-7 text-[15px] font-medium text-sand-50 transition hover:border-brand-gold-400 hover:text-brand-gold-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold-400 active:scale-[0.98] sm:h-14 sm:w-auto sm:text-base"
              >
                Browse remedies
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </a>
            </div>

          </div>

          {/* Concerns: pinned under the CTAs. On phones it's a swipe area that
              shows 2 rows, 1 row, or nothing depending on the free height.
              Tablet/desktop: wrapping pills (desktop = original six). */}
          <div
            className={`mt-6 sm:mt-8 lg:block ${chipRows === 0 ? "hidden" : ""}`}
          >
            <p className="mb-2 text-xs font-medium text-sand-100/70 sm:text-sm lg:text-sand-100/65">
              What is troubling you?
            </p>
            <div className="-mx-5 max-w-[100vw] overflow-x-auto px-5 [mask-image:linear-gradient(to_right,#000_90%,transparent)] [scrollbar-width:none] sm:mx-0 sm:max-w-none sm:overflow-visible sm:px-0 sm:[mask-image:none] [&::-webkit-scrollbar]:hidden">
              <ul
                className="grid w-max grid-flow-col auto-cols-max gap-2 pr-6 sm:flex sm:w-auto sm:flex-wrap sm:pr-0"
                style={{ gridTemplateRows: `repeat(${Math.max(chipRows, 1)}, 2.25rem)` }}
              >
                {[...CONDITIONS, ...EXTRA_CONDITIONS].map((c, i) => (
                  <li
                    key={c.title}
                    className={`shrink-0 ${i >= CONDITIONS.length ? "lg:hidden" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={() => pickCondition(c)}
                      className="inline-flex h-9 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border border-sand-50/20 bg-sand-50/[0.06] px-3 text-xs font-medium text-sand-50 transition hover:border-brand-gold-400 hover:bg-sand-50/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-gold-400 active:scale-[0.97] sm:h-10 sm:gap-2 sm:px-3.5 sm:text-sm"
                    >
                      <span aria-hidden>{c.icon}</span>
                      {c.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Phone/tablet trust line: one small line, hidden on very short screens */}
          <p ref={trustRef} className="mt-6 text-[11px] text-sand-100/60 sm:text-xs lg:hidden [@media(max-height:560px)]:hidden">
            Since 1990 &nbsp;·&nbsp; Matab Korangi &nbsp;·&nbsp; Cash on delivery
          </p>

          {/* Desktop trust line (original) */}
          <p className="mt-10 hidden text-sm text-sand-100/60 lg:block [@media(max-height:700px)]:hidden">
            Since 1990 &nbsp;·&nbsp; Matab Korangi, Karachi &nbsp;·&nbsp; Cash on
            delivery
          </p>
        </div>

        {/* ───────── Desktop arch (unchanged) ───────── */}
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