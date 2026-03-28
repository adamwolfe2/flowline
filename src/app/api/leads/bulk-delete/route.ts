import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { leads, funnels } from "@/db/schema";
import { eq, sql, and, inArray } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const ids: string[] = body.ids;

    if (!Array.isArray(ids) || ids.length === 0 || ids.length > 500) {
      return NextResponse.json({ error: "Invalid ids array (1-500 items)" }, { status: 400 });
    }

    // Verify ownership: only delete leads belonging to user's funnels
    const userFunnels = await db
      .select({ id: funnels.id })
      .from(funnels)
      .where(eq(funnels.userId, userId));

    const funnelIds = userFunnels.map((f) => f.id);
    if (funnelIds.length === 0) {
      return NextResponse.json({ error: "No funnels found" }, { status: 404 });
    }

    const result = await db
      .delete(leads)
      .where(
        and(
          inArray(leads.id, ids),
          sql`${leads.funnelId} = ANY(${funnelIds})`
        )
      );

    return NextResponse.json({ deleted: ids.length });
  } catch (error) {
    logger.error("POST /api/leads/bulk-delete error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
