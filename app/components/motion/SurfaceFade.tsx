"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { MOTION } from "@/lib/motion";

interface SurfaceFadeProps {
  /** Identity of the current surface (tab id, auth mode, …). */
  surfaceKey: string | number;
  className?: string;
  children: ReactNode;
}

/**
 * A short cross-fade for swapping content inside one overlay surface — tab
 * panels, auth modes. Deliberately shorter and stiller than a step transition:
 * nothing is travelling, the surface is only changing what it shows.
 */
export default function SurfaceFade({
  surfaceKey,
  className,
  children,
}: SurfaceFadeProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      key={surfaceKey}
      initial={{ opacity: reducedMotion ? 1 : 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: reducedMotion ? 0 : MOTION.fast,
        ease: MOTION.ease,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
