"use client";

import { Moon, ShieldAlert } from "lucide-react";

type NightSafetyToggleProps = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
};

export function NightSafetyToggle({ enabled, onChange }: NightSafetyToggleProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-3.5 py-2 backdrop-blur-md transition-all duration-300 shadow-md ${
        enabled
          ? "border-rose-200 bg-rose-50/95"
          : "border-slate-200 bg-white/95"
      }`}
    >
      <div className={`flex items-center justify-center ${enabled ? "text-rose-600" : "text-blue-600"}`}>
        {enabled ? (
          <ShieldAlert className="h-4 w-4 animate-pulse" />
        ) : (
          <Moon className="h-4 w-4 text-blue-600" />
        )}
      </div>

      <span
        className={`text-xs font-black uppercase tracking-wider whitespace-nowrap ${
          enabled ? "text-rose-900" : "text-slate-900"
        }`}
      >
        Night Safety Mode
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="Toggle Night Safety Mode"
        onClick={() => onChange(!enabled)}
        className={`relative h-5 w-10 shrink-0 rounded-full transition-colors duration-300 cursor-pointer ${
          enabled ? "bg-rose-500" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
            enabled ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
