"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, KeyRound, Loader2, RefreshCw, Sparkles, X } from "lucide-react";
import type { TrustedContact } from "@/lib/emergency-circle/types";

interface OtpVerifyModalProps {
  contact: TrustedContact | null;
  isOpen: boolean;
  onClose: () => void;
  onVerified: (contactId: string) => void;
}

export function OtpVerifyModal({
  contact,
  isOpen,
  onClose,
  onVerified,
}: OtpVerifyModalProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);

  // Request OTP when modal opens
  useEffect(() => {
    if (isOpen && contact) {
      handleSendOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, contact?.id]);

  // Resend countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!isOpen || !contact) return null;

  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    setError(null);
    setDevOtp(null);

    try {
      const res = await fetch(`/api/emergency-circle/contacts/${contact.id}/otp`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to send verification code.");
        setIsSendingOtp(false);
        return;
      }

      setCountdown(60);
      if (data.devOtp) {
        setDevOtp(data.devOtp);
      }
    } catch (err: any) {
      setError("Network error while requesting verification code.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (code.trim().length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/emergency-circle/contacts/${contact.id}/otp`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Verification failed. Check the code and try again.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Contact verified and added to Emergency Circle!");
      setIsLoading(false);
      setTimeout(() => {
        onVerified(contact.id);
        onClose();
      }, 800);
    } catch (err: any) {
      setError("Network error during verification.");
      setIsLoading(false);
    }
  };

  const maskedPhone = contact.normalizedPhone.replace(/(\+\d{2})(\d{2})(\d{4})(\d{4})/, "$1 $2*** **$4");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700/80 bg-[#0b1329] p-6 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Phone Verification</h3>
              <p className="text-xs text-slate-400">Step 2 of 2: OTP Confirmation</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Verification Info */}
        <div className="mt-4 rounded-xl bg-slate-900/80 p-3.5 border border-slate-800 text-xs">
          <p className="text-slate-300">
            A 6-digit verification code has been dispatched to:
          </p>
          <div className="mt-1 flex items-center justify-between font-mono font-bold text-white text-sm">
            <span>{contact.name}</span>
            <span className="text-indigo-400">{maskedPhone}</span>
          </div>
        </div>

        {/* Development Test Mode Box */}
        {devOtp && (
          <div className="mt-3 rounded-xl border border-indigo-500/30 bg-indigo-950/40 p-3 text-xs text-indigo-300">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-indigo-200">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <span>Simulated SMS Code:</span>
              </span>
              <button
                type="button"
                onClick={() => setCode(devOtp)}
                className="rounded-lg bg-indigo-600/40 hover:bg-indigo-600 px-2 py-0.5 text-[11px] font-bold text-white transition"
              >
                Auto-fill {devOtp}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-indigo-400/80">
              SMS gateway running in test mode. Use code <strong className="text-white font-mono">{devOtp}</strong> to verify immediately.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Enter 6-Digit Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="• • • • • •"
              className="w-full text-center tracking-[0.5em] text-lg font-mono font-black rounded-xl border border-slate-700/80 bg-slate-900/90 py-3 text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Didn't receive code?</span>
            {countdown > 0 ? (
              <span className="text-slate-500 font-mono">Resend in {countdown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSendingOtp}
                className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition"
              >
                <RefreshCw className={`h-3 w-3 ${isSendingOtp ? "animate-spin" : ""}`} />
                <span>Resend Code</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Confirm & Activate</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

