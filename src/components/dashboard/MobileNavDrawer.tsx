"use client";

import React from "react";
import Link from "next/link";
import {
  CalendarPlus,
  Camera,
  Compass,
  FileText,
  HelpCircle,
  Lightbulb,
  LogIn,
  LogOut,
  Map as MapIcon,
  Moon,
  Navigation,
  Newspaper,
  PhoneCall,
  PlusCircle,
  Radio,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
  User,
  Users,
  X,
} from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { QuickShareLocationButton } from "@/components/emergency-circle/QuickShareLocationButton";

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeId: string;
  onNavigate: (id: string) => void;
  nightSafetyMode: boolean;
  onToggleNightSafety: (val: boolean) => void;
  onOpenReportModal: () => void;
  onOpenSafeRouteModal: () => void;
  onOpenEmergencySOS: () => void;
}

export function MobileNavDrawer({
  isOpen,
  onClose,
  activeId,
  onNavigate,
  nightSafetyMode,
  onToggleNightSafety,
  onOpenReportModal,
  onOpenSafeRouteModal,
  onOpenEmergencySOS,
}: MobileNavDrawerProps) {
  const { user, isAuthenticated, logout } = useAuth();

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer Body */}
      <div
        id="mobile-nav-drawer"
        role="dialog"
        aria-label="Navigation Menu"
        aria-modal="true"
        className="relative w-4/5 max-w-xs flex-1 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl z-10 animate-in slide-in-from-left duration-200"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-slate-100">
                N-SHIELD
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">Nagpur Citizen Portal</p>
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

        {/* Quick SOS & Action Buttons */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2">
          {/* One-Tap Emergency Location Sharing */}
          <QuickShareLocationButton variant="mobile" />

          {/* Emergency Circle Management Link */}
          <Link
            href="/emergency-circle"
            onClick={onClose}
            className="w-full flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/20 p-2.5 text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition"
          >
            <span className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-rose-500" />
              <span>Emergency Circle & Contacts</span>
            </span>
            <span className="text-[10px] bg-rose-500/20 px-2 py-0.5 rounded font-mono font-bold">Manage</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenEmergencySOS();
            }}
            className="w-full flex items-center justify-between rounded-xl bg-rose-600 p-3 text-xs font-bold text-white shadow-md shadow-rose-200 dark:shadow-rose-950 active:scale-95 transition"
          >
            <span className="flex items-center gap-2">
              <Siren className="h-4 w-4" />
              <span>Emergency Help (SOS)</span>
            </span>
            <span className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-black">112</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSafeRouteModal();
            }}
            className="w-full flex items-center gap-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 p-2.5 text-xs font-bold text-indigo-700 dark:text-indigo-300"
          >
            <Navigation className="h-4 w-4 text-indigo-600" />
            <span>Find Safer Transit Route</span>
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1">
            Safety Modules
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Footer with User Account and Night Mode toggle */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-4 space-y-3">
          {/* User Account / Sign In */}
          {isAuthenticated && user ? (
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/80 p-3 space-y-2 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${
                    user.role === "officer"
                      ? "bg-amber-600"
                      : user.role === "admin"
                      ? "bg-purple-600"
                      : "bg-indigo-600"
                  }`}
                >
                  {user.role === "officer" ? "🛡️" : user.name?.charAt(0) || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                    {user.role === "officer"
                      ? "Safety Officer"
                      : user.role === "admin"
                      ? "System Admin"
                      : "Verified Citizen"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  onClose();
                  await logout();
                }}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In to N-SHIELD</span>
            </Link>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Moon className="h-4 w-4 text-indigo-500" />
              <span>Night Safety Mode</span>
            </span>
            <input
              type="checkbox"
              checked={nightSafetyMode}
              onChange={(e) => onToggleNightSafety(e.target.checked)}
              className="h-4 w-4 accent-indigo-600 cursor-pointer"
            />
          </div>
          <p className="text-[10px] text-slate-400">
            N-SHIELD AI · Safe City Nagpur 2030
          </p>
        </div>
      </div>
    </div>
  );
}
