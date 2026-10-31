"use client";

import React, { useEffect, useState, use } from "react";
import {
  AlertTriangle,
  Clock,
  Compass,
  ExternalLink,
  Loader2,
  MapPin,
  PhoneCall,
  Radio,
  RefreshCw,
  Shield,
  ShieldAlert,
} from "lucide-react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import type { PublicSharedLocationView } from "@/lib/emergency-circle/types";

export default function LiveShareRecipientPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);

  const [session, setSession] = useState<PublicSharedLocationView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const fetchSharedLocation = async () => {
    try {
      const res = await fetch(`/api/emergency-circle/public/${token}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Unable to load shared emergency location.");
        setIsLoading(false);
        return;
      }

      setSession(data.session);
      setLastRefreshedAt(new Date());
      setSecondsAgo(0);
      setIsLoading(false);
    } catch (err: any) {
      setError("Network error while connecting to N-SHIELD live tracker.");
      setIsLoading(false);
    }
  };

  // Initial fetch and 5-second polling interval
  useEffect(() => {
    fetchSharedLocation();
    const interval = setInterval(fetchSharedLocation, 5000);
    return () => clearInterval(interval);
  }, [token]);

  // Second ticker
  useEffect(() => {
    const ticker = setInterval(() => {
      setSecondsAgo((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(ticker);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070d1e] text-white flex flex-col items-center justify-center p-4">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
          <Radio className="h-8 w-8 animate-pulse text-indigo-400" />
        </div>
        <p className="mt-4 text-sm font-bold text-slate-200">
          Connecting to N-SHIELD Secure Live Location Feed...
        </p>
        <p className="mt-1 text-xs text-slate-400">Verifying session token</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-[#070d1e] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-lg font-black text-white">Emergency Link Unavailable</h1>
        <p className="mt-1.5 text-xs text-slate-400 max-w-md">
          {error || "This location sharing session has either expired or been terminated by the user."}
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <a
            href="tel:112"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 transition"
          >
            <PhoneCall className="h-4 w-4" />
            <span>Call 112 (Nagpur Emergency)</span>
          </a>
        </div>
      </div>
    );
  }

  const lat = session.currentLocation.latitude;
  const lng = session.currentLocation.longitude;
  const accuracy = session.currentLocation.accuracy || 15;
  const isLive = session.status === "active";

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Top Floating Alert Banner */}
      <header className="z-20 px-4 py-3 bg-[#070d1e]/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 text-white shadow-md">
            <Radio className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-[180px] sm:max-w-none">
                {session.userName}
              </h1>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                  isLive
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {isLive ? (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Live Tracking</span>
                  </>
                ) : (
                  <span>Sharing Concluded</span>
                )}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Shared via N-SHIELD AI Urban Safety Model
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`https://www.google.com/maps?q=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition"
          >
            <span>Google Maps</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href="tel:112"
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-black text-white hover:bg-rose-500 transition shadow-md shadow-rose-600/20"
          >
            <PhoneCall className="h-3.5 w-3.5" />
            <span>Call 112</span>
          </a>
        </div>
      </header>

      {/* Main Full-Screen Map Area */}
      <div className="flex-1 w-full relative">
        {apiKey ? (
          <APIProvider apiKey={apiKey}>
            <Map
              center={{ lat, lng }}
              zoom={16}
              mapId="nshield_recipient_view"
              disableDefaultUI={false}
              gestureHandling="greedy"
              className="w-full h-full min-h-[500px]"
            >
              <Marker
                position={{ lat, lng }}
                title={`${session.userName}'s Current Location`}
              />
            </Map>
          </APIProvider>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-950 text-center">
            <MapPin className="h-12 w-12 text-rose-500 animate-bounce" />
            <h3 className="mt-4 text-base font-bold text-white">
              {session.userName}'s Shared Position
            </h3>
            <p className="mt-1 font-mono text-sm text-indigo-300">
              {lat.toFixed(5)}°N, {lng.toFixed(5)}°E
            </p>
            <p className="text-xs text-slate-400 mt-1">Accuracy: ±{accuracy} meters</p>
          </div>
        )}

        {/* Floating Live Telemetry Badge */}
        <div className="absolute top-4 left-4 z-10 rounded-2xl border border-slate-800/80 bg-[#080e22]/90 backdrop-blur-md p-3.5 shadow-2xl text-xs space-y-2 max-w-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-400 text-[11px]">Last Position Refresh:</span>
            <span className="font-mono font-bold text-emerald-400 flex items-center gap-1 text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{secondsAgo}s ago</span>
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 text-[11px]">
            <span className="text-slate-400">GPS Coordinates:</span>
            <span className="font-mono font-semibold text-slate-200">
              {lat.toFixed(4)}°N, {lng.toFixed(4)}°E
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 text-[11px]">
            <span className="text-slate-400">Reported Accuracy:</span>
            <span className="font-mono text-slate-300">±{accuracy}m</span>
          </div>

          {session.isStale && (
            <div className="pt-2 border-t border-slate-800 text-[10px] text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3 shrink-0 text-amber-400" />
              <span>User's phone may be disconnected or in a low-signal area.</span>
            </div>
          )}
        </div>

        {/* Floating Call Emergency Advice Pill */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 w-[92%] max-w-md rounded-2xl border border-rose-500/40 bg-[#0c1226]/95 backdrop-blur-md p-3.5 shadow-2xl flex items-center justify-between gap-3 text-xs">
          <div className="min-w-0">
            <p className="font-bold text-white truncate">Believed to be in immediate danger?</p>
            <p className="text-[11px] text-slate-400 leading-tight">
              Contact Nagpur Emergency Police Control Room.
            </p>
          </div>
          <a
            href="tel:112"
            className="shrink-0 flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-black text-white shadow-md shadow-rose-600/30 transition"
          >
            <PhoneCall className="h-3.5 w-3.5" />
            <span>Call 112</span>
          </a>
        </div>
      </div>
    </div>
  );
}

