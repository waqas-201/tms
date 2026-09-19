import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Reset Password | Tameer-e-Sehat",
  description: "Set a new password for your Tameer-e-Sehat account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
