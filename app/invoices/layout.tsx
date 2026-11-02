import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Order Invoice | Tameer-e-Sehat",
  robots: {
    index: false,
    follow: false,
  },
};

export default function InvoicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
