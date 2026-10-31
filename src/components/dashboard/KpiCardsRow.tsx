"use client";

import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { ShieldCheck, Users, EyeOff, CheckCircle2, TrendingUp, TrendingDown } from "lucide-react";

const SPARKLINE_DATA = [
  { val: 78 },
  { val: 81 },
  { val: 79 },
  { val: 84 },
  { val: 83 },
  { val: 87 },
  { val: 88.4 },
];

type KpiCardsRowProps = {
  activePatrols?: number;
  blindSpotsCount?: number;
  resolvedIncidentsCount?: number;
};

export function KpiCardsRow({
  activePatrols = 32,
  blindSpotsCount = 14,
  resolvedIncidentsCount = 24,
}: KpiCardsRowProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Overall City Safety Score */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition hover:shadow-md min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            City Safety Score
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between min-w-0">
          <div className="min-w-0">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">88.4</p>
            <div className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+3.2% vs last week</span>
            </div>
          </div>

          {/* Smooth Recharts Sparkline */}
          <div className="h-10 w-24 shrink-0 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SPARKLINE_DATA}>
                <defs>
                  <linearGradient id="safetyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="val"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#safetyGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 2. Active Patrol Units */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition hover:shadow-md min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active Patrol Units
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 min-w-0">
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            {activePatrols} Units
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>↑ 12% vs last week</span>
          </div>
        </div>
      </div>

      {/* 3. Critical CCTV Blind-Spots */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition hover:shadow-md min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Critical CCTV Blind-Spots
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
            <EyeOff className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 min-w-0">
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            {blindSpotsCount} Flagged
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingDown className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>↓ 8% risk reduction</span>
          </div>
        </div>
      </div>

      {/* 4. Live Incidents Handled */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition hover:shadow-md min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Incidents Handled
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 min-w-0">
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            {resolvedIncidentsCount} Resolved
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>94% SLA response compliance</span>
          </div>
        </div>
      </div>
    </div>
  );
}
