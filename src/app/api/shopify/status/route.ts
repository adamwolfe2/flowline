import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { shopifyInstallations } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const installations = await db
      .select({
        id: shopifyInstallations.id,
        shopDomain: shopifyInstallations.shopDomain,
        scopes: shopifyInstallations.scopes,
        installedAt: shopifyInstallations.installedAt,
      })
      .from(shopifyInstallations)
      .where(
        and(
          eq(shopifyInstallations.userId, userId),
          isNull(shopifyInstallations.uninstalledAt)
        )
      );

    if (installations.length === 0) {
      return NextResponse.json({ connected: false, installation: null });
    }

    return NextResponse.json({
      connected: true,
      installation: installations[0],
    });
  } catch (error) {
    logger.error("GET /api/shopify/status error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
