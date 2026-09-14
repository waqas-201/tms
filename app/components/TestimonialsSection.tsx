"use client";

import React from "react";
import { TESTIMONIALS } from "@/app/data/products";
import { Star, CheckCircle, Quote } from "lucide-react";
import Reveal from "./motion/Reveal";

export default function TestimonialsSection() {
  return (
    <section className="py-16 bg-[#faf8f5] border-b border-[#e6dfd5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <Reveal className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#c59b27]">
            Customer Reviews
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#123824]">
            Real Stories from Real People
          </h2>
          <p className="text-xs sm:text-sm text-[#59534b]">
            See how our natural remedies and Hakim guidance have helped families across Pakistan.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS.map((item, index) => (
            <Reveal
              key={item.id}
              delay={index * 0.06}
              className="h-full"
            >
              <div
                className="h-full bg-white rounded-xl p-6 border border-[#e6dfd5] shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex text-[#c59b27]">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#c59b27]" />
                      ))}
                    </div>
                    <Quote className="w-6 h-6 text-[#e6dfd5]" />
                  </div>

                  <p className="text-xs text-[#59534b] leading-relaxed italic">
                    &ldquo;{item.text}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-[#f4eee5] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#123824]">{item.name}</h4>
                    <p className="text-[11px] text-[#6a6660]">
                      {item.city}, Pakistan · <span className="text-[#c59b27] font-medium">{item.concern}</span>
                    </p>
                  </div>
                  {item.verifiedPurchase && (
                    <span className="text-[10px] text-[#256644] flex items-center gap-1 font-medium bg-[#f2f9f5] px-1.5 py-0.5 rounded">
                      <CheckCircle className="w-3 h-3" /> Verified Order
                    </span>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
