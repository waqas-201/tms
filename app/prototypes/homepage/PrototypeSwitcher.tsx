"use client";

import React, { useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";

export interface PrototypeVariantInfo {
  id: string;
  label: string;
  description: string;
}

export const PROTOTYPE_VARIANTS: PrototypeVariantInfo[] = [
  {
    id: "original",
    label: "Original",
    description: "Current baseline homepage",
  },
  {
    id: "A",
    label: "Variant A: Clinical Triage",
    description: "Doctor consultation first, fast symptom triage, verified credentials",
  },
  {
    id: "B",
    label: "Variant B: Unani Apothecary",
    description: "Traditional herbal dispensary, botanical remedies, Sunnah Hijama",
  },
  {
    id: "C",
    label: "Variant C: Integrated Care Hub",
    description: "Hybrid clinic + fast-track WhatsApp triage + interactive service pathways",
  },
];

interface PrototypeSwitcherProps {
  currentVariant: string;
}

export default function PrototypeSwitcher({
  currentVariant,
}: PrototypeSwitcherProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentIndex = PROTOTYPE_VARIANTS.findIndex(
    (v) => v.id.toLowerCase() === currentVariant.toLowerCase()
  );
  const activeIndex = currentIndex === -1 ? 1 : currentIndex; // Default to Variant A if not specified
  const current = PROTOTYPE_VARIANTS[activeIndex] || PROTOTYPE_VARIANTS[1];

  const setVariant = useCallback(
    (variantId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("variant", variantId);
      router.replace(`/?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handlePrev = useCallback(() => {
    const prevIndex =
      (activeIndex - 1 + PROTOTYPE_VARIANTS.length) % PROTOTYPE_VARIANTS.length;
    setVariant(PROTOTYPE_VARIANTS[prevIndex].id);
  }, [activeIndex, setVariant]);

  const handleNext = useCallback(() => {
    const nextIndex = (activeIndex + 1) % PROTOTYPE_VARIANTS.length;
    setVariant(PROTOTYPE_VARIANTS[nextIndex].id);
  }, [activeIndex, setVariant]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in form inputs
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  return (
    <aside
      aria-label="Homepage Prototype Variant Switcher"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 max-w-full px-4"
    >
      <div className="flex items-center gap-2 bg-neutral-950/90 text-white backdrop-blur-md px-3 py-2 rounded-full shadow-2xl border border-white/15 text-xs sm:text-sm">
        <div className="flex items-center gap-1.5 pl-1 pr-2 text-brand-gold-400 font-semibold border-r border-white/20 select-none">
          <Layers className="w-3.5 h-3.5 text-brand-gold-400" />
          <span className="hidden sm:inline">Prototype</span>
        </div>

        <button
          onClick={handlePrev}
          title="Previous variant (Left arrow key)"
          className="p-1 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors text-white/80 hover:text-white"
          aria-label="Previous variant"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Quick variant buttons */}
        <div className="flex items-center gap-1">
          {PROTOTYPE_VARIANTS.map((v) => {
            const isActive = v.id.toLowerCase() === current.id.toLowerCase();
            return (
              <button
                key={v.id}
                onClick={() => setVariant(v.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? "bg-brand-green-700 text-white shadow-sm ring-1 ring-white/30"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
                title={v.description}
              >
                {v.id.toUpperCase()}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleNext}
          title="Next variant (Right arrow key)"
          className="p-1 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors text-white/80 hover:text-white"
          aria-label="Next variant"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="hidden md:flex flex-col border-l border-white/20 pl-2 pr-1 max-w-[200px] text-left">
          <span className="font-semibold text-white truncate text-[11px] leading-tight">
            {current.label}
          </span>
          <span className="text-white/60 truncate text-[10px] leading-tight">
            {current.description}
          </span>
        </div>
      </div>
    </aside>
  );
}
