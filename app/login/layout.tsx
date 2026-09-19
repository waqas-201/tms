import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Patient & Practitioner Login",
  description: "Sign in to your Tameer-e-Sehat patient portal.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
