import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Super Admin Setup | Tameer-e-Sehat",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
