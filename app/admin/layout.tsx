import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Apothecary & Clinic Management Portal",
  description: "Administrative console for Matab Tameer-e-Sehat staff.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
