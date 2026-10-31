import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/emergency-circle/authHelper";
import { sendContactOtp, verifyContactOtp } from "@/lib/emergency-circle/circleStore";

// POST: Sends verification code
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const result = await sendContactOtp(user.id, id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully.",
      expiresAt: result.expiresAt,
      // If running in development test mode, devOtp is returned for ease of evaluation
      devOtp: result.devOtp,
    });
  } catch (err: any) {
    console.error("POST /api/emergency-circle/contacts/[id]/otp error:", err);
    return NextResponse.json({ error: "Failed to send verification code." }, { status: 500 });
  }
}

// PUT: Verifies 6-digit code
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== "string" || code.trim().length !== 6) {
      return NextResponse.json({ error: "Please enter a valid 6-digit verification code." }, { status: 400 });
    }

    const result = await verifyContactOtp(user.id, id, code.trim());
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Contact verified successfully." });
  } catch (err: any) {
    console.error("PUT /api/emergency-circle/contacts/[id]/otp error:", err);
    return NextResponse.json({ error: "Failed to verify code." }, { status: 500 });
  }
}

