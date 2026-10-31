import { NextRequest, NextResponse } from "next/server";
import { cctvCameras, getMockMeta } from "@/lib/mockData";
import type { CCTVResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const zoneId = searchParams.get("zoneId") ?? undefined;
  const operationalParam = searchParams.get("operational");

  let operationalFilter: boolean | undefined;
  if (operationalParam === "true") operationalFilter = true;
  if (operationalParam === "false") operationalFilter = false;
  if (
    operationalParam !== null &&
    operationalParam !== "true" &&
    operationalParam !== "false"
  ) {
    if (operationalParam !== "") {
      return NextResponse.json(
        { error: "Invalid operational filter. Use: true or false" },
        { status: 400 },
      );
    }
  }

  let filtered = [...cctvCameras];

  if (zoneId) filtered = filtered.filter((camera) => camera.zoneId === zoneId);
  if (operationalFilter !== undefined) {
    filtered = filtered.filter(
      (camera) => camera.isOperational === operationalFilter,
    );
  }

  const operational = filtered.filter((camera) => camera.isOperational).length;
  const nonOperational = filtered.length - operational;

  const response: CCTVResponse = {
    data: filtered,
    meta: {
      ...getMockMeta(filtered.length),
      operational,
      nonOperational,
      filters: {
        ...(zoneId && { zoneId }),
        ...(operationalFilter !== undefined && { operational: operationalFilter }),
      },
    },
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
    },
  });
}
