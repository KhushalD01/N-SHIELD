"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  AlertTriangle,
  Building2,
  Camera,
  Compass,
  Crosshair,
  MapPin,
  Navigation,
  Newspaper,
  PhoneCall,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import type { EssentialService, ServiceCategory } from "@/lib/nearbyServicesData";
import {
  calculateDistanceMeters,
  formatDistance,
  getSortedNearbyServices,
  parseSearchIntent,
  POPULAR_NAGPUR_LOCATIONS,
  type ServiceWithDistance,
  type UserLocation,
} from "@/lib/geoUtils";
import type { Zone } from "@/lib/types";
import type { RealNewsArticle } from "@/lib/newsTypes";

interface GlobalSearchBarProps {
  userLocation: UserLocation;
  zones: Zone[];
  services: EssentialService[];
  newsArticles?: RealNewsArticle[];
  onSelectZone: (zoneId: string, lat: number, lng: number) => void;
  onSelectService: (service: EssentialService) => void;
  onSelectNewsArticle?: (article: RealNewsArticle) => void;
  onSelectCustomLocation?: (loc: { name: string; lat: number; lng: number }) => void;
  className?: string;
  placeholder?: string;
}

export function GlobalSearchBar({
  userLocation,
  zones = [],
  services = [],
  newsArticles = [],
  onSelectZone,
  onSelectService,
  onSelectNewsArticle,
  onSelectCustomLocation,
  className = "",
  placeholder = "Search hospitals, police, Sitabuldi, Dharampeth...",
}: GlobalSearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Keyboard shortcut '/' to focus search & Escape to dismiss
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Compute Search Results
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    const intent = parseSearchIntent(query, userLocation);

    // 1. Matched Services (Hospitals, Police, Pharmacies, etc. sorted by distance)
    let matchingServices: ServiceWithDistance[] = [];
    if (intent.matchedCategory) {
      const customOrigin = intent.detectedLocality
        ? { lat: intent.detectedLocality.lat, lng: intent.detectedLocality.lng }
        : undefined;

      const effectiveLimit = intent.isExplicitAll
        ? undefined
        : intent.requestedLimit !== null
        ? intent.requestedLimit
        : intent.isSuperlative
        ? 1
        : 6;

      matchingServices = getSortedNearbyServices(
        services,
        userLocation,
        [intent.matchedCategory],
        effectiveLimit,
        customOrigin
      );
    } else if (q.length > 0) {
      // Search by specific service name or address
      const filtered = services.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          (s.landmark && s.landmark.toLowerCase().includes(q))
      );
      matchingServices = filtered
        .map((s) => {
          const dist = calculateDistanceMeters(userLocation.lat, userLocation.lng, s.lat, s.lng);
          return {
            ...s,
            distanceMeters: dist,
            formattedDistance: formatDistance(dist),
          };
        })
        .sort((a, b) => a.distanceMeters - b.distanceMeters)
        .slice(0, 6);
    }

    // 2. Matched Zones / Sectors (Nagpur Areas)
    let matchingZones: (Zone & { distanceMeters: number; formattedDistance: string })[] = [];
    if (q.length > 0 && !intent.matchedCategory) {
      matchingZones = zones
        .filter(
          (z) =>
            z.name.toLowerCase().includes(q) ||
            z.code.toLowerCase().includes(q) ||
            z.officerInCharge.toLowerCase().includes(q)
        )
        .map((z) => {
          const dist = calculateDistanceMeters(userLocation.lat, userLocation.lng, z.lat, z.lng);
          return {
            ...z,
            distanceMeters: dist,
            formattedDistance: formatDistance(dist),
          };
        })
        .sort((a, b) => a.distanceMeters - b.distanceMeters);
    }

    // 3. Matched Popular Landmarks
    let matchingLandmarks: { name: string; lat: number; lng: number; formattedDistance: string }[] = [];
    if (q.length > 0 && !intent.matchedCategory) {
      matchingLandmarks = POPULAR_NAGPUR_LOCATIONS
        .filter((l) => l.name.toLowerCase().includes(q))
        .map((l) => {
          const dist = calculateDistanceMeters(userLocation.lat, userLocation.lng, l.lat, l.lng);
          return {
            ...l,
            formattedDistance: formatDistance(dist),
          };
        });
    }

    // 4. Matched News Incidents
    let matchingNews: RealNewsArticle[] = [];
    if (q.length > 0 && !intent.matchedCategory && newsArticles.length > 0) {
      matchingNews = newsArticles
        .filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.category.toLowerCase().includes(q) ||
            (n.location?.name && n.location.name.toLowerCase().includes(q))
        )
        .slice(0, 3);
    }

    return {
      categoryKeyword: intent.matchedCategory,
      isSuperlative: intent.isSuperlative,
      isExplicitAll: intent.isExplicitAll,
      requiresLocation: intent.requiresLocation,
      detectedLocality: intent.detectedLocality,
      services: matchingServices,
      zones: matchingZones.slice(0, 5),
      landmarks: matchingLandmarks.slice(0, 4),
      news: matchingNews,
      totalCount:
        matchingServices.length +
        matchingZones.length +
        matchingLandmarks.length +
        matchingNews.length +
        (intent.requiresLocation ? 1 : 0),
    };
  }, [query, services, zones, newsArticles, userLocation]);

  const handleSelectServiceItem = (service: EssentialService) => {
    onSelectService(service);
    setIsOpen(false);
    setQuery(service.name);
    inputRef.current?.blur();
    scrollToMap();
  };

  const handleSelectZoneItem = (zone: Zone) => {
    onSelectZone(zone.id, zone.lat, zone.lng);
    setIsOpen(false);
    setQuery(zone.name);
    inputRef.current?.blur();
    scrollToMap();
  };

  const handleSelectLandmarkItem = (loc: { name: string; lat: number; lng: number }) => {
    if (onSelectCustomLocation) {
      onSelectCustomLocation(loc);
    }
    const matchingZone = zones.find((z) =>
      loc.name.toLowerCase().includes(z.name.toLowerCase()) ||
      z.name.toLowerCase().includes(loc.name.toLowerCase())
    );
    if (matchingZone) {
      onSelectZone(matchingZone.id, loc.lat, loc.lng);
    }
    setIsOpen(false);
    setQuery(loc.name);
    inputRef.current?.blur();
    scrollToMap();
  };

  const handleSelectNewsItem = (article: RealNewsArticle) => {
    if (onSelectNewsArticle) {
      onSelectNewsArticle(article);
    }
    setIsOpen(false);
    setQuery(article.title);
    inputRef.current?.blur();
    scrollToMap();
  };

  const scrollToMap = () => {
    const mapSection = document.getElementById("safety-map-section");
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getServiceIcon = (category: ServiceCategory) => {
    switch (category) {
      case "police":
        return "🚓";
      case "hospital":
        return "🏥";
      case "pharmacy":
        return "💊";
      case "ambulance":
        return "🚑";
      case "fire_station":
        return "🚒";
      default:
        return "🛡️";
    }
  };

  return (
    <>
      {/* Mobile backdrop for tap outside and visual isolation */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs md:hidden"
          onClick={() => {
            setIsOpen(false);
            inputRef.current?.blur();
          }}
          aria-hidden="true"
        />
      )}

      <div
        ref={containerRef}
        className={`relative w-full ${isOpen ? "z-50" : "z-10"} ${className}`}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/90 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 focus-within:border-indigo-500 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-950 transition-all shadow-xs">
          <Search className="h-4 w-4 text-indigo-500 shrink-0 mr-2" />

          <input
            ref={inputRef}
            id="global-search-input"
            data-testid="global-search-input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            aria-label="Search hospitals, police stations, and emergency services"
            className="w-full bg-transparent outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 font-medium min-w-0"
          />

          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Clear search input"
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block ml-1.5 shrink-0 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
              /
            </kbd>
          )}
        </div>

        {/* Autocomplete Results Dropdown */}
        {isOpen && (
          <div
            id="search-autocomplete-dropdown"
            role="listbox"
            className="absolute left-0 top-full mt-1.5 z-50 w-full min-w-full sm:min-w-[340px] md:min-w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-2.5 sm:p-3 animate-in fade-in zoom-in-95 duration-150 max-h-60 sm:max-h-80 overflow-y-auto overscroll-contain space-y-2.5"
          >
            {query.trim().length === 0 ? (
              /* Quick Suggestions when input is empty */
              <div className="space-y-2.5 p-0.5">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1">
                  Quick Category Search
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("hospital");
                      setIsOpen(true);
                    }}
                    className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/60 p-2 text-left transition hover:bg-rose-100 dark:hover:bg-rose-900/60"
                  >
                    <span className="text-base sm:text-lg shrink-0">🏥</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        Hospitals
                      </div>
                      <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold truncate">
                        Find nearest
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setQuery("police");
                      setIsOpen(true);
                    }}
                    className="flex items-center gap-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/60 p-2 text-left transition hover:bg-blue-100 dark:hover:bg-blue-900/60"
                  >
                    <span className="text-base sm:text-lg shrink-0">🚓</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        Police
                      </div>
                      <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold truncate">
                        Find nearest
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setQuery("pharmacy");
                      setIsOpen(true);
                    }}
                    className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-900/60 p-2 text-left transition hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
                  >
                    <span className="text-base sm:text-lg shrink-0">💊</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        Pharmacies
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                        24/7 medical
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setQuery("fire station");
                      setIsOpen(true);
                    }}
                    className="flex items-center gap-2 rounded-xl bg-orange-50 dark:bg-orange-950/50 border border-orange-200/80 dark:border-orange-900/60 p-2 text-left transition hover:bg-orange-100 dark:hover:bg-orange-900/60"
                  >
                    <span className="text-base sm:text-lg shrink-0">🚒</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        Fire Brigade
                      </div>
                      <div className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold truncate">
                        Rescue stations
                      </div>
                    </div>
                  </button>
                </div>

                {/* Popular Nagpur Areas */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1 mb-1.5">
                    Popular Nagpur Sectors
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Sitabuldi",
                      "Dharampeth",
                      "Sadar",
                      "Mahal",
                      "Civil Lines",
                      "Wardha Road",
                      "Ambazari",
                      "MIHAN",
                    ].map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => {
                          setQuery(area);
                          setIsOpen(true);
                        }}
                        className="inline-flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 transition"
                      >
                        <MapPin className="h-3 w-3 text-indigo-500 shrink-0" />
                        <span>{area}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : searchResults.totalCount === 0 ? (
              /* No Results Found */
              <div className="py-6 text-center text-xs text-slate-400 space-y-1">
                <MapPin className="mx-auto h-6 w-6 text-slate-300 dark:text-slate-600 mb-1" />
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  No matching results found for &ldquo;{query}&rdquo;
                </p>
                <p>
                  Try searching &ldquo;hospital&rdquo;, &ldquo;police&rdquo;,
                  &ldquo;Sitabuldi&rdquo;, or &ldquo;Dharampeth&rdquo;.
                </p>
              </div>
            ) : (
              /* Matching Results List */
              <div className="space-y-2.5">
                {/* 1. Nearest Emergency Services (Hospitals, Police, Pharmacies, etc.) */}
                {searchResults.services.length > 0 && (
                  <div>
                    {searchResults.requiresLocation && (
                      <div className="mb-2 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/70 p-2.5 text-xs text-amber-900 dark:text-amber-200">
                        <div className="flex items-center gap-1.5 font-bold mb-1">
                          <Crosshair className="h-4 w-4 text-amber-600 dark:text-amber-400 animate-pulse shrink-0" />
                          <span>Location Reference Needed for &ldquo;Nearest&rdquo; Query</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                          To identify the facility closest to your actual location, please enable browser GPS or specify your neighborhood (e.g. <em>&ldquo;nearest hospital in Dharampeth&rdquo;</em>). Distances below are calculated from central Nagpur (Sitabuldi).
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1 mb-1.5">
                      <span className="truncate mr-2">
                        {searchResults.isSuperlative
                          ? `Closest ${searchResults.categoryKeyword?.toUpperCase()} (Single Result)`
                          : searchResults.isExplicitAll
                          ? `All Verified ${searchResults.categoryKeyword?.toUpperCase()} Services`
                          : searchResults.categoryKeyword
                          ? `Nearest ${searchResults.categoryKeyword.toUpperCase()} Services`
                          : "Essential Emergency Services"}
                      </span>
                      <span className="shrink-0">{searchResults.services.length} found</span>
                    </div>

                    <div className="space-y-1">
                      {searchResults.services.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => handleSelectServiceItem(service)}
                          className="w-full flex items-center justify-between gap-2.5 rounded-xl p-2 text-left transition hover:bg-indigo-50/80 dark:hover:bg-indigo-950/60 hover:border-indigo-200 dark:hover:border-indigo-800/60 border border-transparent group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-sm sm:text-base">
                              {getServiceIcon(service.category)}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate">
                                {service.name}
                              </div>
                              <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {service.address}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span className="rounded-md bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 px-1.5 py-0.5 text-[10px] sm:text-[11px] font-extrabold text-indigo-700 dark:text-indigo-300 whitespace-nowrap">
                              {service.formattedDistance}
                            </span>
                            <span className="text-[10px] sm:text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hidden sm:inline whitespace-nowrap">
                              Map →
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Nagpur City Areas & Crime Risk Zones */}
                {searchResults.zones.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1 mb-1.5">
                      Nagpur Safety Sectors & Areas
                    </div>

                    <div className="space-y-1">
                      {searchResults.zones.map((zone) => (
                        <button
                          key={zone.id}
                          type="button"
                          onClick={() => handleSelectZoneItem(zone)}
                          className="w-full flex items-center justify-between gap-2.5 rounded-xl p-2 text-left transition hover:bg-indigo-50/80 dark:hover:bg-indigo-950/60 border border-transparent group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 font-bold text-xs">
                              📍
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate">
                                {zone.name}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                Sector: {zone.code} · Patrols: {zone.activePatrols} units
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium whitespace-nowrap">
                              {zone.formattedDistance}
                            </span>
                            <span className="text-[10px] sm:text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hidden sm:inline whitespace-nowrap">
                              Focus →
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Popular Landmarks */}
                {searchResults.landmarks.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1 mb-1.5">
                      Landmarks & Public Places
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {searchResults.landmarks.map((loc) => (
                        <button
                          key={loc.name}
                          type="button"
                          onClick={() => handleSelectLandmarkItem(loc)}
                          className="flex items-center justify-between gap-2 rounded-xl p-2 text-left bg-slate-50/60 dark:bg-slate-800/40 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition"
                        >
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            📍 {loc.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {loc.formattedDistance}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Matching Recent Real News Stories */}
                {searchResults.news.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1 mb-1.5">
                      Recent Safety News & Incidents
                    </div>
                    <div className="space-y-1">
                      {searchResults.news.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectNewsItem(item)}
                          className="w-full flex items-center justify-between gap-2 rounded-xl p-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                              🚨 {item.title}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {item.location?.name || "Nagpur"} · {item.relativeTime}
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-indigo-600 shrink-0 ml-1">
                            View →
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
