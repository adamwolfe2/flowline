import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { shopifyInstallations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

function verifyHmac(query: URLSearchParams, secret: string): boolean {
  const hmac = query.get("hmac");
  if (!hmac) return false;

  // Build the message from all query params except hmac
  const params = new URLSearchParams();
  for (const [key, value] of query.entries()) {
    if (key !== "hmac") {
      params.set(key, value);
    }
  }

  // Sort parameters alphabetically
  const sortedParams = new URLSearchParams(
    [...params.entries()].sort(([a], [b]) => a.localeCompare(b))
  );
  const message = sortedParams.toString();

  const computed = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(hmac, "hex"),
      Buffer.from(computed, "hex")
    );
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.SHOPIFY_API_KEY;
    const apiSecret = process.env.SHOPIFY_API_SECRET;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!apiKey || !apiSecret || !appUrl) {
      return NextResponse.json(
        { error: "Shopify integration is not configured" },
        { status: 503 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");
    const shop = searchParams.get("shop");
    const state = searchParams.get("state");

    if (!code || !shop || !state) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Validate HMAC
    if (!verifyHmac(searchParams, apiSecret)) {
      logger.warn("Shopify callback HMAC validation failed", { shop });
      return NextResponse.json(
        { error: "Invalid HMAC signature" },
        { status: 403 }
      );
    }

    // Validate state matches cookie
    const storedState = req.cookies.get("shopify_state")?.value;
    if (!storedState || state !== storedState) {
      logger.warn("Shopify callback state mismatch", { shop });
      return NextResponse.json(
        { error: "State mismatch — possible CSRF attack" },
        { status: 403 }
      );
    }

    // Get userId from cookie (set during install)
    const userId = req.cookies.get("shopify_user_id")?.value;
    if (!userId) {
      return NextResponse.json(
        { error: "User session expired. Please try installing again." },
        { status: 401 }
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch(
      `https://${shop}/admin/oauth/access_token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: apiKey,
          client_secret: apiSecret,
          code,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      logger.error("Shopify token exchange failed", {
        shop,
        status: tokenResponse.status,
        error: errorText,
      });
      return NextResponse.json(
        { error: "Failed to complete Shopify authorization" },
        { status: 502 }
      );
    }

    const tokenData = (await tokenResponse.json()) as {
      access_token: string;
      scope: string;
    };

    // Upsert installation
    const existing = await db
      .select({ id: shopifyInstallations.id })
      .from(shopifyInstallations)
      .where(eq(shopifyInstallations.shopDomain, shop));

    if (existing.length > 0) {
      await db
        .update(shopifyInstallations)
        .set({
          accessToken: tokenData.access_token,
          scopes: tokenData.scope,
          userId,
          uninstalledAt: null,
          installedAt: new Date(),
        })
        .where(eq(shopifyInstallations.shopDomain, shop));
    } else {
      await db.insert(shopifyInstallations).values({
        userId,
        shopDomain: shop,
        accessToken: tokenData.access_token,
        scopes: tokenData.scope,
      });
    }

    // Auto-inject popup widget script tag
    try {
      const widgetSrc = `${appUrl}/api/popup/widget/${userId}`;
      await fetch(
        `https://${shop}/admin/api/2024-01/script_tags.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": tokenData.access_token,
          },
          body: JSON.stringify({
            script_tag: {
              event: "onload",
              src: widgetSrc,
            },
          }),
        }
      );
    } catch (scriptError) {
      // Non-critical — the installation still succeeds
      logger.warn("Failed to inject Shopify script tag", {
        shop,
        error:
          scriptError instanceof Error
            ? scriptError.message
            : String(scriptError),
      });
    }

    // Redirect to settings with success indicator, clearing cookies
    const redirectUrl = new URL("/settings", appUrl);
    redirectUrl.searchParams.set("shopify", "connected");

    const response = NextResponse.redirect(redirectUrl.toString());
    response.cookies.delete("shopify_state");
    response.cookies.delete("shopify_user_id");

    return response;
  } catch (error) {
    logger.error("GET /api/shopify/callback error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
