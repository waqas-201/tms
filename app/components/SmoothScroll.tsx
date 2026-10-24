"use client";

import React, { useLayoutEffect, useRef } from "react";
import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import { usePathname } from "next/navigation";
import "lenis/dist/lenis.css";

interface SmoothScrollProps {
  children: React.ReactNode;
}

/**
 * Syncs Next.js route transitions with Lenis.
 *
 * Resets scroll before the new page paints, so the incoming route never shows
 * one frame of the outgoing route's scroll position — the visible scroll snap
 * that made route changes feel broken.
 */
function LenisRouteSync() {
  const pathname = usePathname();
  const lenis = useLenis();

  useLayoutEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true, lock: false });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, lenis]);

  return null;
}

/**
 * Global smooth scroll provider powered by Lenis.
 * Provides luxury, buttery smooth momentum scrolling across the whole platform.
 */
export default function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<LenisRef>(null);

  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.2,
        infinite: false,
        syncTouch: false,
        autoRaf: true,
        anchors: {
          offset: -80,
          duration: 1.2,
        },
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      }}
    >
      <LenisRouteSync />
      {children}
    </ReactLenis>
  );
}

export { useLenis };
