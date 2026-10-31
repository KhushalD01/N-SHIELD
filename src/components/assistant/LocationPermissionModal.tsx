"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  Crosshair,
  Search,
  Shield,
  X,
} from "lucide-react";
import { POPULAR_NAGPUR_LOCATIONS, type UserLocation } from "@/lib/geoUtils";

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelected: (location: UserLocation) => void;
  currentLocation?: UserLocation;
}

export function LocationPermissionModal({
  isOpen,
  onClose,
  onLocationSelected,
  currentLocation,
}: LocationPermissionModalProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customArea, setCustomArea] = useState("");

  if (!isOpen) return null;

  const handleRequestBrowserGps = () => {
    if (!navigator.geolocation) {
      setErrorMessage("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const loc: UserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          label: "Current GPS Location",
          isUserSet: true,
          source: "gps",
        };
        onLocationSelected(loc);
        onClose();
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMessage(
              "Location permission was denied. You can select your Nagpur neighborhood from the list below."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMessage("Location information is unavailable. Please pick a locality below.");
            break;
          case error.TIMEOUT:
            setErrorMessage("Location request timed out. Please retry or choose a locality.");
            break;
          default:
            setErrorMessage("An unknown error occurred while retrieving location.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handleSelectPredefined = (loc: { name: string; lat: number; lng: number }) => {
    onLocationSelected({
      lat: loc.lat,
      lng: loc.lng,
      label: loc.name,
      isUserSet: true,
      source: "manual",
    });
    onClose();
  };

  const handleCustomAreaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customArea.trim()) return;

    // Search predefined or default
    const matched = POPULAR_NAGPUR_LOCATIONS.find((l) =>
      l.name.toLowerCase().includes(customArea.toLowerCase().trim())
    );

    if (matched) {
      handleSelectPredefined(matched);
    } else {
      // Sitabuldi center reference with custom label
      onLocationSelected({
        lat: 21.1458,
        lng: 79.0882,
        label: customArea.trim() + " (Nagpur)",
        isUserSet: true,
        source: "manual",
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600">
              <Crosshair className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                Location Reference
              </h3>
              <p className="text-[11px] text-slate-400">
                To calculate nearest hospitals & police stations
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Privacy Note */}
        <div className="rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 p-3 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <Shield className="h-3.5 w-3.5 text-indigo-600" />
            <span>Privacy Guaranteed</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            Your location is used solely in your browser session to rank nearest services and corridor routes. It is never sold, tracked in background, or permanently recorded.
          </p>
        </div>

        {/* GPS Button */}
        <button
          type="button"
          onClick={handleRequestBrowserGps}
          disabled={isLocating}
          className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-indigo-200 dark:shadow-none active:scale-95 transition disabled:opacity-60"
        >
          <Crosshair className={`h-4 w-4 ${isLocating ? "animate-spin" : ""}`} />
          <span>{isLocating ? "Requesting GPS coordinates..." : "📍 Use My Precise GPS Location"}</span>
        </button>

        {/* Error message with retry */}
        {errorMessage && (
          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 p-2.5 text-[11px] text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* Manual Locality Fallback */}
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Or select your Nagpur locality:
          </label>

          <form onSubmit={handleCustomAreaSubmit} className="flex gap-1.5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={customArea}
                onChange={(e) => setCustomArea(e.target.value)}
                placeholder="Enter locality e.g. Sitabuldi, Dharampeth"
                className="w-full min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-8 pr-3 text-xs outline-none text-slate-800 dark:text-slate-200"
              />
            </div>
            <button
              type="submit"
              className="min-h-[40px] px-3.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold active:scale-95 transition"
            >
              Set
            </button>
          </form>

          {/* Popular Nagpur Quick Pick Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {POPULAR_NAGPUR_LOCATIONS.map((loc) => (
              <button
                key={loc.name}
                type="button"
                onClick={() => handleSelectPredefined(loc)}
                className="min-h-[32px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-indigo-500 hover:text-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition active:scale-95"
              >
                📍 {loc.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
