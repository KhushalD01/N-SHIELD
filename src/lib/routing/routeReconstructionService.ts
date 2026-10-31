/**
 * Route Reconstruction Service
 * Evaluates candidate alternatives, recommends the best alternative with transparent explanations,
 * and builds route-disruption alerts requiring explicit user confirmation.
 * N-SHIELD: AI-Driven Urban Safety Intelligence Model
 */

import { formatDistance } from "@/lib/geoUtils";
import { formatDuration } from "@/lib/routing/provider";
import type { RouteOption } from "@/lib/validation/assistantSchemas";
import type {
  CandidateRouteScore,
  DisruptionIncident,
  RouteImpactReport,
  RouteReconstructionAlert,
} from "./types";

export function buildRouteReconstructionAlert(params: {
  activeRoute: RouteOption;
  activeScore: CandidateRouteScore;
  candidateScores: CandidateRouteScore[];
  incidents: DisruptionIncident[];
}): RouteReconstructionAlert {
  const { activeRoute, activeScore, candidateScores, incidents } = params;

  const isDisrupted = activeScore.impactReport.isMateriallyAffected;
  const closurePresent = activeScore.impactReport.hasConfirmedClosure;

  // Filter alternatives (exclude active route)
  const alternativeCandidates = candidateScores.filter(
    (cs) => cs.route.id !== activeRoute.id
  );

  // Find passable alternatives
  const passableAlternatives = alternativeCandidates.filter(
    (cs) => cs.impactReport.passable
  );

  // Sort by lowest composite risk score, then duration
  passableAlternatives.sort((a, b) => {
    if (a.compositeRiskScore !== b.compositeRiskScore) {
      return a.compositeRiskScore - b.compositeRiskScore;
    }
    return a.route.durationSeconds - b.route.durationSeconds;
  });

  const bestAlternative = passableAlternatives.length > 0 ? passableAlternatives[0] : null;

  let alertHeadline = "Route Monitored — No Disruptions Detected";
  let alertDetails = "Your active route remains clear based on currently reported incidents and traffic advisories.";
  let primaryCategory: RouteReconstructionAlert["primaryDisruptionCategory"] = "none";

  if (closurePresent) {
    alertHeadline = "🚨 Active Route Obstructed: Confirmed Road Closure";
    alertDetails = `A confirmed road closure was detected on your route (${activeScore.impactReport.summaryReason}). An alternative route has been reconstructed below.`;
    primaryCategory = "road_closure";
  } else if (isDisrupted) {
    const topBlocking = activeScore.impactReport.blockingIncidents[0]?.incident;
    const catLabel = topBlocking ? topBlocking.category.replace("_", " ") : "incident";
    alertHeadline = `⚠️ Route Disruption Alert: Active ${catLabel.toUpperCase()}`;
    alertDetails = `A material hazard was reported on or directly along your active corridor (${activeScore.impactReport.summaryReason}). Review the recommended detour below.`;
    primaryCategory = topBlocking?.category || "police_alert";
  }

  // Format recommended alternative details
  let recommendedAltPayload: RouteReconstructionAlert["recommendedAlternative"] = null;

  if (isDisrupted && bestAlternative) {
    const timeDeltaSeconds = bestAlternative.route.durationSeconds - activeRoute.durationSeconds;
    const distanceDeltaMeters = bestAlternative.route.distanceMeters - activeRoute.distanceMeters;

    const formattedTimeDelta =
      timeDeltaSeconds > 0
        ? `+${Math.round(timeDeltaSeconds / 60)} mins`
        : timeDeltaSeconds < 0
        ? `-${Math.round(Math.abs(timeDeltaSeconds) / 60)} mins`
        : "Same time";

    const formattedDistanceDelta =
      distanceDeltaMeters > 0
        ? `+${(distanceDeltaMeters / 1000).toFixed(1)} km`
        : distanceDeltaMeters < 0
        ? `-${(Math.abs(distanceDeltaMeters) / 1000).toFixed(1)} km`
        : "Same distance";

    // Build specific, honest recommendation reason
    let recommendationReason = "";
    if (closurePresent) {
      recommendationReason = `Completely bypasses the impassable road closure on ${activeRoute.via || "the primary corridor"} via ${bestAlternative.route.via || "alternative transit route"}.`;
    } else {
      recommendationReason = `Avoids ${activeScore.impactReport.blockingIncidents.length} active hazard point(s) with lower estimated risk along ${bestAlternative.route.via || "alternative corridor"}.`;
    }

    const tradeoffSummary = `${formattedTimeDelta} (${formatDuration(
      bestAlternative.route.durationSeconds
    )}) · ${formattedDistanceDelta} (${formatDistance(
      bestAlternative.route.distanceMeters
    )}) · Lower estimated risk based on available reports.`;

    recommendedAltPayload = {
      route: bestAlternative.route,
      score: bestAlternative,
      timeDeltaSeconds,
      distanceDeltaMeters,
      formattedTimeDelta,
      formattedDistanceDelta,
      recommendationReason,
      tradeoffSummary,
      dataConfidence: "moderate",
      limitations: [
        "Assessment reflects officially reported and corroborated incidents; unrecorded local events are not represented.",
        "Traffic conditions, lighting, and police patrols vary across daytime and nighttime hours.",
        "A lower estimated risk score does not guarantee absolute physical safety.",
      ],
    };
  }

  return {
    alertId: `alert-${Date.now()}`,
    detectedAt: new Date().toISOString(),
    activeRouteId: activeRoute.id,
    activeRouteName: activeRoute.name,
    hasDisruption: isDisrupted,
    primaryDisruptionCategory: primaryCategory,
    alertHeadline,
    alertDetails,
    affectedIncidents: activeScore.impactReport.blockingIncidents.map((b) => b.incident),
    recommendedAlternative: recommendedAltPayload,
    allAlternatives: alternativeCandidates.map((c) => ({
      route: c.route,
      score: c,
      isPassable: c.impactReport.passable,
    })),
    requiresUserConfirmation: true, // Never silently switch routes
  };
}
