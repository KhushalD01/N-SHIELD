"use client";

import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import {
  APIProvider,
  Map as GoogleMap,
  Marker,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Calendar,
  CalendarPlus,
  Camera,
  Car,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  Crosshair,
  EyeOff,
  Filter,
  Flame,
  Hospital,
  Info,
  Layers,
  MapPin,
  MousePointerClick,
  Newspaper,
  PhoneCall,
  Pill,
  Radio,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  X,
  Zap,
  Navigation2,
  AlertOctagon,
} from "lucide-react";
import { NightSafetyToggle } from "./NightSafetyToggle";
import type { DisruptionIncident } from "@/lib/routing/types";
import type { RouteOption } from "@/lib/validation/assistantSchemas";
import type {
  BlindSpot,
  CCTVCamera,
  CrimeCategoryFilter,
  Incident,
  PolicePatrolUnit,
  PolygonRiskAnalytics,
  TimeFilterPeriod,
  Zone,
  ZoneCrimeRiskAnalytics,
} from "@/lib/types";
import {
  computeAllZonesCrimeRisk,
  filterIncidentsByCategory,
  filterIncidentsByTime,
} from "@/lib/riskEngine";
import { computeAllPolygonsRisk } from "@/lib/polygonRiskEngine";
import { policePatrolUnits as mockPatrolUnits } from "@/lib/mockData";
import {
  NAGPUR_ESSENTIAL_SERVICES,
  SERVICE_CATEGORIES,
  type EssentialService,
  type ServiceCategory,
} from "@/lib/nearbyServicesData";
import {
  calculateDistanceMeters,
  DEFAULT_NAGPUR_USER_LOCATION,
  formatDistance,
  POPULAR_NAGPUR_LOCATIONS,
  type UserLocation,
} from "@/lib/geoUtils";
import { ServiceInfoCard } from "./ServiceInfoCard";
import { MapOverlayPortal } from "./MapOverlayPortal";
import { findCrimePolygonAtLocation } from "@/lib/nagpurPolygons";
import type { RealNewsArticle } from "@/lib/newsTypes";

const NAGPUR_CENTER = {
  lat: 21.1458,
  lng: 79.0882,
};

const CRIME_CATEGORIES: CrimeCategoryFilter[] = [
  "All Crime",
  "Theft",
  "Robbery",
  "Assault",
  "Vehicle Theft",
  "Burglary",
  "Other",
];

const TIME_FILTERS: TimeFilterPeriod[] = [
  "Today",
  "Last 7 Days",
  "Last 30 Days",
  "Last 6 Months",
  "All Time",
];

export type EmergencyCategoryFilterOption =
  | "none"
  | "all"
  | ServiceCategory;

export const SERVICE_MARKER_CONFIG: Record<
  ServiceCategory,
  {
    color: string;
    darkColor: string;
    label: string;
    glyph: string;
  }
> = {
  police: {
    color: "#2563EB", // Rich Royal Blue
    darkColor: "#1D4ED8",
    label: "Police Station",
    glyph: '<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v2h-2V7zm0 4h2v6h-2v-6z"/>',
  },
  hospital: {
    color: "#DC2626", // Medical Crimson / Red
    darkColor: "#B91C1C",
    label: "Hospital / Trauma Center",
    glyph: '<path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"/>',
  },
  pharmacy: {
    color: "#059669", // Emerald Green
    darkColor: "#047857",
    label: "Pharmacy / Medical Store",
    glyph: '<path d="M4.5 10.5C3.12 11.88 3.12 14.12 4.5 15.5l4 4c1.38 1.38 3.62 1.38 5 0l6-6c1.38-1.38 1.38-3.62 0-5l-4-4c-1.38-1.38-3.62-1.38-5 0l-6 6zm7.25-2.25l4 4-2.5 2.5-4-4 2.5-2.5z"/>',
  },
  ambulance: {
    color: "#D97706", // Amber
    darkColor: "#B45309",
    label: "Ambulance / Emergency EMS",
    glyph: '<path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5zm6-3h2v2h2v2h-2v2h-2v-2H9v-2h2V8z"/>',
  },
  fire_station: {
    color: "#EA580C", // Flame Orange
    darkColor: "#C2410C",
    label: "Fire & Rescue Station",
    glyph: '<path d="M12 2c-.3 0-.6.1-.8.3-2.1 1.9-4.2 4.6-4.2 7.7 0 4.4 3.6 8 8 8s8-3.6 8-8c0-3.1-2.1-5.8-4.2-7.7-.2-.2-.5-.3-.8-.3-.6 0-1.1.4-1.3 1-.3 1.2-1.1 2.2-2.2 2.7-.4.2-.9.2-1.3 0-1.1-.5-1.9-1.5-2.2-2.7-.2-.6-.7-1-1.3-1zm0 13c-1.7 0-3-1.3-3-3 0-1.2.7-2.3 1.7-2.8.3-.2.7-.2 1 0 .6.4 1.3.8 2.3.8s1.7-.4 2.3-.8c.3-.2.7-.2 1 0 1 .5 1.7 1.6 1.7 2.8 0 1.7-1.3 3-3 3z"/>',
  },
  emergency_other: {
    color: "#7C3AED", // Royal Violet
    darkColor: "#6D28D9",
    label: "Emergency Helpline / Squad",
    glyph: '<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>',
  },
};

export function getServiceMarkerIcon(
  category: ServiceCategory,
  isSelected: boolean = false,
  clusterCount: number = 1
): google.maps.Icon | string {
  const config = SERVICE_MARKER_CONFIG[category] || SERVICE_MARKER_CONFIG.police;
  const w = isSelected ? 38 : 30;
  const h = isSelected ? 48 : 38;
  const r = (w - 4) / 2;
  const cx = w / 2;
  const cy = r + 2;
  const tipY = h - 2;

  const pathD = `M ${cx} ${tipY} C ${cx + 4} ${tipY - 8}, ${w - 2} ${cy + 6}, ${w - 2} ${cy} A ${r} ${r} 0 1 0 2 ${cy} C 2 ${cy + 6}, ${cx - 4} ${tipY - 8}, ${cx} ${tipY} Z`;
  const strokeColor = isSelected ? "#FDE047" : "#FFFFFF";
  const strokeWidth = isSelected ? "2.5" : "1.5";
  const innerR = r * 0.58;

  const badgeSvg =
    clusterCount > 1
      ? `<circle cx="${w - 6}" cy="7" r="6" fill="#4F46E5" stroke="#FFFFFF" stroke-width="1.2"/>
  <text x="${w - 6}" y="9.5" font-size="7.5" font-family="sans-serif" font-weight="900" fill="#FFFFFF" text-anchor="middle">${clusterCount}</text>`
      : "";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <filter id="sh-${category}${isSelected ? "-sel" : ""}" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.38"/>
    </filter>
  </defs>
  <path filter="url(#sh-${category}${isSelected ? "-sel" : ""})" d="${pathD}" fill="${config.color}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>
  <circle cx="${cx}" cy="${cy}" r="${innerR}" fill="#FFFFFF"/>
  <g transform="translate(${cx - 7}, ${cy - 7}) scale(0.583)" fill="${config.color}">
    ${config.glyph}
  </g>
  ${badgeSvg}
</svg>`;

  const dataUri = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

  if (typeof window !== "undefined" && window.google?.maps?.Size && window.google?.maps?.Point) {
    return {
      url: dataUri,
      scaledSize: new window.google.maps.Size(w, h),
      anchor: new window.google.maps.Point(cx, tipY),
    };
  }

  return dataUri;
}

export function getCrimeIncidentMarkerIcon(): google.maps.Icon | string {
  const w = 26;
  const h = 34;
  const r = (w - 4) / 2;
  const cx = w / 2;
  const cy = r + 2;
  const tipY = h - 2;

  const pathD = `M ${cx} ${tipY} C ${cx + 3} ${tipY - 6}, ${w - 2} ${cy + 5}, ${w - 2} ${cy} A ${r} ${r} 0 1 0 2 ${cy} C 2 ${cy + 5}, ${cx - 3} ${tipY - 6}, ${cx} ${tipY} Z`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <filter id="sh-incident" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
  </defs>
  <path filter="url(#sh-incident)" d="${pathD}" fill="#991B1B" stroke="#FEE2E2" stroke-width="1.5" stroke-linejoin="round"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.55}" fill="#FFFFFF"/>
  <path d="M ${cx} ${cy - 4} L ${cx} ${cy + 1} M ${cx} ${cy + 3} L ${cx} ${cy + 3.5}" stroke="#991B1B" stroke-width="2" stroke-linecap="round"/>
</svg>`;

  const dataUri = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

  if (typeof window !== "undefined" && window.google?.maps?.Size && window.google?.maps?.Point) {
    return {
      url: dataUri,
      scaledSize: new window.google.maps.Size(w, h),
      anchor: new window.google.maps.Point(cx, tipY),
    };
  }

  return dataUri;
}

const GOOGLE_MAPS_DARK_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#cbd5e1" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#475569" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#334155" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#334155" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#cbd5e1" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0284c7" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#38bdf8" }],
  },
];

/**
 * Custom Native Google Maps Circle Component
 */
interface GoogleCircleProps {
  center: { lat: number; lng: number };
  radius: number;
  options: google.maps.CircleOptions;
  onClick?: () => void;
}

function GoogleCircle({ center, radius, options, onClick }: GoogleCircleProps) {
  const map = useMap();
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!circleRef.current) {
      circleRef.current = new google.maps.Circle({
        map,
        center,
        radius,
        ...options,
      });
    } else {
      circleRef.current.setCenter(center);
      circleRef.current.setRadius(radius);
      circleRef.current.setOptions({ ...options, map });
    }

    let listener: google.maps.MapsEventListener | null = null;
    if (onClick && circleRef.current) {
      listener = circleRef.current.addListener("click", onClick);
    }

    return () => {
      if (listener) google.maps.event.removeListener(listener);
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
    };
  }, [map, center.lat, center.lng, radius, options.fillColor, options.strokeColor, options.strokeWeight, options.fillOpacity]);

  return null;
}

/**
 * Custom Native Google Maps Polygon Component
 */
interface GooglePolygonProps {
  paths: { lat: number; lng: number }[];
  options: google.maps.PolygonOptions;
  onClick?: (e?: google.maps.MapMouseEvent | any) => void;
  onMouseOver?: () => void;
  onMouseOut?: () => void;
}

function GooglePolygon({ paths, options, onClick, onMouseOver, onMouseOut }: GooglePolygonProps) {
  const map = useMap();
  const polygonRef = useRef<google.maps.Polygon | null>(null);

  useEffect(() => {
    if (!map || !paths || paths.length < 3) {
      if (polygonRef.current) {
        polygonRef.current.setMap(null);
        polygonRef.current = null;
      }
      return;
    }

    if (!polygonRef.current) {
      polygonRef.current = new google.maps.Polygon({
        map,
        paths,
        ...options,
      });
    } else {
      polygonRef.current.setPaths(paths);
      polygonRef.current.setOptions({ ...options, map });
    }

    const listeners: google.maps.MapsEventListener[] = [];
    if (polygonRef.current) {
      if (onClick) {
        listeners.push(
          polygonRef.current.addListener("click", (e: google.maps.MapMouseEvent) => {
            if (e && typeof e.stop === "function") {
              e.stop();
            }
            onClick(e);
          })
        );
      }
      if (onMouseOver) {
        listeners.push(polygonRef.current.addListener("mouseover", onMouseOver));
      }
      if (onMouseOut) {
        listeners.push(polygonRef.current.addListener("mouseout", onMouseOut));
      }
    }

    return () => {
      listeners.forEach((l) => google.maps.event.removeListener(l));
      if (polygonRef.current) {
        polygonRef.current.setMap(null);
        polygonRef.current = null;
      }
    };
  }, [
    map,
    paths,
    options.fillColor,
    options.fillOpacity,
    options.strokeColor,
    options.strokeWeight,
    options.strokeOpacity,
    options.zIndex,
    onClick,
    onMouseOver,
    onMouseOut,
  ]);

  return null;
}

interface GooglePolylineProps {
  path: [number, number][];
  options: google.maps.PolylineOptions;
  onClick?: () => void;
}

function GooglePolyline({ path, options, onClick }: GooglePolylineProps) {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || !path || path.length < 2) {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      return;
    }

    const googlePath = path.map(([lat, lng]) => ({ lat, lng }));

    if (!polylineRef.current) {
      polylineRef.current = new google.maps.Polyline({
        map,
        path: googlePath,
        ...options,
      });
    } else {
      polylineRef.current.setPath(googlePath);
      polylineRef.current.setOptions({ ...options, map });
    }

    let listener: google.maps.MapsEventListener | null = null;
    if (onClick && polylineRef.current) {
      listener = polylineRef.current.addListener("click", onClick);
    }

    return () => {
      if (listener) google.maps.event.removeListener(listener);
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
    };
  }, [map, path, options.strokeColor, options.strokeWeight, options.strokeOpacity, options.zIndex]);

  return null;
}

/**
 * Helper to smoothly pan/zoom camera when targeted
 */
function MapCameraHandler({ targetLocation }: { targetLocation: { lat: number; lng: number } | null }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !targetLocation) return;
    map.panTo(targetLocation);
    const currentZoom = map.getZoom() || 13;
    if (currentZoom < 14) {
      map.setZoom(14.5);
    }
  }, [map, targetLocation]);

  return null;
}

export interface GoogleNagpurMapProps {
  className?: string;
  incidents?: Incident[];
  zones?: Zone[];
  cameras?: CCTVCamera[];
  blindSpots?: BlindSpot[];
  patrolUnits?: PolicePatrolUnit[];
  essentialServices?: EssentialService[];
  realNewsArticles?: RealNewsArticle[];
  selectedNewsArticle?: RealNewsArticle | null;
  onSelectNewsArticle?: (article: RealNewsArticle | null) => void;
  loading?: boolean;
  error?: string | null;
  nightSafetyMode?: boolean;
  onToggleNightSafety?: (enabled: boolean) => void;
  onSimulateEvent?: () => void;
  showSimulateEvent?: boolean;
  isFiltersOpen?: boolean;
  onToggleFilters?: (open: boolean) => void;
  simulatedHour?: number;
  onZoneSelect?: (zoneId: string | null) => void;
  selectedZoneId?: string | null;
  userLocation?: UserLocation;
  onUpdateUserLocation?: (loc: UserLocation) => void;
  selectedService?: EssentialService | null;
  onSelectService?: (service: EssentialService | null) => void;
  activeServiceCategoryFilter?: ServiceCategory | null;
  activeRoute?: RouteOption | null;
  alternativeRoutes?: RouteOption[];
  routeDisruptions?: DisruptionIncident[];
  onSelectRoute?: (route: RouteOption) => void;
  isPickingLocationOnMap?: boolean;
  onFinishPickingLocationOnMap?: () => void;
}

export default function GoogleNagpurMap({
  className = "",
  incidents = [],
  zones = [],
  cameras = [],
  blindSpots = [],
  patrolUnits = mockPatrolUnits,
  essentialServices = NAGPUR_ESSENTIAL_SERVICES,
  realNewsArticles = [],
  selectedNewsArticle = null,
  onSelectNewsArticle,
  loading = false,
  error = null,
  nightSafetyMode: propNightSafetyMode = false,
  onToggleNightSafety,
  onSimulateEvent,
  showSimulateEvent = true,
  isFiltersOpen: propIsFiltersOpen,
  onToggleFilters,
  simulatedHour = 22,
  onZoneSelect,
  selectedZoneId = null,
  userLocation: propUserLocation,
  onUpdateUserLocation,
  selectedService: propSelectedService = null,
  onSelectService: propOnSelectService,
  activeServiceCategoryFilter = null,
  activeRoute = null,
  alternativeRoutes = [],
  routeDisruptions = [],
  onSelectRoute,
  isPickingLocationOnMap = false,
  onFinishPickingLocationOnMap,
}: GoogleNagpurMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Selected disruption for map info window
  const [selectedDisruption, setSelectedDisruption] = useState<DisruptionIncident | null>(null);

  // Night Safety Mode State (controlled/uncontrolled)
  const [internalNightSafety, setInternalNightSafety] = useState(propNightSafetyMode);
  const nightSafetyMode = propNightSafetyMode ?? internalNightSafety;

  const handleNightSafetyToggle = (enabled: boolean) => {
    setInternalNightSafety(enabled);
    if (onToggleNightSafety) {
      onToggleNightSafety(enabled);
    }
  };

  // Citizen user location state
  const [internalUserLocation, setInternalUserLocation] = useState<UserLocation>(
    propUserLocation || DEFAULT_NAGPUR_USER_LOCATION
  );
  const userLocation = propUserLocation || internalUserLocation;

  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [targetCameraLocation, setTargetCameraLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Collapsible Filter Section Shared State (controlled/uncontrolled)
  const [internalFiltersOpen, setInternalFiltersOpen] = useState(true);
  const isFiltersOpen = propIsFiltersOpen ?? internalFiltersOpen;

  const toggleFilters = useCallback(() => {
    const nextState = !isFiltersOpen;
    if (onToggleFilters) {
      onToggleFilters(nextState);
    } else {
      setInternalFiltersOpen(nextState);
    }
  }, [isFiltersOpen, onToggleFilters]);

  // Trigger window resize so map updates layout after collapse/expand transition
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("resize"));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [isFiltersOpen]);

  // Crime Filter States
  const [selectedCategory, setSelectedCategory] = useState<CrimeCategoryFilter>("All Crime");
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimeFilterPeriod>("Last 30 Days");
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);
  const [showFullZoneDetails, setShowFullZoneDetails] = useState(false);
  const filtersBtnRef = useRef<HTMLButtonElement | null>(null);
  const filtersDropdownRef = useRef<HTMLDivElement | null>(null);

  // Click outside to dismiss extra filters dropdown
  useEffect(() => {
    if (!showFiltersDropdown) return;
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (
        filtersDropdownRef.current &&
        !filtersDropdownRef.current.contains(target) &&
        filtersBtnRef.current &&
        !filtersBtnRef.current.contains(target)
      ) {
        setShowFiltersDropdown(false);
      }
    };
    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [showFiltersDropdown]);

  // Nearby Services Layer Toggle State - default to none or activeCategoryFilter
  const [showNearbyServicesPanel, setShowNearbyServicesPanel] = useState(false);
  const [serviceCategoryToggles, setServiceCategoryToggles] = useState<Record<ServiceCategory, boolean>>(() => ({
    police: activeServiceCategoryFilter === "police",
    hospital: activeServiceCategoryFilter === "hospital",
    pharmacy: activeServiceCategoryFilter === "pharmacy",
    ambulance: activeServiceCategoryFilter === "ambulance",
    fire_station: activeServiceCategoryFilter === "fire_station",
    emergency_other: activeServiceCategoryFilter === "emergency_other",
  }));

  const nearbyServicesBtnRef = useRef<HTMLButtonElement | null>(null);
  const nearbyServicesPanelRef = useRef<HTMLDivElement | null>(null);
  const topControlsContainerRef = useRef<HTMLDivElement | null>(null);
  const [topControlsHeight, setTopControlsHeight] = useState(60);
  const [nearbyServicesTab, setNearbyServicesTab] = useState<"categories" | "facilities">("categories");
  const [nearbyFacilitySearch, setNearbyFacilitySearch] = useState("");

  // Dynamically observe top filter controls container height (without nearby services panel inside)
  useEffect(() => {
    const el = topControlsContainerRef.current;
    if (!el) return;
    const updateHeight = () => {
      const h = el.offsetHeight;
      if (h > 0) setTopControlsHeight(h);
    };
    updateHeight();
    const ro = new ResizeObserver(updateHeight);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isFiltersOpen]);

  const panelTopOffset = Math.max(topControlsHeight + 8, isFiltersOpen ? 176 : 64);

  // Close nearby services panel when filters collapse
  useEffect(() => {
    if (!isFiltersOpen) {
      setShowNearbyServicesPanel(false);
    }
  }, [isFiltersOpen]);

  // When Nearby Services is opened, avoid overlapping panels on mobile / smaller screens
  useEffect(() => {
    if (showNearbyServicesPanel) {
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setActivePolygonDetail(null);
        setActiveZoneDetail(null);
        lastHandledZoneIdRef.current = null;
        if (onZoneSelect) onZoneSelect(null);
      }
    }
  }, [showNearbyServicesPanel, onZoneSelect]);

  // Click-outside and Escape key dismissal for Nearby Services panel
  useEffect(() => {
    if (!showNearbyServicesPanel) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (
        nearbyServicesPanelRef.current &&
        !nearbyServicesPanelRef.current.contains(target) &&
        nearbyServicesBtnRef.current &&
        !nearbyServicesBtnRef.current.contains(target)
      ) {
        setShowNearbyServicesPanel(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowNearbyServicesPanel(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showNearbyServicesPanel]);

  const categoryCounts = useMemo(() => {
    const counts: Record<ServiceCategory, number> = {
      police: 0,
      hospital: 0,
      pharmacy: 0,
      ambulance: 0,
      fire_station: 0,
      emergency_other: 0,
    };
    for (const s of essentialServices) {
      if (counts[s.category] !== undefined) {
        counts[s.category]++;
      }
    }
    return counts;
  }, [essentialServices]);

  // Selection states for popups
  const [activePolygonDetail, setActivePolygonDetail] = useState<PolygonRiskAnalytics | null>(null);
  const [hoveredPolygonId, setHoveredPolygonId] = useState<string | null>(null);
  const [activeZoneDetail, setActiveZoneDetail] = useState<ZoneCrimeRiskAnalytics | null>(null);
  const [activeService, setActiveService] = useState<EssentialService | null>(propSelectedService);
  const [activeClusterModal, setActiveClusterModal] = useState<{
    id: string;
    lat: number;
    lng: number;
    services: EssentialService[];
  } | null>(null);
  const [isMapsApiReady, setIsMapsApiReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.google?.maps?.Point && window.google?.maps?.Size) {
      setIsMapsApiReady(true);
      return;
    }
    const timer = setInterval(() => {
      if (typeof window !== "undefined" && window.google?.maps?.Point && window.google?.maps?.Size) {
        setIsMapsApiReady(true);
        clearInterval(timer);
      }
    }, 200);
    return () => clearInterval(timer);
  }, []);
  const [activeNewsArticle, setActiveNewsArticle] = useState<RealNewsArticle | null>(selectedNewsArticle);
  const [selectedCrimeIncident, setSelectedCrimeIncident] = useState<Incident | null>(null);
  const [selectedClickLocation, setSelectedClickLocation] = useState<{
    lat: number;
    lng: number;
    screenX?: number;
    screenY?: number;
  } | null>(null);
  const [selectedCamera, setSelectedCamera] = useState<CCTVCamera | null>(null);
  const [selectedPatrol, setSelectedPatrol] = useState<PolicePatrolUnit | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [isLegendCollapsed, setIsLegendCollapsed] = useState(false);

  const handleSelectCategoryFilter = useCallback(
    (filter: EmergencyCategoryFilterOption) => {
      switch (filter) {
        case "none":
          setServiceCategoryToggles({
            police: false,
            hospital: false,
            pharmacy: false,
            ambulance: false,
            fire_station: false,
            emergency_other: false,
          });
          setActiveService(null);
          break;
        case "all":
          setServiceCategoryToggles({
            police: true,
            hospital: true,
            pharmacy: true,
            ambulance: true,
            fire_station: true,
            emergency_other: true,
          });
          break;
        case "police":
          setServiceCategoryToggles({
            police: true,
            hospital: false,
            pharmacy: false,
            ambulance: false,
            fire_station: false,
            emergency_other: false,
          });
          if (activeService && activeService.category !== "police") {
            setActiveService(null);
          }
          break;
        case "hospital":
          setServiceCategoryToggles({
            police: false,
            hospital: true,
            pharmacy: false,
            ambulance: false,
            fire_station: false,
            emergency_other: false,
          });
          if (activeService && activeService.category !== "hospital") {
            setActiveService(null);
          }
          break;
        case "pharmacy":
          setServiceCategoryToggles({
            police: false,
            hospital: false,
            pharmacy: true,
            ambulance: false,
            fire_station: false,
            emergency_other: false,
          });
          if (activeService && activeService.category !== "pharmacy") {
            setActiveService(null);
          }
          break;
        case "fire_station":
          setServiceCategoryToggles({
            police: false,
            hospital: false,
            pharmacy: false,
            ambulance: false,
            fire_station: true,
            emergency_other: false,
          });
          if (activeService && activeService.category !== "fire_station") {
            setActiveService(null);
          }
          break;
        case "ambulance":
        case "emergency_other":
          setServiceCategoryToggles({
            police: false,
            hospital: false,
            pharmacy: false,
            ambulance: true,
            fire_station: false,
            emergency_other: true,
          });
          if (
            activeService &&
            activeService.category !== "emergency_other" &&
            activeService.category !== "ambulance"
          ) {
            setActiveService(null);
          }
          break;
      }
    },
    [activeService]
  );

  const currentCategorySelection: EmergencyCategoryFilterOption | "custom" = useMemo(() => {
    const keys = Object.keys(serviceCategoryToggles) as ServiceCategory[];
    const activeKeys = keys.filter((k) => serviceCategoryToggles[k]);
    if (activeKeys.length === 0) return "none";
    if (activeKeys.length === keys.length) return "all";
    if (activeKeys.length === 1) {
      if (activeKeys[0] === "police") return "police";
      if (activeKeys[0] === "hospital") return "hospital";
      if (activeKeys[0] === "pharmacy") return "pharmacy";
      if (activeKeys[0] === "fire_station") return "fire_station";
      if (activeKeys[0] === "emergency_other" || activeKeys[0] === "ambulance") return "emergency_other";
    }
    if (activeKeys.length === 2 && activeKeys.includes("emergency_other") && activeKeys.includes("ambulance")) {
      return "emergency_other";
    }
    return "custom";
  }, [serviceCategoryToggles]);

  const handleToggleAllServices = useCallback((enableAll: boolean) => {
    handleSelectCategoryFilter(enableAll ? "all" : "none");
  }, [handleSelectCategoryFilter]);

  // Base Layers Toggles
  const [layerToggles, setLayerToggles] = useState({
    crimeRisk: true,
    crimeIncidents: false,
    realNews: true,
    cctvCameras: false,
    policePatrols: false,
  });

  // Sync prop changes for selectedService
  useEffect(() => {
    if (propSelectedService !== undefined) {
      setActiveService(propSelectedService);
      if (propSelectedService) {
        setTargetCameraLocation({ lat: propSelectedService.lat, lng: propSelectedService.lng });
        setServiceCategoryToggles((prev) => ({
          ...prev,
          [propSelectedService.category]: true,
        }));
      }
    }
  }, [propSelectedService]);

  // Sync external news article selection (e.g. from Real News section)
  useEffect(() => {
    if (selectedNewsArticle !== undefined) {
      setActiveNewsArticle(selectedNewsArticle);
      if (selectedNewsArticle?.location) {
        setTargetCameraLocation({
          lat: selectedNewsArticle.location.lat,
          lng: selectedNewsArticle.location.lng,
        });
        setActiveService(null);
        setActiveZoneDetail(null);
      }
    }
  }, [selectedNewsArticle]);

  // Sync external category filter trigger
  useEffect(() => {
    if (activeServiceCategoryFilter) {
      handleSelectCategoryFilter(activeServiceCategoryFilter);
    }
  }, [activeServiceCategoryFilter, handleSelectCategoryFilter]);

  // GPS Geolocation Handler
  const handleDetectLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLoc: UserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          label: "Your GPS Location",
        };
        setInternalUserLocation(newLoc);
        if (onUpdateUserLocation) onUpdateUserLocation(newLoc);
        setTargetCameraLocation({ lat: newLoc.lat, lng: newLoc.lng });
        setIsDetectingGps(false);
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
        setIsDetectingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [onUpdateUserLocation]);

  const toggleServiceCategory = (cat: ServiceCategory) => {
    setServiceCategoryToggles((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const zoneAnalyticsList = useMemo(() => {
    if (zones.length === 0) return [];
    return computeAllZonesCrimeRisk(
      zones,
      incidents,
      selectedTimePeriod,
      selectedCategory,
      cameras,
      simulatedHour
    );
  }, [zones, incidents, selectedTimePeriod, selectedCategory, cameras, simulatedHour]);

  // ---------------------------------------------------------------------------
  // Polygon-Based Crime Risk Analytics (16 Contiguous Irregular Municipal Sectors)
  // ---------------------------------------------------------------------------
  const polygonRiskAnalyticsList = useMemo(() => {
    return computeAllPolygonsRisk(
      incidents,
      cameras,
      selectedTimePeriod,
      selectedCategory,
      simulatedHour
    );
  }, [incidents, cameras, selectedTimePeriod, selectedCategory, simulatedHour]);

  const lastHandledZoneIdRef = useRef<string | null>(null);

  useEffect(() => {
    // If selectedZoneId is null or cleared externally / on close
    if (!selectedZoneId) {
      if (lastHandledZoneIdRef.current !== null) {
        lastHandledZoneIdRef.current = null;
        setActivePolygonDetail(null);
        setActiveZoneDetail(null);
      }
      return;
    }

    // Skip if selectedZoneId has already been processed to prevent re-opening loops
    if (selectedZoneId === lastHandledZoneIdRef.current) {
      return;
    }
    lastHandledZoneIdRef.current = selectedZoneId;

    const foundPoly = polygonRiskAnalyticsList.find(
      (p) => p.polygonId === selectedZoneId || p.zoneId === selectedZoneId
    );
    if (foundPoly) {
      setActivePolygonDetail(foundPoly);
      setTargetCameraLocation({ lat: foundPoly.center.lat, lng: foundPoly.center.lng });
    }
    const found = zoneAnalyticsList.find(
      (z) => z.zoneId === selectedZoneId || (foundPoly && z.zoneId === foundPoly.zoneId)
    );
    if (found) {
      setActiveZoneDetail(found);
      if (!foundPoly) {
        setTargetCameraLocation({ lat: found.lat, lng: found.lng });
      }
    }
  }, [selectedZoneId, zoneAnalyticsList, polygonRiskAnalyticsList]);

  const handleCloseRegionDetails = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      setActivePolygonDetail(null);
      setActiveZoneDetail(null);
      setSelectedCrimeIncident(null);
      setSelectedClickLocation(null);
      lastHandledZoneIdRef.current = null;
      if (onZoneSelect) {
        onZoneSelect(null);
      }
    },
    [onZoneSelect]
  );

  const handleMapClick = useCallback(
    (e: any) => {
      if (!e || !e.detail || !e.detail.latLng) return;
      const lat = e.detail.latLng.lat;
      const lng = e.detail.latLng.lng;
      const clickPos = e.detail.domEvent ? { x: e.detail.domEvent.clientX, y: e.detail.domEvent.clientY } : undefined;

      // Handle manual user origin selection on map
      if (isPickingLocationOnMap) {
        const pickedLoc: UserLocation = {
          lat,
          lng,
          label: `Selected Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          isUserSet: true,
          source: "manual",
        };
        setInternalUserLocation(pickedLoc);
        if (onUpdateUserLocation) onUpdateUserLocation(pickedLoc);
        setTargetCameraLocation({ lat, lng });
        if (onFinishPickingLocationOnMap) onFinishPickingLocationOnMap();
        return;
      }

      const targetPoly = findCrimePolygonAtLocation(lat, lng, polygonRiskAnalyticsList);
      if (targetPoly) {
        setActivePolygonDetail(targetPoly);
        const matchingZone = zoneAnalyticsList.find((z) => z.zoneId === targetPoly.zoneId);
        setActiveZoneDetail(matchingZone || null);
        setActiveService(null);
        setActiveNewsArticle(null);
        setSelectedCrimeIncident(null);
        setShowNearbyServicesPanel(false);
        setSelectedClickLocation({
          lat,
          lng,
          screenX: clickPos?.x,
          screenY: clickPos?.y,
        });
        lastHandledZoneIdRef.current = targetPoly.polygonId;
        if (onZoneSelect) onZoneSelect(targetPoly.polygonId);
      }
    },
    [isPickingLocationOnMap, onUpdateUserLocation, onFinishPickingLocationOnMap, polygonRiskAnalyticsList, zoneAnalyticsList, onZoneSelect]
  );

  const visibleServices = useMemo(() => {
    const seenIds = new Set<string>();
    return essentialServices.filter((s) => {
      // Must have valid unique ID
      if (!s.id || seenIds.has(s.id)) return false;
      // Must have valid numeric coordinates
      if (typeof s.lat !== "number" || typeof s.lng !== "number" || isNaN(s.lat) || isNaN(s.lng)) return false;
      if (s.lat < -90 || s.lat > 90 || s.lng < -180 || s.lng > 180) return false;
      // Must match active toggle for its category
      if (!s.category || !serviceCategoryToggles[s.category]) return false;
      seenIds.add(s.id);
      return true;
    });
  }, [essentialServices, serviceCategoryToggles]);

  // Spatial Proximity Clusters (< 45 meters) to cleanly handle co-located medical complexes & overlapping pins
  const serviceSpatialClusters = useMemo(() => {
    const clusters: {
      id: string;
      lat: number;
      lng: number;
      services: EssentialService[];
    }[] = [];
    const thresholdMeters = 45;

    for (const service of visibleServices) {
      let matchedCluster = null;
      for (const cl of clusters) {
        const d = calculateDistanceMeters(service.lat, service.lng, cl.lat, cl.lng);
        if (d <= thresholdMeters) {
          matchedCluster = cl;
          break;
        }
      }
      if (matchedCluster) {
        matchedCluster.services.push(service);
      } else {
        clusters.push({
          id: `cluster-${service.id}`,
          lat: service.lat,
          lng: service.lng,
          services: [service],
        });
      }
    }
    return clusters;
  }, [visibleServices]);

  const sortedVisibleServices = useMemo(() => {
    return visibleServices
      .map((s) => ({
        ...s,
        distanceMeters: calculateDistanceMeters(userLocation.lat, userLocation.lng, s.lat, s.lng),
      }))
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
  }, [visibleServices, userLocation]);

  const filteredServicesList = useMemo(() => {
    if (!nearbyFacilitySearch.trim()) return sortedVisibleServices;
    const q = nearbyFacilitySearch.toLowerCase().trim();
    return sortedVisibleServices.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }, [sortedVisibleServices, nearbyFacilitySearch]);

  const toggleLayer = (layerKey: keyof typeof layerToggles) => {
    setLayerToggles((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const handleSelectServiceItem = (srv: EssentialService) => {
    setActiveService(srv);
    setActiveNewsArticle(null);
    setActiveZoneDetail(null);
    setActivePolygonDetail(null);
    setShowNearbyServicesPanel(false);
    lastHandledZoneIdRef.current = null;
    if (onZoneSelect) onZoneSelect(null);
    if (propOnSelectService) propOnSelectService(srv);
    setTargetCameraLocation({ lat: srv.lat, lng: srv.lng });
  };

  if (!apiKey) {
    return (
      <div className={`flex h-full w-full flex-col items-center justify-center bg-slate-950 p-6 text-center text-white ${className}`}>
        <ShieldAlert className="h-12 w-12 text-rose-500" />
        <h3 className="mt-3 text-lg font-bold">Google Maps API Key Required</h3>
        <p className="mt-1 max-w-md text-xs text-slate-400">
          Please verify that <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> is configured in your <code>.env.local</code> file.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      className={`relative h-full w-full ${nightSafetyMode ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"} ${className}`}
    >
      
      {/* --------------------------------------------------------------------- */}
      {/* 1. TOP CONTROL BAR: FILTER CONTROLS & MAP ACTION BAR                  */}
      {/* --------------------------------------------------------------------- */}
      <div
        ref={topControlsContainerRef}
        className="absolute top-2 sm:top-2.5 left-2 sm:left-3 right-2 sm:right-3 z-30 pointer-events-none flex flex-col sm:flex-row items-start justify-between gap-2.5"
      >
        {/* Left: Filter Controls Panel matching the reference UI */}
        <div className="pointer-events-auto flex flex-col min-w-0">
          <div className="flex flex-col gap-1.5 rounded-2xl bg-[#0c1427]/95 p-2 sm:p-2.5 shadow-2xl backdrop-blur-md border border-slate-700/80 text-slate-100">
            {/* Row 1 — [ Filters v ] [ Services: All Services v ] [ Nearby Directory ] [ Risk Polygons ] [ Incident Pins ] */}
            <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto no-scrollbar">
              {/* Filters button with dropdown for extra layers */}
              <div className="relative shrink-0">
                <button
                  ref={filtersBtnRef}
                  type="button"
                  onClick={() => setShowFiltersDropdown((prev) => !prev)}
                  aria-expanded={showFiltersDropdown}
                  aria-label="Toggle Filter Options"
                  className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold transition-all shadow-xs cursor-pointer border whitespace-nowrap ${
                    showFiltersDropdown || !layerToggles.realNews || !layerToggles.cctvCameras || !layerToggles.policePatrols
                      ? "bg-slate-800 text-indigo-400 border-indigo-500/50"
                      : "bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border-slate-700/80"
                  }`}
                >
                  <Filter className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Filters</span>
                  <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${showFiltersDropdown ? "rotate-180" : ""}`} />
                </button>

                {/* Popover Menu for Additional Filters */}
                {showFiltersDropdown && (
                  <div
                    ref={filtersDropdownRef}
                    className="absolute left-0 top-full mt-1.5 z-50 w-52 rounded-xl bg-slate-900/95 border border-slate-700 shadow-2xl p-2 flex flex-col gap-1 backdrop-blur-md"
                  >
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-1 border-b border-slate-800">
                      Additional Map Layers
                    </div>
                    {/* Real News */}
                    <label className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-800/80 cursor-pointer text-xs font-semibold text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <span>🚨</span>
                        <span>Real News Feed</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={layerToggles.realNews}
                        onChange={() => toggleLayer("realNews")}
                        className="rounded accent-indigo-500 cursor-pointer h-3.5 w-3.5"
                      />
                    </label>
                    {/* CCTV */}
                    <label className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-800/80 cursor-pointer text-xs font-semibold text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <span>📹</span>
                        <span>CCTV Cameras</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={layerToggles.cctvCameras}
                        onChange={() => toggleLayer("cctvCameras")}
                        className="rounded accent-indigo-500 cursor-pointer h-3.5 w-3.5"
                      />
                    </label>
                    {/* Patrols */}
                    <label className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-800/80 cursor-pointer text-xs font-semibold text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <span>🚓</span>
                        <span>Police Patrols</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={layerToggles.policePatrols}
                        onChange={() => toggleLayer("policePatrols")}
                        className="rounded accent-indigo-500 cursor-pointer h-3.5 w-3.5"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Services: Dropdown */}
              <div className="relative flex items-center gap-1 bg-slate-800/90 hover:bg-slate-700/90 px-2.5 py-1 rounded-xl border border-slate-700/80 shadow-xs text-xs font-bold text-slate-200 cursor-pointer shrink-0">
                <Compass className="h-3.5 w-3.5 text-indigo-400 shrink-0 pointer-events-none" />
                <span className="text-[11px] font-bold text-slate-300 shrink-0 pointer-events-none">Services:</span>
                <select
                  id="emergency-service-category-selector"
                  value={currentCategorySelection}
                  onChange={(e) => handleSelectCategoryFilter(e.target.value as EmergencyCategoryFilterOption)}
                  aria-label="Filter emergency services by category"
                  className="bg-transparent text-slate-100 text-xs font-bold pr-4 focus:outline-none cursor-pointer appearance-none"
                >
                  <option value="none" className="bg-slate-900 text-slate-200">Off</option>
                  <option value="all" className="bg-slate-900 text-slate-200">All Services</option>
                  <option value="police" className="bg-slate-900 text-slate-200">Police</option>
                  <option value="hospital" className="bg-slate-900 text-slate-200">Hospitals</option>
                  <option value="pharmacy" className="bg-slate-900 text-slate-200">Pharmacies</option>
                  <option value="fire_station" className="bg-slate-900 text-slate-200">Fire</option>
                  <option value="emergency_other" className="bg-slate-900 text-slate-200">Emergency</option>
                  {currentCategorySelection === "custom" && <option value="custom" className="bg-slate-900 text-slate-200">Custom</option>}
                </select>
                <ChevronDown className="h-3 w-3 text-slate-400 pointer-events-none -ml-3" />
              </div>

              {/* Nearby Directory */}
              <button
                ref={nearbyServicesBtnRef}
                type="button"
                onClick={() => setShowNearbyServicesPanel((prev) => !prev)}
                aria-expanded={showNearbyServicesPanel}
                aria-label="Toggle Nearby Services Panel"
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold transition-all shadow-xs cursor-pointer border whitespace-nowrap shrink-0 ${
                  showNearbyServicesPanel
                    ? "bg-indigo-600 text-white border-indigo-400 shadow-md"
                    : "bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border-slate-700/80"
                }`}
              >
                <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                <span>Nearby Directory</span>
              </button>

              {/* Map Layer Toggles: Risk Polygons & Incident Pins together */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Risk Polygons */}
                <button
                  type="button"
                  onClick={() => toggleLayer("crimeRisk")}
                  aria-pressed={layerToggles.crimeRisk}
                  className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold transition-all shadow-xs cursor-pointer border whitespace-nowrap ${
                    layerToggles.crimeRisk
                      ? "bg-slate-800 text-slate-100 border-slate-600 ring-1 ring-blue-500/40"
                      : "bg-slate-900/60 text-slate-400 border-slate-800"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${layerToggles.crimeRisk ? "bg-blue-400 shadow-[0_0_8px_#60a5fa]" : "bg-slate-600"}`} />
                  <span>Risk Polygons</span>
                </button>

                {/* Incident Pins — placed directly on the right side of Risk Polygons */}
                <button
                  type="button"
                  onClick={() => toggleLayer("crimeIncidents")}
                  aria-pressed={layerToggles.crimeIncidents}
                  className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold transition-all shadow-xs cursor-pointer border whitespace-nowrap ${
                    layerToggles.crimeIncidents
                      ? "bg-slate-800 text-slate-100 border-slate-600 ring-1 ring-rose-500/40"
                      : "bg-slate-900/60 text-slate-400 border-slate-800"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${layerToggles.crimeIncidents ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]" : "bg-slate-600"}`} />
                  <span>Incident Pins</span>
                </button>
              </div>
            </div>

            {/* Row 2 — [ Time Period: Last 30 Days v ] [ Category: All Crime v ] */}
            <div className="flex items-center gap-2 pt-0.5 flex-nowrap overflow-x-auto no-scrollbar">
              {/* Time Period Dropdown */}
              <div className="relative flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700/90 px-2.5 py-1 rounded-xl border border-slate-700/80 shadow-xs text-xs font-bold text-slate-200 cursor-pointer shrink-0">
                <Calendar className="h-3.5 w-3.5 text-indigo-400 shrink-0 pointer-events-none" />
                <span className="text-[11px] font-bold text-slate-300 shrink-0 pointer-events-none">Time Period:</span>
                <select
                  id="time-period-selector"
                  value={selectedTimePeriod}
                  onChange={(e) => setSelectedTimePeriod(e.target.value as TimeFilterPeriod)}
                  aria-label="Filter incidents by time period"
                  className="bg-transparent text-slate-100 text-xs font-bold pr-4 focus:outline-none cursor-pointer appearance-none"
                >
                  {TIME_FILTERS.map((period) => (
                    <option key={period} value={period} className="bg-slate-900 text-slate-200">
                      {period}
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-3 w-3 text-slate-400 pointer-events-none -ml-3" />
              </div>

              {/* Category Dropdown */}
              <div className="relative flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700/90 px-2.5 py-1 rounded-xl border border-slate-700/80 shadow-xs text-xs font-bold text-slate-200 cursor-pointer shrink-0">
                <Filter className="h-3.5 w-3.5 text-indigo-400 shrink-0 pointer-events-none" />
                <span className="text-[11px] font-bold text-slate-300 shrink-0 pointer-events-none">Category:</span>
                <select
                  id="crime-category-selector"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as CrimeCategoryFilter)}
                  aria-label="Filter incidents by crime category"
                  className="bg-transparent text-slate-100 text-xs font-bold pr-4 focus:outline-none cursor-pointer appearance-none"
                >
                  {CRIME_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-slate-900 text-slate-200">
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-3 w-3 text-slate-400 pointer-events-none -ml-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Map Controls Group (Night Safety & Simulate Event stacked vertically) */}
        <div className="pointer-events-auto shrink-0 flex flex-col items-end gap-2 self-end sm:self-start">
          <NightSafetyToggle
            enabled={nightSafetyMode}
            onChange={handleNightSafetyToggle}
          />
          {showSimulateEvent && onSimulateEvent && !nightSafetyMode && (
            <button
              type="button"
              onClick={onSimulateEvent}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3.5 py-2 text-xs font-extrabold uppercase tracking-wider shadow-lg transition-all cursor-pointer border border-blue-500/50"
            >
              <CalendarPlus className="h-3.5 w-3.5" />
              <span>Simulate Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Picking Location On Map Banner */}
      {isPickingLocationOnMap && (
        <div className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 z-40 bg-amber-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border-2 border-white/60 animate-bounce pointer-events-none">
          <MousePointerClick className="h-4 w-4" />
          <span>Click anywhere on the map to set your search origin</span>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 2. MAIN GOOGLE MAP CANVAS (Clipped to rounded corners)                */}
      {/* --------------------------------------------------------------------- */}
      <div className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden">
        <APIProvider apiKey={apiKey}>
        <GoogleMap
          defaultCenter={NAGPUR_CENTER}
          defaultZoom={12.8}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={true}
          styles={nightSafetyMode ? GOOGLE_MAPS_DARK_STYLE : undefined}
          style={{ width: "100%", height: "100%" }}
          onClick={handleMapClick}
        >
          <MapCameraHandler targetLocation={targetCameraLocation} />

          {/* Visual beacon indicator on selected zone location */}
          {selectedClickLocation && (activePolygonDetail || activeZoneDetail) && (
            <Marker
              position={{ lat: selectedClickLocation.lat, lng: selectedClickLocation.lng }}
              title={`Selected Sector: ${activePolygonDetail?.name || activeZoneDetail?.zoneName}`}
              zIndex={120}
            />
          )}

          {/* Citizen's Location Marker */}
          <Marker
            position={{ lat: userLocation.lat, lng: userLocation.lng }}
            title={userLocation.label || "Your Location"}
            zIndex={100}
          />
          <GoogleCircle
            center={{ lat: userLocation.lat, lng: userLocation.lng }}
            radius={250}
            options={{
              fillColor: "#4F46E5",
              fillOpacity: 0.18,
              strokeColor: "#6366F1",
              strokeWeight: 2,
              clickable: false,
              zIndex: 99,
            }}
          />

          {/* ----------------------------------------------------------------- */}
          {/* POLYGON-BASED CRIME RISK MOSAIC LAYER (Zero gaps, Adjoining)      */}
          {/* ----------------------------------------------------------------- */}
          {layerToggles.crimeRisk &&
            polygonRiskAnalyticsList.map((polyData) => {
              const isSelected = activePolygonDetail?.polygonId === polyData.polygonId;
              const isHovered = hoveredPolygonId === polyData.polygonId;
              const googlePath = polyData.boundaryCoordinates.map(([lat, lng]) => ({ lat, lng }));

              const fillOpacity = isSelected
                ? Math.min(0.72, polyData.fillOpacity + 0.20)
                : isHovered
                ? Math.min(0.65, polyData.fillOpacity + 0.12)
                : polyData.fillOpacity;

              const strokeWeight = isSelected ? 3.5 : isHovered ? 2.6 : polyData.strokeWeight;
              const strokeColor = isSelected ? "#FFFFFF" : isHovered ? "#E0E7FF" : polyData.strokeColorHex;

              return (
                <GooglePolygon
                  key={polyData.polygonId}
                  paths={googlePath}
                  options={{
                    fillColor: polyData.colorHex,
                    fillOpacity,
                    strokeColor,
                    strokeOpacity: 0.95,
                    strokeWeight,
                    clickable: true,
                    zIndex: isSelected ? 35 : isHovered ? 30 : polyData.riskLevel === "HIGH" ? 20 : 15,
                  }}
                  onMouseOver={() => setHoveredPolygonId(polyData.polygonId)}
                  onMouseOut={() => setHoveredPolygonId(null)}
                  onClick={(e?: any) => {
                    const clickPos = e?.domEvent ? { x: e.domEvent.clientX, y: e.domEvent.clientY } : undefined;
                    setActivePolygonDetail(polyData);
                    const matchingZone = zoneAnalyticsList.find((z) => z.zoneId === polyData.zoneId);
                    setActiveZoneDetail(matchingZone || null);
                    setActiveService(null);
                    setActiveNewsArticle(null);
                    setSelectedCrimeIncident(null);
                    setShowNearbyServicesPanel(false);
                    setSelectedClickLocation({
                      lat: polyData.center.lat,
                      lng: polyData.center.lng,
                      screenX: clickPos?.x,
                      screenY: clickPos?.y,
                    });
                    lastHandledZoneIdRef.current = polyData.polygonId;
                    if (onZoneSelect) onZoneSelect(polyData.polygonId);
                  }}
                />
              );
            })}

          {/* Optional Individual Incident Markers Layer */}
          {layerToggles.crimeIncidents &&
            incidents
              .filter((inc) => {
                if (selectedCategory !== "All Crime") {
                  if (selectedCategory === "Theft" && inc.type !== "Theft" && inc.type !== "Chain-snatching") return false;
                  if (selectedCategory === "Robbery" && inc.type !== "Robbery") return false;
                  if (selectedCategory === "Assault" && inc.type !== "Assault" && inc.type !== "Murder") return false;
                  if (selectedCategory === "Vehicle Theft" && inc.type !== "Vehicle Theft") return false;
                  if (selectedCategory === "Burglary" && inc.type !== "Burglary") return false;
                }
                return true;
              })
              .map((inc) => (
                <Marker
                  key={`incident-${inc.id}`}
                  position={{ lat: inc.lat, lng: inc.lng }}
                  title={`${inc.type} (${inc.severity.toUpperCase()}): ${inc.description}`}
                  icon={getCrimeIncidentMarkerIcon()}
                  onClick={(e) => {
                    const clickPos = (e as any)?.domEvent ? { x: (e as any).domEvent.clientX, y: (e as any).domEvent.clientY } : undefined;
                    setSelectedClickLocation({
                      lat: inc.lat,
                      lng: inc.lng,
                      screenX: clickPos?.x,
                      screenY: clickPos?.y,
                    });
                    setSelectedCrimeIncident(inc);
                    setActiveNewsArticle(null);
                    setActiveService(null);
                    setActivePolygonDetail(null);
                    setActiveZoneDetail(null);
                  }}
                  zIndex={48}
                />
              ))}

          {/* Render Essential & Emergency Services Markers with Proximity Clustering & Disambiguation */}
          {serviceSpatialClusters.flatMap((cluster) => {
            const hasMultiple = cluster.services.length > 1;

            return cluster.services.map((service, srvIndex) => {
              const isSelected = activeService?.id === service.id;
              const dist = calculateDistanceMeters(userLocation.lat, userLocation.lng, service.lat, service.lng);
              const distLabel = formatDistance(dist);
              const config = SERVICE_MARKER_CONFIG[service.category] || SERVICE_MARKER_CONFIG.police;

              // If multiple facilities share this cluster and none is explicitly selected,
              // apply a subtle spiderfy offset so individual pins can be distinguished and clicked
              let markerLat = service.lat;
              let markerLng = service.lng;

              if (hasMultiple && !isSelected && (!activeService || !cluster.services.some((s) => s.id === activeService.id))) {
                const angle = (srvIndex * 2 * Math.PI) / cluster.services.length;
                // Subtle ~22m visual spiderfy displacement
                markerLat += (22 / 111320) * Math.sin(angle);
                markerLng += (22 / (111320 * Math.cos((service.lat * Math.PI) / 180))) * Math.cos(angle);
              }

              return (
                <Marker
                  key={service.id}
                  position={{ lat: markerLat, lng: markerLng }}
                  title={
                    hasMultiple
                      ? `[Complex: ${cluster.services.length} Facilities] ${service.name} • ${config.label} (${distLabel})`
                      : `${service.name} • ${config.label} (${distLabel})`
                  }
                  icon={getServiceMarkerIcon(service.category, isSelected, hasMultiple ? cluster.services.length : 1)}
                  onClick={(e) => {
                    const clickPos = (e as any)?.domEvent ? { x: (e as any).domEvent.clientX, y: (e as any).domEvent.clientY } : undefined;
                    setSelectedClickLocation({
                      lat: service.lat,
                      lng: service.lng,
                      screenX: clickPos?.x,
                      screenY: clickPos?.y,
                    });
                    if (hasMultiple) {
                      setActiveClusterModal(cluster);
                    }
                    handleSelectServiceItem(service);
                  }}
                  zIndex={isSelected ? 85 : hasMultiple ? 55 : 45}
                />
              );
            });
          })}

          {/* Render Real News Incident Markers on Map */}
          {layerToggles.realNews &&
            realNewsArticles
              .filter((article): article is RealNewsArticle & { location: NonNullable<RealNewsArticle["location"]> } => Boolean(article.location))
              .map((article) => (
                <Marker
                  key={`news-marker-${article.id}`}
                  position={{ lat: article.location.lat, lng: article.location.lng }}
                  title={`Incident Report: ${article.title}`}
                  onClick={(e) => {
                    const clickPos = (e as any)?.domEvent ? { x: (e as any).domEvent.clientX, y: (e as any).domEvent.clientY } : undefined;
                    setSelectedClickLocation({
                      lat: article.location.lat,
                      lng: article.location.lng,
                      screenX: clickPos?.x,
                      screenY: clickPos?.y,
                    });
                    setActiveNewsArticle(article);
                    setActiveService(null);
                    setActiveZoneDetail(null);
                    setActivePolygonDetail(null);
                    setSelectedCrimeIncident(null);
                    if (onSelectNewsArticle) onSelectNewsArticle(article);
                  }}
                  zIndex={55}
                />
              ))}

          {/* CCTV Camera Markers */}
          {layerToggles.cctvCameras &&
            cameras.map((camera) => (
              <Marker
                key={camera.id}
                position={{ lat: camera.lat, lng: camera.lng }}
                title={`CCTV: ${camera.name} (${camera.isOperational ? "Operational" : "OFFLINE"})`}
                onClick={(e) => {
                  const clickPos = (e as any)?.domEvent ? { x: (e as any).domEvent.clientX, y: (e as any).domEvent.clientY } : undefined;
                  setSelectedClickLocation({
                    lat: camera.lat,
                    lng: camera.lng,
                    screenX: clickPos?.x,
                    screenY: clickPos?.y,
                  });
                  setSelectedCamera(camera);
                  setSelectedPatrol(null);
                  setSelectedDisruption(null);
                  setActiveNewsArticle(null);
                  setActiveService(null);
                  setSelectedCrimeIncident(null);
                }}
              />
            ))}

          {/* Police Patrol Units Markers */}
          {layerToggles.policePatrols &&
            patrolUnits.map((unit) => (
              <Marker
                key={unit.id}
                position={{ lat: unit.lat, lng: unit.lng }}
                title={`Patrol Unit: ${unit.unitCode} (${unit.vehicleType})`}
                onClick={(e) => {
                  const clickPos = (e as any)?.domEvent ? { x: (e as any).domEvent.clientX, y: (e as any).domEvent.clientY } : undefined;
                  setSelectedClickLocation({
                    lat: unit.lat,
                    lng: unit.lng,
                    screenX: clickPos?.x,
                    screenY: clickPos?.y,
                  });
                  setSelectedPatrol(unit);
                  setSelectedCamera(null);
                  setSelectedDisruption(null);
                  setActiveNewsArticle(null);
                  setActiveService(null);
                  setSelectedCrimeIncident(null);
                }}
              />
            ))}

          {/* ------------------------------------------------------------- */}
          {/* DYNAMIC SAFE ROUTE RECONSTRUCTION LAYER                       */}
          {/* ------------------------------------------------------------- */}
          {activeRoute && activeRoute.geometry && activeRoute.geometry.length >= 2 && (
            <>
              {/* Active Route Polyline */}
              <GooglePolyline
                path={activeRoute.geometry}
                options={{
                  strokeColor:
                    routeDisruptions && routeDisruptions.some((d) => d.isClosure)
                      ? "#E11D48"
                      : routeDisruptions && routeDisruptions.length > 0
                      ? "#F97316"
                      : "#4F46E5",
                  strokeOpacity: 0.95,
                  strokeWeight: 6,
                  zIndex: 60,
                }}
                onClick={() => onSelectRoute?.(activeRoute)}
              />

              {/* Start (A) Marker */}
              <Marker
                position={{ lat: activeRoute.geometry[0][0], lng: activeRoute.geometry[0][1] }}
                title={`Start: ${activeRoute.name}`}
                zIndex={110}
              />

              {/* Destination (B) Marker */}
              <Marker
                position={{
                  lat: activeRoute.geometry[activeRoute.geometry.length - 1][0],
                  lng: activeRoute.geometry[activeRoute.geometry.length - 1][1],
                }}
                title={`Destination: ${activeRoute.via}`}
                zIndex={110}
              />
            </>
          )}

          {/* Alternative Candidate Routes */}
          {alternativeRoutes &&
            alternativeRoutes.map((alt, idx) => {
              if (!alt.geometry || alt.geometry.length < 2) return null;
              const isRecommended = idx === 0;
              return (
                <GooglePolyline
                  key={alt.id || `alt-${idx}`}
                  path={alt.geometry}
                  options={{
                    strokeColor: isRecommended ? "#059669" : "#64748B",
                    strokeOpacity: isRecommended ? 0.85 : 0.45,
                    strokeWeight: isRecommended ? 5 : 3.5,
                    zIndex: isRecommended ? 55 : 45,
                  }}
                  onClick={() => onSelectRoute?.(alt)}
                />
              );
            })}

          {/* Route Disruption Hazard Markers */}
          {routeDisruptions &&
            routeDisruptions.map((disruption) => {
              if (!disruption.location) return null;
              return (
                <React.Fragment key={`disruption-${disruption.id}`}>
                  <Marker
                    position={{ lat: disruption.location.lat, lng: disruption.location.lng }}
                    title={`🚨 ${disruption.category.toUpperCase()}: ${disruption.title}`}
                    zIndex={120}
                    onClick={(e) => {
                      const clickPos = (e as any)?.domEvent ? { x: (e as any).domEvent.clientX, y: (e as any).domEvent.clientY } : undefined;
                      setSelectedClickLocation({
                        lat: disruption.location!.lat,
                        lng: disruption.location!.lng,
                        screenX: clickPos?.x,
                        screenY: clickPos?.y,
                      });
                      setSelectedDisruption(disruption);
                      setSelectedCamera(null);
                      setSelectedPatrol(null);
                      setActiveNewsArticle(null);
                      setActiveService(null);
                      setSelectedCrimeIncident(null);
                    }}
                  />
                  {disruption.isClosure && (
                    <GoogleCircle
                      center={{ lat: disruption.location.lat, lng: disruption.location.lng }}
                      radius={disruption.impactRadiusMeters || 180}
                      options={{
                        fillColor: "#E11D48",
                        fillOpacity: 0.28,
                        strokeColor: "#BE123C",
                        strokeWeight: 2,
                        zIndex: 115,
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
        </GoogleMap>
      </APIProvider>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 2.5. NEARBY SERVICES DIRECTORY & FACILITY SELECTION PANEL             */}
      {/* --------------------------------------------------------------------- */}
      <AnimatePresence>
        {showNearbyServicesPanel && (
          <MapOverlayPortal
            mapContainerRef={mapContainerRef}
            targetWidth={420}
            topOffset={panelTopOffset}
            align="right"
            onClose={() => setShowNearbyServicesPanel(false)}
            id="nearby-services-portal"
          >
            <div
              ref={nearbyServicesPanelRef}
              className="w-full rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl flex flex-col pointer-events-auto"
            >
              {/* Sticky Header with Title, Active Count Badge, View Tabs & Close Button */}
              <div className="sticky top-0 z-20 px-4 pt-4 pb-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 shrink-0 rounded-t-3xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                      <Compass className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                          Nearby Services
                        </h4>
                        <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200/70 dark:border-indigo-800">
                          {Object.values(serviceCategoryToggles).filter(Boolean).length} Active
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Emergency facilities & stations
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowNearbyServicesPanel(false)}
                    aria-label="Close nearby services panel"
                    className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* View Tabs: Categories vs Facility List */}
                <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setNearbyServicesTab("categories")}
                    className={`flex-1 py-1 rounded-lg transition-all text-center cursor-pointer ${
                      nearbyServicesTab === "categories"
                        ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Categories ({Object.values(serviceCategoryToggles).filter(Boolean).length}/6)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNearbyServicesTab("facilities")}
                    className={`flex-1 py-1 rounded-lg transition-all text-center cursor-pointer ${
                      nearbyServicesTab === "facilities"
                        ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Facilities ({sortedVisibleServices.length})
                  </button>
                </div>
              </div>

              {/* Scrollable Body Content */}
              <div className="p-3.5 sm:p-4 overflow-y-auto space-y-3 flex-1 overscroll-contain max-h-[calc(100vh-160px)]">
              {nearbyServicesTab === "categories" ? (
                <>
                  {/* Category-Based Filter Selector Presets */}
                  <div className="space-y-1.5 bg-slate-50/80 dark:bg-slate-800/40 p-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      <span className="uppercase tracking-wider text-[10px] text-slate-500 dark:text-slate-400">
                        Filter Category on Map:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSelectCategoryFilter("none")}
                        className="text-[10px] text-rose-600 dark:text-rose-400 hover:underline font-bold cursor-pointer"
                      >
                        Clear (Off)
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSelectCategoryFilter("all")}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                          currentCategorySelection === "all"
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        <span>🌐</span>
                        <span className="truncate">All ({essentialServices.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectCategoryFilter("police")}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                          currentCategorySelection === "police"
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        <span>🚓</span>
                        <span className="truncate">Police ({categoryCounts.police})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectCategoryFilter("hospital")}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                          currentCategorySelection === "hospital"
                            ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        <span>🏥</span>
                        <span className="truncate">Hospitals ({categoryCounts.hospital})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectCategoryFilter("pharmacy")}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                          currentCategorySelection === "pharmacy"
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        <span>💊</span>
                        <span className="truncate">Pharmacies ({categoryCounts.pharmacy})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectCategoryFilter("fire_station")}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                          currentCategorySelection === "fire_station"
                            ? "bg-orange-600 text-white border-orange-600 shadow-xs"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        <span>🚒</span>
                        <span className="truncate">Fire ({categoryCounts.fire_station})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectCategoryFilter("emergency_other")}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                          currentCategorySelection === "emergency_other"
                            ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        <span>🛡️</span>
                        <span className="truncate">Emergency ({categoryCounts.emergency_other + categoryCounts.ambulance})</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Select Actions */}
                  <div className="flex items-center justify-between text-[11px] px-1 font-semibold text-slate-500 dark:text-slate-400">
                    <span>Facilities on map: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{visibleServices.length}</strong></span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleAllServices(true)}
                        className="hover:text-indigo-600 dark:text-indigo-400 underline cursor-pointer"
                      >
                        Select All
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => handleToggleAllServices(false)}
                        className="hover:text-rose-600 dark:hover:text-rose-400 underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* Service Categories Toggle List */}
                  <div className="space-y-1.5">
                    {SERVICE_CATEGORIES.map((cat) => {
                      const isChecked = serviceCategoryToggles[cat.id];
                      const count = categoryCounts[cat.id] || 0;
                      return (
                        <label
                          key={cat.id}
                          className={`flex items-center justify-between rounded-2xl p-2.5 cursor-pointer border transition-all ${
                            isChecked
                              ? "bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800/80 shadow-xs"
                              : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/60 dark:hover:bg-slate-800/70"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <span className="text-lg shrink-0">{cat.icon}</span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                  {cat.label}
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 font-bold">
                                  {count}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                {cat.description}
                              </p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleServiceCategory(cat.id)}
                            className="h-4 w-4 rounded accent-indigo-600 cursor-pointer shrink-0"
                          />
                        </label>
                      );
                    })}
                  </div>

                  {/* Quick jump to facility list button */}
                  {sortedVisibleServices.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setNearbyServicesTab("facilities")}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                    >
                      <span>Browse {sortedVisibleServices.length} Facilities List</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </>
              ) : (
                /* Facility-Selection List View */
                <div className="space-y-2">
                  {/* Search input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={nearbyFacilitySearch}
                      onChange={(e) => setNearbyFacilitySearch(e.target.value)}
                      placeholder="Search facility name, address..."
                      className="w-full rounded-xl bg-slate-100 dark:bg-slate-800 py-1.5 pl-8 pr-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Results count & back button */}
                  <div className="flex items-center justify-between text-[11px] px-1 font-semibold text-slate-500 dark:text-slate-400">
                    <span>{filteredServicesList.length} of {sortedVisibleServices.length} available</span>
                    <button
                      type="button"
                      onClick={() => setNearbyServicesTab("categories")}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      ← Back to Categories
                    </button>
                  </div>

                  {/* Facility cards list */}
                  <div className="space-y-1.5 max-h-80 overflow-y-auto pr-0.5">
                    {filteredServicesList.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No matching facilities found. Try adjusting your search or enabling more categories.
                      </div>
                    ) : (
                      filteredServicesList.map((srv) => {
                        const isSelected = activeService?.id === srv.id;
                        const catConfig = SERVICE_CATEGORIES.find((c) => c.id === srv.category);
                        const iconEmoji = catConfig ? catConfig.icon : "📍";
                        return (
                          <div
                            key={srv.id}
                            onClick={() => handleSelectServiceItem(srv)}
                            className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-indigo-50 dark:bg-indigo-950/70 border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs"
                                : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/70 dark:hover:bg-slate-800/70"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm shrink-0">{iconEmoji}</span>
                                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                    {srv.name}
                                  </h5>
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 pl-5">
                                  {srv.address}
                                </p>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-mono">
                                  {formatDistance(srv.distanceMeters)}
                                </span>
                              </div>
                            </div>

                            <div className="mt-1.5 pt-1.5 border-t border-slate-200/40 dark:border-slate-700/40 flex items-center justify-between text-[10px] pl-5">
                              <span className="text-slate-500 dark:text-slate-400 font-medium">
                                {srv.is24x7 ? "🟢 24/7 Service" : srv.timing}
                              </span>
                              <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-0.5">
                                View on Map →
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Footer: GPS Geolocation & Status */}
            <div className="sticky bottom-0 z-20 px-4 py-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs shrink-0 rounded-b-3xl">
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isDetectingGps}
                className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                <Crosshair className={`h-3.5 w-3.5 ${isDetectingGps ? "animate-spin" : ""}`} />
                <span>{isDetectingGps ? "Locating…" : "Update My GPS"}</span>
              </button>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Nagpur Live GIS</span>
              </div>
            </div>
          </div>
        </MapOverlayPortal>
        )}
      </AnimatePresence>

      {/* --------------------------------------------------------------------- */}
      {/* 3. REPORTED INCIDENT POPUP CARD (PORTALED OUTSIDE MAP)                */}
      {/* --------------------------------------------------------------------- */}
      {activeNewsArticle && (
        <MapOverlayPortal
          mapContainerRef={mapContainerRef}
          clickLocation={
            activeNewsArticle.location
              ? {
                  lat: activeNewsArticle.location.lat,
                  lng: activeNewsArticle.location.lng,
                  screenX: selectedClickLocation?.screenX,
                  screenY: selectedClickLocation?.screenY,
                }
              : selectedClickLocation
          }
          targetWidth={380}
          topOffset={panelTopOffset}
          onClose={() => {
            setActiveNewsArticle(null);
            if (onSelectNewsArticle) onSelectNewsArticle(null);
          }}
          id="reported-incident-portal"
        >
          <div className="w-full rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.25)] flex flex-col pointer-events-auto">
            {/* Header with Title & Close Button */}
            <div className="px-4 py-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 font-bold text-sm shadow-xs">
                  🚨
                </span>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Reported Incident
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Verified Local Intelligence Alert
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveNewsArticle(null);
                  if (onSelectNewsArticle) onSelectNewsArticle(null);
                }}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer shrink-0"
                aria-label="Close article"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-3.5 space-y-2.5">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {activeNewsArticle.title}
                </h4>
                {activeNewsArticle.description && (
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal line-clamp-3">
                    {activeNewsArticle.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Location</span>
                  <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 truncate text-[11px]">
                    📍 {activeNewsArticle.location ? activeNewsArticle.location.name : "Nagpur"}
                  </p>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Published</span>
                  <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 truncate text-[11px]">
                    🕒 {activeNewsArticle.relativeTime}
                  </p>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Source</span>
                  <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 truncate text-[11px]">
                    📰 {activeNewsArticle.sourceName}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                {activeNewsArticle.location && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeNewsArticle.location) {
                        setTargetCameraLocation({
                          lat: activeNewsArticle.location.lat,
                          lng: activeNewsArticle.location.lng,
                        });
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition active:scale-95 cursor-pointer"
                  >
                    <Crosshair className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                    <span>Focus Map</span>
                  </button>
                )}

                {activeNewsArticle.link ? (
                  <a
                    href={activeNewsArticle.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700 active:scale-95 ml-auto"
                  >
                    <span>Read Full Story</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </MapOverlayPortal>
      )}

      {/* Multi-Facility / Co-Located Medical Complex Disambiguation Sheet */}
      {activeClusterModal && activeClusterModal.services.length > 1 && (
        <div className="absolute z-50 bottom-5 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 rounded-2xl bg-[#0c1427]/95 p-4 shadow-2xl backdrop-blur-md border border-indigo-500/50 text-white animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-700/80">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Co-Located Medical Complex</h4>
                <p className="text-[10px] text-slate-400">
                  {activeClusterModal.services.length} Facilities share this campus or vicinity
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveClusterModal(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-2.5 flex flex-col gap-2 max-h-60 overflow-y-auto pr-1 no-scrollbar">
            {activeClusterModal.services.map((srv) => {
              const isCur = activeService?.id === srv.id;
              const d = calculateDistanceMeters(userLocation.lat, userLocation.lng, srv.lat, srv.lng);
              return (
                <div
                  key={srv.id}
                  className={`p-2.5 rounded-xl transition-all border ${
                    isCur
                      ? "bg-indigo-950/70 border-indigo-500 text-white shadow-md"
                      : "bg-slate-800/80 hover:bg-slate-800 border-slate-700/60 text-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <span className="truncate">{srv.name}</span>
                        {srv.hospitalDetails?.is24Hours && (
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
                            24/7
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{srv.address}</p>
                    </div>
                    <span className="shrink-0 text-[10px] font-bold text-indigo-300 bg-indigo-950/50 px-1.5 py-0.5 rounded">
                      {formatDistance(d)}
                    </span>
                  </div>

                  {srv.specialties && (
                    <div className="mt-1 text-[10px] text-slate-300 line-clamp-1 italic">
                      {srv.specialties}
                    </div>
                  )}

                  <div className="mt-2 pt-1.5 border-t border-slate-700/50 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectServiceItem(srv);
                      }}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] rounded-lg transition-all shadow-xs cursor-pointer"
                    >
                      {isCur ? "Active Facility" : "Select Facility"}
                    </button>
                    {srv.phone && (
                      <a
                        href={`tel:${srv.phone}`}
                        className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600/80 hover:bg-emerald-500 text-white font-semibold text-[11px] rounded-lg transition-all cursor-pointer"
                      >
                        <PhoneCall className="h-3 w-3" />
                        <span>{srv.phone}</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 4. INTERACTIVE SERVICE INFORMATION CARD (PORTALED OUTSIDE MAP)        */}
      {/* --------------------------------------------------------------------- */}
      {activeService && !activeNewsArticle && (
        <MapOverlayPortal
          mapContainerRef={mapContainerRef}
          clickLocation={
            selectedClickLocation || {
              lat: activeService.lat,
              lng: activeService.lng,
            }
          }
          targetWidth={390}
          topOffset={panelTopOffset}
          onClose={() => {
            setActiveService(null);
            if (propOnSelectService) propOnSelectService(null);
          }}
          id="service-info-portal"
        >
          <ServiceInfoCard
            service={activeService}
            userLocation={userLocation}
            formattedDistance={formatDistance(
              calculateDistanceMeters(
                userLocation.lat,
                userLocation.lng,
                activeService.lat,
                activeService.lng
              )
            )}
            onClose={() => {
              setActiveService(null);
              if (propOnSelectService) propOnSelectService(null);
            }}
          />
        </MapOverlayPortal>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 4.5. CRIME INCIDENT DETAIL CARD (PORTALED OUTSIDE MAP)                */}
      {/* --------------------------------------------------------------------- */}
      {selectedCrimeIncident && !activeNewsArticle && !activeService && (
        <MapOverlayPortal
          mapContainerRef={mapContainerRef}
          clickLocation={
            selectedClickLocation || {
              lat: selectedCrimeIncident.lat,
              lng: selectedCrimeIncident.lng,
            }
          }
          targetWidth={380}
          topOffset={panelTopOffset}
          onClose={() => setSelectedCrimeIncident(null)}
          id="crime-incident-portal"
        >
          <div className="w-full rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.25)] flex flex-col pointer-events-auto">
            {/* Header */}
            <div className="px-4 py-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 font-bold text-sm shadow-xs">
                  📍
                </span>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Crime Incident Details
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Official Police Incident Record
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCrimeIncident(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer shrink-0"
                aria-label="Close incident details"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-3.5 space-y-2.5">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {selectedCrimeIncident.type}
                </h4>
                {selectedCrimeIncident.description && (
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {selectedCrimeIncident.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Severity</span>
                  <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 uppercase flex items-center gap-1 text-[11px]">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        selectedCrimeIncident.severity === "critical"
                          ? "bg-rose-600 animate-ping"
                          : selectedCrimeIncident.severity === "high"
                          ? "bg-rose-500"
                          : selectedCrimeIncident.severity === "medium"
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                    />
                    <span>{selectedCrimeIncident.severity}</span>
                  </p>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Status</span>
                  <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 uppercase text-[11px] truncate">
                    🛡️ {selectedCrimeIncident.status}
                  </p>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Recorded</span>
                  <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 text-[11px] truncate">
                    🕒 {new Date(selectedCrimeIncident.timestamp).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Sector: {selectedCrimeIncident.zoneId}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setTargetCameraLocation({
                      lat: selectedCrimeIncident.lat,
                      lng: selectedCrimeIncident.lng,
                    });
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition active:scale-95 cursor-pointer ml-auto"
                >
                  <Crosshair className="h-3 w-3" />
                  <span>Focus Map</span>
                </button>
              </div>
            </div>
          </div>
        </MapOverlayPortal>
      )}

      {/* CCTV Camera Info Portal */}
      {selectedCamera && (
        <MapOverlayPortal
          mapContainerRef={mapContainerRef}
          clickLocation={
            selectedClickLocation || {
              lat: selectedCamera.lat,
              lng: selectedCamera.lng,
            }
          }
          targetWidth={320}
          topOffset={panelTopOffset}
          onClose={() => setSelectedCamera(null)}
          id="cctv-info-portal"
        >
          <div className="w-full rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.25)] p-3 pointer-events-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                <Camera className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="truncate">{selectedCamera.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCamera(null)}
                aria-label="Close CCTV details"
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-2 space-y-1 text-xs">
              <p>
                Status:{" "}
                <strong className={selectedCamera.isOperational ? "text-emerald-600 font-bold" : "text-rose-600 font-black"}>
                  {selectedCamera.isOperational ? "OPERATIONAL" : "OFFLINE / BLIND SPOT"}
                </strong>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Coverage Radius: {selectedCamera.coverageRadiusM} meters
              </p>
            </div>
          </div>
        </MapOverlayPortal>
      )}

      {/* Police Patrol Unit Info Portal */}
      {selectedPatrol && (
        <MapOverlayPortal
          mapContainerRef={mapContainerRef}
          clickLocation={
            selectedClickLocation || {
              lat: selectedPatrol.lat,
              lng: selectedPatrol.lng,
            }
          }
          targetWidth={320}
          topOffset={panelTopOffset}
          onClose={() => setSelectedPatrol(null)}
          id="patrol-info-portal"
        >
          <div className="w-full rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.25)] p-3 pointer-events-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <Shield className="h-4 w-4" />
                <span className="truncate">Unit {selectedPatrol.unitCode} ({selectedPatrol.vehicleType})</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPatrol(null)}
                aria-label="Close patrol details"
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-2 space-y-1 text-xs text-slate-700 dark:text-slate-300">
              <p>
                Deployment Status: <strong className="text-emerald-600 uppercase font-bold">{selectedPatrol.status}</strong>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Personnel: {selectedPatrol.officerCount} Officers • Last Ping: {selectedPatrol.lastPing}
              </p>
            </div>
          </div>
        </MapOverlayPortal>
      )}

      {/* Route Disruption Info Portal */}
      {selectedDisruption && selectedDisruption.location && (
        <MapOverlayPortal
          mapContainerRef={mapContainerRef}
          clickLocation={
            selectedClickLocation || {
              lat: selectedDisruption.location.lat,
              lng: selectedDisruption.location.lng,
            }
          }
          targetWidth={340}
          topOffset={panelTopOffset}
          onClose={() => setSelectedDisruption(null)}
          id="disruption-info-portal"
        >
          <div className="w-full rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.25)] p-3.5 pointer-events-auto space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">
                  {selectedDisruption.isClosure ? "🛑" : selectedDisruption.category === "protest" ? "📢" : "⚠️"}
                </span>
                <span className="text-xs font-black uppercase text-rose-600 dark:text-rose-400">
                  {selectedDisruption.category.replace("_", " ")}
                  {selectedDisruption.isClosure ? " (CLOSED)" : ""}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDisruption(null)}
                aria-label="Close disruption info"
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {selectedDisruption.title}
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedDisruption.description}
            </p>
            <div className="text-[10px] text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span>Source: {selectedDisruption.sourceName}</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                {selectedDisruption.severity.toUpperCase()}
              </span>
            </div>
          </div>
        </MapOverlayPortal>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 5. INTERACTIVE CRIME INFORMATION POPUP / CARD (PORTALED OUTSIDE MAP) */}
      {/* --------------------------------------------------------------------- */}
      {(activePolygonDetail || activeZoneDetail) && !activeService && !activeNewsArticle && !selectedCrimeIncident && (
        <MapOverlayPortal
          mapContainerRef={mapContainerRef}
          clickLocation={
            selectedClickLocation ||
            (activePolygonDetail?.center
              ? { lat: activePolygonDetail.center.lat, lng: activePolygonDetail.center.lng }
              : null)
          }
          targetWidth={400}
          topOffset={panelTopOffset}
          onClose={handleCloseRegionDetails}
          id="active-zone-details-portal"
        >
          <div className="w-full rounded-2xl bg-[#0c1427]/95 text-slate-100 backdrop-blur-xl border border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col pointer-events-auto p-4">
            {/* Header: Red Icon Badge, Title, Sector Tag, Subtitle & Close Button */}
            <div className="flex items-start justify-between gap-3 shrink-0">
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-red-600/90 flex items-center justify-center text-white shrink-0 shadow-md">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-extrabold text-white truncate">
                    {activePolygonDetail ? activePolygonDetail.name : activeZoneDetail?.zoneName}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-mono font-bold shrink-0">
                      {activePolygonDetail ? activePolygonDetail.code : activeZoneDetail?.code}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate">
                      📍 {activePolygonDetail?.wardName ?? "Nagpur Metropolitan Sector"}
                      {activePolygonDetail?.areaKm2 ? ` (${activePolygonDetail.areaKm2} km²)` : ""}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {activePolygonDetail?.center && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activePolygonDetail?.center) {
                        setTargetCameraLocation({
                          lat: activePolygonDetail.center.lat,
                          lng: activePolygonDetail.center.lng,
                        });
                      }
                    }}
                    title="Focus map on this sector"
                    aria-label="Focus map on sector"
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition cursor-pointer"
                  >
                    <Crosshair className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Close region details"
                  onClick={handleCloseRegionDetails}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Status Badge & Risk Score */}
            <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-800/80">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <AlertTriangle className="h-3 w-3" />
                STATUS: {activePolygonDetail ? activePolygonDetail.status : activeZoneDetail?.status}
              </span>

              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <span>Risk Score:</span>
                <span className="text-rose-500 font-black text-sm">
                  {activePolygonDetail ? activePolygonDetail.riskScore : activeZoneDetail?.riskScore}/100
                </span>
              </div>
            </div>

            {/* 2x3 Grid Key Metrics matching reference picture */}
            <div className="grid grid-cols-2 gap-2 text-xs mt-3">
              {/* 1. Crime Risk Level */}
              <div className="p-2.5 rounded-xl bg-[#131d36]/90 border border-slate-700/60 flex flex-col justify-between">
                <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Crime Risk Level</div>
                <div className="text-xs font-bold text-slate-100 mt-1 flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      (activePolygonDetail ? activePolygonDetail.riskLevel : activeZoneDetail?.riskLevel) === "HIGH"
                        ? "bg-rose-500"
                        : (activePolygonDetail ? activePolygonDetail.riskLevel : activeZoneDetail?.riskLevel) === "MEDIUM"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                  />
                  <span>
                    {(activePolygonDetail ? activePolygonDetail.riskLevel : activeZoneDetail?.riskLevel) === "HIGH"
                      ? "High"
                      : (activePolygonDetail ? activePolygonDetail.riskLevel : activeZoneDetail?.riskLevel) === "MEDIUM"
                      ? "Medium"
                      : "Low"}
                  </span>
                </div>
              </div>

              {/* 2. Crime Trend (Last 30 Days) */}
              <div className="p-2.5 rounded-xl bg-[#131d36]/90 border border-slate-700/60 flex flex-col justify-between">
                <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Crime Trend (Last 30 Days)</div>
                <div className="text-xs font-bold text-rose-400 mt-1 flex items-center gap-1">
                  {(activePolygonDetail ? activePolygonDetail.crimeTrendPercentage : activeZoneDetail?.crimeTrendPercentage ?? 0) >= 0 ? (
                    <span className="text-rose-400 flex items-center gap-1 font-bold">
                      <TrendingUp className="h-3 w-3 text-rose-500" />
                      +{activePolygonDetail ? activePolygonDetail.crimeTrendPercentage : activeZoneDetail?.crimeTrendPercentage}%
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1 font-bold">
                      <TrendingDown className="h-3 w-3 text-emerald-500" />
                      {activePolygonDetail ? activePolygonDetail.crimeTrendPercentage : activeZoneDetail?.crimeTrendPercentage}%
                    </span>
                  )}
                </div>
              </div>

              {/* 3. Total Incidents */}
              <div className="p-2.5 rounded-xl bg-[#131d36]/90 border border-slate-700/60 flex flex-col justify-between">
                <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Total Incidents</div>
                <div className="text-sm font-extrabold text-slate-100 mt-0.5">
                  {activePolygonDetail ? activePolygonDetail.recentIncidentsCount : activeZoneDetail?.recentIncidentsCount}
                </div>
              </div>

              {/* 4. Historical Records */}
              <div className="p-2.5 rounded-xl bg-[#131d36]/90 border border-slate-700/60 flex flex-col justify-between">
                <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Historical Records</div>
                <div className="text-sm font-extrabold text-slate-100 mt-0.5">
                  {activePolygonDetail ? activePolygonDetail.historicalIncidentsCount : activeZoneDetail?.historicalIncidentsCount}
                </div>
              </div>

              {/* 5. CCTV Coverage */}
              <div className="p-2.5 rounded-xl bg-[#131d36]/90 border border-slate-700/60 flex flex-col justify-between">
                <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">CCTV Coverage</div>
                <div className="text-xs font-bold text-slate-100 mt-0.5 truncate">
                  {activePolygonDetail
                    ? `${activePolygonDetail.cctvCoverageStatus} (${activePolygonDetail.cctvCoveragePercent}%)`
                    : `${activeZoneDetail?.cctvCoverageStatus}`}
                </div>
              </div>

              {/* 6. Night Risk & Lighting */}
              <div className="p-2.5 rounded-xl bg-[#131d36]/90 border border-slate-700/60 flex flex-col justify-between">
                <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Night Risk & Lighting</div>
                <div className="text-xs font-bold text-slate-100 mt-0.5 truncate">
                  {activePolygonDetail
                    ? `${activePolygonDetail.nightRiskLevel} (${activePolygonDetail.lightingIndex}% Light)`
                    : `${activeZoneDetail?.nightRiskLevel}`}
                </div>
              </div>
            </div>

            {/* View Full Details Button */}
            <button
              type="button"
              onClick={() => setShowFullZoneDetails((prev) => !prev)}
              className="w-full mt-3 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <span>{showFullZoneDetails ? "Hide Full Details" : "View Full Details"}</span>
              <ArrowRight className={`h-3.5 w-3.5 transition-transform ${showFullZoneDetails ? "-rotate-90" : ""}`} />
            </button>

            {/* Collapsible Full Details Section */}
            {showFullZoneDetails && (
              <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {/* Crime Distribution */}
                {activePolygonDetail && activePolygonDetail.categoryBreakdown && (
                  <div className="p-2.5 rounded-xl bg-[#131d36]/90 border border-slate-700/60 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Crime Distribution</span>
                      <span className="font-mono text-[9px] text-slate-400">{selectedTimePeriod}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {Object.entries(activePolygonDetail.categoryBreakdown).map(([catName, count]) => (
                        <span
                          key={catName}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                            count > 0
                              ? "bg-indigo-950/80 text-indigo-300 border border-indigo-800"
                              : "bg-slate-800/80 text-slate-400"
                          }`}
                        >
                          <span>{catName}:</span>
                          <strong className="font-mono font-bold">{count}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk Drivers */}
                <div className="p-2.5 rounded-xl bg-[#131d36]/90 border border-slate-700/60 space-y-1">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                    <Info className="h-3 w-3 text-indigo-400" /> Sector Risk Drivers & Vulnerabilities
                  </h4>
                  <ul className="space-y-0.5 text-[11px] text-slate-300">
                    {(activePolygonDetail ? activePolygonDetail.highRiskReasons : activeZoneDetail?.highRiskReasons || []).map(
                      (reason, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="h-1 w-1 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                          <span>{reason}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {/* AI Directive */}
                <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 space-y-0.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-indigo-400" /> AI Tactical Directive
                  </h4>
                  <p className="text-[11px] text-indigo-200 leading-snug font-medium">
                    {activePolygonDetail ? activePolygonDetail.aiRecommendation : activeZoneDetail?.aiRecommendation}
                  </p>
                </div>

                {/* Commander Info */}
                {activePolygonDetail && (
                  <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-1 border-t border-slate-800">
                    <span>Commander: <strong className="text-slate-200">{activePolygonDetail.officerInCharge}</strong></span>
                    <a
                      href={`tel:${activePolygonDetail.contactNumber}`}
                      className="text-indigo-400 font-semibold hover:underline"
                    >
                      {activePolygonDetail.contactNumber}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </MapOverlayPortal>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 6. BOTTOM-RIGHT COMPACT & COLLAPSIBLE FLOATING LEGEND                 */}
      {/* --------------------------------------------------------------------- */}
      <div className={`hidden sm:block absolute right-2.5 sm:right-3.5 bottom-2.5 sm:bottom-3.5 z-20 pointer-events-auto transition-opacity duration-200 ${showNearbyServicesPanel ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        {isLegendCollapsed ? (
          <button
            type="button"
            onClick={() => setIsLegendCollapsed(false)}
            aria-label="Show Crime Risk Mosaic"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0c1427]/95 backdrop-blur-md border border-slate-700/80 shadow-md text-xs font-bold text-slate-200 hover:bg-slate-800 transition active:scale-95 cursor-pointer"
          >
            <Shield className="h-3.5 w-3.5 text-indigo-400" />
            <span>Risk Mosaic</span>
            <ChevronUp className="h-3 w-3 text-slate-400" />
          </button>
        ) : (
          <div className="p-3 rounded-2xl bg-[#0c1427]/95 backdrop-blur-md border border-slate-700/80 shadow-2xl w-64 text-white">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-100 mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                <span className="font-black">CRIME RISK MOSAIC</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-slate-400">16 SECTORS</span>
                <button
                  type="button"
                  onClick={() => setIsLegendCollapsed(true)}
                  title="Collapse legend"
                  aria-label="Collapse legend"
                  className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shrink-0" />
                  <span className="font-semibold text-slate-200">High Risk Sector</span>
                </div>
                <span className="font-mono text-[11px] font-bold text-rose-500">70-100</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="font-semibold text-slate-200">Medium Risk Sector</span>
                </div>
                <span className="font-mono text-[11px] font-bold text-amber-500">40-69</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-semibold text-slate-200">Low Risk Sector</span>
                </div>
                <span className="font-mono text-[11px] font-bold text-emerald-400">0-39</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-400">Baseline / Insufficient</span>
                </div>
                <span className="font-mono text-[11px] text-slate-400">&lt; 10</span>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>🚓 Patrols</span>
                <span>📹 CCTV</span>
                <span>🏥 Health</span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                <span>Real-Time Nagpur Police Incident Feeds</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}