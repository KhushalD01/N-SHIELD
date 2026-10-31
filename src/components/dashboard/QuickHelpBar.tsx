"use client";

import React from "react";
import {
  AlertCircle,
  PhoneCall,
} from "lucide-react";
import type { ServiceCategory } from "@/lib/nearbyServicesData";

interface QuickHelpBarProps {
  onQuickCategoryClick: (category: ServiceCategory) => void;
  onCallEmergency112: () => void;
  onOpenDirectory?: () => void;
  onOpenSafeRoute?: () => void;
}

export function QuickHelpBar({
  onQuickCategoryClick,
  onCallEmergency112,
  onOpenDirectory,
  onOpenSafeRoute,
}: QuickHelpBarProps) {
  const quickItems: {
    category: ServiceCategory;
    title: string;
    actionText: string;
    icon: string;
    bgHover: string;
    borderColor: string;
  }[] = [
    {
      category: "police",
      title: "🚓 Police",
      actionText: "Find nearest",
      icon: "🚓",
      bgHover: "hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/40",
      borderColor: "border-blue-200/80 dark:border-blue-900/60",
    },
    {
      category: "hospital",
      title: "🏥 Hospital",
      actionText: "Find nearest",
      icon: "🏥",
      bgHover: "hover:border-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/40",
      borderColor: "border-rose-200/80 dark:border-rose-900/60",
    },
    {
      category: "pharmacy",
      title: "💊 Pharmacy",
      actionText: "Find nearest",
      icon: "💊",
      bgHover: "hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40",
      borderColor: "border-emerald-200/80 dark:border-emerald-900/60",
    },
    {
      category: "ambulance",
      title: "🚑 Emergency",
      actionText: "Get help",
      icon: "🚑",
      bgHover: "hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/40",
      borderColor: "border-amber-200/80 dark:border-amber-900/60",
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-2.5 shadow-xs backdrop-blur-md">
      
      {/* Title */}
      <div className="flex items-center justify-between sm:justify-start gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500 text-white animate-pulse">
            <AlertCircle className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Need Help?
          </span>
        </div>

        {/* Mobile-only compact 112 button */}
        <button
          type="button"
          onClick={onCallEmergency112}
          className="flex sm:hidden items-center gap-1 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-black text-white shadow-xs active:scale-95 transition"
        >
          <PhoneCall className="h-3.5 w-3.5" />
          <span>SOS 112</span>
        </button>
      </div>

      {/* Quick Action Buttons Grid (2-column on mobile, flex on desktop) */}
      <div className="grid grid-cols-2 sm:flex sm:flex-1 sm:flex-wrap items-center gap-2 min-w-0">
        {quickItems.map((item) => (
          <button
            key={item.category}
            type="button"
            onClick={() => onQuickCategoryClick(item.category)}
            className={`group flex min-h-[44px] flex-1 sm:min-w-[120px] items-center justify-between gap-1.5 rounded-xl border bg-white dark:bg-slate-800/80 px-3 py-2 text-left transition-all ${item.borderColor} ${item.bgHover} shadow-2xs hover:shadow-xs active:scale-98`}
          >
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {item.title}
              </div>
              <div className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                {item.actionText} →
              </div>
            </div>
          </button>
        ))}

        {onOpenDirectory && (
          <button
            type="button"
            onClick={onOpenDirectory}
            className="col-span-2 sm:col-auto flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 shadow-2xs hover:bg-indigo-100 dark:hover:bg-indigo-900/60 active:scale-95 transition shrink-0"
            title="Open Complete Nagpur Emergency Directory & PDF Dossier"
          >
            <span>📋 Emergency Directory</span>
          </button>
        )}

        {onOpenSafeRoute && (
          <button
            type="button"
            onClick={onOpenSafeRoute}
            className="col-span-2 sm:col-auto flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 shadow-2xs hover:bg-emerald-100 dark:hover:bg-emerald-900/60 active:scale-95 transition shrink-0"
            title="Open Dynamic Safe Route Reconstruction Planner"
          >
            <span>🗺️ Safe Route</span>
          </button>
        )}

        {/* Desktop-only 112 Speed Dial button */}
        <button
          type="button"
          onClick={onCallEmergency112}
          className="hidden sm:flex min-h-[44px] items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-black text-white shadow-xs transition hover:bg-rose-700 active:scale-95 shrink-0"
          title="Dial National Emergency 112"
        >
          <PhoneCall className="h-3.5 w-3.5" />
          <span>SOS: 112</span>
        </button>
      </div>
    </div>
  );
}
