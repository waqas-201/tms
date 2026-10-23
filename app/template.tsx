"use client";

import React, { type ReactNode } from "react";

/**
 * Next.js App Router template wrapper.
 * Re-mounts on every route change to provide a silky, smooth page entrance.
 * Uses pure CSS animation to ensure instant First Contentful Paint (FCP)
 * without delaying critical hero rendering behind client JS hydration.
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 flex flex-col w-full animate-fade-in">
      {children}
    </div>
  );
}
