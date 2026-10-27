"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient, resetPassword } from "@/lib/auth-client";
import { OtpInput } from "@/components/ui/otp-input";
import {
  Sparkles,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const legacyToken = searchParams.get("token");
  const emailParam = searchParams.get("email");

  const [email, setEmail] = useState(emailParam || "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  // Sync email from searchParams if updated
  useEffect(() => {
    if (emailParam && !email) {
      setEmail(emailParam);
    }
  }, [emailParam, email]);

  // Countdown timer for resending reset code
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your account email address.");
      return;
    }

    if (!legacyToken && otp.length !== 6) {
      setError("Please enter the complete 6-digit password reset code sent to your email.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter your new password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (legacyToken) {
        // Legacy token reset fallback
        const res = await (typeof resetPassword === "function"
          ? resetPassword({ newPassword: password, token: legacyToken })
          : fetch("/api/auth/reset-password", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ newPassword: password, token: legacyToken }),
            }).then((r) => r.json()));

        if (res?.error) throw new Error(res.error.message || "Failed to reset password.");
      } else {
        // 6-digit Code OTP reset
        if (authClient?.emailOtp?.resetPassword) {
          const res = await authClient.emailOtp.resetPassword({
            email: cleanEmail,
            otp: otp.trim(),
            password,
          });
          if (res?.error) {
            throw new Error(res.error.message || "Invalid or expired password reset code.");
          }
        } else {
          const res = await fetch("/api/auth/email-otp/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: cleanEmail,
              otp: otp.trim(),
              password,
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(data.message || "Invalid or expired password reset code.");
          }
        }
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 2400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reset password. Please check your code.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || resending || cooldown > 0) return;

    setResending(true);
    setResendSuccess(false);
    setError(null);

    try {
      if (authClient?.emailOtp?.sendVerificationOtp) {
        const res = await authClient.emailOtp.sendVerificationOtp({
          email: cleanEmail,
          type: "forget-password",
        });
        if (res?.error) throw new Error(res.error.message || "Failed to dispatch code.");
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
        if (!res.ok) throw new Error(data.message || "Failed to dispatch code.");
      }

      setResendSuccess(true);
      setCooldown(60);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to resend code.";
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl border border-line shadow-xl text-center">
        <div className="w-14 h-14 rounded-full bg-success-soft border border-success-line text-primary flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-secondary-text">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Security Updated</span>
          </span>
          <h2 className="font-serif text-2xl font-bold text-primary">
            Password Changed Successfully
          </h2>
          <p className="text-xs text-ink-body leading-relaxed">
            Your password has been updated. For your security, all active sessions across all devices have been logged out.
          </p>
          <p className="text-[11px] text-secondary-text font-medium pt-1">
            Redirecting to sign in screen...
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center gap-2 py-3 bg-primary hover:bg-brand-green-800 text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-all shadow-md"
          >
            <span>Sign In with New Password</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl border border-line shadow-xl">
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-secondary-text">
          <KeyRound className="w-3.5 h-3.5" />
          <span>New Password Setup</span>
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-primary">
          Reset Your Password
        </h1>
        <p className="text-xs text-ink-muted leading-relaxed">
          Enter your 6-digit password reset code and choose a strong new password.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-danger-soft border border-danger/20 rounded-xl text-xs text-danger flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {resendSuccess && (
        <div className="p-3.5 bg-success-soft border border-success-line rounded-xl text-xs text-success flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>A fresh 6-digit reset code has been sent to your email!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink">
            Account Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patient@example.com"
              className="w-full pl-10 pr-3.5 py-2.5 bg-surface border border-line-strong rounded-lg text-xs text-ink focus:outline-none focus:border-primary focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* 6-Digit Code Input (hidden if legacy token present) */}
        {!legacyToken && (
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-ink">
                6-Digit Reset Code
              </label>
              <span className="text-[11px] text-secondary-text">Valid 5 minutes</span>
            </div>
            <OtpInput
              value={otp}
              onChange={setOtp}
              disabled={loading}
              hasError={Boolean(error && otp.length > 0 && otp.length < 6)}
            />
          </div>
        )}

        {/* New Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink">
            New Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full pl-10 pr-10 py-2.5 bg-surface border border-line-strong rounded-lg text-xs text-ink focus:outline-none focus:border-primary focus:bg-white transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full pl-10 pr-10 py-2.5 bg-surface border border-line-strong rounded-lg text-xs text-ink focus:outline-none focus:border-primary focus:bg-white transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || (!legacyToken && otp.length !== 6) || !password || !confirmPassword}
          className="w-full py-3 bg-primary hover:bg-brand-green-800 disabled:opacity-50 text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating Password...</span>
            </>
          ) : (
            <>
              <span>Save Password &amp; Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Resend reset code action */}
      {!legacyToken && (
        <div className="pt-2 border-t border-line text-center space-y-2">
          <p className="text-xs text-ink-muted">
            Code expired or didn&apos;t arrive?
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0 || !email.trim()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
          >
            {resending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Sending new code...</span>
              </>
            ) : cooldown > 0 ? (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resend code in {cooldown}s</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resend Reset Code</span>
              </>
            )}
          </button>
        </div>
      )}

      <div className="pt-1 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-primary transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] bg-surface flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="max-w-md w-full p-10 bg-white rounded-2xl border border-line shadow-xl text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
