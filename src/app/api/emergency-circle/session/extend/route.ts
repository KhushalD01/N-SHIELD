import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/emergency-circle/authHelper";
import { extendSession } from "@/lib/emergency-circle/circleStore";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId, additionalMinutes } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId." }, { status: 400 });
    }

    const extendedSession = await extendSession(sessionId, user.id, additionalMinutes || 30);
    if (!extendedSession) {
      return NextResponse.json({ error: "Session not found or cannot be extended." }, { status: 404 });
    }

    return NextResponse.json({ success: true, session: extendedSession });
  } catch (err: any) {
    console.error("POST /api/emergency-circle/session/extend error:", err);
    return NextResponse.json({ error: "Failed to extend session." }, { status: 500 });
  }
}

