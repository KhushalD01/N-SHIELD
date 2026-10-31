"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  Crosshair,
  Info,
  MapPin,
  Navigation,
  RefreshCw,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import { POPULAR_NAGPUR_LOCATIONS, type UserLocation } from "@/lib/geoUtils";
import type { RouteOption } from "@/lib/validation/assistantSchemas";
import type {
  DisruptionIncident,
  RouteReconstructionAlert,
} from "@/lib/routing/types";

interface DynamicRoutePlannerProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: UserLocation;
  onActiveRouteChange: (route: RouteOption | null) => void;
  onAlternativesChange: (routes: RouteOption[]) => void;
  onDisruptionsChange: (disruptions: DisruptionIncident[]) => void;
}

export function DynamicRoutePlanner({
  isOpen,
  onClose,
  userLocation,
  onActiveRouteChange,
  onAlternativesChange,
  onDisruptionsChange,
}: DynamicRoutePlannerProps) {
  const [origin, setOrigin] = useState(userLocation.label || "Sitabuldi Metro Interchange");
  const [destination, setDestination] = useState("Dharampeth (WHC Road)");
  const [isLoading, setIsLoading] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Active route & reconstruction alert state
  const [activeRoute, setActiveRoute] = useState<RouteOption | null>(null);
  const [allRoutes, setAllRoutes] = useState<RouteOption[]>([]);
  const [alert, setAlert] = useState<RouteReconstructionAlert | null>(null);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Simulated disruption tester for demonstration & validation
  const [selectedSimulatedDisruption, setSelectedSimulatedDisruption] = useState<string>("none");

  // Keyboard escape listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Primary route calculation handler
  const handleCalculateRoute = useCallback(async () => {
    if (!origin.trim() || !destination.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const payload: {
        origin: string;
        destination: string;
        includeSimulated?: boolean;
        simulatedDisruptionId?: string;
      } = {
        origin,
        destination,
        includeSimulated: selectedSimulatedDisruption !== "none",
      };

      if (selectedSimulatedDisruption !== "none") {
        payload.simulatedDisruptionId = selectedSimulatedDisruption;
      }

      const res = await fetch("/api/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to calculate road routes.");
      }

      const data = await res.json();
      const initialActive = data.activeRoute as RouteOption;
      const candidates = (data.routes || []) as RouteOption[];
      const activeAlert = data.alert as RouteReconstructionAlert;
      const activeDisruptions = (data.disruptions || []) as DisruptionIncident[];

      setActiveRoute(initialActive);
      setAllRoutes(candidates);
      setAlert(activeAlert);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));

      // Propagate to main map
      onActiveRouteChange(initialActive);
      onAlternativesChange(candidates.filter((r) => r.id !== initialActive.id));
      onDisruptionsChange(activeDisruptions);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Routing calculation failed.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  }, [origin, destination, selectedSimulatedDisruption, onActiveRouteChange, onAlternativesChange, onDisruptionsChange]);

  // Re-check / Monitoring refresh handler
  const handleCheckUpdates = useCallback(async () => {
    if (!activeRoute) return;
    setIsLoading(true);

    try {
      const payload = {
        activeRouteId: activeRoute.id,
        origin,
        destination,
        simulatedDisruptionId: selectedSimulatedDisruption !== "none" ? selectedSimulatedDisruption : undefined,
        acknowledgedIncidentIds: acknowledgedAlerts,
      };

      const res = await fetch("/api/routes/reconstruct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setAlert(data.alert);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      }
    } catch (err) {
      console.warn("Failed to refresh route monitoring", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeRoute, origin, destination, selectedSimulatedDisruption, acknowledgedAlerts]);

  // User confirms switching to the recommended alternative
  const handleSwitchToAlternative = () => {
    if (!alert || !alert.recommendedAlternative) return;

    const newActive = alert.recommendedAlternative.route;
    setActiveRoute(newActive);
    onActiveRouteChange(newActive);

    // Update alternatives list on map
    const remaining = allRoutes.filter((r) => r.id !== newActive.id);
    onAlternativesChange(remaining);

    // Acknowledge current alert so banner dismisses
    setAcknowledgedAlerts((prev) => [
      ...prev,
      ...alert.affectedIncidents.map((i) => i.id),
    ]);
  };

  // User explicitly decides to keep the current route despite disruption
  const handleKeepCurrentRoute = () => {
    if (!alert) return;
    // Dismiss alert for currently reported incidents
    setAcknowledgedAlerts((prev) => [
      ...prev,
      ...alert.affectedIncidents.map((i) => i.id),
    ]);
  };

  if (!isOpen) return null;

  const isCurrentAlertActive =
    alert &&
    alert.hasDisruption &&
    alert.affectedIncidents.some((i) => !acknowledgedAlerts.includes(i.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
              <Navigation className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Dynamic Safe Route Reconstruction
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live Road Network Routing &amp; Incident-Aware Rerouting
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Inputs (Origin & Destination) */}
        <div className="space-y-3">
          {/* Origin */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Starting Location (Origin)
              </label>
              <button
                type="button"
                onClick={() => setOrigin(userLocation.label || "My Current Location")}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Crosshair className="h-3 w-3" /> Use GPS Location
              </button>
            </div>
            <div className="relative flex items-center">
              <MapPin className="absolute left-3 h-4 w-4 text-emerald-500" />
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Enter origin address or locality"
                className="w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-3 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Destination (Target Facility or Sector)
            </label>
            <div className="relative flex items-center">
              <Navigation className="absolute left-3 h-4 w-4 text-indigo-500" />
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-3 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {POPULAR_NAGPUR_LOCATIONS.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    📍 {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Demonstration Disruption Selector for Testing Section */}
          <div className="rounded-xl border border-dashed border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20 p-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1">
                🧪 Test Disruption Scenario:
              </span>
              <span className="text-slate-400 text-[10px]">Verifies Dynamic Rerouting</span>
            </div>
            <select
              value={selectedSimulatedDisruption}
              onChange={(e) => setSelectedSimulatedDisruption(e.target.value)}
              className="w-full rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="none">Normal Route (Live Feeds Only - No Injected Closures)</option>
              <option value="fixture-closure-sitabuldi">🛑 Road Closure at Munje Square (Sitabuldi Corridor)</option>
              <option value="fixture-protest-whc">📢 Active Protest Demonstration (WHC Road Corridor)</option>
              <option value="fixture-accident-wardha-rd">🚗 Major Accident on Wardha Road</option>
            </select>
          </div>

          {/* Action Button: Find Route */}
          <button
            type="button"
            onClick={handleCalculateRoute}
            disabled={isLoading}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-indigo-700 active:scale-95 transition disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Evaluating Road Network &amp; Hazards...</span>
              </>
            ) : (
              <>
                <Compass className="h-4 w-4" />
                <span>Calculate Road Route &amp; Assess Hazards</span>
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-3 text-xs text-rose-700 dark:text-rose-300 font-medium">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* ROUTE MONITORING BAR                                          */}
        {/* ------------------------------------------------------------- */}
        {activeRoute && (
          <div className="flex items-center justify-between rounded-xl bg-slate-100 dark:bg-slate-800/80 px-3 py-2 text-xs">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isCurrentAlertActive ? "bg-rose-500 animate-ping" : "bg-emerald-500"}`} />
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {isCurrentAlertActive ? "Route Disruption Detected" : "Route Monitored (All Clear)"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-[11px]">
              <span>Updated: {lastUpdated || "Just now"}</span>
              <button
                type="button"
                onClick={handleCheckUpdates}
                disabled={isLoading}
                title="Check for route updates"
                className="rounded-lg p-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* ROUTE DISRUPTION ALERT & RECOMMENDED ALTERNATIVE BANNER       */}
        {/* ------------------------------------------------------------- */}
        {isCurrentAlertActive && alert && alert.recommendedAlternative && (
          <div className="rounded-2xl border-2 border-rose-500 bg-rose-50/70 dark:bg-rose-950/30 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Alert Header */}
            <div className="flex items-start gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-600 text-white shrink-0 shadow-xs">
                <AlertOctagon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-black text-rose-900 dark:text-rose-200 uppercase tracking-wide">
                  {alert.alertHeadline}
                </h4>
                <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5 leading-snug">
                  {alert.alertDetails}
                </p>
              </div>
            </div>

            {/* Recommended Alternative Card */}
            <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900 p-3 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
                  <ShieldCheck className="h-3 w-3" /> Recommended Detour
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {alert.recommendedAlternative.formattedTimeDelta} · {alert.recommendedAlternative.formattedDistanceDelta}
                </span>
              </div>

              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {alert.recommendedAlternative.route.name}
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {alert.recommendedAlternative.recommendationReason}
              </p>

              <div className="text-[10px] text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-1.5 flex items-center justify-between">
                <span>Total: {alert.recommendedAlternative.route.formattedDuration} ({alert.recommendedAlternative.route.formattedDistance})</span>
                <span className="font-semibold text-emerald-600">Lower Estimated Risk</span>
              </div>
            </div>

            {/* Mandatory User Confirmation Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleSwitchToAlternative}
                className="flex-1 min-h-[42px] flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 text-xs font-black uppercase tracking-wider shadow-sm active:scale-95 transition cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Switch to This Route</span>
              </button>

              <button
                type="button"
                onClick={handleKeepCurrentRoute}
                className="min-h-[42px] rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-slate-700 text-rose-700 dark:text-rose-300 px-3.5 py-2 text-xs font-bold active:scale-95 transition cursor-pointer"
              >
                Keep Current Route
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* CURRENT ACTIVE ROUTE & CANDIDATE ALTERNATIVES LIST            */}
        {/* ------------------------------------------------------------- */}
        {activeRoute && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-indigo-600" /> Active Route &amp; Candidate Options
            </h4>

            {allRoutes.map((r, idx) => {
              const isActive = r.id === activeRoute.id;
              const isBlocked = r.safetyAssessment?.relativeRisk === "higher" && alert?.primaryDisruptionCategory === "road_closure" && isActive;

              return (
                <div
                  key={r.id}
                  onClick={() => {
                    setActiveRoute(r);
                    onActiveRouteChange(r);
                  }}
                  className={`rounded-2xl p-3.5 border transition cursor-pointer ${
                    isActive
                      ? isBlocked
                        ? "border-rose-400 bg-rose-50/60 dark:bg-rose-950/20"
                        : "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 ring-1 ring-indigo-500/30"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/30"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      {isActive && (
                        <span className={`h-2 w-2 rounded-full ${isBlocked ? "bg-rose-500" : "bg-indigo-600"}`} />
                      )}
                      {r.name}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      {r.formattedDuration} · {r.formattedDistance}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Via: {r.via}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span>Provider: {r.provider === "google_routes" ? "Google Routes API" : "Nagpur Road Network Model"}</span>
                    <span
                      className={`font-semibold uppercase ${
                        isBlocked
                          ? "text-rose-600"
                          : r.safetyAssessment?.relativeRisk === "lower"
                          ? "text-emerald-600"
                          : "text-slate-500"
                      }`}
                    >
                      {isBlocked ? "Obstructed" : `${r.safetyAssessment?.relativeRisk || "similar"} estimated risk`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Mandatory Safety Disclaimer */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 p-2.5 text-[10px] text-slate-500 leading-relaxed">
          <Info className="h-3 w-3 text-slate-400 inline mr-1" />
          <strong>Notice:</strong> Route assessments and alternative reconstructions are based on available municipal reports and corroborated incident feeds. They do not guarantee physical safety. Conditions can change; follow official instructions and use your judgment.
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center gap-2">
          {activeRoute && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
                origin + ", Nagpur"
              )}&destination=${encodeURIComponent(destination + ", Nagpur")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-h-[42px] inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition"
            >
              <Navigation className="h-4 w-4" />
              <span>Launch in Google Maps</span>
            </a>
          )}

          <button
            type="button"
            onClick={onClose}
            className="min-h-[42px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
