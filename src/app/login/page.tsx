"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Radio,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Quick-fill credentials helper for evaluation
  const fillCredentials = (role: "officer" | "citizen") => {
    if (role === "officer") {
      setEmail("officer@nshield.nagpur.gov.in");
      setPassword("NagpurSafe@2026");
    } else {
      setEmail("citizen@nshield.nagpur.gov.in");
      setPassword("CitizenSafe@2026");
    }
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Client-side validation
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email, password, rememberMe);

      if (!result.success) {
        setErrorMessage(result.error || "Authentication failed.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Identity verified. Redirecting to N-SHIELD Command Center...");
      setTimeout(() => {
        router.push(returnUrl);
      }, 700);
    } catch (err: any) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070d1e] text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Graphic Grid & Ambient Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-600/15 blur-[140px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 px-6 sm:px-12 py-5 flex items-center justify-between border-b border-slate-800/80 bg-[#070d1e]/80 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 shadow-md shadow-indigo-500/20 ring-1 ring-white/20 text-white transition-transform group-hover:scale-105">
            <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-white leading-none">
                N-SHIELD
              </span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Nagpur City
              </span>
            </div>
            <span className="text-[10px] font-medium text-slate-400">
              AI Urban Safety Intelligence
            </span>
          </div>
        </Link>

        {/* 24/7 Emergency Quick Helpline Bypass */}
        <div className="flex items-center gap-3">
          <a
            href="tel:112"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition shadow-xs"
            title="Integrated Emergency Helpline 112"
          >
            <Siren className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
            <span>Emergency 112</span>
          </a>
        </div>
      </header>

      {/* Main 2-Column Responsive Body */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16">
        
        {/* Left Column: Platform Branding & Intelligence Map Graphics */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs font-bold w-fit">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Real-time Situational Intelligence</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
            Your City. Your Safety.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-300">
              One Intelligent Platform.
            </span>
          </h2>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
            Access urban safety intelligence, predictive crime risk heatmaps, emergency resource
            locators, and 24/7 live assistance across Nagpur from a single unified portal.
          </p>

          {/* City Grid Visualization Mini-Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0c152e]/80 border border-slate-800 shadow-2xl backdrop-blur-md relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-200">Nagpur Police & Safety Grid</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                Live Coverage
              </span>
            </div>

            <div className="mt-3.5 grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
                <div className="text-lg font-black text-white">37</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Police Stations</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
                <div className="text-lg font-black text-white">64+</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Verified Hospitals</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
                <div className="text-lg font-black text-emerald-400">100%</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Zero-Gap Heatmap</div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-indigo-400 shrink-0" />
              <span>Covering Sitabuldi, Dharampeth, Nandanvan, MIHAN, WCEM Corridor & all 10 zones.</span>
            </p>
          </div>
        </div>

        {/* Right Column: Compact Elegant Login Card */}
        <div className="w-full lg:w-[460px] shrink-0">
          <div className="rounded-2xl sm:rounded-3xl bg-[#0b142c]/95 border border-slate-800/90 shadow-2xl backdrop-blur-xl p-6 sm:p-8">
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Sign in to N-SHIELD
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Enter your credentials to access the safety command center.
              </p>
            </div>

            {/* Error & Success Feedback Banners */}
            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Address */}
              <div>
                <label
                  htmlFor="email-address"
                  className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                  <input
                    id="email-address"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@nshield.nagpur.gov.in"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password-field"
                    className="block text-xs font-bold text-slate-300 uppercase tracking-wider"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                  <input
                    id="password-field"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                  />
                  <span className="text-xs text-slate-300">Remember this device (30 days)</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Identity...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to N-SHIELD</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Autofill Pill */}
            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <p className="text-[11px] font-semibold text-slate-400 mb-2">
                Evaluation Test Credentials:
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fillCredentials("officer")}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-950/50 hover:bg-indigo-900/50 border border-indigo-700/50 text-[11px] font-bold text-indigo-300 transition text-center cursor-pointer"
                >
                  👮 Safety Officer
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials("citizen")}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800/70 hover:bg-slate-700/70 border border-slate-700/50 text-[11px] font-bold text-slate-300 transition text-center cursor-pointer"
                >
                  👤 Citizen User
                </button>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="mt-5 text-center">
              <p className="text-xs text-slate-400">
                Don&apos;t have an account yet?{" "}
                <Link
                  href="/register"
                  className="font-bold text-indigo-400 hover:text-indigo-300 transition underline underline-offset-4"
                >
                  Create Citizen Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 text-center border-t border-slate-800/80 bg-[#070d1e]/80 text-[11px] text-slate-500">
        N-SHIELD AI Urban Safety Intelligence Platform • Nagpur Smart City & Municipal Corporation
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070d1e] flex items-center justify-center text-white">
          <div className="h-8 w-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

