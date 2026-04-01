import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { logger } from "@/lib/logger";

const SHOPIFY_SCOPES = "read_products,read_customers,write_script_tags";

function isValidShopDomain(shop: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shop);
}

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.SHOPIFY_API_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!apiKey || !appUrl) {
      return NextResponse.json(
        { error: "Shopify integration is not configured" },
        { status: 503 }
      );
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shop = req.nextUrl.searchParams.get("shop");
    if (!shop || !isValidShopDomain(shop)) {
      return NextResponse.json(
        { error: "Invalid shop domain. Must be a valid .myshopify.com domain." },
        { status: 400 }
      );
    }

    const state = crypto.randomBytes(16).toString("hex");
    const redirectUri = `${appUrl}/api/shopify/callback`;

    const installUrl = new URL(`https://${shop}/admin/oauth/authorize`);
    installUrl.searchParams.set("client_id", apiKey);
    installUrl.searchParams.set("scope", SHOPIFY_SCOPES);
    installUrl.searchParams.set("redirect_uri", redirectUri);
    installUrl.searchParams.set("state", state);

    const response = NextResponse.redirect(installUrl.toString());

    // Store state and userId in cookies for CSRF protection and user association
    response.cookies.set("shopify_state", state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    });
    response.cookies.set("shopify_user_id", userId, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    return response;
  } catch (error) {
    logger.error("GET /api/shopify/install error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
