import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { leads, funnels } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const funnelId = searchParams.get("funnelId");

    const rows = await db
      .select({
        email: leads.email,
        score: leads.score,
        tier: leads.calendarTier,
        answers: leads.answers,
        createdAt: leads.createdAt,
        funnelSlug: funnels.slug,
        funnelConfig: funnels.config,
      })
      .from(leads)
      .innerJoin(funnels, eq(leads.funnelId, funnels.id))
      .where(
        funnelId
          ? and(eq(funnels.userId, userId), eq(leads.funnelId, funnelId as string))
          : eq(funnels.userId, userId)
      )
      .orderBy(desc(leads.createdAt))
      .limit(10000);

    if (rows.length === 0) {
      const csv = "email,score,tier,funnel,submitted_at\n";
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="leads-export.csv"`,
        },
      });
    }

    const csvRows = ["email,score,tier,funnel,submitted_at"];
    for (const row of rows) {
      const funnelName = (row.funnelConfig as { brand?: { name?: string } })?.brand?.name ?? row.funnelSlug;
      const date = new Date(row.createdAt).toISOString();
      const escaped = [
        `"${row.email.replace(/"/g, '""')}"`,
        row.score,
        row.tier,
        `"${funnelName.replace(/"/g, '""')}"`,
        date,
      ].join(",");
      csvRows.push(escaped);
    }

    return new NextResponse(csvRows.join("\n"), {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    logger.error("GET /api/leads/export error:", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
