"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Crosshair,
  MapPin,
  Send,
  ShieldAlert,
  X,
} from "lucide-react";
import type { CitizenSubmittedReport, NewsCategory } from "@/lib/newsTypes";
import { POPULAR_NAGPUR_LOCATIONS } from "@/lib/geoUtils";

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: Omit<CitizenSubmittedReport, "id" | "timestamp" | "status">) => void;
}

export function ReportIncidentModal({
  isOpen,
  onClose,
  onSubmit,
}: ReportIncidentModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<NewsCategory>("Other Crime");
  const [selectedLocation, setSelectedLocation] = useState(POPULAR_NAGPUR_LOCATIONS[0]);
  const [customLocation, setCustomLocation] = useState("");
  const [submittedName, setSubmittedName] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSelectedLocation({
          name: "My GPS Location",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          locality: "Nagpur",
        });
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      locationName: customLocation.trim() || selectedLocation.name,
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      submittedBy: submittedName.trim() || "Concerned Citizen",
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setTitle("");
      setDescription("");
      setCustomLocation("");
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                Report an Incident
              </h3>
              <p className="text-xs text-slate-400">
                Nagpur Citizen Safety Community Reporting
              </p>
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

        {isSuccess ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 animate-bounce" />
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Report Submitted Successfully
            </h4>
            <p className="text-xs text-slate-500">
              Your report has been added to the Citizen Reports feed as <em>Unverified</em>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Category Selector */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Incident Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NewsCategory)}
                className="w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 font-semibold text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="Theft">🔴 Theft / Stolen Property</option>
                <option value="Vehicle Theft">🔴 Vehicle Theft (Car / Bike)</option>
                <option value="Robbery">🔴 Robbery / Loot</option>
                <option value="Burglary">🔴 Burglary / House Break-in</option>
                <option value="Assault">🔴 Assault / Physical Altercation</option>
                <option value="Murder">🚨 Murder / Homicide</option>
                <option value="Kidnapping">⚠️ Kidnapping / Abduction</option>
                <option value="Crimes Against Women">🛡️ Crimes Against Women</option>
                <option value="Cybercrime">💻 Cybercrime / Cyber Fraud</option>
                <option value="Fraud">💳 Fraud / Scam</option>
                <option value="Drugs and Smuggling">🚫 Drugs & Narcotics Smuggling</option>
                <option value="Missing Person">👤 Missing Person</option>
                <option value="Other Crime">🚨 Other Crime</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Incident Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Non-functional streetlights on WHC Road"
                className="w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-slate-800 dark:text-slate-200 outline-none"
              />
            </div>

            {/* Location Selector with GPS Option */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Nagpur Sector / Landmark
                </label>
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={isLocating}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Crosshair className={`h-3 w-3 ${isLocating ? "animate-spin" : ""}`} />
                  <span>{isLocating ? "Locating..." : "Use My Location"}</span>
                </button>
              </div>

              <select
                value={selectedLocation.name}
                onChange={(e) => {
                  const loc = POPULAR_NAGPUR_LOCATIONS.find((l) => l.name === e.target.value);
                  if (loc) setSelectedLocation(loc);
                }}
                className="w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 font-semibold text-slate-800 dark:text-slate-200 outline-none"
              >
                {selectedLocation.name === "My GPS Location" && (
                  <option value="My GPS Location">📍 My GPS Location (Detected)</option>
                )}
                {POPULAR_NAGPUR_LOCATIONS.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    📍 {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Detailed Description
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details about the incident, time observed, and any safety hazards..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-slate-800 dark:text-slate-200 outline-none leading-relaxed"
              />
            </div>

            {/* Citizen Name (Optional) */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Your Name / Alias (Optional)
              </label>
              <input
                type="text"
                value={submittedName}
                onChange={(e) => setSubmittedName(e.target.value)}
                placeholder="e.g. Concerned Citizen (Anonymous)"
                className="w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-slate-800 dark:text-slate-200 outline-none"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-95"
              >
                <Send className="h-4 w-4" />
                <span>Submit Citizen Report</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
