"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  /** Optional: use "left" or "right" for horizontal slides */
  direction?: "up" | "left" | "right";
  /** Duration override (default 0.55s) */
  duration?: number;
}

/**
 * Scroll-triggered fade-up (or slide) reveal.
 * Respects prefers-reduced-motion (renders static).
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  direction = "up",
  duration = 0.55,
}: RevealProps) {
  const reducedMotion = useReducedMotion();

  const initialState = reducedMotion
    ? { opacity: 1, x: 0, y: 0 }
    : direction === "left"
      ? { opacity: 0, x: -30, y: 0 }
      : direction === "right"
        ? { opacity: 0, x: 30, y: 0 }
        : { opacity: 0, x: 0, y };

  return (
    <motion.div
      initial={initialState}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration, ease: [0.25, 0.1, 0.25, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
