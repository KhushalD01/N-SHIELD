import { NextRequest, NextResponse } from "next/server";
import { processAssistantMessage } from "@/lib/assistant/orchestrator";
import type { AssistantRequest } from "@/lib/validation/assistantSchemas";

// Simple in-memory rate limiting map: IP -> timestamp array
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return false;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      {
        error: "Too many requests. Please wait a moment before sending another message.",
        answer: "⚠️ Request limit reached. Please wait a few seconds before asking another question.",
      },
      { status: 429 }
    );
  }

  let body: AssistantRequest;
  try {
    body = await request.json();
  } catch (parseErr) {
    return NextResponse.json(
      { error: "Invalid JSON format in request body." },
      { status: 400 }
    );
  }

  try {
    const { message, userLocation, sessionId, context, history } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message cannot be empty." },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { error: "Message length exceeds maximum limit of 1000 characters." },
        { status: 400 }
      );
    }

    const response = await processAssistantMessage({
      message,
      userLocation,
      sessionId,
      context,
      history,
    });

    return NextResponse.json(response);
  } catch (err: unknown) {
    console.error("AI Assistant Route error:", err);
    const rawMessage = err instanceof Error ? err.message : "Internal server error";
    const safeError = rawMessage.replace(/AIza[0-9A-Za-z-_]{35}/g, "AIza[REDACTED]");
    return NextResponse.json(
      {
        answer: "I encountered an unexpected issue while processing your request. Please try again or use the Emergency SOS button above.",
        error: safeError,
        sourceMetadata: {
          sourcesUsed: ["N-SHIELD Safety Desk"],
          retrievedAt: new Date().toISOString(),
          dataFreshness: "Current",
        },
      },
      { status: 500 }
    );
  }
}
