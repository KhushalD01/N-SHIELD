import React from "react";
import Link from "next/link";
import { ArrowLeft, Radio, Shield } from "lucide-react";
import { EmergencyCircleView } from "@/components/emergency-circle/EmergencyCircleView";

export const metadata = {
  title: "Emergency Circle — N-SHIELD Urban Safety Intelligence",
  description: "One-Tap Live Emergency Location Sharing with trusted family and contacts in Nagpur.",
};

export default function EmergencyCirclePage() {
  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col justify-between selection:bg-rose-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-slate-800/80 bg-[#070d1e]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              <span>N-SHIELD Emergency Circle</span>
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-medium hidden sm:block">
          Nagpur Smart City Safety Protocol
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-6 px-3 sm:px-6">
        <EmergencyCircleView />
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center border-t border-slate-800/80 bg-[#070d1e]/80 text-[11px] text-slate-500">
        N-SHIELD AI Urban Safety Intelligence Platform • Emergency Location Sharing & Civic Protection
      </footer>
    </div>
  );
}

