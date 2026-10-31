/**
 * N-SHIELD AI Safety Assistant Data Contracts & Validation Schemas
 * Standardized typed contracts with strict runtime validation.
 */

export type ServiceType = "hospital" | "police_station" | "pharmacy";

export interface ServicePlace {
  id: string;
  name: string;
  type: ServiceType;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  phone?: string | null;
  openingHours?: string;
  isOpenNow?: boolean | null;
  is24x7?: boolean;
  emergencyServices?: string;
  source: string;
  verifiedAt?: string;
  retrievedAt: string;
  distanceMeters?: number;
  formattedDistance?: string;
  roadDistanceMeters?: number;
  formattedRoadDistance?: string;
  estimatedDurationSeconds?: number;
  formattedDuration?: string;
  isNearest?: boolean;
}

export type RelativeRiskLevel = "lower" | "similar" | "higher" | "unknown";
export type EvidenceCoverage = "adequate" | "partial" | "poor";

export interface RouteRiskAssessment {
  relativeRisk: RelativeRiskLevel;
  score?: number; // 0 - 100 risk score
  evidenceCount: number;
  coverage: EvidenceCoverage;
  timeWindow: string;
  sourceMetadata: {
    source: string;
    lastUpdated: string;
    incidentsSampled: number;
  };
  limitations: string[];
  methodologyVersion: string;
  disclaimer: string;
}

export interface RouteOption {
  id: string;
  name: string;
  via: string;
  distanceMeters: number;
  durationSeconds: number;
  formattedDistance: string;
  formattedDuration: string;
  geometry?: [number, number][]; // Lat, Lng polyline points
  provider: "google_routes" | "nshield_transit_corridor";
  safetyAssessment: RouteRiskAssessment;
  highlights?: string[];
}

export interface IncidentEvidenceItem {
  id: string;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  description?: string;
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  occurredAt?: string;
  reportedAt: string;
  sourceName: string;
  sourceUrl?: string;
  verificationStatus: "official" | "corroborated" | "unverified" | "sample_data";
  confidence?: number;
  distanceFromRouteMeters?: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary?: string;
  url: string;
  publisher: string;
  publishedAt?: string;
  retrievedAt: string;
  category?: string;
}

export interface Helpline {
  id: string;
  name: string;
  number: string;
  purpose: string;
  scope: "National" | "State" | "Local";
  sourceUrl: string;
  verifiedAt: string;
  activeStatus: "verified_active" | "operational";
  is24x7: boolean;
}

export interface WebResearchItem {
  id: string;
  title: string;
  url: string;
  snippet: string;
  publisher?: string;
  publishedAt?: string;
  retrievedAt: string;
  extractedFacts?: string[];
  uncertaintyOrLimitations?: string;
  isLiveWeb?: boolean;
}

export interface AssistantRequest {
  message: string;
  userLocation?: {
    lat: number;
    lng: number;
    label?: string;
    isUserSet?: boolean;
    source?: "gps" | "manual" | "default";
  };
  sessionId?: string;
  context?: {
    lastReferencedPlace?: ServicePlace;
    lastPlacesList?: ServicePlace[];
    lastServiceType?: ServiceType;
    lastLocality?: string;
    lastOffset?: number;
    hasMorePlaces?: boolean;
    lastResearchList?: WebResearchItem[];
    lastNewsList?: NewsItem[];
  };
  history?: {
    role: "user" | "assistant";
    text: string;
  }[];
}

export interface AssistantResponse {
  answer: string;
  items?: {
    helplines?: Helpline[];
    places?: ServicePlace[];
    routes?: RouteOption[];
    news?: NewsItem[];
    incidents?: IncidentEvidenceItem[];
    research?: WebResearchItem[];
  };
  sourceMetadata: {
    sourcesUsed: string[];
    retrievedAt: string;
    dataFreshness: string;
    limitations?: string[];
    distanceMode?: "straight_line" | "road_transit";
  };
  contextUpdate?: {
    lastReferencedPlace?: ServicePlace;
    lastPlacesList?: ServicePlace[];
    lastServiceType?: ServiceType;
    lastLocality?: string;
    lastOffset?: number;
    hasMorePlaces?: boolean;
    lastResearchList?: WebResearchItem[];
    lastNewsList?: NewsItem[];
  };
  requiresLocation?: boolean;
  suggestedFollowUps?: string[];
  error?: string;
}

/**
 * Validation utilities
 */
export function validateCoordinates(lat: unknown, lng: unknown): { lat: number; lng: number } | null {
  const nLat = Number(lat);
  const nLng = Number(lng);
  if (
    typeof nLat !== "number" ||
    isNaN(nLat) ||
    !isFinite(nLat) ||
    nLat < -90 ||
    nLat > 90
  ) {
    return null;
  }
  if (
    typeof nLng !== "number" ||
    isNaN(nLng) ||
    !isFinite(nLng) ||
    nLng < -180 ||
    nLng > 180
  ) {
    return null;
  }
  return { lat: nLat, lng: nLng };
}

export function sanitizeText(input: unknown, maxLength = 1000): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[<>]/g, "") // basic sanitization
    .trim()
    .slice(0, maxLength);
}

export function validateServiceType(type: unknown): ServiceType | null {
  if (type === "hospital" || type === "police_station" || type === "pharmacy") {
    return type;
  }
  return null;
}
