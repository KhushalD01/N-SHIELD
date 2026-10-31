"use client";

import React from "react";
import {
  Clock,
  Compass,
  Hospital,
  MapPin,
  Navigation,
  Phone,
  Pill,
  Shield,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { ServicePlace } from "@/lib/validation/assistantSchemas";

interface ServiceResultCardProps {
  place: ServicePlace;
  onSelectOnMap?: (place: ServicePlace) => void;
}

export function ServiceResultCard({ place, onSelectOnMap }: ServiceResultCardProps) {
  const isPolice = place.type === "police_station";
  const isPharmacy = place.type === "pharmacy";

  const Icon = isPolice ? Shield : isPharmacy ? Pill : Hospital;
  const accentColor = isPolice
    ? "text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800"
    : isPharmacy
    ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800"
    : "text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800";

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}`;

  return (
    <div
      className={`relative rounded-2xl border bg-white dark:bg-slate-900 p-3.5 shadow-sm space-y-2.5 transition hover:shadow-md ${
        place.isNearest
          ? "border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-500/20"
          : "border-slate-200 dark:border-slate-800"
      }`}
    >
      {/* Nearest Priority Badge */}
      {place.isNearest && (
        <div className="flex items-center justify-between pb-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 text-white px-2.5 py-0.5 text-[10px] font-black tracking-wide uppercase shadow-xs">
            <Sparkles className="h-3 w-3" />
            <span>🎯 Nearest Match</span>
          </span>
          {place.formattedDuration && (
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              ~{place.formattedDuration}
            </span>
          )}
        </div>
      )}

      {/* Facility Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${accentColor}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h4 className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">
              {place.name}
            </h4>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
              <span className="capitalize">{place.type.replace("_", " ")}</span>
              <span>•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {place.formattedDistance || "Nagpur"} (straight-line)
              </span>
            </div>
          </div>
        </div>

        {/* 24/7 or Opening Status */}
        {place.is24x7 ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="h-3 w-3" /> 24/7 Verified
          </span>
        ) : place.isOpenNow === true ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
            <Clock className="h-3 w-3" /> Open Now
          </span>
        ) : place.isOpenNow === false ? (
          <span className="shrink-0 rounded-md bg-rose-100 dark:bg-rose-950/60 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300">
            Closed Now
          </span>
        ) : (
          <span className="shrink-0 rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-500">
            Hours Unverified
          </span>
        )}
      </div>

      {/* Road Travel Transit Detail */}
      {place.roadDistanceMeters && (
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 text-[11px] text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
          <Compass className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
          <span className="font-semibold">{place.formattedRoadDistance}</span>
          {place.formattedDuration && (
            <>
              <span>•</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                ETA: {place.formattedDuration}
              </span>
            </>
          )}
        </div>
      )}

      {/* Physical Address */}
      <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
        {place.address}
      </p>

      {/* Emergency specialties note if present */}
      {place.emergencyServices && (
        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
          Specialties: {place.emergencyServices}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        {place.phone ? (
          <a
            href={`tel:${place.phone.replace(/[^0-9+]/g, "")}`}
            className="flex-1 min-h-[36px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs active:scale-95 transition"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>Call {place.phone}</span>
          </a>
        ) : (
          <span className="flex-1 min-h-[36px] inline-flex items-center justify-center text-[11px] text-slate-400 italic">
            Phone unlisted
          </span>
        )}

        {onSelectOnMap && (
          <button
            type="button"
            onClick={() => onSelectOnMap(place)}
            className="min-h-[36px] inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 active:scale-95 transition"
            title="Focus on map"
          >
            <MapPin className="h-3.5 w-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Map</span>
          </button>
        )}

        <a
          href={googleMapsDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[36px] inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 active:scale-95 transition"
          title="Turn-by-turn Directions"
        >
          <Navigation className="h-3.5 w-3.5 text-emerald-500" />
          <span className="hidden sm:inline">Nav</span>
        </a>
      </div>
    </div>
  );
}
