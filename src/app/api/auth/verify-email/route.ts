import { NextRequest, NextResponse } from "next/server";
import { verifyEmailVerificationToken } from "@/lib/auth/token";
import { findUserById, verifyUserEmail } from "@/lib/auth/userStore";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required." },
        { status: 400 }
      );
    }

    const payload = await verifyEmailVerificationToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Email verification link has expired or is invalid." },
        { status: 400 }
      );
    }

    const user = await findUserById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    await verifyUserEmail(user.id);

    return NextResponse.json({
      success: true,
      message: "Email address successfully verified.",
    });
  } catch (err: any) {
    console.error("Email verification error:", err);
    return NextResponse.json(
      { error: "Email verification failed." },
      { status: 500 }
    );
  }
}

