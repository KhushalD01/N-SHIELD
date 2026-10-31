import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, setResetToken } from "@/lib/auth/userStore";
import { createPasswordResetToken } from "@/lib/auth/token";
import { checkRateLimit } from "@/lib/auth/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Rate limiting: 3 requests per 15 minutes per IP
    const rateCheck = checkRateLimit(`forgot:${ip}`, 3, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many password reset requests. Please wait ${Math.ceil(
            rateCheck.retryAfterSeconds / 60
          )} minutes before requesting another reset link.`,
        },
        { status: 429 }
      );
    }

    const user = await findUserByEmail(email);

    // Uniform generic response to prevent email enumeration attacks
    const genericResponse: { success: boolean; message: string; debugResetLink?: string } = {
      success: true,
      message:
        "If an account with that email exists, instructions to reset your password have been generated.",
    };

    if (user) {
      const resetToken = await createPasswordResetToken(user.id, user.email);
      await setResetToken(user.id, resetToken, Date.now() + 3600 * 1000);

      // In development mode, provide the direct reset link in the response for easy evaluation
      const baseUrl = req.nextUrl.origin || "http://localhost:3000";
      const resetLink = `${baseUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;

      if (process.env.NODE_ENV !== "production") {
        genericResponse.debugResetLink = resetLink;
      }
    }

    return NextResponse.json(genericResponse);
  } catch (err: any) {
    console.error("Forgot password route error:", err);
    return NextResponse.json(
      { error: "Unable to process password reset request at this time." },
      { status: 500 }
    );
  }
}
