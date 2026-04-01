import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { shopifyInstallations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

function verifyWebhookHmac(body: string, hmacHeader: string, secret: string): boolean {
  const computed = crypto
    .createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("base64");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(hmacHeader, "base64"),
      Buffer.from(computed, "base64")
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const apiSecret = process.env.SHOPIFY_API_SECRET;
    if (!apiSecret) {
      return new NextResponse("Not configured", { status: 503 });
    }

    const hmacHeader = req.headers.get("x-shopify-hmac-sha256");
    const topic = req.headers.get("x-shopify-topic");
    const shopDomain = req.headers.get("x-shopify-shop-domain");

    if (!hmacHeader || !topic || !shopDomain) {
      return new NextResponse("Missing required headers", { status: 400 });
    }

    const body = await req.text();

    // Validate HMAC
    if (!verifyWebhookHmac(body, hmacHeader, apiSecret)) {
      logger.warn("Shopify webhook HMAC validation failed", {
        topic,
        shop: shopDomain,
      });
      return new NextResponse("Invalid signature", { status: 403 });
    }

    const payload = JSON.parse(body) as Record<string, unknown>;

    switch (topic) {
      case "app/uninstalled": {
        await db
          .update(shopifyInstallations)
          .set({ uninstalledAt: new Date() })
          .where(eq(shopifyInstallations.shopDomain, shopDomain));

        logger.info("Shopify app uninstalled", { shop: shopDomain });
        break;
      }

      case "shop/update": {
        const newDomain = payload.myshopify_domain as string | undefined;
        if (newDomain && newDomain !== shopDomain) {
          await db
            .update(shopifyInstallations)
            .set({ shopDomain: newDomain })
            .where(eq(shopifyInstallations.shopDomain, shopDomain));

          logger.info("Shopify shop domain updated", {
            oldDomain: shopDomain,
            newDomain,
          });
        }
        break;
      }

      default:
        logger.info("Unhandled Shopify webhook topic", { topic, shop: shopDomain });
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    logger.error("POST /api/shopify/webhooks error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return new NextResponse("Internal server error", { status: 500 });
  }
}
