import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Verify Email | Tameer-e-Sehat",
  description: "Verify your email address for your Tameer-e-Sehat account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
