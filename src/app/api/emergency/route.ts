import { NextRequest, NextResponse } from "next/server";
import { getHelplines } from "@/lib/emergency/helplines";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("query") || undefined;

  const helplines = getHelplines(query);

  return NextResponse.json(
    {
      data: helplines,
      total: helplines.length,
      retrievedAt: new Date().toISOString(),
      source: "Official Central and Maharashtra State Emergency Services",
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
