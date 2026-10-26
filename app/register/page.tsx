"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import {
  Sparkles,
  Lock,
  Mail,
  User,
  ArrowRight,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  MapPin,
  Navigation,
  Check,
} from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "Karachi",
    address: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationNote, setLocationNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleDetectLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationNote("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setLocationNote(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        }));
        setLocating(false);
        setLocationNote("Location coordinates detected successfully.");
      },
      () => {
        setLocating(false);
        setLocationNote("Location permission denied or unavailable. You can still enter your address manually.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const lowerEmail = formData.email.toLowerCase().trim();

      // Prevent direct registration of the admin account via public form
      if (lowerEmail === "admin@tameeresehat.com") {
        throw new Error("This email is reserved for administrative access. Please use a personal email.");
      }

      if (formData.password.length < 8) {
        throw new Error("Password must be at least 8 characters long.");
      }

      // Phone is mandatory so clinic staff can always reach a customer about
      // an order or consultation.
      if (formData.phone.replace(/\D/g, "").length < 10) {
        throw new Error("Please enter a valid phone / WhatsApp number.");
      }

      const safeRedirect =
        redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
          ? redirectParam
          : "/account";

      const res = await signUp.email({
        name: formData.name.trim(),
        email: lowerEmail,
        password: formData.password,
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        address: formData.address.trim() || undefined,
        latitude: formData.latitude ?? undefined,
        longitude: formData.longitude ?? undefined,
        callbackURL: safeRedirect,
      } as Parameters<typeof signUp.email>[0]);

      if (res.error) {
        throw new Error(res.error.message || "Failed to create account.");
      }

      // Strict gating: user account requires email verification before login/access.
      const verifyUrl = `/verify-email?email=${encodeURIComponent(lowerEmail)}&redirect=${encodeURIComponent(safeRedirect)}&new=true`;
      router.push(verifyUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred during registration.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl border border-line shadow-xl">
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-secondary-text">
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Account Registration</span>
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-primary">
          Create an Account
        </h1>
        <p className="text-xs text-ink-muted">
          Track your orders and online consultation history.
        </p>
      </div>

      <div className="p-3 bg-success-soft/80 border border-success-line rounded-xl text-[11px] text-success flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <span>
          <strong>Email Verification Notice:</strong> An activation link will be sent to your email. Verification is required before placing orders.
        </span>
      </div>

      {error && (
        <div className="p-3.5 bg-danger-soft border border-danger/20 rounded-xl text-xs text-danger flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink">
            Full Name <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Muhammad Bilal"
              className="w-full pl-10 pr-3.5 py-2.5 bg-surface border border-line rounded-lg text-xs text-ink focus:outline-none focus:border-primary focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink">
            Email Address <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="bilal@example.com"
              className="w-full pl-10 pr-3.5 py-2.5 bg-surface border border-line rounded-lg text-xs text-ink focus:outline-none focus:border-primary focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink">
              Phone / WhatsApp <span className="text-danger">*</span>
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="0300-1234567"
              className="w-full px-3.5 py-2.5 bg-surface border border-line rounded-lg text-xs text-ink focus:outline-none focus:border-primary focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Karachi, Lahore..."
              className="w-full px-3.5 py-2.5 bg-surface border border-line rounded-lg text-xs text-ink focus:outline-none focus:border-primary focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-ink">
              Address <span className="text-ink-muted text-[10px] font-normal">(Optional for delivery)</span>
            </label>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={locating}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-brand-green-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {locating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Navigation className="w-3 h-3" />
              )}
              <span>{formData.latitude ? "Update GPS Pin" : "Detect GPS Pin"}</span>
            </button>
          </div>
          <div className="relative">
            <MapPin className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="House / Apartment #, Street, Area / Landmark..."
              className="w-full pl-10 pr-3.5 py-2 bg-surface border border-line rounded-lg text-xs text-ink focus:outline-none focus:border-primary focus:bg-white transition-colors resize-none"
            />
          </div>
          {formData.latitude !== null && formData.longitude !== null && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              <Check className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>GPS Pin saved ({formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)})</span>
            </div>
          )}
          {locationNote && (formData.latitude === null || formData.longitude === null) && (
            <p className="text-[11px] text-ink-muted">{locationNote}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink">
            Password (Min 8 characters) <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-2 text-center text-xs text-ink-muted">
        <p>
          Already registered?{" "}
          <Link
            href={redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : "/login"}
            className="text-primary font-semibold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-[85vh] py-12 px-4 flex items-center justify-center bg-sand-50/50">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}
