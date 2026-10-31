"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  ChevronDown,
  LogIn,
  LogOut,
  Menu,
  PhoneCall,
  Radio,
  Search,
  Shield,
  ShieldCheck,
  Siren,
  Sparkles,
  User,
} from "lucide-react";
import { NotificationDropdown } from "./NotificationDropdown";
import { GlobalSearchBar } from "./GlobalSearchBar";
import { QuickShareLocationButton } from "@/components/emergency-circle/QuickShareLocationButton";
import { useAuth } from "@/context/AuthContext";
import type { EssentialService } from "@/lib/nearbyServicesData";
import type { UserLocation } from "@/lib/geoUtils";
import type { Zone } from "@/lib/types";
import type { RealNewsArticle } from "@/lib/newsTypes";

interface HeaderProps {
  onOpenMobileNav?: () => void;
  onOpenEmergencySOS?: () => void;
  onOpenAssistant?: () => void;
  onSelectZone?: (zoneId: string, lat?: number, lng?: number) => void;
  userLocation: UserLocation;
  zones?: Zone[];
  services?: EssentialService[];
  newsArticles?: RealNewsArticle[];
  onSelectService?: (service: EssentialService) => void;
  onSelectNewsArticle?: (article: RealNewsArticle) => void;
}

export function Header({
  onOpenMobileNav,
  onOpenEmergencySOS,
  onOpenAssistant,
  onSelectZone,
  userLocation,
  zones = [],
  services = [],
  newsArticles = [],
  onSelectService,
  onSelectNewsArticle,
}: HeaderProps) {
  const [time, setTime] = useState<string>("--:--:--");
  const [date, setDate] = useState<string>("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen]);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
      setDate(
        now.toLocaleDateString("en-IN", {
          weekday: "short",
          day: "2-digit",
          month: "short",
        })
      );
    };

    updateClock();
    const interval = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <header className="relative z-30 flex h-14 sm:h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 dark:bg-slate-900/95 px-3 sm:px-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] backdrop-blur-md">
      
      {/* Left: Mobile Hamburger + Brand Logo */}
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1 max-w-xl">
        {/* Mobile Hamburger Menu Button (44px target) */}
        {onOpenMobileNav && (
          <button
            type="button"
            onClick={onOpenMobileNav}
            aria-label="Open Mobile Menu"
            aria-controls="mobile-nav-drawer"
            className="flex lg:hidden min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 shrink-0"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-indigo-600 shadow-md shadow-indigo-200 ring-2 ring-indigo-100 dark:ring-indigo-900 text-white">
            <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-50 tracking-tight leading-none">
                N-SHIELD
              </h1>
              <span className="rounded-md bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Nagpur
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden 2xl:block truncate">
              AI-Powered Urban Safety Intelligence
            </p>
          </div>
        </div>

        {/* Desktop Interactive Search Bar */}
        <div className="hidden lg:block flex-1 min-w-[180px] max-w-xs xl:max-w-sm 2xl:max-w-md">
          <GlobalSearchBar
            userLocation={userLocation}
            zones={zones}
            services={services}
            newsArticles={newsArticles}
            onSelectZone={(zoneId, lat, lng) => {
              if (onSelectZone) onSelectZone(zoneId, lat, lng);
            }}
            onSelectService={(service) => {
              if (onSelectService) onSelectService(service);
            }}
            onSelectNewsArticle={(article) => {
              if (onSelectNewsArticle) onSelectNewsArticle(article);
            }}
          />
        </div>
      </div>

      {/* Right: Actions, SOS, Status, & Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        
        {/* AI Safety Assistant Launcher Button */}
        {onOpenAssistant && (
          <button
            type="button"
            onClick={onOpenAssistant}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 shadow-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/60 active:scale-95 transition"
            title="Open AI Safety Assistant"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden md:inline">AI Safety Assistant</span>
            <span className="md:hidden">AI Assistant</span>
          </button>
        )}

        {/* One-Tap Emergency Location Sharing Shortcut */}
        <QuickShareLocationButton variant="header" />

        {/* Emergency Circle Management Link */}
        <Link
          href="/emergency-circle"
          className="hidden lg:flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 sm:py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          title="Manage Emergency Circle & Trusted Contacts"
        >
          <Radio className="h-3.5 w-3.5 text-rose-500" />
          <span>Circle</span>
        </Link>

        {/* Emergency SOS Button (Mobile & Desktop) */}
        {onOpenEmergencySOS && (
          <button
            type="button"
            onClick={onOpenEmergencySOS}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 sm:py-2 text-xs font-black text-white shadow-xs hover:bg-rose-700 active:scale-95 transition"
            title="Emergency Services"
          >
            <Siren className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Emergency</span>
            <span>SOS</span>
          </button>
        )}

        {/* Live Status Badge */}
        <div className="hidden 2xl:flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live Protection Active
        </div>

        {/* Live Time */}
        <div className="hidden 2xl:block text-right">
          <p className="font-mono text-xs font-semibold tabular-nums text-slate-800 dark:text-slate-200">
            {time} IST
          </p>
          <p className="text-[10px] font-medium text-slate-400">{date}</p>
        </div>

        {/* Notification Bell Button (Interactive) */}
        <button
          type="button"
          onClick={() => setNotificationsOpen((prev) => !prev)}
          aria-label="Open Safety Notifications"
          className={`relative min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border transition-all active:scale-95 shadow-xs ${
            notificationsOpen
              ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          }`}
          title="Safety Notifications & Broadcasts"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-600 ring-2 ring-white dark:ring-slate-900" />
            </span>
          )}
        </button>

        {/* User Authentication & Profile Menu */}
        <div ref={userMenuRef} className="relative hidden sm:flex items-center border-l border-slate-200 dark:border-slate-800 pl-3">
          {authLoading ? (
            <div className="flex items-center gap-2 animate-pulse">
              <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-700" />
              <div className="hidden xl:block space-y-1">
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-2 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            </div>
          ) : isAuthenticated && user ? (
            <>
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold text-white shadow-xs ${
                    user.role === "officer"
                      ? "bg-gradient-to-br from-amber-500 to-amber-700 ring-2 ring-amber-400/40"
                      : user.role === "admin"
                      ? "bg-gradient-to-br from-purple-600 to-indigo-700 ring-2 ring-purple-400/40"
                      : "bg-gradient-to-br from-indigo-600 to-blue-700 ring-2 ring-indigo-400/30"
                  }`}
                >
                  {user.role === "officer"
                    ? "🛡️"
                    : user.name
                    ? user.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : "C"}
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight truncate max-w-[120px]">
                    {user.name || "Citizen"}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 capitalize">
                    {user.role === "officer"
                      ? "Safety Officer"
                      : user.role === "admin"
                      ? "Admin"
                      : "Verified Citizen"}
                  </p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden xl:block" />
              </button>

              {/* Profile Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-100">
                  {/* User Header */}
                  <div className="flex items-start gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-xs ${
                        user.role === "officer"
                          ? "bg-amber-600"
                          : user.role === "admin"
                          ? "bg-purple-600"
                          : "bg-indigo-600"
                      }`}
                    >
                      {user.role === "officer" ? "🛡️" : <User className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                            user.role === "officer"
                              ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                              : user.role === "admin"
                              ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                              : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                          }`}
                        >
                          {user.role === "officer"
                            ? "Officer #NGP"
                            : user.role === "admin"
                            ? "System Admin"
                            : "Citizen Verified"}
                        </span>
                        {user.locality && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            · {user.locality}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Account Information & Security Status */}
                  <div className="py-2.5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center justify-between text-[11px] px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Session Active
                      </span>
                      <span className="text-[10px] font-mono font-bold">JWT HMAC-256</span>
                    </div>

                    <div className="px-2 py-1 text-[11px] text-slate-500 dark:text-slate-400">
                      Emergency status: <span className="font-semibold text-slate-700 dark:text-slate-200">Nagpur 112 Integrated</span>
                    </div>
                  </div>

                  {/* Sign Out Action */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={async () => {
                        setUserMenuOpen(false);
                        await logout();
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition active:scale-98"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out from N-SHIELD</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-95 transition"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>

      {/* Notification Dropdown / Panel */}
      <NotificationDropdown
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onSelectZone={(zoneId) => {
          if (onSelectZone) onSelectZone(zoneId);
        }}
      />
    </header>
  );
}
