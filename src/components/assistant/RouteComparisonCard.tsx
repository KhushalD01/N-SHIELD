"use client";

import React from "react";
import {
  AlertTriangle,
  Navigation,
  Shield,
} from "lucide-react";
import type { RouteOption } from "@/lib/validation/assistantSchemas";

interface RouteComparisonCardProps {
  routes: RouteOption[];
  onSelectRouteOnMap?: (route: RouteOption) => void;
}

export function RouteComparisonCard({ routes, onSelectRouteOnMap }: RouteComparisonCardProps) {
  if (!routes || routes.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Mandatory Safety Disclaimer Notice */}
      <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/30 p-3 text-[11px] leading-relaxed text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div>
          <span className="font-bold">Spatial Evidence Disclaimer:</span> This comparison is based on available police logs and data coverage. It does not guarantee safety. Conditions can change; follow official instructions and use your judgment.
        </div>
      </div>

      {/* Routes List */}
      <div className="space-y-2.5">
        {routes.map((route, idx) => {
          const isPrimary = idx === 0;
          const assessment = route.safetyAssessment;

          return (
            <div
              key={route.id}
              className={`rounded-2xl border p-3.5 space-y-2.5 transition ${
                isPrimary
                  ? "border-indigo-300 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        isPrimary ? "bg-indigo-600" : "bg-slate-400"
                      }`}
                    />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {route.name}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500">{route.via}</p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-black text-indigo-700 dark:text-indigo-400">
                    {route.formattedDuration}
                  </div>
                  <div className="text-[10px] text-slate-400">{route.formattedDistance}</div>
                </div>
              </div>

              {/* Safety Evidence Row */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 rounded-xl p-2 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1 font-semibold">
                  <Shield className="h-3 w-3 text-indigo-600" />
                  <span>Reported Exposure:</span>
                  <span className="capitalize font-bold text-slate-800 dark:text-slate-200">
                    {assessment.relativeRisk === "lower"
                      ? "Fewer Recorded Incidents"
                      : assessment.relativeRisk === "higher"
                      ? "Higher Recorded Density"
                      : "Moderate Exposure"}
                  </span>
                </div>

                <span>•</span>

                <div className="flex items-center gap-1">
                  <span>Evidence: {assessment.evidenceCount} records</span>
                </div>

                <span>•</span>

                <div className="flex items-center gap-1">
                  <span className="capitalize">Coverage: {assessment.coverage}</span>
                </div>
              </div>

              {/* Route Highlights */}
              {route.highlights && route.highlights.length > 0 && (
                <div className="space-y-1">
                  {route.highlights.map((h, hIdx) => (
                    <div
                      key={hIdx}
                      className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400"
                    >
                      <span className="text-emerald-500">✓</span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action */}
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    route.via + ", Nagpur"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-h-[36px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-xs font-bold active:scale-95 transition"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  <span>Start Navigation</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
