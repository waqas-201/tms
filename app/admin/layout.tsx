import type { Metadata } from "next";
import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Catalog & Inventory Admin",
  description: "Product, stock and unit management for Tameer-e-Sehat.",
  robots: {
    index: false,
    follow: false,
  },
};

function AdminFallback() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<AdminFallback />}>{children}</Suspense>;
}
