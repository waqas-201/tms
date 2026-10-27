"use client";

import React from "react";
import { Printer } from "lucide-react";

export default function InvoicePrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-brand-green-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
    >
      <Printer className="w-3.5 h-3.5" />
      <span>Print / Save PDF</span>
    </button>
  );
}
