import { logger } from "@/lib/logger";
import { db } from "@/db";
import { webhookDeliveries } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import crypto from "crypto";

/**
 * Compute HMAC-SHA256 signature for webhook payload.
 * If WEBHOOK_SIGNING_SECRET is set, the signature is included as X-Webhook-Signature header.
 * Recipients can verify: HMAC-SHA256(secret, body) === header value.
 */
function computeSignature(body: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(body, "utf8").digest("hex");
}

export async function fireWebhook(url: string, payload: Record<string, unknown>, funnelId?: string, retries = 3): Promise<boolean> {
  let lastStatusCode: number | null = null;
  let lastError: string | null = null;
  let success = false;
  const body = JSON.stringify(payload);
  const signingSecret = process.env.WEBHOOK_SIGNING_SECRET;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (signingSecret) {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const signaturePayload = `${timestamp}.${body}`;
        headers["X-Webhook-Signature"] = computeSignature(signaturePayload, signingSecret);
        headers["X-Webhook-Timestamp"] = timestamp;
      }

      const res = await fetch(url, {
        method: "POST",
        headers,
        body,
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
