import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { ghlConnections } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connections = await db
      .select({ id: ghlConnections.id })
      .from(ghlConnections)
      .where(eq(ghlConnections.userId, userId));

    if (connections.length === 0) {
      return NextResponse.json(
        { error: "No active GoHighLevel connection" },
        { status: 404 }
      );
    }

    await db
      .delete(ghlConnections)
      .where(
        and(
          eq(ghlConnections.id, connections[0].id),
          eq(ghlConnections.userId, userId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("POST /api/ghl/disconnect error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
