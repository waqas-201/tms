import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Secure Checkout & Cash on Delivery",
  description: "Complete your order with secure nationwide Cash on Delivery across Pakistan.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
