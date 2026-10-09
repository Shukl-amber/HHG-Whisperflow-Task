interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const attempts = new Map<string, RateLimitEntry>();

// Limit: 5 attempts per 10 minutes
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;

export function checkRateLimit(key: string): { allowed: boolean; remaining: number; retryAfterSec?: number } {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry) {
    return { allowed: true, remaining: MAX_ATTEMPTS };
  }

  if (now > entry.resetAt) {
    attempts.delete(key);
    return { allowed: true, remaining: MAX_ATTEMPTS };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  return { allowed: true, remaining: MAX_ATTEMPTS - entry.count };
}

export function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
  } else {
    entry.count += 1;
  }
}

export function clearRateLimit(key: string): void {
  attempts.delete(key);
}
