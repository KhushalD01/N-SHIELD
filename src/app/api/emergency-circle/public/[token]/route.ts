import { NextRequest, NextResponse } from "next/server";
import { getSessionByToken } from "@/lib/emergency-circle/circleStore";
import type { PublicSharedLocationView } from "@/lib/emergency-circle/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token || typeof token !== "string" || token.length < 16) {
      return NextResponse.json(
        { error: "Invalid emergency location token." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const session = await getSessionByToken(token);
    if (!session) {
      return NextResponse.json(
        { error: "Emergency sharing link not found or has been revoked." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    // Determine staleness (more than 75 seconds without updates)
    const lastUpdateMs = new Date(session.lastUpdatedAt).getTime();
    const nowMs = Date.now();
    const isStale = session.status === "active" && nowMs - lastUpdateMs > 75 * 1000;

    // Strict sanitization: Return ONLY public viewer fields, NEVER leaking contacts or passwords
    const publicView: PublicSharedLocationView = {
      token: session.token,
      userName: session.userName,
      status: session.status,
      startedAt: session.startedAt,
      expiresAt: session.expiresAt,
      lastUpdatedAt: session.lastUpdatedAt,
      currentLocation: session.currentLocation,
      isStale,
    };

    return NextResponse.json(
      { success: true, session: publicView },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (err: any) {
    console.error("GET /api/emergency-circle/public/[token] error:", err);
    return NextResponse.json(
      { error: "Failed to load shared location." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

