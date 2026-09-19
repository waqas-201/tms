import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Forgot Password | Tameer-e-Sehat",
  description: "Reset your Tameer-e-Sehat account password.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
