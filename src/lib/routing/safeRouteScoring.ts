/**
 * Safe Route Scoring Service
 * Transparent, multi-factor scoring model weighing accessibility, incident severity, time, and distance
 * N-SHIELD: AI-Driven Urban Safety Intelligence Model
 */

import type { RouteOption } from "@/lib/validation/assistantSchemas";
import type { CandidateRouteScore, RouteImpactReport } from "./types";

export interface ScoringWeights {
  closurePenalty: number;
  incidentWeight: number;
  timeWeight: number; // weight per 60 seconds
  distanceWeight: number; // weight per 1000 meters
  lightingCctvMaxDiscount: number;
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  closurePenalty: 10000, // Hard constraint: road closure renders route unusable
  incidentWeight: 1.0,
  timeWeight: 0.8, // 0.8 pts per minute of travel
  distanceWeight: 0.5, // 0.5 pts per km of travel
  lightingCctvMaxDiscount: 12, // Up to 12 pts safety discount for verified well-lit corridors
};

/**
 * Checks if route passes through verified well-lit or high-CCTV corridors in Nagpur
 */
export function estimateCorridorSafetyBoost(route: RouteOption): number {
  const via = (route.via || route.name || "").toLowerCase();

  // Known high-surveillance, brightly lit corridors in Nagpur
  if (
    via.includes("west high court") ||
    via.includes("whc") ||
    via.includes("metro transit") ||
    via.includes("civil lines") ||
    via.includes("wardha road")
  ) {
    return 10;
  }
  if (via.includes("shankar nagar") || via.includes("dharampeth") || via.includes("ramdaspeth")) {
    return 6;
  }
  return 2;
}

/**
 * Computes transparent composite risk score for a candidate route
 */
export function scoreCandidateRoute(
  route: RouteOption,
  impactReport: RouteImpactReport,
  weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS
): CandidateRouteScore {
  const travelTimeMinutes = route.durationSeconds / 60;
  const travelTimeScore = Math.round(travelTimeMinutes * weights.timeWeight);

  const distanceKm = route.distanceMeters / 1000;
  const distanceScore = Math.round(distanceKm * weights.distanceWeight);

  const incidentPenalty = Math.round(impactReport.totalIncidentScore * weights.incidentWeight);
  const closurePenalty = impactReport.hasConfirmedClosure ? weights.closurePenalty : 0;
  const lightingCctvBoost = estimateCorridorSafetyBoost(route);

  // If road is closed, composite score is pegged at 100+ (blocked)
  let compositeRiskScore: number;
  let riskTier: CandidateRouteScore["riskTier"];

  if (impactReport.hasConfirmedClosure) {
    compositeRiskScore = 100;
    riskTier = "blocked";
  } else {
    // Scaled from 0 (safest) to 100 (highest risk)
    const rawScore = 15 + incidentPenalty + travelTimeScore * 0.4 + distanceScore * 0.2 - lightingCctvBoost;
    compositeRiskScore = Math.max(5, Math.min(95, Math.round(rawScore)));

    if (compositeRiskScore <= 32) {
      riskTier = "lower";
    } else if (compositeRiskScore <= 60) {
      riskTier = "similar";
    } else {
      riskTier = "higher";
    }
  }

  return {
    route,
    impactReport,
    travelTimeScore,
    distanceScore,
    incidentPenalty,
    closurePenalty,
    lightingCctvBoost,
    compositeRiskScore,
    riskTier,
  };
}
