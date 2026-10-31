"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronDown,
  Compass,
  Crosshair,
  Filter,
  HeartPulse,
  Hospital,
  MapPin,
  MousePointerClick,
  Navigation,
  Phone,
  PhoneCall,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
  Stethoscope,
  X,
} from "lucide-react";
import type { EssentialService, ServiceCategory } from "@/lib/nearbyServicesData";
import {
  formatDistance,
  getGoogleMapsDirectionsUrl,
  getPhoneDialerUrl,
  getSortedNearbyServices,
  POPULAR_NAGPUR_LOCATIONS,
  type ServiceWithDistance,
  type UserLocation,
} from "@/lib/geoUtils";

export type FacilityFilterCategory =
  | "all"
  | "hospitals"
  | "emergency_hospitals"
  | "govt_hospitals"
  | "clinics_nursing"
  | "specialist"
  | "maternity_child"
  | "ambulance"
  | "police"
  | "fire_station"
  | "pharmacy";

interface NearestServicesBarProps {
  services: EssentialService[];
  userLocation: UserLocation;
  onSelectService: (service: EssentialService) => void;
  onUpdateLocation: (newLocation: UserLocation) => void;
  onDetectLocation: () => void;
  isDetectingLocation?: boolean;
  locationError?: string | null;
  onClearLocationError?: () => void;
  onStartPickLocationOnMap?: () => void;
  isPickingLocationOnMap?: boolean;
}

const RADIUS_OPTIONS = [
  { label: "1 km", value: 1000 },
  { label: "3 km", value: 3000 },
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
  { label: "20 km", value: 20000 },
  { label: "All Nagpur", value: 0 },
];

const CATEGORY_TABS: { id: FacilityFilterCategory; label: string; icon: string; shortLabel: string }[] = [
  { id: "all", label: "All Nearby", icon: "🌐", shortLabel: "All" },
  { id: "hospitals", label: "Hospitals", icon: "🏥", shortLabel: "Hospitals" },
  { id: "emergency_hospitals", label: "24/7 Emergency", icon: "🚨", shortLabel: "24/7 Emergency" },
  { id: "govt_hospitals", label: "Government", icon: "🏛️", shortLabel: "Government" },
  { id: "specialist", label: "Specialists", icon: "🔬", shortLabel: "Specialists" },
  { id: "maternity_child", label: "Maternity & Child", icon: "👶", shortLabel: "Maternity" },
  { id: "clinics_nursing", label: "Clinics & Nursing", icon: "🩺", shortLabel: "Clinics" },
  { id: "ambulance", label: "Ambulance", icon: "🚑", shortLabel: "Ambulance" },
  { id: "police", label: "Police Stations", icon: "🚓", shortLabel: "Police" },
  { id: "pharmacy", label: "24/7 Medicals", icon: "💊", shortLabel: "Medicals" },
  { id: "fire_station", label: "Fire Stations", icon: "🚒", shortLabel: "Fire" },
];

export function NearestServicesBar({
  services,
  userLocation,
  onSelectService,
  onUpdateLocation,
  onDetectLocation,
  isDetectingLocation = false,
  locationError = null,
  onClearLocationError,
  onStartPickLocationOnMap,
  isPickingLocationOnMap = false,
}: NearestServicesBarProps) {
  const [selectedCategory, setSelectedCategory] = useState<FacilityFilterCategory>("all");
  const [selectedRadiusMeters, setSelectedRadiusMeters] = useState<number>(5000); // 5km default
  const [searchQuery, setSearchQuery] = useState("");
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");

  // Filtered and sorted services based on user location, category, and radius
  const filteredServices = useMemo(() => {
    let categoryFilter: ServiceCategory[] | undefined = undefined;

    let predicate: ((s: EssentialService) => boolean) | undefined = undefined;

    if (selectedCategory === "hospitals") {
      categoryFilter = ["hospital"];
    } else if (selectedCategory === "emergency_hospitals") {
      categoryFilter = ["hospital"];
      predicate = (s) => s.is24x7 === true;
    } else if (selectedCategory === "govt_hospitals") {
      categoryFilter = ["hospital"];
      predicate = (s) =>
        Boolean(
          s.hospitalDetails?.isGovernment ||
          s.hospitalDetails?.category === "government" ||
          s.name.toLowerCase().includes("govt") ||
          s.name.toLowerCase().includes("government") ||
          s.name.toLowerCase().includes("gmch") ||
          s.name.toLowerCase().includes("mayo") ||
          s.name.toLowerCase().includes("aiims") ||
          s.name.toLowerCase().includes("nmc")
        );
    } else if (selectedCategory === "specialist") {
      categoryFilter = ["hospital"];
      predicate = (s) =>
        Boolean(
          s.hospitalDetails?.category === "cardiac" ||
          s.hospitalDetails?.category === "cancer" ||
          s.hospitalDetails?.category === "eye" ||
          s.hospitalDetails?.category === "orthopaedic" ||
          s.specialties?.toLowerCase().includes("cardiac") ||
          s.specialties?.toLowerCase().includes("cancer") ||
          s.specialties?.toLowerCase().includes("eye") ||
          s.specialties?.toLowerCase().includes("ortho")
        );
    } else if (selectedCategory === "maternity_child") {
      categoryFilter = ["hospital"];
      predicate = (s) =>
        Boolean(
          s.hospitalDetails?.category === "maternity" ||
          s.hospitalDetails?.category === "children" ||
          s.specialties?.toLowerCase().includes("pediatric") ||
          s.specialties?.toLowerCase().includes("maternity") ||
          s.specialties?.toLowerCase().includes("children") ||
          s.name.toLowerCase().includes("women") ||
          s.name.toLowerCase().includes("daga") ||
          s.name.toLowerCase().includes("nelson")
        );
    } else if (selectedCategory === "clinics_nursing") {
      categoryFilter = ["hospital"];
      predicate = (s) =>
        Boolean(
          s.hospitalDetails?.category === "nursing_home" ||
          s.hospitalDetails?.category === "clinic" ||
          s.name.toLowerCase().includes("nursing") ||
          s.name.toLowerCase().includes("clinic")
        );
    } else if (selectedCategory === "ambulance") {
      categoryFilter = ["ambulance"];
    } else if (selectedCategory === "police") {
      categoryFilter = ["police"];
    } else if (selectedCategory === "fire_station") {
      categoryFilter = ["fire_station"];
    } else if (selectedCategory === "pharmacy") {
      categoryFilter = ["pharmacy"];
    }

    // Get strictly sorted services within radius
    const sorted = getSortedNearbyServices(
      services,
      userLocation,
      categoryFilter,
      undefined,
      undefined,
      selectedRadiusMeters > 0 ? selectedRadiusMeters : undefined,
      predicate
    );

    // Filter by text search if provided
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return sorted.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          (s.landmark && s.landmark.toLowerCase().includes(q)) ||
          (s.specialties && s.specialties.toLowerCase().includes(q)) ||
          (s.hospitalDetails?.locality && s.hospitalDetails.locality.toLowerCase().includes(q))
      );
    }

    return sorted;
  }, [services, userLocation, selectedCategory, selectedRadiusMeters, searchQuery]);

  // Filtered popular locations for manual selector
  const filteredLocations = useMemo(() => {
    if (!locationSearch.trim()) return POPULAR_NAGPUR_LOCATIONS;
    const q = locationSearch.toLowerCase().trim();
    return POPULAR_NAGPUR_LOCATIONS.filter(
      (l) => l.name.toLowerCase().includes(q) || l.locality.toLowerCase().includes(q)
    );
  }, [locationSearch]);

  return (
    <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 sm:p-5 shadow-sm backdrop-blur-md space-y-4">
      {/* ------------------------------------------------------------- */}
      {/* 1. HEADER: Title, Current Search Origin & GPS / Map Actions  */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20 shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-50 tracking-tight">
                Nearby Hospitals & Emergency Services
              </h3>
              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Verified Directory + Live Discovery
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Strictly filtered by radius & sorted by straight-line distance from your origin
            </p>
          </div>
        </div>

        {/* Location Selector Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* GPS Auto-Detect Button */}
          <button
            type="button"
            onClick={onDetectLocation}
            disabled={isDetectingLocation}
            className={`min-h-[42px] flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition shadow-xs active:scale-95 cursor-pointer ${userLocation.source === "gps"
              ? "bg-indigo-600 text-white border-indigo-600"
              : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            title="Detect My GPS Location"
          >
            <Crosshair className={`h-4 w-4 ${isDetectingLocation ? "animate-spin text-indigo-400" : ""}`} />
            <span>{isDetectingLocation ? "Acquiring GPS…" : "My Location"}</span>
          </button>

          {/* Interactive Map Picker Toggle */}
          {onStartPickLocationOnMap && (
            <button
              type="button"
              onClick={onStartPickLocationOnMap}
              className={`min-h-[42px] flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition shadow-xs active:scale-95 cursor-pointer ${isPickingLocationOnMap
                ? "bg-amber-500 text-white border-amber-500 ring-2 ring-amber-300 animate-pulse"
                : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              title="Click on the map to set reference search origin"
            >
              <MousePointerClick className="h-4 w-4" />
              <span>{isPickingLocationOnMap ? "Click on Map" : "Pick on Map"}</span>
            </button>
          )}

          {/* Locality Dropdown Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLocationPicker((prev) => !prev)}
              className="min-h-[42px] flex items-center gap-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 px-3.5 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition cursor-pointer"
            >
              <MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="max-w-[160px] truncate">{userLocation.label || "Nagpur City"}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showLocationPicker ? "rotate-180" : ""}`} />
            </button>

            {/* Quick Location Menu */}
            {showLocationPicker && (
              <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Nagpur Corridors & Localities
                  </span>
                  <button
                    onClick={() => setShowLocationPicker(false)}
                    className="text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="px-1 mb-2">
                  <input
                    type="text"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    placeholder="Search area (e.g. WCEM, Nandanvan)..."
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1">
                  {filteredLocations.map((loc) => (
                    <button
                      key={loc.name}
                      type="button"
                      onClick={() => {
                        onUpdateLocation({
                          lat: loc.lat,
                          lng: loc.lng,
                          label: loc.name,
                          isUserSet: true,
                          source: "manual",
                        });
                        setShowLocationPicker(false);
                      }}
                      className={`w-full min-h-[36px] text-left rounded-xl px-2.5 py-1.5 text-xs font-medium transition cursor-pointer flex items-center justify-between ${userLocation.lat === loc.lat && userLocation.lng === loc.lng
                        ? "bg-indigo-600 text-white font-bold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600"
                        }`}
                    >
                      <span className="truncate">{loc.name}</span>
                      <span className="text-[10px] opacity-70 ml-1 shrink-0">{loc.locality}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Geolocation Warning / Error Banner (if permission denied or failed) */}
      {locationError && (
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 p-3 flex items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              {locationError} You can choose a locality from the dropdown or click <strong>Pick on Map</strong>.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onDetectLocation}
              className="flex items-center gap-1 font-bold underline hover:text-amber-950 dark:hover:text-amber-100 cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Retry GPS</span>
            </button>
            {onClearLocationError && (
              <button onClick={onClearLocationError} className="p-1 text-amber-600 hover:text-amber-900">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. CONTROLS: Category Tabs & Radius Distance Selector         */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-3">
        {/* Category Tabs Scrollbar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORY_TABS.map((tab) => {
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer border ${isSelected
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter Bar: Radius Pill Selector & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Radius Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 shrink-0 mr-1">
              Search Radius:
            </span>
            {RADIUS_OPTIONS.map((opt) => {
              const isSelected = selectedRadiusMeters === opt.value;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setSelectedRadiusMeters(opt.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border whitespace-nowrap ${isSelected
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-xs"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Quick Keyword Search Filter */}
          <div className="relative sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search facility name or specialty..."
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 py-1.5 pl-8 pr-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. RESULTS SUMMARY BAR                                        */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 px-1 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
        <div>
          Showing <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{filteredServices.length}</strong> verified facilities
          {selectedRadiusMeters > 0 && (
            <span> within <strong className="text-slate-800 dark:text-slate-200">{selectedRadiusMeters / 1000} km</strong> of {userLocation.label || "your origin"}</span>
          )}
        </div>
        <div className="text-[11px] text-slate-400 hidden sm:block">
          Sorted strictly by straight-line proximity
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. RESULTS GRID OR HONEST EMPTY STATE                          */}
      {/* ------------------------------------------------------------- */}
      {filteredServices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-8 text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              No matching facilities within {selectedRadiusMeters > 0 ? `${selectedRadiusMeters / 1000} km` : "this area"}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              We never fabricate artificial nearby locations. Try expanding your search radius or changing the active category filter.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedRadiusMeters(10000)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition cursor-pointer"
            >
              Expand to 10 km
            </button>
            <button
              type="button"
              onClick={() => setSelectedRadiusMeters(20000)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              Expand to 20 km
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredServices.map((service, index) => {
            const directionsUrl = getGoogleMapsDirectionsUrl(userLocation, service);
            const dialerUrl = getPhoneDialerUrl(service.phone);
            const isClosest = index === 0;

            return (
              <div
                key={service.id}
                className={`group relative flex flex-col justify-between rounded-2xl border p-4 transition-all hover:shadow-md ${isClosest
                  ? "border-indigo-300 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20"
                  : "border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800"
                  }`}
              >
                <div>
                  {/* Top Header: Category Tag & Distance */}
                  <div className="flex items-center justify-between gap-1.5 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 rounded-md bg-white dark:bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs">
                        <span>{service.category === "hospital" ? "🏥" : service.category === "police" ? "🚓" : service.category === "pharmacy" ? "💊" : service.category === "ambulance" ? "🚑" : "🚒"}</span>
                        <span className="capitalize">{service.category.replace("_", " ")}</span>
                      </span>

                      {service.is24x7 && (
                        <span className="inline-flex items-center gap-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 text-[10px] font-extrabold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                          24/7 Open
                        </span>
                      )}

                      {service.verified && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400" title="Officially Verified Listing">
                          <ShieldCheck className="h-3 w-3" />
                        </span>
                      )}
                    </div>

                    <span className="rounded-lg bg-indigo-100/90 dark:bg-indigo-950 px-2 py-0.5 text-[11px] font-black text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0">
                      {service.formattedDistance}
                    </span>
                  </div>

                  {/* Facility Name */}
                  <button
                    type="button"
                    onClick={() => onSelectService(service)}
                    className="text-left text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition line-clamp-2 cursor-pointer"
                  >
                    {service.name}
                  </button>

                  {/* Address & Locality */}
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    📍 {service.address}
                  </p>

                  {/* Specialties / Key Services */}
                  {service.specialties && (
                    <p className="mt-1.5 text-[10px] text-slate-600 dark:text-slate-300 line-clamp-1 italic bg-slate-100/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-md">
                      ✨ {service.specialties}
                    </p>
                  )}
                </div>

                {/* Bottom Action Bar: [Call] [View On Map] [Directions] */}
                <div className="mt-3.5 flex items-center gap-1.5 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60">
                  {dialerUrl ? (
                    <a
                      href={dialerUrl}
                      className="flex-1 min-h-[44px] flex items-center justify-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95"
                      title={`Call ${service.name}`}
                    >
                      <PhoneCall className="h-3.5 w-3.5" />
                      <span>Call</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="flex-1 min-h-[44px] rounded-xl bg-slate-100 dark:bg-slate-800 px-2.5 py-2 text-[11px] font-medium text-slate-400 cursor-not-allowed"
                    >
                      No Phone
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onSelectService(service)}
                    className="flex-1 min-h-[44px] flex items-center justify-center gap-1 rounded-xl bg-slate-200 dark:bg-slate-700 px-2.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 transition hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-95 cursor-pointer"
                    title="Focus on map"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Focus</span>
                  </button>

                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-h-[44px] flex items-center justify-center gap-1 rounded-xl bg-indigo-600 px-2.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700 active:scale-95"
                    title={`Google Maps Directions to ${service.name}`}
                  >
                    <Compass className="h-3.5 w-3.5" />
                    <span>Route</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
