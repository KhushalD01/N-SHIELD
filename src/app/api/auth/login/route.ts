import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, recordUserLogin, sanitizeUser } from "@/lib/auth/userStore";
import { verifyPassword } from "@/lib/auth/passwords";
import { createSessionToken } from "@/lib/auth/token";
import { checkRateLimit, resetRateLimit } from "@/lib/auth/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const body = await req.json();
    const { email, password, rememberMe = false } = body;

    // Input Validation
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Please enter your password." },
        { status: 400 }
      );
    }

    // Rate Limiting (5 attempts per 15 minutes)
    const rateLimitKey = `login:${ip}:${email.trim().toLowerCase()}`;
    const rateCheck = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed login attempts. Please wait ${Math.ceil(
            rateCheck.retryAfterSeconds / 60
          )} minutes before trying again.`,
        },
        { status: 429 }
      );
    }

    // Lookup user
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password. Please check your credentials." },
        { status: 401 }
      );
    }

    // Verify Password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password. Please check your credentials." },
        { status: 401 }
      );
    }

    // Reset rate limit on success
    resetRateLimit(rateLimitKey);

    // Record login timestamp
    await recordUserLogin(user.id);

    // Create session token
    const safeUser = sanitizeUser(user);
    const token = await createSessionToken(safeUser, Boolean(rememberMe));

    // Construct response with secure HttpOnly cookie
    const response = NextResponse.json({
      success: true,
      message: "Authentication successful",
      user: safeUser,
    });

    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // 30 days vs 7 days

    response.cookies.set({
      name: "nshield_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return response;
  } catch (err: any) {
    console.error("Login route error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during sign in. Please try again." },
      { status: 500 }
    );
  }
}

