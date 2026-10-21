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
  Inbox,
} from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const errorParam = searchParams.get("error");
  const emailParam = searchParams.get("email");
  const isNewSignup = searchParams.get("new") === "true";
  const redirectParam = searchParams.get("redirect") || searchParams.get("callbackURL") || "/account";

  const safeRedirect =
    redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
      ? redirectParam
      : "/account";

  const [status, setStatus] = useState<"loading" | "success" | "error" | "prompt">(
    token ? "loading" : "prompt"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(
    errorParam ? "The verification link is invalid or has expired." : null
  );
  const [emailInput, setEmailInput] = useState(emailParam || "");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(isNewSignup ? 30 : 0);

  // Decrement cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Execute verification when a token is provided in URL
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
          // Smooth auto-redirect after brief celebration
          setTimeout(() => {
            router.push(safeRedirect);
          }, 1800);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setStatus("error");
          const msg =
            err instanceof Error
              ? err.message
              : "The verification link is invalid or has expired. Please request a new link.";
          setErrorMessage(msg);
        }
      }
    }

    executeVerification();

    return () => {
      isMounted = false;
    };
  }, [token, safeRedirect, router]);

  const handleResend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetEmail = (emailInput || emailParam || "").trim().toLowerCase();
    if (!targetEmail || resending || cooldown > 0) return;

    setResending(true);
    setResendSuccess(false);
    setErrorMessage(null);

    try {
      if (typeof sendVerificationEmail === "function") {
        const res = await sendVerificationEmail({
          email: targetEmail,
          callbackURL: safeRedirect,
        });
        if (res?.error) {
          throw new Error(res.error.message || "Failed to dispatch verification email.");
        }
      } else {
        const res = await fetch("/api/auth/send-verification-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: targetEmail,
            callbackURL: safeRedirect,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to dispatch verification email.");
        }
      }

      setResendSuccess(true);
      setCooldown(60);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to send verification email. Please try again.";
      setErrorMessage(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl border border-line shadow-xl">
      {status === "loading" && (
        <div className="text-center space-y-4 py-6">
          <div className="w-14 h-14 rounded-full bg-success-soft border border-success-line text-primary flex items-center justify-center mx-auto">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-serif text-2xl font-bold text-primary">
              Verifying Your Email
            </h2>
            <p className="text-xs text-ink-muted">
              Validating your patient credentials and establishing secure session...
            </p>
          </div>
        </div>
      )}

      {status === "success" && (
        <div className="text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-success-soft border border-success-line text-primary flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-secondary-text">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Account Activated</span>
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary">
              Email Verified Successfully
            </h2>
            <p className="text-xs text-ink-body leading-relaxed">
              Assalam-o-Alaikum! Your email address has been verified. Your patient profile, consultations, and remedy orders are now fully active.
            </p>
            <p className="text-[11px] text-secondary-text font-medium pt-1">
              Redirecting you to your account in a moment...
            </p>
          </div>

          <div className="pt-2">
            <Link
              href={safeRedirect}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-brand-green-800 text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-all shadow-md"
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
            <div className="w-14 h-14 rounded-full bg-success-soft border border-success-line text-primary flex items-center justify-center mx-auto">
              {isNewSignup ? <Inbox className="w-7 h-7" /> : <Mail className="w-7 h-7 text-secondary-text" />}
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-secondary-text">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isNewSignup ? "Registration Step 2 of 2" : "Email Verification"}</span>
            </span>
            <h1 className="font-serif text-2xl font-bold text-primary">
              {status === "error"
                ? "Verification Link Expired"
                : isNewSignup
                ? "Check Your Email"
                : "Verify Your Account"}
            </h1>
            <p className="text-xs text-ink-muted leading-relaxed">
              {status === "error"
                ? "This verification link is invalid or has expired. Enter your email below to receive a fresh activation link."
                : isNewSignup && emailParam
                ? `Assalam-o-Alaikum! We have sent a secure activation link to ${emailParam}. Please click the link in your email to activate your account.`
                : "Please verify your email address to access your consultations and order records."}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-danger-soft border border-danger/20 rounded-xl text-xs text-danger flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {resendSuccess && (
            <div className="p-3 bg-success-soft border border-success-line rounded-xl text-xs text-success flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-primary" />
              <span>Activation email dispatched! Please check your inbox and spam folder.</span>
            </div>
          )}

          <form onSubmit={handleResend} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink">
                Your Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-surface border border-line rounded-lg text-xs text-ink focus:outline-none focus:border-primary focus:bg-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={resending || cooldown > 0}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-brand-green-800 text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              {resending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Dispatching Link...</span>
                </>
              ) : cooldown > 0 ? (
                <span>Resend available in {cooldown}s</span>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Resend Verification Email</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 flex items-center justify-between text-xs text-ink-muted">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-primary font-semibold hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Already verified? Sign In</span>
            </Link>

            <Link
              href="/register"
              className="text-secondary-text hover:text-primary hover:underline"
            >
              Wrong email?
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[80vh] bg-surface flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="max-w-md w-full bg-white p-10 rounded-2xl border border-line text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            <p className="text-xs text-ink-muted">Checking verification status...</p>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
