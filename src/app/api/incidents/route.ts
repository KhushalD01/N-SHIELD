import { NextRequest, NextResponse } from "next/server";
import { getMockMeta, incidents } from "@/lib/mockData";
import type {
  CrimeType,
  IncidentStatus,
  IncidentsResponse,
  Severity,
} from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID_SEVERITIES: Severity[] = ["low", "medium", "high", "critical"];
const VALID_TYPES: CrimeType[] = ["Murder", "Chain-snatching", "Robbery"];
const VALID_STATUSES: IncidentStatus[] = ["open", "investigating", "resolved"];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const zoneId = searchParams.get("zoneId") ?? undefined;
  const severity = searchParams.get("severity") as Severity | null;
  const type = searchParams.get("type") as CrimeType | null;
  const status = searchParams.get("status") as IncidentStatus | null;
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.min(Math.max(Number(limitParam), 1), 50) : undefined;

  if (severity && !VALID_SEVERITIES.includes(severity)) {
    return NextResponse.json(
      { error: "Invalid severity. Use: low, medium, high, critical" },
      { status: 400 },
    );
  }

  if (type && !VALID_TYPES.includes(type)) {
    return NextResponse.json(
      { error: "Invalid type. Use: Murder, Chain-snatching, Robbery" },
      { status: 400 },
    );
  }

  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "Invalid status. Use: open, investigating, resolved" },
      { status: 400 },
    );
  }

  let filtered = [...incidents];

  if (zoneId) filtered = filtered.filter((item) => item.zoneId === zoneId);
  if (severity) filtered = filtered.filter((item) => item.severity === severity);
  if (type) filtered = filtered.filter((item) => item.type === type);
  if (status) filtered = filtered.filter((item) => item.status === status);
  if (limit) filtered = filtered.slice(0, limit);

  const response: IncidentsResponse = {
    data: filtered,
    meta: {
      ...getMockMeta(filtered.length),
      filters: {
        ...(zoneId && { zoneId }),
        ...(severity && { severity }),
        ...(type && { type }),
        ...(status && { status }),
      },
    },
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
