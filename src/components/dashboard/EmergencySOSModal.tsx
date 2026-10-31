"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  Flame,
  Hospital,
  Phone,
  PhoneCall,
  PhoneForwarded,
  PhoneOff,
  Shield,
  ShieldAlert,
  Siren,
  Sparkles,
  Users,
  X,
} from "lucide-react";

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HelplineItem {
  name: string;
  number: string;
  rawNumber: string;
  icon: string;
  color: string;
  description: string;
  availability: string;
}

export function EmergencySOSModal({ isOpen, onClose }: EmergencySOSModalProps) {
  const [activeCallingItem, setActiveCallingItem] = useState<HelplineItem | null>(null);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const helplines: HelplineItem[] = [
    {
      name: "Nagpur Police & Unified Emergency",
      number: "112",
      rawNumber: "112",
      icon: "🚓",
      color: "bg-rose-600",
      description: "Immediate police response, distress calls, PCR vans, and unified emergency dispatch.",
      availability: "24/7 Toll-Free",
    },
    {
      name: "Emergency Ambulance & Trauma (108)",
      number: "108",
      rawNumber: "108",
      icon: "🚑",
      color: "bg-emerald-600",
      description: "Free 24/7 Maharashtra emergency medical ambulance & trauma dispatch.",
      availability: "24/7 Toll-Free",
    },
    {
      name: "Nagpur Fire & Rescue Service",
      number: "101",
      rawNumber: "101",
      icon: "🚒",
      color: "bg-amber-600",
      description: "Citywide fire control response covering all municipal sectors.",
      availability: "24/7 Toll-Free",
    },
    {
      name: "Damini Women Safety Squad",
      number: "1091",
      rawNumber: "1091",
      icon: "🛡️",
      color: "bg-purple-600",
      description: "Specialized Nagpur Police women protection & distress assistance unit.",
      availability: "24/7 Dedicated",
    },
    {
      name: "Nagpur Police Control Room (Landline)",
      number: "+91-712-2561245",
      rawNumber: "+917122561245",
      icon: "📞",
      color: "bg-blue-600",
      description: "Nagpur Police Commissionerate direct desk dispatch.",
      availability: "24/7 Direct Line",
    },
    {
      name: "Highway Patrol & Road Accident",
      number: "1033",
      rawNumber: "1033",
      icon: "🛣️",
      color: "bg-indigo-600",
      description: "National & state highway emergency patrol and medical support.",
      availability: "24/7 Toll-Free",
    },
  ];

  const handleInitiateCall = (item: HelplineItem) => {
    setActiveCallingItem(item);
    // Trigger mobile browser dialer
    try {
      window.location.href = `tel:${item.rawNumber}`;
    } catch (e) {
      console.warn("Could not launch tel: link directly", e);
    }
  };

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Active Dialing Feedback Screen */}
        {activeCallingItem ? (
          <div className="py-4 space-y-4 text-center animate-in zoom-in-95 duration-150">
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <PhoneCall className="h-10 w-10 text-rose-600 animate-bounce" />
            </div>

            <div>
              <span className="rounded-full bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 px-3 py-1 text-xs font-black text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                Connecting Call…
              </span>
              <h3 className="mt-2 text-xl font-black text-slate-900 dark:text-slate-50">
                {activeCallingItem.name}
              </h3>
              <p className="text-3xl font-mono font-black text-rose-600 dark:text-rose-400 mt-2 tracking-wider">
                {activeCallingItem.number}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Opening phone dialer. If your device doesn&apos;t automatically connect, dial directly or copy the number below.
              </p>
            </div>

            {/* Action Buttons: Redial & Copy */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <a
                href={`tel:${activeCallingItem.rawNumber}`}
                className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-rose-700 active:scale-95 transition"
              >
                <PhoneCall className="h-4 w-4" />
                <span>Launch Dialer Again</span>
              </a>

              <button
                type="button"
                onClick={() => handleCopyNumber(activeCallingItem.rawNumber)}
                className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition"
              >
                {copiedNumber === activeCallingItem.rawNumber ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-600">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-slate-500" />
                    <span>Copy {activeCallingItem.number}</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveCallingItem(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                ← Return to Emergency Helpline Directory
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600">
                  <Siren className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                    Emergency Helpline Directory
                  </h3>
                  <p className="text-xs text-slate-400">
                    Nagpur 24/7 Verified Emergency Dispatch
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Confirmation Banner */}
            <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3.5 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">
                <strong>Immediate Help:</strong> Tap <strong>[ Call ]</strong> to connect with dispatchers or tap <strong>[ 📋 Copy ]</strong> to copy the number to your phone keypad.
              </p>
            </div>

            {/* Helplines List with touch-friendly 48px targets */}
            <div className="space-y-2.5">
              {helplines.map((item) => (
                <div
                  key={item.number}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3.5 transition hover:bg-slate-100 dark:hover:bg-slate-800/70"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-2xl mt-0.5 shrink-0">{item.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {item.name}
                        </h4>
                        <span className="rounded bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 text-[9px] font-bold text-slate-600 dark:text-slate-300 shrink-0">
                          {item.availability}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-700/60">
                    {/* Copy Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyNumber(item.rawNumber)}
                      className="min-h-[44px] px-3 flex items-center justify-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition"
                      title={`Copy ${item.number}`}
                    >
                      {copiedNumber === item.rawNumber ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>

                    {/* Direct Call Trigger */}
                    <button
                      type="button"
                      onClick={() => handleInitiateCall(item)}
                      className="flex-1 sm:flex-initial min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-black text-white shadow-sm hover:bg-rose-700 active:scale-95 transition"
                    >
                      <PhoneCall className="h-4 w-4" />
                      <span>Call {item.number}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Close Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
              >
                Close Directory
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
