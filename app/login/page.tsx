"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession, sendVerificationEmail } from "@/lib/auth-client";
import {
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldAlert,
} from "lucide-react";
import { isStaffRole } from "@/lib/rbac-base";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const verifiedParam = searchParams.get("verified");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Unverified account handling
  const [isUnverified, setIsUnverified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Decrement resend cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIsUnverified(false);
    setResendSuccess(false);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await signIn.email({
        email: cleanEmail,
        password,
      });

      if (res.error) {
        const errorMsg = (res.error.message || "").toLowerCase();
        const errorCode = (res.error as { code?: string })?.code;

        if (errorCode === "EMAIL_NOT_VERIFIED" || errorMsg.includes("email not verified")) {
          setIsUnverified(true);
          setError(
            "Your email address is not verified yet. Verification is strictly required before you can access your account."
          );
          return;
        }

        throw new Error(res.error.message || "Invalid email or password.");
      }

      // Check role from signIn response or fresh session
      let role = (res.data as { user?: { role?: string } })?.user?.role;
      if (!role) {
        const sessionRes = await getSession();
        role = (sessionRes?.data?.user as { role?: string })?.role;
      }

      if (isStaffRole(role)) {
        router.push("/admin");
      } else if (redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")) {
        router.push(redirectParam);
      } else {
        router.push("/account");
      }
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign in. Please check your credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim() || resending || cooldown > 0) return;
    setResending(true);
    setResendSuccess(false);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const safeCallback =
        redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
          ? redirectParam
          : "/account";

      if (typeof sendVerificationEmail === "function") {
        const res = await sendVerificationEmail({
          email: cleanEmail,
          callbackURL: safeCallback,
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
            callbackURL: safeCallback,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Failed to dispatch verification email.");
        }
      }

      setResendSuccess(true);
      setCooldown(60);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to dispatch verification email. Please try again.";
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-7 bg-white p-8 sm:p-10 rounded-2xl border border-line shadow-xl">
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-secondary-text">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Clinic &amp; Account Access</span>
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-primary">
          Sign In to Tameer-e-Sehat
        </h1>
        <p className="text-xs text-ink-muted">
          Access your consultations, order history, and account settings.
        </p>
      </div>

      {verifiedParam === "true" && (
        <div className="p-3.5 bg-success-soft border border-success-line rounded-xl text-xs text-success flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
          <span>Your email has been verified successfully! You may now sign in.</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-danger-soft border border-danger/20 rounded-xl text-xs text-danger flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isUnverified && (
        <div className="p-4 bg-warning-soft/90 border border-warning-line rounded-xl space-y-2.5 text-xs text-warning shadow-xs">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-warning">Email Verification Pending</p>
              <p className="text-[11px] text-warning leading-relaxed mt-0.5">
                Check your inbox for the activation link sent to <strong>{email.trim()}</strong>.
              </p>
            </div>
          </div>

          {resendSuccess && (
            <div className="p-2 bg-success-soft border border-success-line rounded-lg text-[11px] text-success flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>✓ Fresh activation link dispatched! Please check your spam or inbox.</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resending || cooldown > 0}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-warning hover:bg-warning text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {resending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Sending Activation Link...</span>
              </>
            ) : cooldown > 0 ? (
              <span>Resend available in {cooldown}s</span>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resend Verification Email</span>
              </>
            )}
          </button>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
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
              onChange={(e) => {
                setEmail(e.target.value);
                if (isUnverified) setIsUnverified(false);
              }}
              placeholder="your.email@example.com"
              className="w-full pl-10 pr-3.5 py-2.5 bg-surface border border-line rounded-lg text-xs text-ink focus:outline-none focus:border-primary focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-ink">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-medium text-secondary-text hover:text-primary transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-surface border border-line rounded-lg text-xs text-ink focus:outline-none focus:border-primary focus:bg-white transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
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
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-brand-green-800 text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-all shadow-md disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-2 text-center text-xs text-ink-muted">
        <p>
          Don&apos;t have an account?{" "}
          <Link
            href={redirectParam ? `/register?redirect=${encodeURIComponent(redirectParam)}` : "/register"}
            className="text-primary font-semibold hover:underline"
          >
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] bg-surface flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="max-w-md w-full bg-white p-10 rounded-2xl border border-line text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            <p className="text-xs text-ink-muted">Loading sign in...</p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
