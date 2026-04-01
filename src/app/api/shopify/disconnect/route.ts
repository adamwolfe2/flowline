import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { shopifyInstallations } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find active installation
    const installations = await db
      .select({
        id: shopifyInstallations.id,
        shopDomain: shopifyInstallations.shopDomain,
        accessToken: shopifyInstallations.accessToken,
      })
      .from(shopifyInstallations)
      .where(
        and(
          eq(shopifyInstallations.userId, userId),
          isNull(shopifyInstallations.uninstalledAt)
        )
      );

    if (installations.length === 0) {
      return NextResponse.json({ error: "No active Shopify installation" }, { status: 404 });
    }

    const installation = installations[0];

    // Remove script tags from Shopify store
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://getmyvsl.com";
      const widgetSrc = `${appUrl}/api/popup/widget/${userId}`;

      const scriptTagsRes = await fetch(
        `https://${installation.shopDomain}/admin/api/2024-01/script_tags.json`,
        {
          headers: {
            "X-Shopify-Access-Token": installation.accessToken,
          },
        }
      );

      if (scriptTagsRes.ok) {
        const scriptTagsData = (await scriptTagsRes.json()) as {
          script_tags: Array<{ id: number; src: string }>;
        };
        for (const tag of scriptTagsData.script_tags) {
          if (tag.src === widgetSrc) {
            await fetch(
              `https://${installation.shopDomain}/admin/api/2024-01/script_tags/${tag.id}.json`,
              {
                method: "DELETE",
                headers: {
                  "X-Shopify-Access-Token": installation.accessToken,
                },
              }
            );
          }
        }
      }
    } catch (scriptError) {
      // Non-critical — mark as uninstalled regardless
      logger.warn("Failed to remove Shopify script tags during disconnect", {
        error: scriptError instanceof Error ? scriptError.message : String(scriptError),
      });
    }

    // Mark as uninstalled
    await db
      .update(shopifyInstallations)
      .set({ uninstalledAt: new Date() })
      .where(eq(shopifyInstallations.id, installation.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("POST /api/shopify/disconnect error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
