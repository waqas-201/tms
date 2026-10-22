"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { getSession, signIn, signUp } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AuthTab = "signin" | "signup";

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: AuthTab;
  onAuthenticated?: () => void;
}

export default function AuthModal({
  isOpen,
  onOpenChange,
  initialTab = "signin",
  onAuthenticated,
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const switchTab = (tab: AuthTab) => {
    setActiveTab(tab);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !password) {
        throw new Error("Please enter both email and password.");
      }

      const response = await signIn.email({
        email: cleanEmail,
        password,
      });

      if (response.error) {
        const errorMessage = (response.error.message || "").toLowerCase();
        const errorCode = (response.error as { code?: string })?.code;

        if (errorCode === "EMAIL_NOT_VERIFIED" || errorMessage.includes("email not verified")) {
          throw new Error(
            "Your email address is not verified yet. Please check your inbox and verify your account before booking."
          );
        }

        throw new Error(response.error.message || "Invalid email or password.");
      }

      const sessionResponse = await getSession();
      if (!sessionResponse?.data?.user) {
        throw new Error("Sign in succeeded, but your session is not ready yet. Please try again.");
      }

      onOpenChange(false);
      onAuthenticated?.();
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!name.trim()) throw new Error("Full name is required.");
      if (!cleanEmail) throw new Error("Email address is required.");
      if (cleanEmail === "admin@tameeresehat.com") {
        throw new Error("This email is reserved for administrative access. Please use a personal email.");
      }
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long.");
      }

      const callbackURL = typeof window !== "undefined" ? window.location.href : "/hijama";
      const response = await signUp.email({
        name: name.trim(),
        email: cleanEmail,
        password,
        phone: phone.trim() || undefined,
        callbackURL,
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to create account.");
      }

      setSuccessMessage(
        `Account created. We sent a verification link to ${cleanEmail}. Verify your email, then sign in here to continue booking.`
      );
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="z-[70] max-h-[92vh] max-w-lg overflow-y-auto p-0">
        <div className="p-6 sm:p-7">
          <DialogHeader className="space-y-2 pr-8">
            <DialogTitle>Sign in to continue your Hijama booking</DialogTitle>
            <DialogDescription>
              Your appointment details stay safe while you sign in or create your account.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 grid grid-cols-2 rounded-xl border border-line bg-surface p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => switchTab("signin")}
              className={`rounded-lg py-2.5 transition-colors cursor-pointer ${
                activeTab === "signin"
                  ? "bg-surface-inverse text-white shadow-xs"
                  : "text-ink-subtle hover:text-ink"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchTab("signup")}
              className={`rounded-lg py-2.5 transition-colors cursor-pointer ${
                activeTab === "signup"
                  ? "bg-surface-inverse text-white shadow-xs"
                  : "text-ink-subtle hover:text-ink"
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="mt-5">
            {activeTab === "signin" ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-3.5 text-xs text-ink focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-ink">Password</label>
                    <Link href="/forgot-password" className="text-[11px] text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Your password"
                      className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-10 text-xs text-ink focus:border-primary focus:bg-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink cursor-pointer"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && <AuthMessage tone="error">{error}</AuthMessage>}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-brand-green-800 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  <span>{loading ? "Signing In..." : "Sign In & Continue"}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="e.g. Usman Ahmed"
                      className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-3.5 text-xs text-ink focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-3.5 text-xs text-ink focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-10 text-xs text-ink focus:border-primary focus:bg-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((visible) => !visible)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink cursor-pointer"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink">WhatsApp Phone (Optional)</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                      <input
                        type="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="0300 1234567"
                        className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-3.5 text-xs text-ink focus:border-primary focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {error && <AuthMessage tone="error">{error}</AuthMessage>}
                {successMessage && <AuthMessage tone="success">{successMessage}</AuthMessage>}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-brand-green-800 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  <span>{loading ? "Creating Account..." : "Create Account"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AuthMessage({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: React.ReactNode;
}) {
  const isError = tone === "error";

  return (
    <div
      className={`flex items-start gap-2 rounded-xl border p-3 text-xs ${
        isError
          ? "border-danger/20 bg-danger-soft text-danger"
          : "border-success-line bg-success-soft text-success"
      }`}
    >
      {isError ? (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <span>{children}</span>
    </div>
  );
}
