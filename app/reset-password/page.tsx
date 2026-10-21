"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/auth-client";
import {
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
} from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const errorParam = searchParams.get("error");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam === "INVALID_TOKEN"
      ? "This password reset link is invalid or has expired. Please request a new one."
      : null
  );
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Reset token is missing. Please use the link provided in your email.");
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
      if (typeof resetPassword === "function") {
        const res = await resetPassword({
          newPassword: password,
          token,
        });
        if (res?.error) {
          throw new Error(res.error.message || "Failed to reset password.");
        }
      } else {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newPassword: password,
            token,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to reset password.");
        }
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(
        err.message ||
          "Failed to update password. Your reset link may have expired. Please request a new one."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token && !isSuccess) {
    return (
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl border border-line shadow-xl text-center">
        <div className="w-14 h-14 rounded-full bg-warning-soft border border-warning-line text-warning flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-bold text-primary">
            Invalid or Missing Token
          </h1>
          <p className="text-xs text-ink-muted leading-relaxed">
            The password reset link is invalid or incomplete. Please request a new link from the forgot password page.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/forgot-password"
            className="w-full inline-flex items-center justify-center gap-2 py-3 bg-primary hover:bg-brand-green-800 text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-all shadow-md"
          >
            <span>Request New Reset Link</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl border border-line shadow-xl">
      {!isSuccess ? (
        <>
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-secondary-text">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Password Security</span>
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-primary">
              Set New Password
            </h1>
            <p className="text-xs text-ink-muted">
              Create a strong password for your Tameer-e-Sehat account.
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
                New Password (Min 8 characters) <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-surface border border-line rounded-lg text-xs text-ink focus:outline-none focus:border-primary focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink">
                Confirm New Password <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-surface border border-line rounded-lg text-xs text-ink focus:outline-none focus:border-primary focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-brand-green-800 text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-all shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-ink-muted">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-primary font-semibold hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-success-soft border border-success-line text-primary flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-secondary-text">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Security Updated</span>
            </span>
            <h2 className="font-serif text-2xl font-bold text-primary">
              Password Reset Successful
            </h2>
            <p className="text-xs text-ink-body leading-relaxed">
              Your account password has been safely updated. You can now sign in with your new credentials.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-brand-green-800 text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-all shadow-md"
            >
              <span>Sign In to Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] bg-surface flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="max-w-md w-full bg-white p-10 rounded-2xl border border-line text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            <p className="text-xs text-ink-muted">Loading password recovery...</p>
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
