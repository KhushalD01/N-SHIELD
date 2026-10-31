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
  ShieldCheck,
  Siren,
} from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isLengthValid = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!token) {
      setErrorMessage("Missing or invalid password reset token. Please request a new link.");
      return;
    }

    if (!isLengthValid || !hasLetter || !hasNumber) {
      setErrorMessage("Password must be at least 8 characters long and contain both letters and numbers.");
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to reset password.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Your password has been successfully reset! Redirecting to sign in...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      setErrorMessage("Network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070d1e] text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-600/15 blur-[120px] pointer-events-none" />

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
            <h2 className="text-2xl font-black text-white tracking-tight">
              Create New Password
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Set a strong, new password for your N-SHIELD account.
            </p>
          </div>

          {!token && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Missing Reset Token</p>
                <p className="text-slate-300 mt-0.5">
                  This reset link is missing a valid token. Please{" "}
                  <Link href="/forgot-password" className="text-indigo-400 underline font-bold">
                    request a new reset link
                  </Link>
                  .
                </p>
              </div>
            </div>
          )}

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
            <div>
              <label
                htmlFor="new-password"
                className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={!token || Boolean(successMessage)}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50"
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

            <div>
              <label
                htmlFor="confirm-new-password"
                className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                <input
                  id="confirm-new-password"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={!token || Boolean(successMessage)}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50"
                />
              </div>
            </div>

            {/* Checklist */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] space-y-1.5">
              <div className={`flex items-center gap-1.5 ${isLengthValid ? "text-emerald-400" : "text-slate-500"}`}>
                <CheckCircle2 className="h-3 w-3 shrink-0" />
                <span>At least 8 characters long</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasLetter && hasNumber ? "text-emerald-400" : "text-slate-500"}`}>
                <CheckCircle2 className="h-3 w-3 shrink-0" />
                <span>Letters and numbers included</span>
              </div>
              {confirmPassword && (
                <div className={`flex items-center gap-1.5 ${passwordsMatch ? "text-emerald-400" : "text-rose-400"}`}>
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                  <span>{passwordsMatch ? "Passwords match" : "Passwords do not match"}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !token || Boolean(successMessage)}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel and return to Sign In
            </Link>
          </div>
        </div>
      </main>

      <footer className="relative z-10 px-6 py-4 text-center border-t border-slate-800/80 bg-[#070d1e]/80 text-[11px] text-slate-500">
        N-SHIELD AI Urban Safety Intelligence Platform • Nagpur Smart City & Municipal Corporation
      </footer>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070d1e] flex items-center justify-center text-white">
          <div className="h-8 w-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

