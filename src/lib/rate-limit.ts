import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

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
  identifier: string
): Promise<{ success: boolean; remaining?: number }> {
  if (!limiter) return { success: true };
  try {
    const result = await limiter.limit(identifier);
    return { success: result.success, remaining: result.remaining };
  } catch {
    // If Redis is down, allow the request
    return { success: true };
  }
}
