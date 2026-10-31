/**
 * Dynamic Safe Route Reconstruction System - Domain Types
 * N-SHIELD: AI-Driven Urban Safety Intelligence Model
 */

import type { RouteOption } from "@/lib/validation/assistantSchemas";

export type DisruptionCategory =
  | "protest"
  | "police_alert"
  | "crime"
  | "accident"
  | "fire_emergency"
  | "road_closure"
  | "hazard_weather";

export type IncidentVerificationStatus =
  | "verified_official"
  | "news_corroborated"
  | "unverified_report"
  | "simulated_fixture";

export type IncidentStatus = "active" | "resolved" | "stale" | "unknown";

export type IncidentSeverity = "low" | "medium" | "high" | "critical";

export interface DisruptionLocation {
  lat: number;
  lng: number;
  name: string;
  roadName?: string;
}

export interface DisruptionIncident {
  id: string;
  category: DisruptionCategory;
  title: string;
  description: string;
  location: DisruptionLocation | null;
  sourceName: string;
  sourceUrl?: string;
  eventTime?: string;
  publishedAt: string;
  retrievedAt: string;
  verificationStatus: IncidentVerificationStatus;
  confidence: number; // 0.0 to 1.0
  status: IncidentStatus;
  severity: IncidentSeverity;
  isClosure: boolean; // Confirmed impassable road segment
  impactRadiusMeters: number; // Direct impact buffer around point
}

export interface IncidentImpactOnRoute {
  incident: DisruptionIncident;
  distanceToRouteMeters: number;
  nearestSegmentIndex: number;
  isDirectObstruction: boolean; // On or directly blocking the road
  isNearbyAdvisory: boolean; // Near corridor but road passable
  impactSeverityScore: number;
}

export interface RouteImpactReport {
  routeId: string;
  routeName: string;
  totalDistanceMeters: number;
  durationSeconds: number;
  isMateriallyAffected: boolean;
  hasConfirmedClosure: boolean;
  closureCount: number;
  blockingIncidents: IncidentImpactOnRoute[];
  nearbyIncidents: IncidentImpactOnRoute[];
  totalIncidentScore: number;
  passable: boolean;
  summaryReason: string;
}

export interface CandidateRouteScore {
  route: RouteOption;
  impactReport: RouteImpactReport;
  travelTimeScore: number;
  distanceScore: number;
  incidentPenalty: number;
  closurePenalty: number;
  lightingCctvBoost: number;
  compositeRiskScore: number; // 0 (safest) to 100 (highest risk/blocked)
  riskTier: "lower" | "similar" | "higher" | "blocked";
}

export interface RouteReconstructionAlert {
  alertId: string;
  detectedAt: string;
  activeRouteId: string;
  activeRouteName: string;
  hasDisruption: boolean;
  primaryDisruptionCategory: DisruptionCategory | "none";
  alertHeadline: string;
  alertDetails: string;
  affectedIncidents: DisruptionIncident[];
  recommendedAlternative: {
    route: RouteOption;
    score: CandidateRouteScore;
    timeDeltaSeconds: number; // +X seconds compared to active
    distanceDeltaMeters: number; // +X meters compared to active
    formattedTimeDelta: string;
    formattedDistanceDelta: string;
    recommendationReason: string;
    tradeoffSummary: string;
    dataConfidence: "high" | "moderate" | "preliminary";
    limitations: string[];
  } | null;
  allAlternatives: {
    route: RouteOption;
    score: CandidateRouteScore;
    isPassable: boolean;
  }[];
  requiresUserConfirmation: boolean;
}

export interface RouteMonitoringState {
  isMonitoring: boolean;
  lastCheckedAt: string | null;
  activeRouteId: string | null;
  alertCount: number;
  acknowledgedIncidentIds: string[];
  monitoringIntervalSeconds: number;
  lastError: string | null;
}
