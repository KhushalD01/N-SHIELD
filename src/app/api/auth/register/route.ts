import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByEmail, sanitizeUser } from "@/lib/auth/userStore";
import { createSessionToken } from "@/lib/auth/token";
import { checkRateLimit } from "@/lib/auth/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const body = await req.json();
    const name = body.name || body.fullName;
    const { email, password, confirmPassword, role } = body;
    const phone = body.phone || body.phoneNumber;

    // Rate Limiting (4 attempts per 10 minutes)
    const rateCheck = checkRateLimit(`register:${ip}`, 4, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many registration attempts. Please wait ${Math.ceil(
            rateCheck.retryAfterSeconds / 60
          )} minutes before trying again.`,
        },
        { status: 429 }
      );
    }

    // Input Validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Please enter your full name (at least 2 characters)." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // Check password complexity (at least one letter and one number)
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      return NextResponse.json(
        { error: "Password must contain both letters and numbers." },
        { status: 400 }
      );
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    // Duplicate check
    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    // Create user
    const newUser = await createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      phone: phone ? String(phone).trim() : undefined,
      role: role === "officer" ? "officer" : "citizen",
    });

    const safeUser = sanitizeUser(newUser);
    const token = await createSessionToken(safeUser, false);

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        user: safeUser,
      },
      { status: 201 }
    );

    // Set Session Cookie
    response.cookies.set({
      name: "nshield_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err: any) {
    console.error("Register route error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
