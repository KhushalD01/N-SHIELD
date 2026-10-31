"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mail,
  ShieldCheck,
  Siren,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [debugLink, setDebugLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setDebugLink(null);

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Unable to send reset instructions.");
        setIsLoading(false);
        return;
      }

      setSubmitted(true);
      if (data.debugResetLink) {
        setDebugLink(data.debugResetLink);
      }
    } catch (err: any) {
      setErrorMessage("Network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070d1e] text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />

      {/* Header Bar */}
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

        <a
          href="tel:112"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition shadow-xs"
        >
          <Siren className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
          <span>Emergency 112</span>
        </a>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-md w-full mx-auto px-4 sm:px-6 py-12 flex flex-col justify-center">
        <div className="rounded-2xl sm:rounded-3xl bg-[#0b142c]/95 border border-slate-800/90 shadow-2xl backdrop-blur-xl p-6 sm:p-8">
          <div className="mb-6">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition mb-3"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Sign In</span>
            </Link>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Reset Your Password
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Enter your registered email address and we&apos;ll send you instructions to securely reset your password.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          {submitted ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Instructions Dispatched</p>
                  <p className="text-slate-300 leading-relaxed">
                    If an account with <span className="font-semibold text-white">{email}</span> exists in our system, password reset instructions have been dispatched.
                  </p>
                </div>
              </div>

              {debugLink && (
                <div className="p-3 rounded-xl bg-indigo-950/80 border border-indigo-600/60 text-xs text-indigo-200 space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>⚡ Development Quick Reset Link:</span>
                  </div>
                  <a
                    href={debugLink}
                    className="inline-flex items-center gap-1 text-xs font-bold text-cyan-300 hover:text-cyan-200 underline break-all"
                  >
                    Click to proceed to Reset Password page &rarr;
                  </a>
                </div>
              )}

              <Link
                href="/login"
                className="w-full mt-4 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center justify-center gap-2"
              >
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="forgot-email"
                  className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@nshield.nagpur.gov.in"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="relative z-10 px-6 py-4 text-center border-t border-slate-800/80 bg-[#070d1e]/80 text-[11px] text-slate-500">
        N-SHIELD AI Urban Safety Intelligence Platform • Nagpur Smart City & Municipal Corporation
      </footer>
    </div>
  );
}

