"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import {
  Sparkles,
  QrCode,
  CheckCircle2,
  Copy,
  Check,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  Clock,
  Printer,
} from "lucide-react";
import { QRCodeSVG } from "@/components/membership/QRCodeSVG";

interface JoinFormData {
  name: string;
  phone: string;
  city: string;
  email: string;
}

interface MembershipSuccessData {
  membershipId: string;
  name?: string;
  phone?: string;
  maskedPhone?: string;
  couponCode?: string;
  discountAmount?: number;
  minSubtotal?: number;
  expiresAt?: string;
  isNew: boolean;
  message?: string;
}

const DRAFT_STORAGE_KEY = "tms_membership_draft_v1";

function JoinPageContent() {
  const searchParams = useSearchParams();
  const source = searchParams.get("src") || "QR";

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedMemberId, setCopiedMemberId] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<MembershipSuccessData | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<JoinFormData>({
    defaultValues: {
      name: "",
      phone: "",
      city: "",
      email: "",
    },
  });

  // Restore draft from localStorage on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.name) setValue("name", parsed.name);
        if (parsed.phone) setValue("phone", parsed.phone);
        if (parsed.city) setValue("city", parsed.city);
        if (parsed.email) setValue("email", parsed.email);
      }
    } catch (e) {
      console.warn("Could not restore membership draft from localStorage", e);
    }
  }, [setValue]);

  // Persist form draft to localStorage on changes
  useEffect(() => {
    const subscription = watch((values) => {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(values));
      } catch (e) {
        console.warn("Could not save membership draft to localStorage", e);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (formData: JoinFormData) => {
    setSubmitError(null);
    try {
      const response = await fetch("/api/membership/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          city: formData.city || undefined,
          email: formData.email || undefined,
          source,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || "Failed to complete registration.");
      }

      // Clear draft upon successful registration
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // Safe ignore
      }

      setSuccessData(json.data);
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred. Please try again.");
    }
  };

  const handleCopy = (text: string, type: "code" | "memberId") => {
    navigator.clipboard.writeText(text);
    if (type === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } else {
      setCopiedMemberId(true);
      setTimeout(() => setCopiedMemberId(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green-100 text-brand-green-800 text-xs font-semibold tracking-wide uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold-600" />
            Tameer-e-Sehat Membership
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-green-950 tracking-tight">
            تعمیرِ صحت ممبرشپ
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Scan & Join in 60 Seconds • Instant ₨ 200 Welcome Voucher
          </p>
        </div>

        {!successData ? (
          /* Registration Form Card */
          <div className="bg-white rounded-2xl shadow-sm border border-sand-200 overflow-hidden">
            {/* Top Benefit Callout */}
            <div className="bg-gradient-to-r from-brand-green-900 to-brand-green-800 p-5 text-white">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm text-brand-gold-400">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">
                    Walk-in Clinic Welcome Offer
                  </h2>
                  <p className="text-xs text-brand-green-200 mt-0.5">
                    Register below to receive a digital membership badge and ₨ 200 off your next apothecary order.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {submitError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {submitError}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tariq Mehmood"
                  {...register("name", {
                    required: "Please enter your full name",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters",
                    },
                  })}
                  className="w-full px-3.5 py-2.5 text-sm bg-sand-50 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-green-600 focus:bg-white text-neutral-900 placeholder:text-neutral-400 transition"
                />
                {errors.name && (
                  <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Mobile Number (WhatsApp) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-xs font-semibold text-neutral-500">
                    🇵🇰 +92
                  </div>
                  <input
                    type="tel"
                    placeholder="300 1234567"
                    {...register("phone", {
                      required: "Mobile number is required",
                      pattern: {
                        value: /^((\+92)|(0092)|(92)|(0))?3[0-9]{9}$/,
                        message: "Enter a valid Pakistan mobile number (e.g. 03001234567)",
                      },
                    })}
                    className="w-full pl-20 pr-3.5 py-2.5 text-sm bg-sand-50 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-green-600 focus:bg-white text-neutral-900 placeholder:text-neutral-400 transition"
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>
                )}
                <p className="text-[11px] text-neutral-500 mt-1">
                  We send your member badge and discount code directly to this number.
                </p>
              </div>

              {/* City (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  City <span className="text-neutral-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lahore, Rawalpindi, Islamabad"
                  {...register("city")}
                  className="w-full px-3.5 py-2.5 text-sm bg-sand-50 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-green-600 focus:bg-white text-neutral-900 placeholder:text-neutral-400 transition"
                />
              </div>

              {/* Email (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Email Address <span className="text-neutral-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="name@example.com (optional)"
                  {...register("email", {
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email address",
                    },
                  })}
                  className="w-full px-3.5 py-2.5 text-sm bg-sand-50 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-green-600 focus:bg-white text-neutral-900 placeholder:text-neutral-400 transition"
                />
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Instant Frictionless Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-green-700 hover:bg-brand-green-800 text-white font-semibold text-sm shadow-md transition disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Activating Membership...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-brand-gold-300" />
                      <span>Claim My ₨ 200 Voucher & Card</span>
                    </>
                  )}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-sand-200 text-center text-[11px] text-neutral-500">
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-green-600" />
                  <span>No Password Needed</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand-green-600" />
                  <span>Takes Under 60s</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <HeartHandshake className="w-3.5 h-3.5 text-brand-green-600" />
                  <span>Tibb-e-Nabawi Clinic</span>
                </div>
              </div>
            </form>
          </div>
        ) : (
          /* Success Screen: Digital Membership Card & Voucher */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Success Banner */}
            <div className="bg-brand-green-100 border border-brand-green-300 rounded-2xl p-4 text-center">
              <CheckCircle2 className="w-8 h-8 text-brand-green-700 mx-auto mb-1.5" />
              <h2 className="text-lg font-bold text-brand-green-950 font-serif">
                {successData.isNew ? "Welcome to Tameer-e-Sehat!" : "Welcome Back, Member!"}
              </h2>
              <p className="text-xs text-brand-green-800 mt-0.5">
                {successData.isNew
                  ? "Your clinic membership is active and your welcome voucher has been generated."
                  : (successData.message || "We recognized your existing membership. Your account is active.")}
              </p>
            </div>

            {/* Digital Membership Card (Prestige Wallet Card) */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-green-950 via-brand-green-900 to-brand-green-950 text-white p-6 shadow-xl border border-brand-green-700">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] tracking-widest font-semibold uppercase text-brand-gold-400">
                    Clinic Membership
                  </div>
                  <div className="text-xl font-bold font-serif text-white tracking-wide mt-0.5">
                    تعمیرِ صحت
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-gold-500/20 border border-brand-gold-400/40 text-brand-gold-300 text-xs font-mono font-bold">
                    <span>{successData.membershipId}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(successData.membershipId, "memberId")}
                      className="ml-1 text-brand-gold-200 hover:text-white transition"
                      title="Copy Membership ID"
                    >
                      {copiedMemberId ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* QR Code and Member Info */}
              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-brand-green-300 uppercase tracking-wider font-semibold">
                    {successData.isNew ? "Member Name" : "Member Status"}
                  </div>
                  <div className="text-base sm:text-lg font-bold text-white">
                    {successData.name || "Registered Member"}
                  </div>
                  <div className="text-xs text-brand-green-200 font-mono">
                    {successData.maskedPhone || successData.phone}
                  </div>
                  <div className="pt-2 text-[11px] text-brand-gold-300/90 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Clinic Patron</span>
                  </div>
                </div>

                {/* Vector SVG QR for Counter Scanning */}
                <div className="bg-white p-2.5 rounded-xl shadow-md flex flex-col items-center">
                  <QRCodeSVG
                    value={successData.membershipId}
                    size={110}
                    title={`Scan member ${successData.membershipId}`}
                  />
                  <span className="text-[9px] font-mono font-bold text-brand-green-950 mt-1">
                    SCAN AT CLINIC
                  </span>
                </div>
              </div>
            </div>

            {/* Voucher Card for New Members, or Account Card for Existing Members */}
            {successData.isNew && successData.couponCode ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-brand-gold-500 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-brand-gold-100 text-brand-gold-700">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900">
                        ₨ 200 Welcome Voucher
                      </h3>
                      <p className="text-[11px] text-neutral-500">
                        Valid on orders min ₨ {Number(successData.minSubtotal || 1200).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase">
                      Active
                    </span>
                  </div>
                </div>

                {/* Code Box with One-Click Copy */}
                <div className="flex items-center justify-between bg-sand-50 rounded-xl p-3 border border-sand-300">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                      Voucher Code
                    </span>
                    <span className="text-base sm:text-lg font-mono font-extrabold text-brand-green-950 tracking-wider">
                      {successData.couponCode}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(successData.couponCode!, "code")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-green-700 hover:bg-brand-green-800 text-white text-xs font-semibold shadow transition cursor-pointer"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <Link
                    href="/products"
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-green-700 hover:bg-brand-green-800 text-white font-semibold text-sm shadow transition"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Order Remedies</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl border border-sand-300 bg-sand-100 hover:bg-sand-200 text-neutral-800 font-semibold text-sm transition"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Save / Print</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-sand-300 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-brand-green-100 text-brand-green-800">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">
                      Existing Clinic Account Active
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Your remedies, vouchers, and consultation records are safely preserved in your account.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <Link
                    href="/products"
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-green-700 hover:bg-brand-green-800 text-white font-semibold text-sm shadow transition"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Shop Remedies</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl border border-sand-300 bg-sand-100 hover:bg-sand-200 text-neutral-800 font-semibold text-sm transition"
                  >
                    <span>Sign In</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Footer Information */}
            <div className="text-center text-xs text-neutral-500 space-y-1">
              <p>Present your Member ID at the clinic reception or apply your coupon at checkout.</p>
              <p className="text-[11px] text-neutral-400">
                Tameer-e-Sehat Matab & Hijama Clinic • Lahore, Pakistan
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-2 border-brand-green-700 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-neutral-600">Loading Tameer-e-Sehat Membership...</p>
          </div>
        </div>
      }
    >
      <JoinPageContent />
    </Suspense>
  );
}
