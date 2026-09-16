"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyEmail, sendVerificationEmail } from "@/lib/auth-client";
import {
  Sparkles,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const errorParam = searchParams.get("error");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "prompt">(
    token ? "loading" : "prompt"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(
    errorParam ? "The verification link is invalid or has expired." : null
  );
  const [emailInput, setEmailInput] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    async function executeVerification() {
      try {
        if (typeof verifyEmail === "function") {
          const res = await verifyEmail({
            query: { token: token as string },
          });
          if (res?.error) {
            throw new Error(res.error.message || "Failed to verify email.");
          }
        } else {
          const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token as string)}`);
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || "Failed to verify email.");
          }
        }

        if (isMounted) {
          setStatus("success");
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus("error");
          setErrorMessage(
            err.message || "The verification link is invalid or has expired. Please request a new link."
          );
        }
      }
    }

    executeVerification();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!emailInput.trim()) return;

    setResending(true);
    setResendSuccess(false);
    setErrorMessage(null);

    try {
      const cleanEmail = emailInput.trim().toLowerCase();
      if (typeof sendVerificationEmail === "function") {
        const res = await sendVerificationEmail({
          email: cleanEmail,
          callbackURL: "/account",
        });
        if (res?.error) {
          throw new Error(res.error.message || "Failed to dispatch verification email.");
        }
      } else {
        const res = await fetch("/api/auth/send-verification-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: cleanEmail,
            callbackURL: "/account",
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to dispatch verification email.");
        }
      }

      setResendSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to send verification email. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl border border-[#e6dfd5] shadow-xl">
      {status === "loading" && (
        <div className="text-center space-y-4 py-6">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-[#22623a] flex items-center justify-center mx-auto">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-serif text-2xl font-bold text-[#22623a]">
              Verifying Your Email
            </h2>
            <p className="text-xs text-[#6a6660]">
              Please wait while we validate your patient account credentials...
            </p>
          </div>
        </div>
      )}

      {status === "success" && (
        <div className="text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-[#22623a] flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-[#c59b27]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Account Activated</span>
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#22623a]">
              Email Verified Successfully
            </h2>
            <p className="text-xs text-[#59534b] leading-relaxed">
              Assalam-o-Alaikum! Your email address has been verified. Your patient profile, consultations, and herbal remedy tracking are now active.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/account"
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-all shadow-md"
            >
              <span>Go to My Patient Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {(status === "error" || status === "prompt") && (
        <div className="space-y-5">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-[#c59b27] flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-[#c59b27]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Email Verification</span>
            </span>
            <h1 className="font-serif text-2xl font-bold text-[#22623a]">
              {status === "error" ? "Verification Link Expired" : "Verify Your Account"}
            </h1>
            <p className="text-xs text-[#6a6660] leading-relaxed">
              {status === "error"
                ? "This verification link is invalid or has expired. Enter your email below to receive a new activation link."
                : "Please verify your email address to access your consultations and order records."}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {resendSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#22623a]" />
              <span>Verification email dispatched! Please check your inbox.</span>
            </div>
          )}

          <form onSubmit={handleResend} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1a1816]">
                Your Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6a6660] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-xs text-[#1a1816] focus:outline-none focus:border-[#22623a] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={resending}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#22623a] hover:bg-[#1b502e] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-all shadow-md disabled:opacity-50"
            >
              {resending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Dispatching Email...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Resend Verification Email</span>
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
              <span>Return to Sign In</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[80vh] bg-[#faf8f5] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="max-w-md w-full bg-white p-10 rounded-2xl border border-[#e6dfd5] text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#22623a] mx-auto" />
            <p className="text-xs text-[#6a6660]">Checking verification status...</p>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
