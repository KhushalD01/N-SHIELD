import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/emergency-circle/authHelper";
import { stopSession } from "@/lib/emergency-circle/circleStore";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId." }, { status: 400 });
    }

    const stoppedSession = await stopSession(sessionId, user.id);
    if (!stoppedSession) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Emergency location sharing stopped.", session: stoppedSession });
  } catch (err: any) {
    console.error("POST /api/emergency-circle/session/stop error:", err);
    return NextResponse.json({ error: "Failed to stop sharing session." }, { status: 500 });
  }
}

