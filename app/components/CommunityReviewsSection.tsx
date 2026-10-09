"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Star,
  CheckCircle,
  Quote,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  Loader2,
} from "lucide-react";
import { CLINIC_INFO } from "@/app/data/products";
import Reveal from "./motion/Reveal";
import type { GoogleReviewsResponse } from "@/app/api/reviews/google/route";

export default function CommunityReviewsSection() {
  const [data, setData] = useState<GoogleReviewsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReviews = async (refresh: boolean = false) => {
    try {
      setLoading(true);
      const url = refresh ? "/api/reviews/google?refresh=true" : "/api/reviews/google";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load Google reviews");
      const json: GoogleReviewsResponse = await res.json();
      setData(json);
    } catch (err: any) {
      console.error("Error loading reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const rating = data?.rating ?? 5.0;
  const totalReviews = data?.totalReviews ?? (data?.reviews?.length ? data.reviews.length : 1);
  const reviewsList = data?.reviews || [];

  return (
    <section
      id="community-reviews"
      className="py-12 sm:py-18 lg:py-22 bg-[#faf8f5] border-b border-[#e6dfd5]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">

        {/* Top Header & Official Google Rating Card */}
        <Reveal className="space-y-4 sm:space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eef7f1] border border-[#cde4d6] text-[#22623a] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>Verified Google Business Social Proof</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#22623a] leading-tight">
                Authentic Patient Reviews
              </h2>

              <p className="text-xs sm:text-sm text-[#59534b] leading-relaxed">
                Real clinical feedback and recovery experiences directly from our Google Business profile for Matab Tameer-e-sehat in Karachi.
              </p>
            </div>

            {/* Official Google Live Card */}
            <a
              href={CLINIC_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-[#faf8f5] p-3.5 sm:p-4 rounded-2xl border border-[#e6dfd5] hover:border-[#22623a] shadow-2xs hover:shadow-xs transition-all flex items-center gap-4 shrink-0 self-start lg:self-auto group cursor-pointer"
              title="Click to view verified reviews on Google Business Profile"
            >
              <div className="flex flex-col items-center justify-center border-r border-[#e6dfd5] pr-3.5 sm:pr-4">
                {/* Google Multicolor G Icon */}
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-2xs border border-[#e6dfd5] mb-0.5 group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                </div>
                <span className="font-serif text-xl sm:text-2xl font-bold text-[#1a1816] leading-none">
                  {rating.toFixed(1)}
                </span>
                <div className="flex text-[#c59b27] mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                  ))}
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1 text-xs font-bold text-[#22623a] group-hover:text-[#1b502e]">
                  <span>Matab Tameer-e-sehat</span>
                  <ExternalLink className="w-3 h-3 text-[#c59b27] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#59534b]">
                  Google Verified Business Profile
                </p>
                <div className="flex items-center gap-1 text-[10px] text-[#8c6a15] font-semibold pt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#22623a]" />
                  <span className="underline decoration-dotted underline-offset-2">
                    {totalReviews} Verified Review{totalReviews > 1 ? "s" : ""} on Google ↗
                  </span>
                </div>
              </div>
            </a>
          </div>
        </Reveal>

        {/* Loading State */}
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center space-y-2.5 bg-white rounded-2xl border border-[#e6dfd5] text-[#59534b]">
            <Loader2 className="w-6 h-6 text-[#22623a] animate-spin" />
            <p className="text-xs font-semibold">Connecting to Google Reviews...</p>
          </div>
        )}

        {/* Real Reviews Rendering */}
        {!loading && reviewsList.length > 0 && (
          <div
            className={`grid gap-4 sm:gap-6 ${
              reviewsList.length === 1
                ? "grid-cols-1 max-w-2xl mx-auto"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {reviewsList.map((rev, index) => (
              <Reveal key={rev.id} delay={index * 0.04} className="h-full">
                <div className="bg-white rounded-2xl border border-[#e6dfd5] p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all duration-300 flex flex-col justify-between h-full group hover:border-[#22623a]/40 space-y-4">
                  <div className="space-y-3">
                    {/* Author Meta Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        {rev.avatarUrl ? (
                          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#e6dfd5] shrink-0">
                            <Image
                              src={rev.avatarUrl}
                              alt={rev.author}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div
                            className={`w-9 h-9 rounded-full ${rev.avatarBg} text-white font-bold text-xs flex items-center justify-center shadow-2xs shrink-0`}
                          >
                            {rev.avatarText}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-xs text-[#1a1816]">
                            {rev.author}
                          </h4>
                          <span className="text-[10px] text-[#6a6660] block">
                            {rev.relativeTime}
                          </span>
                        </div>
                      </div>

                      {/* Google G Source Badge */}
                      <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold uppercase bg-white border border-[#e6dfd5] text-[#4285F4] flex items-center gap-1 shrink-0">
                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                          />
                        </svg>
                        <span>Google Review</span>
                      </span>
                    </div>

                    {/* Star Rating */}
                    <div className="flex text-[#c59b27]">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>

                    {/* Review Body */}
                    <p className="text-xs sm:text-sm text-[#3f3b35] leading-relaxed italic">
                      &ldquo;{rev.text}&rdquo;
                    </p>
                  </div>

                  {/* Verification Tag */}
                  <div className="pt-2.5 border-t border-[#e6dfd5] flex items-center justify-between text-[10px] sm:text-[11px] text-[#22623a]">
                    <div className="flex items-center gap-1 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Verified Google Review</span>
                    </div>

                    <a
                      href={rev.googleReviewUrl || CLINIC_INFO.googleReviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#8c6a15] hover:underline flex items-center gap-1 font-semibold text-[10px]"
                    >
                      <span>View on Google</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        {/* Zero State / Direct Invitation when No Reviews in API yet */}
        {!loading && reviewsList.length === 0 && (
          <Reveal>
            <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-dashed border-[#e6dfd5] text-center max-w-xl mx-auto space-y-3.5">
              <div className="w-10 h-10 rounded-full bg-[#eef7f1] text-[#22623a] flex items-center justify-center mx-auto">
                <Quote className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#22623a]">
                  5.0★ on Google Business Profile
                </h3>
                <p className="text-xs text-[#59534b] leading-relaxed">
                  Have you consulted with Hakim Muhammad Tariq or ordered our natural remedies? Help others by writing a quick verified review on Google.
                </p>
              </div>
              <a
                href={CLINIC_INFO.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-2xs"
              >
                <span>Write First Review on Google</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </Reveal>
        )}

        {/* Bottom Callout Bar: Write a Review on Google */}
        <Reveal className="p-5 sm:p-7 bg-[#22623a] rounded-2xl sm:rounded-3xl text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-widest font-semibold text-[#c59b27]">
              Have you visited Matab Tameer-e-sehat?
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
              Share Your Experience with Our Hakim
            </h3>
            <p className="text-xs text-[#f4eee5]/80">
              Your genuine feedback directly on our Google Business Profile helps other patients find safe, authentic Unani healing.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto shrink-0">
            <a
              href={CLINIC_INFO.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-[#faf8f5] text-[#22623a] text-xs font-bold tracking-wider uppercase rounded-xl transition-all shadow-xs text-center flex items-center justify-center gap-1.5"
            >
              <span>Write Google Review</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href={CLINIC_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-4 py-2.5 bg-[#143e23] hover:bg-[#11351e] text-white text-xs font-bold tracking-wider uppercase rounded-xl border border-[#2d7648] transition-all text-center flex items-center justify-center gap-1.5"
            >
              <span>View Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#c59b27]" />
            </a>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
