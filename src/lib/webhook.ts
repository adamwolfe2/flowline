import { logger } from "@/lib/logger";
import { db } from "@/db";
import { webhookDeliveries } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function fireWebhook(url: string, payload: Record<string, unknown>, funnelId?: string, retries = 3): Promise<boolean> {
  let lastStatusCode: number | null = null;
  let lastError: string | null = null;
  let success = false;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      lastStatusCode = res.status;

      if (res.ok) {
        success = true;
        break;
      }

      lastError = `HTTP ${res.status} ${res.statusText}`;
      logger.warn(`[webhook] attempt ${attempt + 1}/${retries} failed`, { url, status: res.status, statusText: res.statusText });
    } catch (err) {
      lastError = err instanceof Error ? err.message : "unknown";
      logger.warn(`[webhook] attempt ${attempt + 1}/${retries} error`, { url, error: lastError });
    }

    // Exponential backoff: 1s, 2s, 4s
    if (attempt < retries - 1) {
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }

  if (!success) {
    logger.error(`[webhook] all ${retries} attempts failed`, { url });
  }

  // Log delivery to database (non-blocking)
  if (funnelId) {
    logDelivery(funnelId, url, lastStatusCode, success, retries, lastError).catch(() => {});
  }

  return success;
}

async function logDelivery(funnelId: string, url: string, statusCode: number | null, success: boolean, attempts: number, errorMessage: string | null) {
  try {
    await db.insert(webhookDeliveries).values({
      funnelId,
      url,
      statusCode,
      success,
      attempts,
      errorMessage,
    });

    // Keep only last 20 deliveries per funnel
    await db.execute(sql`
      DELETE FROM ${webhookDeliveries}
      WHERE funnel_id = ${funnelId}
      AND id NOT IN (
        SELECT id FROM ${webhookDeliveries}
        WHERE funnel_id = ${funnelId}
        ORDER BY created_at DESC
        LIMIT 20
      )
    `);
  } catch (err) {
    logger.error("[webhook] failed to log delivery", { error: err instanceof Error ? err.message : String(err) });
  }
}
