/**
 * N-SHIELD Cryptographic Session & Token Engine
 * 
 * Generates and verifies signed JSON Web Tokens (JWT) using Web Crypto HMAC-SHA256.
 * Zero external dependencies. Fully compatible with Next.js Edge Runtime (middleware)
 * and Node.js server runtimes.
 */

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "citizen" | "officer" | "admin";
  emailVerified?: boolean;
  createdAt?: string;
  locality?: string;
  phone?: string;
}

export interface SessionPayload {
  user: SessionUser;
  iat: number; // Issued at (seconds)
  exp: number; // Expiration (seconds)
  jti?: string; // Unique token ID
}

export interface ResetTokenPayload {
  type: "password_reset";
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface EmailVerificationPayload {
  type: "email_verification";
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

const DEFAULT_SECRET = "nshield_nagpur_urban_safety_intelligence_jwt_secret_key_2026";

function getSecretKey(): string {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || DEFAULT_SECRET;
}

function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return atob(base64);
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Signs a payload object and produces a compact JWT (header.payload.signature)
 */
async function signJwt(payload: any, secret: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const key = await getHmacKey(secret);
  const enc = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(dataToSign));

  // Convert signature buffer to binary string for base64url
  const sigBytes = new Uint8Array(signatureBuffer);
  let binary = "";
  for (let i = 0; i < sigBytes.length; i++) {
    binary += String.fromCharCode(sigBytes[i]);
  }
  const encodedSignature = base64UrlEncode(binary);

  return `${dataToSign}.${encodedSignature}`;
}

/**
 * Verifies and parses a signed JWT. Returns null if invalid or expired.
 */
async function verifyJwt<T>(token: string, secret: string): Promise<T | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const dataToVerify = `${encodedHeader}.${encodedPayload}`;

    const key = await getHmacKey(secret);
    const enc = new TextEncoder();

    // Decode signature from base64url
    const rawSig = base64UrlDecode(encodedSignature);
    const sigBytes = new Uint8Array(rawSig.length);
    for (let i = 0; i < rawSig.length; i++) {
      sigBytes[i] = rawSig.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(dataToVerify));
    if (!isValid) return null;

    const payload: any = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    // Expiration check
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload as T;
  } catch (err) {
    return null;
  }
}

/**
 * Creates a signed session token.
 * Default lifetime: 7 days. If rememberMe is true: 30 days.
 */
export async function createSessionToken(user: SessionUser, rememberMe = false): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const durationSeconds = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // 30 days vs 7 days

  const payload: SessionPayload = {
    user,
    iat: now,
    exp: now + durationSeconds,
    jti: crypto.randomUUID(),
  };

  return signJwt(payload, getSecretKey());
}

/**
 * Verifies a session token string from cookie or header
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  return verifyJwt<SessionPayload>(token, getSecretKey());
}

/**
 * Creates a single-use password reset token valid for 1 hour
 */
export async function createPasswordResetToken(userId: string, email: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: ResetTokenPayload = {
    type: "password_reset",
    userId,
    email,
    iat: now,
    exp: now + 3600, // 1 hour
  };
  return signJwt(payload, getSecretKey());
}

/**
 * Verifies a password reset token
 */
export async function verifyPasswordResetToken(token: string): Promise<ResetTokenPayload | null> {
  const payload = await verifyJwt<ResetTokenPayload>(token, getSecretKey());
  if (!payload || payload.type !== "password_reset") return null;
  return payload;
}

/**
 * Creates an email verification token valid for 24 hours
 */
export async function createEmailVerificationToken(userId: string, email: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: EmailVerificationPayload = {
    type: "email_verification",
    userId,
    email,
    iat: now,
    exp: now + 24 * 3600, // 24 hours
  };
  return signJwt(payload, getSecretKey());
}

/**
 * Verifies an email verification token
 */
export async function verifyEmailVerificationToken(token: string): Promise<EmailVerificationPayload | null> {
  const payload = await verifyJwt<EmailVerificationPayload>(token, getSecretKey());
  if (!payload || payload.type !== "email_verification") return null;
  return payload;
}

