import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { eq, and, sql, isNull } from "drizzle-orm";
import { generateApiKey } from "@/lib/api-key";
import { apiLimiter, checkRateLimit } from "@/lib/rate-limit";
import { getUserTeamIds } from "@/lib/team-access";
import { logger } from "@/lib/logger";

const VALID_SCOPES = ["read", "write", "admin"];
const MAX_KEYS_PER_USER = 10;
const MAX_NAME_LENGTH = 50;

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceTeamId = req.headers.get("x-workspace-team-id");
    let resolvedTeamId: string | null = null;
    if (workspaceTeamId) {
      const teamIds = await getUserTeamIds(userId);
      if (teamIds.includes(workspaceTeamId)) {
        resolvedTeamId = workspaceTeamId;
      }
    }

    const keys = await db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        keyPrefix: apiKeys.keyPrefix,
        scopes: apiKeys.scopes,
        lastUsedAt: apiKeys.lastUsedAt,
        expiresAt: apiKeys.expiresAt,
        createdAt: apiKeys.createdAt,
      })
      .from(apiKeys)
      .where(
        resolvedTeamId
          ? and(eq(apiKeys.userId, userId), eq(apiKeys.teamId, resolvedTeamId))
          : and(eq(apiKeys.userId, userId), isNull(apiKeys.teamId))
      );

    return NextResponse.json({ keys }, {
      headers: { "Cache-Control": "private, no-cache" },
    });
  } catch (error) {
    logger.error("GET /api/keys error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResult = await checkRateLimit(apiLimiter, userId);
    if (rateLimitResult.limited) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json();
    const { name, scopes: rawScopes, expiresAt: rawExpiresAt } = body as {
      name?: string;
      scopes?: string[];
      expiresAt?: string;
    };

    // Validate name
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }
    if (name.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: `Name must be ${MAX_NAME_LENGTH} characters or less` },
        { status: 400 }
      );
    }

    // Validate scopes
    const scopes = rawScopes ?? ["read", "write"];
    if (!Array.isArray(scopes) || scopes.length === 0) {
      return NextResponse.json(
        { error: "Scopes must be a non-empty array" },
        { status: 400 }
      );
    }
    for (const scope of scopes) {
      if (!VALID_SCOPES.includes(scope)) {
        return NextResponse.json(
          { error: `Invalid scope: ${scope}. Valid scopes: ${VALID_SCOPES.join(", ")}` },
          { status: 400 }
        );
      }
    }

    // Validate expiresAt
    let expiresAt: Date | null = null;
    if (rawExpiresAt) {
      const parsed = new Date(rawExpiresAt);
      if (isNaN(parsed.getTime()) || parsed <= new Date()) {
        return NextResponse.json(
          { error: "expiresAt must be a valid future date" },
          { status: 400 }
        );
      }
      expiresAt = parsed;
    }

    // Resolve workspace team context
    const workspaceTeamId = req.headers.get("x-workspace-team-id");
    let resolvedTeamId: string | null = null;
    if (workspaceTeamId) {
      const teamIds = await getUserTeamIds(userId);
      if (teamIds.includes(workspaceTeamId)) {
        resolvedTeamId = workspaceTeamId;
      }
    }

    // Check max keys per user
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId));
    if (Number(countResult?.count ?? 0) >= MAX_KEYS_PER_USER) {
      return NextResponse.json(
        { error: `Maximum of ${MAX_KEYS_PER_USER} API keys allowed` },
        { status: 400 }
      );
    }

    // Generate key
    const { key, prefix, hash } = generateApiKey();

    const [created] = await db
      .insert(apiKeys)
      .values({
        userId,
        teamId: resolvedTeamId,
        name: name.trim(),
        keyPrefix: prefix,
        keyHash: hash,
        scopes,
        expiresAt,
      })
      .returning({
        id: apiKeys.id,
        name: apiKeys.name,
        keyPrefix: apiKeys.keyPrefix,
        scopes: apiKeys.scopes,
        expiresAt: apiKeys.expiresAt,
        createdAt: apiKeys.createdAt,
      });

    return NextResponse.json(
      {
        ...created,
        key, // Full key — shown only once
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("POST /api/keys error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
