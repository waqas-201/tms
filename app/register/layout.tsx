import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Create Patient Account",
  description: "Register for a patient account with Tameer-e-Sehat.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
