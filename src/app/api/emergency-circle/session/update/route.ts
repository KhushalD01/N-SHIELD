import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/emergency-circle/authHelper";
import { updateSessionLocation } from "@/lib/emergency-circle/circleStore";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId, location } = body;

    if (!sessionId || !location) {
      return NextResponse.json({ error: "Missing sessionId or location data." }, { status: 400 });
    }

    const updatedSession = await updateSessionLocation(sessionId, user.id, {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy || 10,
      timestamp: new Date().toISOString(),
      speed: location.speed ?? null,
      heading: location.heading ?? null,
    });

    if (!updatedSession) {
      return NextResponse.json(
        { error: "Active session not found or has been stopped/expired." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, session: updatedSession });
  } catch (err: any) {
    console.error("POST /api/emergency-circle/session/update error:", err);
    return NextResponse.json({ error: "Failed to update location." }, { status: 500 });
  }
}

