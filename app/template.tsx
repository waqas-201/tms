"use client";

import React, { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Next.js App Router template wrapper.
 * Re-mounts on every route change to provide a silky, smooth page entrance.
 */
export default function Template({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1], // Apple-like silky cubic ease-out
      }}
      className="flex-1 flex flex-col w-full"
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}
