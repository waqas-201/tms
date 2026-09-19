import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "My Account & Orders",
  description: "Manage your patient profile, consultation history, and recent orders.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
