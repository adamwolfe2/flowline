import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Simple in-memory fallback when Redis is down
const memoryStore = new Map<string, { count: number; resetAt: number }>();
const MAX_MEMORY_STORE_SIZE = 1000;

// Only create rate limiter if Redis is configured
function createRateLimiter(requests: number, window: Duration) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
  });
}

export const submitLimiter = createRateLimiter(10, "1 h");   // 10 submissions per IP per hour
export const eventLimiter = createRateLimiter(100, "1 m");   // 100 events per IP per minute
export const aiLimiter = createRateLimiter(5, "1 d");        // 5 AI generations per user per day
export const sessionLimiter = createRateLimiter(60, "1 m");  // 60 session starts per IP per minute
export const uploadLimiter = createRateLimiter(10, "1 h");   // 10 uploads per user per hour
export const ogLimiter = createRateLimiter(30, "1 m");       // 30 OG image requests per IP per minute
export const apiLimiter = createRateLimiter(30, "1 m");      // 30 authenticated API requests per user per minute
export const sharedAnalyticsLimiter = createRateLimiter(20, "1 m"); // 20 shared analytics requests per IP per minute

export interface RateLimitResult {
  limited: boolean;
  remaining?: number;
  limit?: number;
}

function cleanupMemoryStore() {
  if (memoryStore.size > MAX_MEMORY_STORE_SIZE) {
    const now = Date.now();
    // First pass: remove expired entries
    for (const [key, val] of memoryStore) {
      if (val.resetAt < now) {
        memoryStore.delete(key);
      }
    }
    // If still too large, delete oldest half
    if (memoryStore.size > MAX_MEMORY_STORE_SIZE) {
      const entries = Array.from(memoryStore.entries());
      entries.sort((a, b) => a[1].resetAt - b[1].resetAt);
      for (let i = 0; i < entries.length / 2; i++) {
        memoryStore.delete(entries[i][0]);
      }
    }
  }
}

export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string,
  fallbackLimit = 30 // generous fallback per minute
): Promise<RateLimitResult> {
  if (!limiter) {
    // No Redis configured — use in-memory fallback
    const now = Date.now();
    const key = identifier;
    const entry = memoryStore.get(key);

    if (!entry || entry.resetAt < now) {
      memoryStore.set(key, { count: 1, resetAt: now + 60000 });
      cleanupMemoryStore();
      return { limited: false, remaining: fallbackLimit - 1, limit: fallbackLimit };
    }

    if (entry.count >= fallbackLimit) {
      return { limited: true, remaining: 0, limit: fallbackLimit };
    }

    entry.count++;
    cleanupMemoryStore();
    return { limited: false, remaining: fallbackLimit - entry.count, limit: fallbackLimit };
  }

  try {
    const result = await limiter.limit(identifier);
    return { limited: !result.success, remaining: result.remaining, limit: result.limit };
  } catch {
    // Redis error — use in-memory fallback
    const now = Date.now();
    const entry = memoryStore.get(identifier);
    if (!entry || entry.resetAt < now) {
      memoryStore.set(identifier, { count: 1, resetAt: now + 60000 });
      cleanupMemoryStore();
      return { limited: false, remaining: fallbackLimit - 1, limit: fallbackLimit };
    }
    if (entry.count >= fallbackLimit) {
      return { limited: true, remaining: 0, limit: fallbackLimit };
    }
    entry.count++;
    cleanupMemoryStore();
    return { limited: false, remaining: fallbackLimit - entry.count, limit: fallbackLimit };
  }
}
