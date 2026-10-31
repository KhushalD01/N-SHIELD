import { NextRequest, NextResponse } from "next/server";
import { calculateNagpurRoutes } from "@/lib/routing/provider";
import { getActiveDisruptions } from "@/lib/routing/incidentService";
import { assessRouteIncidentImpact } from "@/lib/routing/incidentImpactService";
import { scoreCandidateRoute } from "@/lib/routing/safeRouteScoring";
import { buildRouteReconstructionAlert } from "@/lib/routing/routeReconstructionService";
import { evaluateMonitoringChange } from "@/lib/routing/routeMonitoringService";
import type { CandidateRouteScore } from "@/lib/routing/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      activeRouteId,
      origin,
      destination,
      simulatedDisruptionId,
      acknowledgedIncidentIds = [],
    } = body;

    if (!origin || !destination) {
      return NextResponse.json(
        { error: "Fields 'origin' and 'destination' are required." },
        { status: 400 }
      );
    }

    // 1. Recalculate routes
    const routes = await calculateNagpurRoutes({
      origin,
      destination,
    });

    if (routes.length === 0) {
      return NextResponse.json(
        { error: "No routes found between specified points." },
        { status: 404 }
      );
    }

    // 2. Ingest active disruption incidents
    const disruptions = await getActiveDisruptions({
      includeSimulated: !!simulatedDisruptionId,
      simulatedFixtureId: simulatedDisruptionId,
    });

    // 3. Assess impact and score all candidate routes
    const candidateScores: CandidateRouteScore[] = [];

    for (const r of routes) {
      const report = assessRouteIncidentImpact({
        routeId: r.id,
        routeName: r.name,
        geometry: r.geometry || [],
        distanceMeters: r.distanceMeters,
        durationSeconds: r.durationSeconds,
        incidents: disruptions,
      });

      const score = scoreCandidateRoute(r, report);
      candidateScores.push(score);
    }

    // Determine current active route score
    const activeScore =
      candidateScores.find((cs) => cs.route.id === activeRouteId) || candidateScores[0];
    const activeRoute = activeScore.route;

    // 4. Reconstruct alternatives
    const alert = buildRouteReconstructionAlert({
      activeRoute,
      activeScore,
      candidateScores,
      incidents: disruptions,
    });

    // 5. Evaluate if this alert represents a new unacknowledged change
    const monitoringResult = evaluateMonitoringChange(alert, acknowledgedIncidentIds);

    return NextResponse.json({
      alert,
      monitoringResult,
      activeRoute,
      allAlternatives: alert.allAlternatives,
      recommendedAlternative: alert.recommendedAlternative,
      retrievedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to reconstruct routes.";
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
