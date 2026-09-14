"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { useLanguage } from "@/app/context/LanguageContext";
import { Sparkles, Lock, Mail, ArrowRight, Loader2, AlertCircle, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { isUrdu } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn.email({
        email,
        password,
      });

      if (res.error) {
        throw new Error(res.error.message || "Invalid email or password.");
      }

      // Check if admin or regular user
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-[#faf8f5] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-[#e6dfd5] shadow-xl">
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-[#c59b27]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isUrdu ? "مرکزِ صحت لاگ ان" : "Apothecary & Clinic Access"}</span>
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#123824]">
            {isUrdu ? "اپنے اکاؤنٹ میں داخل ہوں" : "Sign In to Tameer-e-Sehat"}
          </h1>
          <p className="text-xs text-[#6a6660]">
            {isUrdu
              ? "حکیم و ایڈمن پورٹل یا مریض کا طبی ریکارڈ دیکھنے کے لیے لاگ ان کریں۔"
              : "Access your clinical consultation history, tracked orders, and Hakim desk."}
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1a1816]">
              {isUrdu ? "ای میل ایڈریس" : "Email Address"}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#6a6660] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tameeresehat.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-xs text-[#1a1816] focus:outline-none focus:border-[#123824] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-[#1a1816]">
                {isUrdu ? "پاس ورڈ" : "Password"}
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#6a6660] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                <span>{isUrdu ? "تصدیق ہو رہی ہے..." : "Authenticating..."}</span>
              </>
            ) : (
              <>
                <span>{isUrdu ? "داخل ہوں" : "Sign In"}</span>
                <ArrowRight className={`w-4 h-4 ${isUrdu ? "rotate-180" : ""}`} />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-[#6a6660] space-y-3">
          <p>
            {isUrdu ? "نیا اکاؤنٹ بنانا چاہتے ہیں؟" : "Don't have an account?"}{" "}
            <Link href="/register" className="text-[#123824] font-semibold hover:underline">
              {isUrdu ? "یہاں رجسٹر ہوں" : "Create an Account"}
            </Link>
          </p>

          <div className="p-3 bg-[#f4eee5]/60 rounded-lg text-[11px] text-[#59534b] text-left">
            <p className="font-semibold text-[#123824]">Hakim & Admin Demo Access:</p>
            <p>Admin Email: <code className="text-[#123824]">admin@tameeresehat.com</code></p>
            <p>Admin Portal gives live control over all orders, patient consultations, stock & analytics.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
