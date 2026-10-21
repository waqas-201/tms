"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Moon, ShieldCheck } from "lucide-react";
import { getHijriDate } from "@/lib/hijama-types";

export default function HijamaHeroWidget() {
  const [sunnahText, setSunnahText] = useState<string>("Upcoming Sunnah Dates: 17th, 19th & 21st");

  useEffect(() => {
    try {
      // Find the nearest upcoming Sunnah date
      const today = new Date();
      for (let i = 0; i < 35; i++) {
        const check = new Date(today);
        check.setDate(today.getDate() + i);
        const h = getHijriDate(check, 0);
        if (h.isSunnahDay) {
          const gregFormatted = check.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });
          const prefix = i === 0 ? "Today is a Sunnah Day" : `Next Sunnah Date: ${gregFormatted}`;
          setSunnahText(`${prefix} (${h.hijriDay} ${h.hijriMonthName})`);
          break;
        }
      }
    } catch {
      // fallback
    }
  }, []);

  return (
    <section className="py-6 px-4 bg-surface border-y border-line">
      <div className="max-w-6xl mx-auto">
        <div className="bg-surface-inverse rounded-2xl p-5 md:p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-secondary/30">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-secondary/15 border border-secondary/30 flex items-center justify-center shrink-0 text-brand-gold-500">
              <Moon className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-gold-500">
                  Sunnah Wet Cupping
                </span>
                <span className="text-[11px] text-brand-green-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-success" />
                  Separate Male &amp; Female Wards
                </span>
              </div>
              <h3 className="font-serif text-base md:text-lg font-bold text-on-inverse mt-0.5">
                {sunnahText}
              </h3>
            </div>
          </div>

          <Link
            href="/hijama"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary hover:bg-secondary text-ink font-bold text-xs rounded-xl transition-all shrink-0 shadow-sm"
          >
            <span>Book Appointment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
