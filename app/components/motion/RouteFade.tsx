"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Route transition: a CSS-only fade of the page content, keyed on `pathname`.
 *
 * Keyed on the pathname rather than on navigation events so that query-string
 * updates — product filters, search, pagination — never re-animate the page.
 * Pure CSS means the fade cannot be stranded by slow hydration: if React is
 * late, the animation has already completed.
 */
export default function RouteFade({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="route-fade">
      {children}
    </div>
  );
}
