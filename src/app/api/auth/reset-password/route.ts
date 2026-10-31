import { NextRequest, NextResponse } from "next/server";
import { verifyPasswordResetToken } from "@/lib/auth/token";
import { findUserById, updateUserPassword } from "@/lib/auth/userStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password, confirmPassword } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing password reset token." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

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

    // Verify token cryptographically
    const payload = await verifyPasswordResetToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Password reset link has expired or is invalid. Please request a new one." },
        { status: 400 }
      );
    }

    // Verify user exists and token matches
    const user = await findUserById(payload.userId);
    if (!user || user.resetToken !== token) {
      return NextResponse.json(
        { error: "This password reset token has already been used or is invalid." },
        { status: 400 }
      );
    }

    // Update password
    await updateUserPassword(user.id, password);

    return NextResponse.json({
      success: true,
      message: "Password has been successfully reset. You can now sign in with your new password.",
    });
  } catch (err: any) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { error: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}
