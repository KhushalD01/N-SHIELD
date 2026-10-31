import { NextRequest, NextResponse } from "next/server";
import { getActiveDisruptions } from "@/lib/routing/incidentService";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const includeSimulated = searchParams.get("includeSimulated") === "true";
  const fixtureId = searchParams.get("fixtureId") || undefined;
  const maxAgeHours = Number(searchParams.get("maxAgeHours")) || 48;

  const disruptions = await getActiveDisruptions({
    includeSimulated,
    simulatedFixtureId: fixtureId,
    maxAgeHours,
  });

  return NextResponse.json(
    {
      data: disruptions,
      total: disruptions.length,
      retrievedAt: new Date().toISOString(),
      disclaimer:
        "Disruption intelligence aggregates officially corroborated reports and news items. Always verify critical closures locally.",
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    }
  );
}
