"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  AlertTriangle,
  Clock,
  Compass,
  Copy,
  ExternalLink,
  Layers,
  Loader2,
  MapPin,
  PlusCircle,
  Radio,
  RefreshCw,
  ShieldAlert,
  StopCircle,
  Users,
} from "lucide-react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import type { EmergencySharingSession, LocationCoordinate } from "@/lib/emergency-circle/types";

interface LiveSharingSessionViewProps {
  session: EmergencySharingSession;
  onSessionUpdated: (updated: EmergencySharingSession) => void;
  onSessionStopped: () => void;
}

export function LiveSharingSessionView({
  session,
  onSessionUpdated,
  onSessionStopped,
}: LiveSharingSessionViewProps) {
  const [timeLeft, setTimeLeft] = useState<string>("--:--");
  const [isExtending, setIsExtending] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [isWatchingLocation, setIsWatchingLocation] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  // 1. Session Expiry Countdown & Stale Check
  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const expiry = new Date(session.expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft("00:00 (Expired)");
        onSessionStopped();
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);

      // Check for stale coordinates (> 60s)
      const lastUpdate = new Date(session.lastUpdatedAt).getTime();
      setIsStale(now - lastUpdate > 60000);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [session, onSessionStopped]);

  // 2. Active Browser Geolocation Watcher
  useEffect(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) return;
    if (session.status !== "active") return;

    setIsWatchingLocation(true);

    const successHandler = async (pos: GeolocationPosition) => {
      const newCoord: LocationCoordinate = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        speed: pos.coords.speed,
        heading: pos.coords.heading,
        timestamp: new Date().toISOString(),
      };

      try {
        const res = await fetch("/api/emergency-circle/session/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: session.id,
            location: newCoord,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.session) {
            onSessionUpdated(data.session);
          }
        }
      } catch (err) {
        console.error("Failed to post location update:", err);
      }
    };

    const errorHandler = (err: GeolocationPositionError) => {
      console.warn("Geolocation watch error:", err.message);
    };

    const id = navigator.geolocation.watchPosition(successHandler, errorHandler, {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 15000,
    });

    watchIdRef.current = id;

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [session.id, session.status, onSessionUpdated]);

  const handleExtend = async (minutes: number) => {
    setIsExtending(true);
    try {
      const res = await fetch("/api/emergency-circle/session/extend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          additionalMinutes: minutes,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.session) onSessionUpdated(data.session);
      }
    } finally {
      setIsExtending(false);
    }
  };

  const handleStop = async () => {
    setIsStopping(true);
    try {
      const res = await fetch("/api/emergency-circle/session/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id }),
      });
      if (res.ok) {
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
        }
        onSessionStopped();
      }
    } finally {
      setIsStopping(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(session.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentLat = session.currentLocation.latitude;
  const currentLng = session.currentLocation.longitude;
  const currentAccuracy = session.currentLocation.accuracy || 15;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Active Session Ribbon */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/80 via-[#0a1824] to-[#0a1329] p-5 shadow-xl text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <Radio className="h-6 w-6 animate-pulse text-emerald-400" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400">
                  Live Emergency Session Active
                </h3>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                  {isWatchingLocation ? "GPS Watching" : "GPS Locked"}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Broadcasting coordinates to {session.contactsNotified.length} verified contacts.
              </p>
            </div>
          </div>

          {/* Time Remaining & Stop Sharing Control */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Time Remaining
              </span>
              <span className="font-mono text-base font-black text-amber-300">
                {timeLeft}
              </span>
            </div>

            <button
              type="button"
              onClick={handleStop}
              disabled={isStopping}
              className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-rose-600/30 transition disabled:opacity-50"
            >
              {isStopping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <StopCircle className="h-4 w-4" />
              )}
              <span>Stop Sharing</span>
            </button>
          </div>
        </div>

        {/* Stale Warning Banner */}
        {isStale && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-950/60 p-2.5 text-xs text-amber-200">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>
              Device has not reported new coordinates in over 60 seconds. Ensure browser location permission is active and GPS is enabled.
            </span>
          </div>
        )}
      </div>

      {/* Main Two-Column View: Map Preview + Location Intel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Google Maps Live Tracking Preview (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-[#070d1e] overflow-hidden shadow-lg flex flex-col h-[380px] relative">
          <div className="p-3 border-b border-slate-800/80 bg-slate-900/80 flex items-center justify-between text-xs font-bold text-slate-200">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-400" />
              <span>Real-Time GPS Map Preview</span>
            </div>
            <a
              href={`https://www.google.com/maps?q=${currentLat},${currentLng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition"
            >
              <span>External Map</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="flex-1 w-full h-full relative">
            {apiKey ? (
              <APIProvider apiKey={apiKey}>
                <Map
                  center={{ lat: currentLat, lng: currentLng }}
                  zoom={15}
                  mapId="nshield_live_share"
                  disableDefaultUI={true}
                  gestureHandling="cooperative"
                  className="w-full h-full"
                >
                  <Marker
                    position={{ lat: currentLat, lng: currentLng }}
                    title={session.userName}
                  />
                </Map>
              </APIProvider>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
                <MapPin className="h-8 w-8 text-indigo-400 animate-bounce" />
                <p className="mt-2 text-xs font-bold text-slate-200">
                  Coordinates: {currentLat.toFixed(5)}°N, {currentLng.toFixed(5)}°E
                </p>
                <p className="text-[11px] text-slate-400">Accuracy: ±{currentAccuracy} meters</p>
              </div>
            )}

            {/* Floating accuracy pill */}
            <div className="absolute bottom-3 left-3 rounded-lg bg-slate-900/90 border border-slate-700/80 px-2.5 py-1 text-[11px] font-mono text-slate-300 shadow-md">
              GPS Accuracy: <span className="text-emerald-400 font-bold">±{currentAccuracy}m</span>
            </div>
          </div>
        </div>

        {/* Right: Session Info & Contacts (1 col) */}
        <div className="space-y-4">
          {/* Quick Extend Card */}
          <div className="rounded-2xl border border-slate-800 bg-[#0a1226] p-4 text-xs space-y-3">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-indigo-400" />
              <span>Extend Live Sharing</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Need more time? Add duration to prevent the link from expiring while you are in transit.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleExtend(15)}
                disabled={isExtending}
                className="rounded-xl border border-indigo-500/30 bg-indigo-950/40 hover:bg-indigo-900/50 py-2 px-3 text-xs font-bold text-indigo-300 transition"
              >
                +15 Minutes
              </button>
              <button
                type="button"
                onClick={() => handleExtend(30)}
                disabled={isExtending}
                className="rounded-xl border border-indigo-500/30 bg-indigo-950/40 hover:bg-indigo-900/50 py-2 px-3 text-xs font-bold text-indigo-300 transition"
              >
                +30 Minutes
              </button>
            </div>
          </div>

          {/* Recipient Link Box */}
          <div className="rounded-2xl border border-slate-800 bg-[#0a1226] p-4 text-xs space-y-2">
            <span className="font-bold text-white block">Recipient Link</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={session.shareUrl}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-2.5 py-2 font-mono text-[11px] text-indigo-300 truncate select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-xs font-bold text-white transition flex items-center gap-1"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              Only people with this secure token can view your position.
            </p>
          </div>

          {/* Notified Contacts List */}
          <div className="rounded-2xl border border-slate-800 bg-[#0a1226] p-4 text-xs space-y-2.5">
            <span className="font-bold text-white flex items-center justify-between">
              <span>Notified Contacts</span>
              <span className="text-[10px] text-slate-400 font-normal">
                {session.contactsNotified.length} recipients
              </span>
            </span>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {session.contactsNotified.map((c) => (
                <div
                  key={c.contactId}
                  className="flex items-center justify-between rounded-xl bg-slate-900/80 border border-slate-800/80 px-2.5 py-1.5 text-xs"
                >
                  <span className="font-semibold text-slate-200 truncate max-w-[130px]">
                    {c.contactName}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>{c.channel === "mock_sms" ? "Simulated SMS" : "SMS Delivered"}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

