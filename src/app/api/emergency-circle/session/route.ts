import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/emergency-circle/authHelper";
import {
  getActiveSessionForUser,
  startEmergencySession,
} from "@/lib/emergency-circle/circleStore";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const activeSession = await getActiveSessionForUser(user.id);
    return NextResponse.json({ success: true, session: activeSession });
  } catch (err: any) {
    console.error("GET /api/emergency-circle/session error:", err);
    return NextResponse.json({ error: "Failed to retrieve active session." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in to share emergency location." }, { status: 401 });
    }

    const body = await req.json();
    const { contactIds, location } = body;

    if (!Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one verified contact to notify." },
        { status: 400 }
      );
    }

    if (
      !location ||
      typeof location.latitude !== "number" ||
      typeof location.longitude !== "number" ||
      isNaN(location.latitude) ||
      isNaN(location.longitude)
    ) {
      return NextResponse.json(
        { error: "Valid GPS coordinates are required to start an emergency sharing session." },
        { status: 400 }
      );
    }

    // Determine current origin URL for generating the secure link
    const host = req.headers.get("host") || "localhost:3000";
    const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const originUrl = `${proto}://${host}`;

    const result = await startEmergencySession(
      user.id,
      user.name || "Nagpur Citizen",
      contactIds,
      {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy || 15,
        timestamp: new Date().toISOString(),
      },
      originUrl
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, session: result.session }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/emergency-circle/session error:", err);
    return NextResponse.json({ error: "Failed to start emergency location sharing." }, { status: 500 });
  }
}

