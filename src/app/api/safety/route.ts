import { NextRequest, NextResponse } from "next/server";
import { evaluateRouteRisk, getRouteIncidentEvidence } from "@/lib/safety/evaluateRouteRisk";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { geometry, distanceMeters = 0, corridorBufferMeters = 750 } = body;

    if (!Array.isArray(geometry) || geometry.length === 0) {
      return NextResponse.json(
        { error: "Field 'geometry' must be a non-empty array of [lat, lng] points." },
        { status: 400 }
      );
    }

    const assessment = evaluateRouteRisk({
      routeId: body.routeId || "eval-route",
      geometry,
      distanceMeters,
      corridorBufferMeters,
    });

    const incidentEvidence = getRouteIncidentEvidence(geometry, corridorBufferMeters);

    return NextResponse.json({
      assessment,
      incidentEvidence,
      retrievedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to evaluate route safety.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
