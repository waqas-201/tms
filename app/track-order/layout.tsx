import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Track Your Order & Parcel Status",
  description: "Check real-time delivery status for your herbal remedies parcel across Pakistan.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function TrackOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
