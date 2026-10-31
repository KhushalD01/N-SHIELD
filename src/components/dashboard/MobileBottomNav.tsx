"use client";

import React from "react";
import {
  Compass,
  Home,
  MapPin,
  Map as MapIcon,
  Navigation,
  PlusCircle,
  Shield,
  ShieldAlert,
  Siren,
} from "lucide-react";

interface MobileBottomNavProps {
  activeNav: string;
  onNavigate: (id: string) => void;
  onOpenReportModal: () => void;
  onOpenSafeRouteModal: () => void;
  onOpenEmergencySOS: () => void;
}

export function MobileBottomNav({
  activeNav,
  onNavigate,
  onOpenReportModal,
  onOpenSafeRouteModal,
  onOpenEmergencySOS,
}: MobileBottomNavProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 block lg:hidden border-t border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl safe-area-pb">
      <nav className="flex items-center justify-around px-2 py-1.5">
        
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => {
            onNavigate("live-map");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex min-h-[48px] min-w-[54px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-[10px] font-bold transition-all ${
            activeNav === "live-map"
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          <Home className="h-5 w-5" />
          <span>Home</span>
        </button>

        {/* 2. Map */}
        <button
          type="button"
          onClick={() => {
            onNavigate("live-map");
            const mapEl = document.getElementById("safety-map-section");
            if (mapEl) {
              mapEl.scrollIntoView({ behavior: "smooth", block: "center" });
            } else {
              window.scrollTo({ top: 120, behavior: "smooth" });
            }
          }}
          className={`flex min-h-[48px] min-w-[54px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-[10px] font-bold transition-all ${
            activeNav === "live-map"
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          <MapIcon className="h-5 w-5" />
          <span>Map</span>
        </button>

        {/* 3. Safe Route */}
        <button
          type="button"
          onClick={onOpenSafeRouteModal}
          className="flex min-h-[48px] min-w-[54px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400"
        >
          <Navigation className="h-5 w-5 text-indigo-500" />
          <span>Safe Route</span>
        </button>

        {/* 4. Report Incident */}
        <button
          type="button"
          onClick={onOpenReportModal}
          className="flex min-h-[48px] min-w-[54px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400"
        >
          <PlusCircle className="h-5 w-5 text-amber-500" />
          <span>Report</span>
        </button>

        {/* 5. Emergency SOS Speed Dial */}
        <button
          type="button"
          onClick={onOpenEmergencySOS}
          className="flex min-h-[48px] min-w-[54px] flex-col items-center justify-center gap-1 rounded-xl px-2.5 py-1 text-[10px] font-black text-rose-600 dark:text-rose-400 animate-pulse"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white shadow-md shadow-rose-300 dark:shadow-rose-950">
            <Siren className="h-3.5 w-3.5" />
          </div>
          <span>SOS 112</span>
        </button>
      </nav>
    </div>
  );
}
