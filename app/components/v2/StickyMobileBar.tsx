"use client";

import React from "react";
import { MessageCircle, ShoppingBag, Zap } from "lucide-react";
import { CLINIC_INFO } from "@/app/data/products";
import { useCart } from "@/app/context/CartContext";

export default function StickyMobileBar() {
  const { totalItems, subtotal, setIsCartOpen } = useCart();

  const whatsAppUrl = `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(
    "Assalam-o-Alaikum Hakim Sahib! I would like to consult with you regarding herbal treatment options."
  )}`;

  return (
    <aside
      aria-label="Mobile quick triage and checkout"
      className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white/95 backdrop-blur-md border-t border-[#E5EDE5] px-3 py-2.5 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] pb-[calc(env(safe-area-inset-bottom,0px)+0.625rem)]"
    >
      <div className="max-w-md mx-auto grid grid-cols-2 gap-2">
        {/* Fast WhatsApp Hotline */}
        <a
          href={whatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#0F2E1E] text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
        >
          <div className="relative">
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
          </div>
          <span className="truncate">Ask Hakim</span>
        </a>

        {/* 1-Tap Cart / Bag */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="flex items-center justify-between py-2.5 px-3 bg-[#FAF9F5] hover:bg-[#F0F5F0] text-[#0F2E1E] rounded-xl text-xs font-bold border border-[#E5EDE5] active:scale-95 transition-all"
        >
          <div className="flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-[#C86A4B]" />
            <span>Bag</span>
            {totalItems > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#0F2E1E] text-white text-[10px] font-bold">
                {totalItems}
              </span>
            )}
          </div>

          <span className="text-[11px] font-extrabold text-[#0F2E1E]">
            ₨ {subtotal.toLocaleString()}
          </span>
        </button>
      </div>
    </aside>
  );
}
