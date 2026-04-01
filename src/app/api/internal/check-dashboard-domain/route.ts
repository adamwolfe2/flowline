import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { teams } from "@/db/schema";
import { eq } from "drizzle-orm";

// In-memory cache: domain -> { teamId, expiresAt }
const domainCache = new Map<string, { teamId: string | null; expiresAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Internal endpoint for middleware to check if a hostname is a custom dashboard domain.
 * No auth required — internal use only, returns minimal data.
 */
export async function GET(req: NextRequest) {
  const host = req.nextUrl.searchParams.get("host")?.trim().toLowerCase();

  if (!host) {
    return NextResponse.json({ teamId: null });
  }

  // Check cache first
  const cached = domainCache.get(host);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(
      { teamId: cached.teamId },
      { headers: { "Cache-Control": "private, max-age=3600" } }
    );
  }

  try {
    const [team] = await db
      .select({ id: teams.id })
      .from(teams)
      .where(eq(teams.customDashboardDomain, host));

    const teamId = team?.id ?? null;

    // Update cache
    domainCache.set(host, { teamId, expiresAt: Date.now() + CACHE_TTL_MS });

    return NextResponse.json(
      { teamId },
      { headers: { "Cache-Control": "private, max-age=3600" } }
    );
  } catch {
    return NextResponse.json({ teamId: null });
  }
}
