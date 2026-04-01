import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { ghlConnections } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connections = await db
      .select({
        id: ghlConnections.id,
        locationId: ghlConnections.locationId,
        companyId: ghlConnections.companyId,
        scopes: ghlConnections.scopes,
        connectedAt: ghlConnections.connectedAt,
      })
      .from(ghlConnections)
      .where(eq(ghlConnections.userId, userId));

    if (connections.length === 0) {
      return NextResponse.json({ connected: false, connection: null });
    }

    return NextResponse.json({
      connected: true,
      connection: connections[0],
    });
  } catch (error) {
    logger.error("GET /api/ghl/status error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
