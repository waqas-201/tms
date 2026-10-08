"use client";

import React from "react";
import { MessageCircle, ShoppingBag } from "lucide-react";
import { CLINIC_INFO } from "@/app/data/products";
import { useCart } from "@/app/context/CartContext";

export default function StickyMobileBar() {
  const { totalItems, subtotal, setIsCartOpen } = useCart();

  const whatsAppUrl = `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encodeURIComponent(
    "Assalam-o-Alaikum Hakim Sahib! I would like to consult with you regarding herbal treatment options."
  )}`;

  return (
    <aside
      aria-label="Mobile quick actions"
      className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white/95 backdrop-blur-md border-t border-[#e6dfd5] px-3 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[calc(env(safe-area-inset-bottom,0px)+0.625rem)]"
    >
      <div className="max-w-md mx-auto grid grid-cols-2 gap-2">
        {/* Left Action: Fast WhatsApp Triage */}
        <a
          href={whatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#22623a] text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
        >
          <div className="relative">
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
          </div>
          <span className="truncate">Ask Hakim</span>
        </a>

        {/* Right Action: Open Shopping Bag */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="flex items-center justify-between py-2.5 px-3 bg-[#f4eee5] hover:bg-[#e8ded2] text-[#22623a] rounded-xl text-xs font-bold border border-[#e6dfd5] active:scale-95 transition-all"
        >
          <div className="flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-[#8c6a15]" />
            <span>Bag</span>
            {totalItems > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#22623a] text-white text-[10px] font-bold">
                {totalItems}
              </span>
            )}
          </div>

          <span className="text-[11px] font-extrabold text-[#22623a]">
            ₨ {subtotal.toLocaleString()}
          </span>
        </button>
      </div>
    </aside>
  );
}
