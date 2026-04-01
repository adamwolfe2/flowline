import crypto from "crypto";
import { NextRequest } from "next/server";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

const KEY_PREFIX = "myvsl_";
const KEY_BYTE_LENGTH = 24; // 24 bytes = 48 hex chars

/**
 * Generate a new API key with prefix, hash, and raw key.
 * The raw key is shown once at creation time. Only the hash is stored.
 */
export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const randomHex = crypto.randomBytes(KEY_BYTE_LENGTH).toString("hex");
  const key = `${KEY_PREFIX}${randomHex}`;
  const prefix = key.slice(0, 12);
  const hash = hashApiKey(key);
  return { key, prefix, hash };
}

/**
 * SHA-256 hash of a raw API key.
 */
export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key, "utf8").digest("hex");
}

interface ValidateResult {
  valid: boolean;
  userId?: string;
  teamId?: string | null;
  scopes?: string[];
}

/**
 * Validate an API key by hashing it and looking up the record.
 * Checks expiration. Updates lastUsedAt (fire-and-forget).
 */
export async function validateApiKey(key: string): Promise<ValidateResult> {
  try {
    const hash = hashApiKey(key);

    const [row] = await db
      .select({
        id: apiKeys.id,
        userId: apiKeys.userId,
        teamId: apiKeys.teamId,
        scopes: apiKeys.scopes,
        expiresAt: apiKeys.expiresAt,
      })
      .from(apiKeys)
      .where(eq(apiKeys.keyHash, hash));

    if (!row) {
      return { valid: false };
    }

    // Check expiration
    if (row.expiresAt && new Date(row.expiresAt) < new Date()) {
      return { valid: false };
    }

    // Update lastUsedAt (fire-and-forget)
    db.update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, row.id))
      .then(() => {})
      .catch(() => {});

    return {
      valid: true,
      userId: row.userId,
      teamId: row.teamId,
      scopes: row.scopes,
    };
  } catch (error) {
    logger.error("validateApiKey error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { valid: false };
  }
}

interface ApiKeyAuthResult {
  userId: string;
  teamId?: string | null;
  scopes: string[];
}

/**
 * Extract and validate an API key from request headers.
 * Checks x-api-key header and Authorization: Bearer header.
 */
export async function apiKeyAuth(
  req: NextRequest
): Promise<ApiKeyAuthResult | null> {
  // Check x-api-key header first
  let key = req.headers.get("x-api-key");

  // Fall back to Authorization: Bearer
  if (!key) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer myvsl_")) {
      key = authHeader.slice(7); // Remove "Bearer "
    }
  }

  if (!key || !key.startsWith("myvsl_")) {
    return null;
  }

  const result = await validateApiKey(key);

  if (!result.valid || !result.userId) {
    return null;
  }

  return {
    userId: result.userId,
    teamId: result.teamId,
    scopes: result.scopes ?? ["read", "write"],
  };
}
