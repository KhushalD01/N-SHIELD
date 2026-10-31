import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/token";
import { findUserById, sanitizeUser } from "@/lib/auth/userStore";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("nshield_session")?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      );
    }

    const payload = await verifySessionToken(sessionCookie);
    if (!payload || !payload.user) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      );
    }

    // Refresh user state from persistent store
    const freshUser = await findUserById(payload.user.id);
    if (!freshUser) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: sanitizeUser(freshUser),
    });
  } catch (err: any) {
    console.error("Session check error:", err);
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 500 }
    );
  }
}

