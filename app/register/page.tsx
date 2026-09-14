"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { Sparkles, Lock, Mail, User, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "Karachi",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signUp.email({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        city: formData.city,
      } as any);

      if (res.error) {
        throw new Error(res.error.message || "Failed to create account.");
      }

      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-[#faf8f5] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl border border-[#e6dfd5] shadow-xl">
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-[#c59b27]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Account Registration</span>
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#123824]">
            Create an Account
          </h1>
          <p className="text-xs text-[#6a6660]">
            Track your orders and online consultation history.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1a1816]">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#6a6660] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Muhammad Bilal"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-xs text-[#1a1816] focus:outline-none focus:border-[#123824] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1a1816]">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#6a6660] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="bilal@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-xs text-[#1a1816] focus:outline-none focus:border-[#123824] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1a1816]">
                Phone / WhatsApp
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0300-1234567"
                className="w-full px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-xs text-[#1a1816] focus:outline-none focus:border-[#123824] focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1a1816]">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Karachi, Lahore..."
                className="w-full px-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-xs text-[#1a1816] focus:outline-none focus:border-[#123824] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1a1816]">
              Password (Min 8 characters) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#6a6660] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-xs text-[#1a1816] focus:outline-none focus:border-[#123824] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#123824] hover:bg-[#0c2719] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-all shadow-md disabled:opacity-50"
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

        <div className="pt-2 text-center text-xs text-[#6a6660]">
          <p>
            Already registered?{" "}
            <Link href="/login" className="text-[#123824] font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
