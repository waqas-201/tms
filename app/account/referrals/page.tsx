"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  Users,
  ArrowLeft,
  Copy,
  Check,
  Share2,
  Gift,
  Coins,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  MessageCircle,
} from "lucide-react";

interface ReferralFriend {
  id: string;
  name: string;
  joinedAt: string;
  hasQualifyingOrder: boolean;
}

interface ReferralData {
  referralCode: string;
  shareUrl: string;
  totalReferred: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalPointsEarned: number;
  referrals: ReferralFriend[];
}

export default function AccountReferralsPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReferralData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchReferralData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account/referrals");
      if (res.status === 401) {
        router.push("/login?redirect=/account/referrals");
        return;
      }
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load referral program data.");
      }
      setData(json);
    } catch (err: any) {
      setError(err?.message || "An error occurred while loading your referral account.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSessionPending) {
      if (!session) {
        router.push("/login?redirect=/account/referrals");
      } else {
        fetchReferralData();
      }
    }
  }, [session, isSessionPending]);

  const handleCopyCode = async () => {
    if (!data?.referralCode) return;
    try {
      await navigator.clipboard.writeText(data.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (e) {
      console.warn("Failed to copy code", e);
    }
  };

  const handleCopyLink = async () => {
    if (!data?.shareUrl) return;
    try {
      await navigator.clipboard.writeText(data.shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {
      console.warn("Failed to copy link", e);
    }
  };

  const shareText = data
    ? `السلام علیکم! تعمیرِ صحت قدرتی دواخانہ اور کلینک پر میرا ریفرل کوڈ ${data.referralCode} استعمال کریں اور اپنے پہلے آرڈر پر ₨ 200 کی بچت حاصل کریں۔ رجسٹریشن لنک: ${data.shareUrl}\n\nAssalamu Alaikum! Join Tameer-e-Sehat holistic wellness & clinic with my referral code ${data.referralCode} to get ₨ 200 off your first remedies order: ${data.shareUrl}`
    : "";

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="min-h-screen bg-surface-subtle py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Account (واپس اکاؤنٹ)
          </Link>
          <Link
            href="/account/loyalty"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-full transition-colors"
          >
            <Coins className="w-3.5 h-3.5" />
            View Points Ledger
          </Link>
        </div>

        {/* Title */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-line shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                  <Users className="w-6 h-6" />
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
                  Refer a Friend (دوستوں کو مدعو کریں)
                </h1>
              </div>
              <p className="text-sm text-ink-body">
                Give your friends ₨ 200 off their first order and earn 100 Loyalty Points (₨ 100 value)
                for every friend who makes a qualifying purchase.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-danger-soft border border-danger-line text-danger p-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-line text-center text-sm text-ink-subtle">
            Loading your referral dashboard...
          </div>
        ) : (
          data && (
            <>
              {/* Share Hub Card */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-line shadow-2xs space-y-6">
                <h2 className="text-lg font-serif font-bold text-primary flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  Your Exclusive Referral Link &amp; Code
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Referral Code Box */}
                  <div className="p-4 rounded-xl bg-surface border border-line space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-ink-subtle">
                      Your Referral Code
                    </label>
                    <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-lg border border-line">
                      <span className="font-mono text-lg font-bold text-primary tracking-wider">
                        {data.referralCode}
                      </span>
                      <button
                        onClick={handleCopyCode}
                        className="p-1.5 hover:bg-surface-sunken text-primary rounded-md transition-colors cursor-pointer"
                        title="Copy referral code"
                      >
                        {copiedCode ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Share Link Box */}
                  <div className="p-4 rounded-xl bg-surface border border-line space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-ink-subtle">
                      Direct Signup Link
                    </label>
                    <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-lg border border-line">
                      <span className="text-xs text-ink truncate pr-2">
                        {data.shareUrl}
                      </span>
                      <button
                        onClick={handleCopyLink}
                        className="p-1.5 hover:bg-surface-sunken text-primary rounded-md transition-colors cursor-pointer flex-shrink-0"
                        title="Copy link"
                      >
                        {copiedLink ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Instant Share Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-5 py-3 rounded-xl font-bold text-sm shadow-sm transition-all"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                    Share on WhatsApp (واٹس ایپ پر شیئر کریں)
                  </a>
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center justify-center gap-2 bg-surface hover:bg-surface-sunken text-ink-body border border-line px-5 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        Link Copied!
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        Copy Share Link
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-line shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-ink-subtle">
                      Friends Joined
                    </span>
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-3xl font-serif font-bold text-primary">
                    {data.totalReferred}
                  </div>
                  <p className="text-xs text-ink-subtle mt-1">
                    {data.pendingReferrals} pending first purchase
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-line shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-ink-subtle">
                      Completed Orders
                    </span>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-serif font-bold text-emerald-700">
                    {data.successfulReferrals}
                  </div>
                  <p className="text-xs text-ink-subtle mt-1">Qualifying orders delivered (min ₨ 1,000)</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-line shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-ink-subtle">
                      Points Earned
                    </span>
                    <Coins className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-3xl font-serif font-bold text-amber-700">
                    {data.totalPointsEarned}
                  </div>
                  <p className="text-xs text-ink-subtle mt-1">Worth ₨ {data.totalPointsEarned} in clinic discounts</p>
                </div>
              </div>

              {/* Program Rules / How it works */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-line shadow-2xs space-y-4">
                <h3 className="font-serif font-bold text-lg text-primary">
                  How the Referral Program Works (طریقہ کار)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-surface border border-line space-y-2">
                    <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <h4 className="font-bold text-sm text-primary">Invite Friends</h4>
                    <p className="text-xs text-ink-body">
                      Send your link or referral code to friends, family, and colleagues looking for authentic prophetic &amp; herbal medicine.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-surface border border-line space-y-2">
                    <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <h4 className="font-bold text-sm text-primary">Friend Gets ₨ 200 Off</h4>
                    <p className="text-xs text-ink-body">
                      Your friend signs up and immediately receives a ₨ 200 welcome voucher valid on apothecary remedies (min spend ₨ 1,200).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-surface border border-line space-y-2">
                    <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <h4 className="font-bold text-sm text-primary">You Get 100 Points</h4>
                    <p className="text-xs text-ink-body">
                      As soon as their first order is delivered (min ₨ 1,000 spend), 100 points (₨ 100 value) are automatically added to your Loyalty Ledger.
                    </p>
                  </div>
                </div>
              </div>

              {/* Referred Friends Activity Feed */}
              <div className="bg-white rounded-2xl border border-line shadow-2xs overflow-hidden">
                <div className="p-6 border-b border-line flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg text-primary">
                    Referred Friends History (مدعو کیے گئے دوست)
                  </h3>
                  <span className="text-xs font-semibold text-ink-subtle">
                    {data.referrals.length} Total
                  </span>
                </div>

                {data.referrals.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <Users className="w-12 h-12 text-ink-subtle opacity-40 mx-auto" />
                    <p className="text-sm font-semibold text-primary">No referrals yet</p>
                    <p className="text-xs text-ink-subtle max-w-sm mx-auto">
                      Share your link via WhatsApp above to invite your first friend and start earning reward points!
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-line">
                    {data.referrals.map((friend) => (
                      <div
                        key={friend.id}
                        className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-surface-subtle transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="font-bold text-sm text-primary">{friend.name}</div>
                          <div className="text-xs text-ink-subtle flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Joined {new Date(friend.joinedAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div>
                          {friend.hasQualifyingOrder ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              100 Points Earned
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-surface-sunken text-ink-subtle border border-line">
                              <Clock className="w-3.5 h-3.5" />
                              Awaiting 1st Order
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}
