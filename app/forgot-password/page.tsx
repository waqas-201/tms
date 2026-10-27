"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  Sparkles,
  Mail,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  KeyRound,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    setLoading(true);
    setError(null);

    try {
      if (authClient?.emailOtp?.sendVerificationOtp) {
        const res = await authClient.emailOtp.sendVerificationOtp({
          email: cleanEmail,
          type: "forget-password",
        });
        if (res?.error) {
          throw new Error(res.error.message || "Failed to dispatch password reset code.");
        }
      } else {
        const res = await fetch("/api/auth/email-otp/request-password-reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: cleanEmail,
            type: "forget-password",
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || "Failed to dispatch password reset code.");
        }
      }

      // Smooth navigation to unified reset screen with email parameter
      router.push(`/reset-password?email=${encodeURIComponent(cleanEmail)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please check your email.";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-surface flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl border border-line shadow-xl">
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-secondary-text">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Account Recovery</span>
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-primary">
            Forgot Your Password?
          </h1>
          <p className="text-xs text-ink-muted leading-relaxed">
            Enter your registered email address to receive a 6-digit Password Reset Code valid for 5 minutes.
          </p>
          <p className="text-[11px] text-secondary-text font-medium" dir="rtl">
            پاس ورڈ تبدیل کرنے کا ۶ ہندسوں کا کوڈ آپ کی ای میل پر بھیجا جائے گا۔
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-danger-soft border border-danger/20 rounded-xl text-xs text-danger flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-surface border border-line-strong rounded-lg text-xs text-ink focus:outline-none focus:border-primary focus:bg-white transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full py-3 bg-primary hover:bg-brand-green-800 disabled:opacity-50 text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending 6-Digit Code...</span>
              </>
            ) : (
              <>
                <span>Get Reset Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-line">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-primary transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
