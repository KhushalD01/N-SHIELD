"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ShieldAlert, ShieldCheck, Siren } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email address with N-SHIELD...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing verification token.");
      return;
    }

    async function verify() {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token!)}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setStatus("success");
          setMessage("Your email has been verified. You now have full access to safety intelligence broadcasts.");
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed or token has expired.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Unable to complete verification due to a network error.");
      }
    }

    verify();
  }, [token]);

  return (
    <div className="min-h-screen w-full bg-[#070d1e] text-slate-100 flex flex-col justify-between relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

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
        <div className="rounded-2xl sm:rounded-3xl bg-[#0b142c]/95 border border-slate-800/90 shadow-2xl backdrop-blur-xl p-6 sm:p-8 text-center space-y-4">
          {status === "loading" && (
            <div className="py-8 flex flex-col items-center gap-3">
              <div className="h-10 w-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-xs text-slate-400">{message}</p>
            </div>
          )}

          {status === "success" && (
            <div className="py-4 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-black text-white">Email Verified</h2>
              <p className="text-xs text-slate-300 leading-relaxed">{message}</p>
              <Link
                href="/"
                className="inline-flex w-full mt-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition items-center justify-center"
              >
                Go to Safety Command Center
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="py-4 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-400">
                <ShieldAlert className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-black text-white">Verification Failed</h2>
              <p className="text-xs text-rose-300 leading-relaxed">{message}</p>
              <Link
                href="/login"
                className="inline-flex w-full mt-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition items-center justify-center"
              >
                Return to Sign In
              </Link>
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-10 px-6 py-4 text-center border-t border-slate-800/80 bg-[#070d1e]/80 text-[11px] text-slate-500">
        N-SHIELD AI Urban Safety Intelligence Platform • Nagpur Smart City & Municipal Corporation
      </footer>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070d1e] flex items-center justify-center text-white">
          <div className="h-8 w-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

