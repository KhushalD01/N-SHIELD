"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface AssistantLauncherProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function AssistantLauncher({ isOpen, onToggle }: AssistantLauncherProps) {
  if (isOpen) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button
        type="button"
        onClick={onToggle}
        aria-label="Open AI Safety Assistant"
        className="group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white p-3 sm:px-4 sm:py-3 shadow-xl shadow-indigo-500/30 ring-4 ring-indigo-100 dark:ring-indigo-950/60 hover:scale-105 active:scale-95 transition-all duration-200"
      >
        {/* Glowing Pulse Ring */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900" />
        </span>

        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white">
          <Sparkles className="h-4 w-4 animate-spin-slow" />
        </div>

        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-black tracking-tight leading-none">
            AI Safety Assistant
          </span>
          <span className="text-[10px] text-indigo-200 font-medium leading-tight">
            Ask Emergency & Services
          </span>
        </div>
      </button>
    </div>
  );
}
