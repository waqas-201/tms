"use client";

import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { MOTION } from "@/lib/motion";

interface StepTransitionProps {
  /** Identity of the current step. Changing it animates the swap. */
  stepKey: string | number;
  /** 1 for forward, -1 for back. Controls which way the content travels. */
  direction?: 1 | -1;
  /** The step's scroll container. Reset to the top before the enter animation. */
  scrollRef?: RefObject<HTMLElement | null>;
  className?: string;
  children: ReactNode;
}

/**
 * The one step-to-step transition in the app.
 *
 * - Forward slides in from the right, back slides in from the left.
 * - The container height animates so the surrounding surface never snaps.
 * - Scroll is reset before the enter animation paints, so a step never opens
 *   half-scrolled.
 * - Collapses to an instant swap under `prefers-reduced-motion`.
 */
export default function StepTransition({
  stepKey,
  direction = 1,
  scrollRef,
  className,
  children,
}: StepTransitionProps) {
  const reducedMotion = useReducedMotion();
  const duration = reducedMotion ? 0 : MOTION.base;
  const distance = reducedMotion ? 0 : MOTION.distance;

  const contentRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");

  // Measure before paint so the height animation starts from the right place.
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    setHeight(el.offsetHeight);
  }, [stepKey]);

  // Follow content that changes size without a step change (calendar months,
  // inline validation notices, async details landing).
  useEffect(() => {
    const el = contentRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const next = el.offsetHeight;
      setHeight((prev) => (prev === next ? prev : next));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Reset the step's own scroll before the new content paints.
  useLayoutEffect(() => {
    scrollRef?.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [stepKey, scrollRef]);

  // Clip only while the height is animating; leave overflow visible at rest so
  // focus rings and menus inside a step are never cut off.
  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el || duration === 0) return;
    el.style.overflow = "hidden";
    const timer = window.setTimeout(() => {
      el.style.overflow = "visible";
    }, duration * 1000 + 60);
    return () => window.clearTimeout(timer);
  }, [stepKey, duration]);

  const variants: Variants = {
    enter: { opacity: reducedMotion ? 1 : 0, x: direction * distance },
    center: { opacity: 1, x: 0 },
    exit: { opacity: reducedMotion ? 1 : 0, x: direction * -distance },
  };

  return (
    <motion.div
      ref={frameRef}
      initial={false}
      animate={{ height }}
      transition={{ duration, ease: MOTION.ease }}
      className={className}
    >
      <div ref={contentRef} className="relative">
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <motion.div
            key={stepKey}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration, ease: MOTION.ease }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
