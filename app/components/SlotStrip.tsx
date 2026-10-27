"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

export interface SlotStripItem {
  slot: string; // Unique slot ID or canonical range, e.g. "10:00 AM - 11:00 AM"
  startTime?: string;
  endTime?: string;
  label?: string; // Formatted time to display, e.g. "10:00 AM"
  subLabel?: string; // Status text override, e.g. "Available", "Booked", "2 seats"
  available: boolean;
  seatsRemaining?: number;
  totalSeats?: number;
}

export interface SlotStripProps {
  slots: SlotStripItem[];
  selectedSlot: string | null;
  onSelectSlot: (slot: string) => void;
  variant?: "primary" | "inverse";
  className?: string;
  ariaLabel?: string;
  bgFadeClass?: string; // background color for fade gradients, default "from-white"
  emptyMessage?: string;
  showClockIcon?: boolean;
}

export default function SlotStrip({
  slots,
  selectedSlot,
  onSelectSlot,
  variant = "primary",
  className = "",
  ariaLabel = "Time slots",
  bgFadeClass = "from-white",
  emptyMessage = "No slots available for this date.",
  showClockIcon = false,
}: SlotStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();

    const handleResize = () => checkScroll();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [checkScroll, slots]);

  // Auto-scroll to selected or first available slot
  useEffect(() => {
    if (!scrollRef.current) return;
    const targetSlot = selectedSlot || slots.find((s) => s.available)?.slot;
    if (!targetSlot) return;

    const targetEl = itemRefs.current[targetSlot];
    if (targetEl) {
      targetEl.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selectedSlot, slots]);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = Math.max(el.clientWidth * 0.75, 200);
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const availableSlots = slots.filter((s) => s.available);
      if (availableSlots.length === 0) return;

      const currentIndex = availableSlots.findIndex((s) => s.slot === selectedSlot);
      let nextIndex = 0;
      if (currentIndex === -1) {
        nextIndex = 0;
      } else if (e.key === "ArrowRight") {
        nextIndex = currentIndex < availableSlots.length - 1 ? currentIndex + 1 : 0;
      } else {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : availableSlots.length - 1;
      }

      const next = availableSlots[nextIndex];
      if (next) {
        onSelectSlot(next.slot);
        itemRefs.current[next.slot]?.focus();
      }
    }
  };

  if (!slots || slots.length === 0) {
    return (
      <div className="p-3 text-center text-xs text-ink-subtle">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className={`relative group ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label={ariaLabel}
    >
      {/* Left scroll chevron */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => handleScroll("left")}
          className="absolute -left-1 sm:-left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white/95 hover:bg-white border border-line shadow-sm text-ink hover:text-primary transition-all cursor-pointer backdrop-blur-xs"
          aria-label="Scroll slots left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Left edge gradient mask */}
      {canScrollLeft && (
        <div
          className={`pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r ${bgFadeClass} to-transparent z-5`}
        />
      )}

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex items-center gap-2 overflow-x-auto scroll-smooth snap-x py-1 px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="listbox"
        aria-label={ariaLabel}
      >
        {slots.map((s) => {
          const isSelected = selectedSlot === s.slot;
          const isAvailable = s.available && (s.seatsRemaining === undefined || s.seatsRemaining > 0);
          const timeDisplay = s.label || s.startTime || s.slot;

          // Status badge text
          let statusText = s.subLabel;
          if (!statusText) {
            if (!isAvailable) {
              statusText = "Booked";
            } else if (s.seatsRemaining !== undefined) {
              statusText = `${s.seatsRemaining} ${s.seatsRemaining === 1 ? "seat" : "seats"}`;
            } else {
              statusText = "Available";
            }
          }

          // Button styling depending on variant and status
          let buttonClass = "";
          let badgeClass = "";

          if (variant === "inverse") {
            if (!isAvailable) {
              buttonClass =
                "bg-brand-green-50 text-primary/70 border-success-line/70 opacity-60 blur-[0.4px] hover:blur-[0.4px] cursor-not-allowed select-none";
              badgeClass = "text-primary/60 font-semibold";
            } else if (isSelected) {
              buttonClass =
                "bg-surface-inverse text-white border-ink shadow-xs font-semibold cursor-pointer";
              badgeClass = "text-brand-gold-300 font-semibold";
            } else {
              buttonClass =
                "bg-surface text-ink border-line hover:border-ink cursor-pointer hover:bg-sand-50";
              badgeClass = "text-success font-semibold";
            }
          } else {
            // default "primary"
            if (!isAvailable) {
              buttonClass =
                "bg-surface-sunken border-line text-ink-subtle cursor-not-allowed opacity-60 line-through select-none";
              badgeClass = "text-ink-subtle";
            } else if (isSelected) {
              buttonClass =
                "bg-primary text-white border-primary shadow-xs font-semibold cursor-pointer";
              badgeClass = "text-white/90 font-medium";
            } else {
              buttonClass =
                "bg-white border-line text-ink hover:border-primary hover:bg-success-soft/30 cursor-pointer";
              badgeClass = "text-success font-semibold";
            }
          }

          return (
            <button
              key={s.slot}
              ref={(el) => {
                itemRefs.current[s.slot] = el;
              }}
              type="button"
              role="option"
              aria-selected={isSelected}
              disabled={!isAvailable}
              onClick={() => isAvailable && onSelectSlot(s.slot)}
              title={
                !isAvailable
                  ? "This slot is unavailable or fully booked"
                  : `Select slot ${timeDisplay}`
              }
              className={`min-w-[130px] sm:min-w-[140px] shrink-0 snap-start p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${buttonClass}`}
            >
              <div className="flex items-center gap-1.5 justify-center">
                {showClockIcon && (
                  <Clock
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected
                        ? variant === "inverse"
                          ? "text-brand-gold-300"
                          : "text-white/80"
                        : "text-ink-subtle"
                    }`}
                  />
                )}
                <span className="text-xs font-bold font-mono tracking-tight whitespace-nowrap">
                  {timeDisplay}
                </span>
              </div>
              <span className={`text-[10px] mt-0.5 tracking-wide uppercase ${badgeClass}`}>
                {statusText}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right edge gradient mask */}
      {canScrollRight && (
        <div
          className={`pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l ${bgFadeClass} to-transparent z-5`}
        />
      )}

      {/* Right scroll chevron */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => handleScroll("right")}
          className="absolute -right-1 sm:-right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white/95 hover:bg-white border border-line shadow-sm text-ink hover:text-primary transition-all cursor-pointer backdrop-blur-xs"
          aria-label="Scroll slots right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
