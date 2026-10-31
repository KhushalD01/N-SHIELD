/**
 * N-SHIELD Authentication Rate Limiter
 * 
 * In-memory sliding-window rate limiter for sensitive authentication endpoints:
 * - Login: 5 attempts per 15 minutes per IP/email
 * - Registration: 4 attempts per 10 minutes per IP
 * - Forgot Password: 3 requests per 15 minutes per IP/email
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean expired records every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (record.resetAt <= now) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000
): { allowed: boolean; remainingAttempts: number; retryAfterSeconds: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || record.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remainingAttempts: maxAttempts - 1, retryAfterSeconds: 0 };
  }

  if (record.count >= maxAttempts) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
  }

  record.count += 1;
  return {
    allowed: true,
    remainingAttempts: maxAttempts - record.count,
    retryAfterSeconds: 0,
  };
}

export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

