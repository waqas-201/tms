"use client";

import React from "react";
import { useCart } from "@/app/context/CartContext";
import { CheckCircle2 } from "lucide-react";

export default function Toast() {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in transition-all duration-300">
      <div className="flex items-center gap-3 bg-[#123824] text-white px-5 py-3.5 rounded-lg shadow-xl border border-[#256644]/40 max-w-md">
        <CheckCircle2 className="w-5 h-5 text-[#c59b27] shrink-0" />
        <span className="text-sm font-medium tracking-wide">{toastMessage}</span>
      </div>
    </div>
  );
}
