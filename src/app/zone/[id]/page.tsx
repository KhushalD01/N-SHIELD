"use client";

import React, { use, useState, useMemo } from "react";
import Link from "next/link";
import { APIProvider, Map as GoogleMap, Marker, InfoWindow } from "@vis.gl/react-google-maps";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Users,
  Camera,
  MapPin,
  TrendingDown,
  CheckCircle2,
  PhoneCall,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import { getZoneDetailById } from "@/lib/zoneDetailData";

interface ZonePageProps {
  params: Promise<{ id: string }>;
}

export default function ZoneAnalyticsPage({ params }: ZonePageProps) {
  const resolvedParams = use(params);
  const zoneId = resolvedParams.id;
  const zoneDetail = useMemo(() => getZoneDetailById(zoneId), [zoneId]);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const [actionStatuses, setActionStatuses] = useState<Record<string, boolean>>({});
  const [selectedHotspot, setSelectedHotspot] = useState<any | null>(null);

  const toggleActionStatus = (actionId: string) => {
    setActionStatuses((prev) => ({ ...prev, [actionId]: !prev[actionId] }));
  };

  // Center coordinates of hotspot data
  const mapCenter = useMemo(() => {
    if (zoneDetail.accidentHotspots.length > 0) {
      return {
        lat: zoneDetail.accidentHotspots[0].lat,
        lng: zoneDetail.accidentHotspots[0].lng,
      };
    }
    return { lat: 21.1458, lng: 79.0882 };
  }, [zoneDetail]);

  const statusBadgeClass =
    zoneDetail.safetyScore >= 80
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : zoneDetail.safetyScore >= 50
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-rose-50 text-rose-700 border-rose-200";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* --------------------------------------------------------------------- */}
      {/* 1. TOP HEADER LAYOUT                                                  */}
      {/* --------------------------------------------------------------------- */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
              title="Back to Command Center"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
                  {zoneDetail.name} Sector Analytics
                </h1>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${statusBadgeClass}`}
                >
                  {zoneDetail.safetyScore >= 80 ? (
                    <ShieldCheck className="h-3.5 w-3.5" />
                  ) : zoneDetail.safetyScore >= 50 ? (
                    <ShieldAlert className="h-3.5 w-3.5" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  )}
                  {zoneDetail.safetyScore}% Safety Health
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500">
                Nagpur Metropolitan Zone · Code: {zoneDetail.code}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900">{zoneDetail.officerInCharge}</p>
              <p className="text-[11px] text-slate-500">{zoneDetail.contactNumber}</p>
            </div>
            <a
              href={`tel:${zoneDetail.contactNumber}`}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 transition hover:bg-indigo-100"
              title="Call Command Center"
            >
              <PhoneCall className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 pt-6 sm:px-6">
        {/* --------------------------------------------------------------------- */}
        {/* SUMMARY METRICS ROW                                                   */}
        {/* --------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Patrols
              </span>
              <Users className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">
              {zoneDetail.activePatrols} Units
            </p>
            <p className="mt-1 text-[11px] font-medium text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> 100% On-duty compliance
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                CCTV Network
              </span>
              <Camera className="h-4 w-4 text-blue-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">
              {zoneDetail.operationalCctvCount} / {zoneDetail.totalCctvCount}
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">
              {Math.round((zoneDetail.operationalCctvCount / zoneDetail.totalCctvCount) * 100)}%
              operational rate
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Est. Population
              </span>
              <MapPin className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">
              {(zoneDetail.populationEstimate / 1000).toFixed(0)}k Residents
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">Density: High Urban</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recent Incidents
              </span>
              <Activity className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">
              {zoneDetail.recentIncidentsCount} Incidents
            </p>
            <p className="mt-1 text-[11px] font-medium text-emerald-600 flex items-center gap-1">
              <TrendingDown className="h-3 w-3" /> -12% YTD reduction
            </p>
          </div>
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* 2. ACCIDENT VISUALIZATION CARD (Google Maps API)                      */}
        {/* --------------------------------------------------------------------- */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-600" />
                Accident Hotspot Frequency Map ({zoneDetail.name})
              </h2>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Google Maps visualization for localized accident and vulnerability hotspots.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> High Risk
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Medium
              </span>
            </div>
          </div>

          <div className="relative h-80 w-full bg-slate-100">
            {apiKey ? (
              <APIProvider apiKey={apiKey}>
                <GoogleMap
                  defaultCenter={mapCenter}
                  defaultZoom={14}
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                  style={{ width: "100%", height: "100%" }}
                >
                  {zoneDetail.accidentHotspots.map((spot, idx) => (
                    <Marker
                      key={idx}
                      position={{ lat: spot.lat, lng: spot.lng }}
                      title={`${spot.name}: ${spot.accidentCount} accidents (${spot.riskLevel} risk)`}
                      onClick={() => setSelectedHotspot(spot)}
                    />
                  ))}

                  {selectedHotspot && (
                    <InfoWindow
                      position={{ lat: selectedHotspot.lat, lng: selectedHotspot.lng }}
                      onCloseClick={() => setSelectedHotspot(null)}
                    >
                      <div className="p-1 text-slate-900">
                        <div className="font-bold text-xs border-b pb-1">
                          {selectedHotspot.name}
                        </div>
                        <p className="text-xs mt-1">
                          Accidents: <strong>{selectedHotspot.accidentCount}</strong>
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Risk Level: {selectedHotspot.riskLevel}
                        </p>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              </APIProvider>
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                <p className="text-xs font-bold text-slate-700">Google Maps API Key Required</p>
              </div>
            )}
          </div>
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* 3. CRIME ANALYTICS GRID (Recharts Bar & Radar Charts)                 */}
        {/* --------------------------------------------------------------------- */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Chart 1: Reported Incidents YTD Bar Chart */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Reported Incidents Year-to-Date
              </h3>
              <p className="text-xs text-slate-500">
                Categorized crime comparison vs previous year
              </p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zoneDetail.ytdCrimes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="category" tick={{ fontSize: 11, fill: "#64748B" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: "12px",
                      borderColor: "#E2E8F0",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Bar dataKey="incidents" name="2026 YTD" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="previousYear" name="2025 YTD" fill="#C7D2FE" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Vulnerability Factors Radar Chart */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Sector Vulnerability Index
              </h3>
              <p className="text-xs text-slate-500">
                Multi-axis risk radar vs Nagpur city average
              </p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={zoneDetail.vulnerabilities}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "#475569", fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "#94A3B8" }} />
                  <Radar
                    name="Zone Score"
                    dataKey="score"
                    stroke="#4F46E5"
                    fill="#4F46E5"
                    fillOpacity={0.4}
                  />
                  <Radar
                    name="City Average"
                    dataKey="cityAverage"
                    stroke="#94A3B8"
                    fill="#94A3B8"
                    fillOpacity={0.15}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: "12px",
                      borderColor: "#E2E8F0",
                      fontSize: "12px",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* 4. STRATEGIC RECOMMENDED ACTIONS PANEL                                */}
        {/* --------------------------------------------------------------------- */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                Recommended Strategic Actions
              </h3>
              <p className="text-xs text-slate-500">
                AI-driven tactical interventions prioritized by risk impact
              </p>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              {zoneDetail.actions.length} Directives Available
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {zoneDetail.actions.map((act) => {
              const isDone = actionStatuses[act.id];
              return (
                <div
                  key={act.id}
                  className={`flex flex-col justify-between gap-4 rounded-xl border p-4 transition md:flex-row md:items-center ${
                    isDone
                      ? "border-emerald-200 bg-emerald-50/40"
                      : "border-slate-200/90 bg-slate-50/60 hover:bg-slate-50"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          act.priority === "Urgent"
                            ? "bg-rose-100 text-rose-700 border border-rose-200"
                            : "bg-amber-100 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {act.priority}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{act.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{act.description}</p>
                    <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-slate-500 font-medium">
                      <span>Target: {act.targetTime}</span>
                      <span>Assigned: {act.assignedUnit}</span>
                      <span className="font-semibold text-indigo-600">Est. Impact: {act.impactEstimate}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleActionStatus(act.id)}
                    className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs ${
                      isDone
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {isDone ? "Directive Marked Resolved" : "Deploy Directive"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
