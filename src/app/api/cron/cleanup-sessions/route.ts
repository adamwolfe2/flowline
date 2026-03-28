import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { funnelSessions } from "@/db/schema";
import { and, lt, eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);

    // Delete unconverted sessions older than 90 days (cascade deletes events)
    await db.delete(funnelSessions)
      .where(and(
        eq(funnelSessions.converted, false),
        lt(funnelSessions.startedAt, cutoff)
      ));

    logger.info("Cleanup cron: deleted old sessions", { cutoff: cutoff.toISOString() });
    return NextResponse.json({ success: true, cutoff: cutoff.toISOString() });
  } catch (error) {
    logger.error("Cleanup cron error:", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
