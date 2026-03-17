import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { leads, funnels } from "@/db/schema";
import { eq, desc, sql, and, ilike } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const page = parseInt(req.nextUrl.searchParams.get("page") || "0");
    const funnelId = req.nextUrl.searchParams.get("funnelId");
    const tier = req.nextUrl.searchParams.get("tier");
    const search = req.nextUrl.searchParams.get("search");
    const limit = 25;

    // Get user's funnel IDs and names
    const userFunnels = await db
      .select({
        id: funnels.id,
        name: sql<string>`(${funnels.config}->>'brand')::jsonb->>'name'`,
      })
      .from(funnels)
      .where(eq(funnels.userId, userId));

    const funnelIds = userFunnels.map((f) => f.id);
    if (funnelIds.length === 0) {
      return NextResponse.json({ leads: [], total: 0, funnels: [] });
    }

    // Build WHERE conditions
    const conditions = [sql`${leads.funnelId} = ANY(${funnelIds})`];

    if (funnelId) {
      conditions.push(eq(leads.funnelId, funnelId));
    }
    if (tier && ["high", "mid", "low"].includes(tier)) {
      conditions.push(sql`${leads.calendarTier} = ${tier}`);
    }
    if (search) {
      conditions.push(ilike(leads.email, `%${search}%`));
    }

    const whereClause = and(...conditions);

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(leads)
      .where(whereClause);

    // Get paginated leads
    const allLeads = await db
      .select()
      .from(leads)
      .where(whereClause)
      .orderBy(desc(leads.createdAt))
      .limit(limit)
      .offset(page * limit);

    return NextResponse.json({
      leads: allLeads,
      total: Number(countResult?.count ?? 0),
      funnels: userFunnels,
    });
  } catch (error) {
    console.error("GET /api/leads error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
