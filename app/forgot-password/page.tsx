"use client";

import React, { useState } from "react";
import Link from "next/link";
import { requestPasswordReset, forgetPassword } from "@/lib/auth-client";
import {
  Sparkles,
  Mail,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  RefreshCw,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const cleanEmail = email.trim().toLowerCase();
      // Use client helper or direct endpoint
      const resetFn = requestPasswordReset || forgetPassword;
      if (typeof resetFn === "function") {
        const res = await resetFn({
          email: cleanEmail,
          redirectTo: "/reset-password",
        });
        if (res?.error) {
          throw new Error(res.error.message || "Failed to send reset link.");
        }
      } else {
        const res = await fetch("/api/auth/request-password-reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: cleanEmail,
            redirectTo: "/reset-password",
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to send reset email.");
        }
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please check your email and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendLoading) return;
    setResendLoading(true);
    setResendSuccess(false);
    setError(null);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const resetFn = requestPasswordReset || forgetPassword;
      if (typeof resetFn === "function") {
        await resetFn({
          email: cleanEmail,
          redirectTo: "/reset-password",
        });
      } else {
        await fetch("/api/auth/request-password-reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: cleanEmail,
            redirectTo: "/reset-password",
          }),
        });
      }
      setResendSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to resend reset email.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-[#faf8f5] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl border border-[#e6dfd5] shadow-xl">
        {!isSubmitted ? (
          <>
            <div className="text-center space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-[#c59b27]">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Account Recovery</span>
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#22623a]">
                Forgot Your Password?
              </h1>
              <p className="text-xs text-[#6a6660] leading-relaxed">
                Enter your registered email address and we will send you a secure password reset link.
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1a1816]">
                  Registered Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6a6660] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-xs text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-all shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Dispatching Reset Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-[#6a6660]">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-[#22623a] font-semibold hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-[#22623a] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-[#c59b27]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Email Dispatched</span>
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#22623a]">
                Check Your Inbox
              </h2>
              <p className="text-xs text-[#59534b] leading-relaxed">
                If an account exists for <strong className="text-[#1a1816]">{email}</strong>, we have dispatched a password reset link to your email.
              </p>
            </div>

            <div className="p-3.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-xl text-left text-xs text-[#6a6660] space-y-1.5">
              <p className="font-semibold text-[#1a1816] flex items-center gap-1.5">
                <span>⏱ Link Expiration:</span>
                <span className="text-[#8c6a15]">1 Hour</span>
              </p>
              <p className="text-[11px] leading-relaxed">
                Please check your inbox (and spam/junk folder). Click the button in the email to set a new password.
              </p>
            </div>

            {resendSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700">
                A fresh reset link has been dispatched to your email.
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-[#faf8f5] border border-[#e6dfd5] text-[#22623a] text-xs font-semibold rounded-md transition-colors disabled:opacity-50"
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Resending...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resend Reset Email</span>
                  </>
                )}
              </button>

              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-1.5 text-xs text-[#6a6660] hover:text-[#22623a] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
