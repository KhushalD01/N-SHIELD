import { NextRequest } from "next/server";
import { verifySessionToken, SessionUser } from "@/lib/auth/token";

/**
 * Extracts and cryptographically verifies the current authenticated user from session cookies.
 */
export async function getSessionUser(req: NextRequest): Promise<SessionUser | null> {
  const cookie = req.cookies.get("nshield_session")?.value;
  if (!cookie) return null;

  try {
    const payload = await verifySessionToken(cookie);
    if (!payload || !payload.user) return null;
    return payload.user;
  } catch (err) {
    return null;
  }
}

