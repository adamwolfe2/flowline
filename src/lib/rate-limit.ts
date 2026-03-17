import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Simple in-memory fallback when Redis is down
const memoryStore = new Map<string, { count: number; resetAt: number }>();

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

export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string,
  fallbackLimit = 30 // generous fallback per minute
): Promise<{ success: boolean; remaining?: number }> {
  if (!limiter) {
    // No Redis configured — use in-memory fallback
    const now = Date.now();
    const key = identifier;
    const entry = memoryStore.get(key);

    if (!entry || entry.resetAt < now) {
      memoryStore.set(key, { count: 1, resetAt: now + 60000 });
      return { success: true, remaining: fallbackLimit - 1 };
    }

    if (entry.count >= fallbackLimit) {
      return { success: false, remaining: 0 };
    }

    entry.count++;
    return { success: true, remaining: fallbackLimit - entry.count };
  }

  try {
    const result = await limiter.limit(identifier);
    return { success: result.success, remaining: result.remaining };
  } catch {
    // Redis error — use in-memory fallback
    const now = Date.now();
    const entry = memoryStore.get(identifier);
    if (!entry || entry.resetAt < now) {
      memoryStore.set(identifier, { count: 1, resetAt: now + 60000 });
      return { success: true };
    }
    if (entry.count >= fallbackLimit) {
      return { success: false };
    }
    entry.count++;
    return { success: true };
  }
}
