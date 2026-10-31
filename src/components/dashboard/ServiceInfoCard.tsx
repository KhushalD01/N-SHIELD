"use client";

import React from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Compass,
  ExternalLink,
  MapPin,
  Navigation,
  Phone,
  PhoneCall,
  ShieldCheck,
  X,
} from "lucide-react";
import type { EssentialService, ServiceCategory } from "@/lib/nearbyServicesData";
import {
  getGoogleMapsDirectionsUrl,
  getPhoneDialerUrl,
  type UserLocation,
} from "@/lib/geoUtils";

const CATEGORY_META: Record<
  ServiceCategory,
  { label: string; icon: string; bgBadge: string; textBadge: string; borderBadge: string }
> = {
  police: {
    label: "Police Station",
    icon: "🚓",
    bgBadge: "bg-blue-50 dark:bg-blue-950/60",
    textBadge: "text-blue-700 dark:text-blue-300",
    borderBadge: "border-blue-200 dark:border-blue-800",
  },
  hospital: {
    label: "Hospital",
    icon: "🏥",
    bgBadge: "bg-rose-50 dark:bg-rose-950/60",
    textBadge: "text-rose-700 dark:text-rose-300",
    borderBadge: "border-rose-200 dark:border-rose-800",
  },
  pharmacy: {
    label: "Medical Shop / Pharmacy",
    icon: "💊",
    bgBadge: "bg-emerald-50 dark:bg-emerald-950/60",
    textBadge: "text-emerald-700 dark:text-emerald-300",
    borderBadge: "border-emerald-200 dark:border-emerald-800",
  },
  ambulance: {
    label: "Ambulance / Emergency",
    icon: "🚑",
    bgBadge: "bg-amber-50 dark:bg-amber-950/60",
    textBadge: "text-amber-700 dark:text-amber-300",
    borderBadge: "border-amber-200 dark:border-amber-800",
  },
  fire_station: {
    label: "Fire Station",
    icon: "🚒",
    bgBadge: "bg-orange-50 dark:bg-orange-950/60",
    textBadge: "text-orange-700 dark:text-orange-300",
    borderBadge: "border-orange-200 dark:border-orange-800",
  },
  emergency_other: {
    label: "Emergency Service",
    icon: "🛡️",
    bgBadge: "bg-purple-50 dark:bg-purple-950/60",
    textBadge: "text-purple-700 dark:text-purple-300",
    borderBadge: "border-purple-200 dark:border-purple-800",
  },
};

interface ServiceInfoCardProps {
  service: EssentialService;
  userLocation: UserLocation;
  formattedDistance: string;
  onClose: () => void;
  topOffset?: number;
}

export function ServiceInfoCard({
  service,
  userLocation,
  formattedDistance,
  onClose,
  topOffset = 180,
}: ServiceInfoCardProps) {
  const meta = CATEGORY_META[service.category] || CATEGORY_META.police;
  const directionsUrl = getGoogleMapsDirectionsUrl(userLocation, service);
  const dialerUrl = getPhoneDialerUrl(service.phone);

  return (
    <div
      className="w-full rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.25)] flex flex-col pointer-events-auto"
    >
      {/* Category Pill & Close Button (Sticky Header) */}
      <div className="sticky top-0 z-20 px-3.5 pt-3 pb-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 rounded-t-2xl">
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide border ${meta.bgBadge} ${meta.textBadge} ${meta.borderBadge}`}
          >
            <span className="text-sm">{meta.icon}</span>
            <span>{meta.label}</span>
          </span>
          {service.hospitalDetails?.verificationStatus === "needs_review" ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5" /> Needs Review
            </span>
          ) : service.hospitalDetails?.verificationStatus === "unverified" || !service.verified ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500 dark:text-rose-400">
              Unverified Location
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified Premise
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer shrink-0"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Spacious Body Content (Grows naturally without forced map-height clamp) */}
      <div className="p-3.5 space-y-2.5 overflow-y-auto max-h-[calc(100vh-140px)] overscroll-contain flex-1">
        {/* Service Name & Distance */}
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-50 leading-tight">
            {service.name}
          </h3>
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
              <MapPin className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              📍 {formattedDistance}
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              {service.is24x7 ? "24/7 Verified" : "Open / Available"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 text-[11px] font-mono text-slate-600 dark:text-slate-300">
              🧭 {service.lat.toFixed(5)}, {service.lng.toFixed(5)}
            </span>
            {service.hospitalDetails?.beds && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                🛏️ {service.hospitalDetails.beds} Beds
              </span>
            )}
            {service.hospitalDetails?.ambulanceAvailable && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                🚑 Ambulance Unit
              </span>
            )}
            {service.hospitalDetails?.bloodBankAvailable && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300">
                🩸 Blood Bank
              </span>
            )}
          </div>
        </div>

      {/* Route Distance Flow Preview */}
      <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 p-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
          <span>Route from current location</span>
          <span className="text-indigo-600 dark:text-indigo-400">{formattedDistance}</span>
        </div>
        <div className="relative pl-6 space-y-3 text-xs">
          {/* Vertical path line */}
          <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-dashed border-l-2 border-indigo-400 dark:border-indigo-600" />
          
          <div className="relative flex items-center gap-2">
            <span className="absolute -left-6 h-3 w-3 rounded-full bg-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-950" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {userLocation.label || "Your Location"}
            </span>
          </div>

          <div className="relative flex items-center gap-2">
            <span className="absolute -left-6 h-3 w-3 rounded-full bg-emerald-600 ring-4 ring-emerald-100 dark:ring-emerald-950" />
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {meta.icon} {service.name}
            </span>
          </div>
        </div>
      </div>

      {/* Address & Details Grid */}
      <div className="space-y-2 text-xs">
        <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
          <Building2 className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{service.address}</p>
            {service.landmark && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Landmark: {service.landmark}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
          <Clock className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="font-medium">Timing: {service.timing}</span>
        </div>

        {service.specialties && (
          <div className="rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 p-2.5 border border-indigo-100 dark:border-indigo-900/60 text-[11px] text-indigo-900 dark:text-indigo-200">
            <span className="font-bold">Specialties:</span> {service.specialties}
          </div>
        )}

        {service.email && (
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="text-slate-400">✉️</span>
            <a
              href={`mailto:${service.email}`}
              className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline truncate"
            >
              {service.email}
            </a>
          </div>
        )}

        {service.website && (
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="text-slate-400">🌐</span>
            <a
              href={service.website.startsWith("http") ? service.website : `https://${service.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline truncate flex items-center gap-1"
            >
              <span>Official Website</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {service.notes && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800">
            ℹ️ {service.notes}
          </p>
        )}
      </div>

      {/* Action Buttons: [ 📞 Call ] & [ 🧭 Directions ] */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        {dialerUrl ? (
          <a
            href={dialerUrl}
            className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-md transition hover:bg-emerald-700 active:scale-98"
          >
            <PhoneCall className="h-4 w-4" />
            <span>📞 Call</span>
          </a>
        ) : (
          <div className="flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-medium px-4 py-3">
            Phone Unavailable
          </div>
        )}

        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white shadow-md transition hover:bg-indigo-700 active:scale-98"
        >
          <Compass className="h-4 w-4" />
          <span>🧭 Directions</span>
        </a>
      </div>
      </div>
    </div>
  );
}
