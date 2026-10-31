import { NextRequest, NextResponse } from "next/server";
import { calculateNagpurRoutes } from "@/lib/routing/provider";
import { getActiveDisruptions } from "@/lib/routing/incidentService";
import { assessRouteIncidentImpact } from "@/lib/routing/incidentImpactService";
import { scoreCandidateRoute } from "@/lib/routing/safeRouteScoring";
import { buildRouteReconstructionAlert } from "@/lib/routing/routeReconstructionService";
import type { CandidateRouteScore, RouteImpactReport } from "@/lib/routing/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { origin, destination, simulatedDisruptionId, includeSimulated = false } = body;

    if (!origin || !destination) {
      return NextResponse.json(
        { error: "Both 'origin' and 'destination' are required fields." },
        { status: 400 }
      );
    }

    // 1. Calculate candidate road routes
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
      includeSimulated: !!includeSimulated || !!simulatedDisruptionId,
      simulatedFixtureId: simulatedDisruptionId,
    });

    // 3. Assess incident impact on each candidate route
    const impactReports: Record<string, RouteImpactReport> = {};
    const candidateScores: CandidateRouteScore[] = [];

    for (const r of routes) {
      const report = assessRouteIncidentImpact({
        routeId: r.id,
        routeName: r.name,
        geometry: r.geometry || [[origin.lat, origin.lng], [destination.lat, destination.lng]],
        distanceMeters: r.distanceMeters,
        durationSeconds: r.durationSeconds,
        incidents: disruptions,
      });

      impactReports[r.id] = report;
      const score = scoreCandidateRoute(r, report);
      candidateScores.push(score);
    }

    // Primary route is initial active candidate
    const activeScore = candidateScores[0];
    const activeRoute = activeScore.route;

    // 4. Generate disruption and reconstruction alert
    const alert = buildRouteReconstructionAlert({
      activeRoute,
      activeScore,
      candidateScores,
      incidents: disruptions,
    });

    return NextResponse.json({
      activeRoute,
      routes,
      candidateScores,
      impactReports,
      alert,
      disruptions,
      total: routes.length,
      retrievedAt: new Date().toISOString(),
      disclaimer:
        "This comparison is based on available reports and data coverage. It does not guarantee safety. Conditions can change; follow official instructions and use your judgment.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to calculate routes.";
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
