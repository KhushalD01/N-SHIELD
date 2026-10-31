"use client";

import React from "react";
import { ExternalLink, Phone, ShieldCheck, Siren } from "lucide-react";
import type { Helpline } from "@/lib/validation/assistantSchemas";

interface EmergencyHelplineCardProps {
  helpline: Helpline;
}

export function EmergencyHelplineCard({ helpline }: EmergencyHelplineCardProps) {
  const is112 = helpline.number === "112";

  return (
    <div
      className={`rounded-2xl border p-3 shadow-xs space-y-2 transition ${
        is112
          ? "border-rose-300 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/30"
          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-black text-xs ${
              is112
                ? "bg-rose-600 text-white"
                : "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
            }`}
          >
            {is112 ? <Siren className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {helpline.name}
            </h4>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="rounded bg-slate-100 dark:bg-slate-800 px-1 py-0.2 uppercase font-semibold">
                {helpline.scope}
              </span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-0.5">
                <ShieldCheck className="h-2.5 w-2.5" /> Verified Active
              </span>
            </div>
          </div>
        </div>

        <span className="text-sm font-black tracking-tight text-slate-900 dark:text-slate-50">
          {helpline.number}
        </span>
      </div>

      <p className="text-[11px] text-slate-600 dark:text-slate-300">
        {helpline.purpose}
      </p>

      <div className="flex items-center gap-2 pt-0.5">
        <a
          href={`tel:${helpline.number.replace(/[^0-9]/g, "")}`}
          className={`flex-1 min-h-[36px] inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold shadow-xs active:scale-95 transition ${
            is112
              ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          <Phone className="h-3.5 w-3.5" />
          <span>Call {helpline.number}</span>
        </a>

        {helpline.sourceUrl && (
          <a
            href={helpline.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[36px] inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="Official Source Verification"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
