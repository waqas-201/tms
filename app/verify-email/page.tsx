"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient, verifyEmail } from "@/lib/auth-client";
import { OtpInput } from "@/components/ui/otp-input";
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
  ShieldAlert,
  Inbox,
  KeyRound,
} from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const legacyToken = searchParams.get("token");
  const errorParam = searchParams.get("error");
  const emailParam = searchParams.get("email");
  const isNewSignup = searchParams.get("new") === "true";
  const isUnverifiedLogin = searchParams.get("source") === "unverified";
  const redirectParam = searchParams.get("redirect") || searchParams.get("callbackURL") || "/account";

  const safeRedirect =
    redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
      ? redirectParam
      : "/account";

  const [otp, setOtp] = useState("");
  const [emailInput, setEmailInput] = useState(emailParam || "");
  const [status, setStatus] = useState<"loading" | "success" | "error" | "input">(
    legacyToken ? "loading" : "input"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(
    errorParam ? "The verification code is invalid or has expired." : null
  );
  const [resending, setResending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(isNewSignup ? 60 : 0);

  // Sync emailInput if query param changes
  useEffect(() => {
    if (emailParam && !emailInput) {
      setEmailInput(emailParam);
    }
  }, [emailParam, emailInput]);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Legacy link fallback if token in query string
  useEffect(() => {
    if (!legacyToken) return;

    let isMounted = true;
    async function executeLegacyVerification() {
      try {
        if (typeof verifyEmail === "function") {
          const res = await verifyEmail({
            query: { token: legacyToken as string },
          });
          if (res?.error) throw new Error(res.error.message || "Failed to verify email.");
        } else {
          const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(legacyToken as string)}`);
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || "Failed to verify email.");
          }
        }

        if (isMounted) {
          setStatus("success");
          setTimeout(() => {
            router.push(safeRedirect);
          }, 1800);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setStatus("error");
          setErrorMessage(err instanceof Error ? err.message : "The link is invalid or expired.");
        }
      }
    }

    executeLegacyVerification();
    return () => {
      isMounted = false;
    };
  }, [legacyToken, safeRedirect, router]);

  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = (codeToVerify || otp).trim();
    const targetEmail = (emailInput || emailParam || "").trim().toLowerCase();

    if (!targetEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (code.length !== 6) {
      setErrorMessage("Please enter all 6 digits of your verification code.");
      return;
    }

    setVerifying(true);
    setErrorMessage(null);

    try {
      if (authClient?.emailOtp?.verifyEmail) {
        const res = await authClient.emailOtp.verifyEmail({
          email: targetEmail,
          otp: code,
        });
        if (res?.error) {
          throw new Error(res.error.message || "Invalid or expired verification code.");
        }
      } else {
        const res = await fetch("/api/auth/email-otp/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: targetEmail,
            otp: code,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || "Invalid or expired verification code.");
        }
      }

      setStatus("success");
      setTimeout(() => {
        router.push(safeRedirect);
      }, 1800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification failed. Please try again.";
      setErrorMessage(msg);
      setStatus("input");
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetEmail = (emailInput || emailParam || "").trim().toLowerCase();
    if (!targetEmail || resending || cooldown > 0) return;

    setResending(true);
    setResendSuccess(false);
    setErrorMessage(null);

    try {
      if (authClient?.emailOtp?.sendVerificationOtp) {
        const res = await authClient.emailOtp.sendVerificationOtp({
          email: targetEmail,
          type: "email-verification",
        });
        if (res?.error) {
          throw new Error(res.error.message || "Failed to dispatch verification code.");
        }
      } else {
        const res = await fetch("/api/auth/email-otp/send-verification-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: targetEmail,
            type: "email-verification",
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || "Failed to dispatch verification code.");
        }
      }

      setResendSuccess(true);
      setCooldown(60);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to dispatch code. Please try again.";
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
              Verifying Your Account
            </h2>
            <p className="text-xs text-ink-muted">
              Validating your credentials and activating patient services...
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
              Assalam-o-Alaikum! Your email address has been verified. Your patient profile, clinical consultations, and remedy orders are now fully active.
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

      {(status === "input" || status === "error") && (
        <div className="space-y-5">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-success-soft border border-success-line text-primary flex items-center justify-center mx-auto">
              {isNewSignup ? (
                <Inbox className="w-7 h-7" />
              ) : isUnverifiedLogin ? (
                <ShieldAlert className="w-7 h-7 text-primary" />
              ) : (
                <KeyRound className="w-7 h-7 text-primary" />
              )}
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-secondary-text">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Account Security</span>
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-primary">
              Enter Verification Code
            </h1>
            <p className="text-xs text-ink-body leading-relaxed">
              We sent a 6-digit verification code to{" "}
              {emailParam ? (
                <strong className="text-primary font-mono">{emailParam}</strong>
              ) : (
                "your email address"
              )}
              . Enter the code below to activate your account.
            </p>
            <p className="text-[11px] text-secondary-text font-medium" dir="rtl">
              یہ کوڈ ۵ منٹ کے لیے کارآمد ہے۔
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-danger-soft border border-danger/20 rounded-xl text-xs text-danger flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {resendSuccess && (
            <div className="p-3.5 bg-success-soft border border-success-line rounded-xl text-xs text-success flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>A fresh 6-digit verification code has been dispatched to your email!</span>
            </div>
          )}

          {/* Email input if not in URL */}
          {!emailParam && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-surface border border-line-strong rounded-lg text-xs text-ink focus:outline-none focus:border-primary focus:bg-white transition-colors"
                />
              </div>
            </div>
          )}

          {/* 6-Digit Segmented OTP Input */}
          <div className="space-y-2">
            <OtpInput
              value={otp}
              onChange={setOtp}
              onComplete={(code) => handleVerifyOtp(code)}
              disabled={verifying}
              hasError={Boolean(errorMessage)}
            />
          </div>

          {/* Verify Action Button */}
          <button
            type="button"
            onClick={() => handleVerifyOtp()}
            disabled={verifying || otp.length !== 6}
            className="w-full py-3 bg-primary hover:bg-brand-green-800 disabled:opacity-50 text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {verifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Code...</span>
              </>
            ) : (
              <>
                <span>Verify &amp; Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Resend Action with 60-Second Cooldown */}
          <div className="pt-2 border-t border-line text-center space-y-2">
            <p className="text-xs text-ink-muted">
              Didn&apos;t receive the code or expired? Check spam folder or
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
            >
              {resending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending code...</span>
                </>
              ) : cooldown > 0 ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend code in {cooldown}s</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend 6-Digit Code</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-2 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="max-w-md w-full p-10 bg-white rounded-2xl border border-line shadow-xl text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
