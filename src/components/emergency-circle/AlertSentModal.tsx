"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  MapPin,
  Radio,
  Share2,
  ShieldAlert,
  StopCircle,
  X,
} from "lucide-react";
import type { EmergencySharingSession } from "@/lib/emergency-circle/types";

interface AlertSentModalProps {
  session: EmergencySharingSession | null;
  isOpen: boolean;
  onClose: () => void;
  onViewSession: () => void;
  onStopSharing: () => void;
}

export function AlertSentModal({
  session,
  isOpen,
  onClose,
  onViewSession,
  onStopSharing,
}: AlertSentModalProps) {
  const [copied, setCopied] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  if (!isOpen || !session) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(session.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStop = async () => {
    setIsStopping(true);
    await onStopSharing();
    setIsStopping(false);
    onClose();
  };

  const successfulContacts = session.contactsNotified.filter(
    (c) => c.status === "sent" || c.status === "delivered"
  );
  const failedContacts = session.contactsNotified.filter((c) => c.status === "failed");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700/80 bg-[#080e22] p-6 shadow-2xl text-slate-100">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Big Alert Icon */}
        <div className="flex flex-col items-center text-center pt-2 pb-4">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
            <Radio className="h-8 w-8 animate-pulse text-emerald-400" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500" />
            </span>
          </div>
          <h2 className="mt-3 text-lg font-black text-white">Emergency Alert Sent</h2>
          <p className="mt-1 text-xs text-slate-400 max-w-sm">
            Your live GPS location is now actively being broadcast to your verified Emergency Circle contacts.
          </p>
        </div>

        {/* Live Tracking Status Bar */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Tracking Status:</span>
            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Active GPS Live Feed</span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Initial Coordinates:</span>
            <span className="font-mono text-slate-300 font-semibold">
              {session.currentLocation.latitude.toFixed(4)}°N, {session.currentLocation.longitude.toFixed(4)}°E (±{session.currentLocation.accuracy || 15}m)
            </span>
          </div>

          {/* Secure Link Copy Box */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400">Secure Recipient Link:</span>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={session.shareUrl}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 font-mono text-[11px] text-indigo-300 truncate select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 px-2.5 py-1.5 text-[11px] font-bold text-white transition flex items-center gap-1"
              >
                {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Contacts Notification Status List */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
            <span>Contact Dispatch Status</span>
            <span className="text-slate-400 text-[11px]">
              {successfulContacts.length}/{session.contactsNotified.length} Dispatched
            </span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {session.contactsNotified.map((c) => (
              <div
                key={c.contactId}
                className="flex items-center justify-between rounded-xl bg-slate-900/60 border border-slate-800/80 px-3 py-2 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-white truncate">{c.contactName}</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{c.phone}</p>
                </div>

                <div className="shrink-0 flex items-center gap-1.5">
                  {c.status === "sent" || c.status === "delivered" ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{c.channel === "mock_sms" ? "Dispatched (Test)" : "Sent via SMS"}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-rose-950/60 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold text-rose-400">
                      <span>Failed</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={onViewSession}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 py-2.5 px-4 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View Live Sharing Dashboard</span>
          </button>

          <button
            type="button"
            onClick={handleStop}
            disabled={isStopping}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-950/30 hover:bg-rose-900/40 py-2.5 px-4 text-xs font-bold text-rose-300 transition"
          >
            {isStopping ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <StopCircle className="h-4 w-4" />
            )}
            <span>Stop Sharing</span>
          </button>
        </div>
      </div>
    </div>
  );
}

