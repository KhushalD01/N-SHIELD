"use client";

import React from "react";
import { Shield } from "lucide-react";
import type { IncidentEvidenceItem } from "@/lib/validation/assistantSchemas";

interface IncidentEvidenceCardProps {
  incidents: IncidentEvidenceItem[];
}

export function IncidentEvidenceCard({ incidents }: IncidentEvidenceCardProps) {
  if (!incidents || incidents.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
        <Shield className="h-3.5 w-3.5 text-indigo-600" />
        <span>Corridor Incident Evidence Records ({incidents.length})</span>
      </div>

      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
        {incidents.map((inc) => {
          const isCritical = inc.severity === "critical" || inc.severity === "high";

          return (
            <div
              key={inc.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-2.5 text-xs space-y-1"
            >
              <div className="flex items-center justify-between text-[10px]">
                <span
                  className={`font-black uppercase tracking-wider rounded px-1.5 py-0.5 ${
                    isCritical
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                  }`}
                >
                  {inc.category}
                </span>

                <span className="text-slate-400">
                  {new Date(inc.reportedAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              {inc.description && (
                <p className="text-[11px] font-medium text-slate-700 dark:text-slate-200">
                  {inc.description}
                </p>
              )}

              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="truncate">{inc.location.name}</span>
                {inc.distanceFromRouteMeters !== undefined && (
                  <span>{inc.distanceFromRouteMeters}m from route</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
