"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CalendarRange, Loader2, MapPin, Users, X } from "lucide-react";
import type { PublicEventSimulation } from "@/lib/eventImpactEngine";
import type { Zone } from "@/lib/types";

type EventSimulatorModalProps = {
  open: boolean;
  onClose: () => void;
  zones: Zone[];
  onSimulate: (input: {
    eventName: string;
    zoneId: string;
    location: string;
    expectedCrowd: number;
    durationHours: number;
  }) => Promise<PublicEventSimulation>;
  onComplete: (result: PublicEventSimulation) => void;
};

export function EventSimulatorModal({
  open,
  onClose,
  zones,
  onSimulate,
  onComplete,
}: EventSimulatorModalProps) {
  const [eventName, setEventName] = useState("Festival Rally");
  const [zoneId, setZoneId] = useState(zones[0]?.id ?? "");
  const [expectedCrowd, setExpectedCrowd] = useState(12000);
  const [durationHours, setDurationHours] = useState(4);
  const [phase, setPhase] = useState<"form" | "loading" | "result">("form");
  const [result, setResult] = useState<PublicEventSimulation | null>(null);

  const selectedZone = zones.find((zone) => zone.id === zoneId);

  const resetAndClose = () => {
    setPhase("form");
    setResult(null);
    onClose();
  };

  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase !== "loading") resetAndClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, phase, resetAndClose]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!zoneId || !eventName.trim()) return;

    setPhase("loading");
    try {
      const simulation = await onSimulate({
        eventName: eventName.trim(),
        zoneId,
        location: selectedZone?.name ?? "Unknown",
        expectedCrowd,
        durationHours,
      });
      setResult(simulation);
      setPhase("result");
      onComplete(simulation);
    } catch {
      setPhase("form");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close modal backdrop"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={phase === "loading" ? undefined : resetAndClose}
          />

          <motion.div
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            initial={{ scale: 0.95, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 12, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
          >
            {/* Modal Header */}
            <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                    Event-Aware Risk Predictor
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-slate-900">
                    Simulate Public Event Impact
                  </h2>
                </div>
                {phase !== "loading" && (
                  <button
                    type="button"
                    onClick={resetAndClose}
                    className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 hover:text-slate-700 shadow-2xs"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Loading Phase */}
            {phase === "loading" && (
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                <p className="mt-4 text-sm font-bold text-slate-900">
                  AI Simulating Impact...
                </p>
                <p className="mt-1 max-w-xs text-xs font-medium text-slate-500">
                  Calculating crowd pressure, patrol bottlenecks, and traffic spillover vectors
                </p>
              </div>
            )}

            {/* Form Phase */}
            {phase === "form" && (
              <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
                <label className="block">
                  <span className="text-xs font-bold text-slate-700">Event Name</span>
                  <input
                    value={eventName}
                    onChange={(event) => setEventName(event.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none ring-indigo-500/20 focus:border-indigo-500 focus:bg-white focus:ring-2"
                    placeholder="Festival Rally"
                    required
                  />
                </label>

                <label className="block">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                    Target Location (Zone)
                  </span>
                  <select
                    value={zoneId}
                    onChange={(event) => setZoneId(event.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none ring-indigo-500/20 focus:border-indigo-500 focus:bg-white focus:ring-2"
                    required
                  >
                    {zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Users className="h-3.5 w-3.5 text-indigo-500" />
                      Expected Crowd
                    </span>
                    <input
                      type="number"
                      min={500}
                      max={100000}
                      step={500}
                      value={expectedCrowd}
                      onChange={(event) => setExpectedCrowd(Number(event.target.value))}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none ring-indigo-500/20 focus:border-indigo-500 focus:bg-white focus:ring-2"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <CalendarRange className="h-3.5 w-3.5 text-indigo-500" />
                      Duration (Hours)
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={24}
                      value={durationHours}
                      onChange={(event) => setDurationHours(Number(event.target.value))}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none ring-indigo-500/20 focus:border-indigo-500 focus:bg-white focus:ring-2"
                      required
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-indigo-700"
                >
                  Run AI Simulation
                </button>
              </form>
            )}

            {/* Result Phase */}
            {phase === "result" && result && (
              <div className="space-y-4 px-6 py-5">
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                    <div>
                      <p className="text-xs font-bold leading-relaxed text-rose-900">
                        {result.warningMessage}
                      </p>
                      <p className="mt-2 text-xs font-medium text-rose-700">
                        Projected risk for <span className="font-bold">{result.zoneName}</span>:{" "}
                        <span className="font-mono font-bold text-rose-900">{result.projectedScore}</span>{" "}
                        (+{result.riskBoost} point event spike)
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetAndClose}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
                >
                  Close & View Updated Map
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
