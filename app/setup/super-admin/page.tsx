"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  Eye,
  EyeOff,
  Flame,
} from "lucide-react";

export default function SuperAdminSetupPage() {
  const router = useRouter();

  const [loadingStatus, setLoadingStatus] = useState(true);
  const [alreadyInitialized, setAlreadyInitialized] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bootstrapKey, setBootstrapKey] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check setup status on load
  useEffect(() => {
    let isMounted = true;
    async function checkStatus() {
      try {
        const res = await fetch("/api/setup/super-admin");
        const json = await res.json();
        if (isMounted) {
          if (json.success && json.isInitialized) {
            setAlreadyInitialized(true);
          }
          setLoadingStatus(false);
        }
      } catch {
        if (isMounted) setLoadingStatus(false);
      }
    }
    checkStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!bootstrapKey.trim()) {
      setError("Please input the single-use secret Bootstrap Key.");
      return;
    }
    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill out all required administrator fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters in length.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/setup/super-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          bootstrapKey: bootstrapKey.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to initialize Super Admin account.");
      }

      setSuccess("Super Admin initialized successfully! The secret key has been permanently consumed and revoked.");
      setTimeout(() => {
        router.push("/login?setup=success");
      }, 2500);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during bootstrap verification.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingStatus) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-400">Verifying system governance state...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-900/30 ring-1 ring-emerald-400/30">
            <KeyRound className="w-8 h-8 text-slate-950" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white font-serif">
          Super Admin Bootstrap Portal
        </h2>
        <p className="mt-2 text-center text-xs text-slate-400 uppercase tracking-widest font-semibold">
          Single-Use Credential Redemption & Role Claim
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-slate-900/90 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-emerald-500/20 sm:rounded-2xl">
          {alreadyInitialized ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Super Admin Active</h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
                A sovereign Super Admin account is already configured for this system. The bootstrap initialization interface has been sealed.
              </p>
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400 mb-6 text-left">
                <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1">
                  <ShieldAlert className="w-4 h-4" /> Security Notice:
                </div>
                To rotate or reassign the Super Admin role, the authenticated Super Admin must use the <strong>Super Admin Cell</strong> inside the dashboard, or perform direct disaster recovery via database console.
              </div>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-700/20"
              >
                Proceed to Login <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Alert Callout */}
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3 text-xs text-emerald-200">
                <Flame className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-emerald-300 font-semibold mb-0.5">
                    Single-Use Self-Destructing Key:
                  </strong>
                  Entering your secret bootstrap key will establish you as the permanent Super Admin. Once verified, this key will immediately be revoked and permanently destroyed.
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 flex items-start gap-3 text-xs text-rose-200">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-400 flex items-start gap-3 text-xs text-emerald-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {/* Secret Bootstrap Key */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
                  Secret Bootstrap Key *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-500/70">
                    <KeyRound className="h-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={bootstrapKey}
                    onChange={(e) => setBootstrapKey(e.target.value)}
                    placeholder="TMS-SUPER-XXXXXX-XXXXXX-XXXXXX"
                    className="block w-full pl-11 pr-4 py-3 bg-slate-950 border border-emerald-500/40 rounded-xl text-white placeholder-slate-500 font-mono text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400">
                  Run <code className="text-emerald-400">pnpm tsx scripts/generate-bootstrap-key.ts</code> on the server to print this secret key.
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Administrator Full Name *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="h-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Hakeem Tahir Hameed"
                    className="block w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Super Admin Email *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-5 h-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@tameeresehat.com"
                    className="block w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Master Password *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters with symbols"
                    className="block w-full pl-11 pr-11 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-900/40 text-sm font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.99]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Verifying & Consuming Key...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Redeem Secret Key & Initialize Super Admin</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-xs text-slate-400 hover:text-emerald-400 transition"
                >
                  Already have access? Proceed to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
