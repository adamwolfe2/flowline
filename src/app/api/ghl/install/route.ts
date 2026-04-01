import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { logger } from "@/lib/logger";

const GHL_SCOPES = "contacts.write contacts.readonly locations.readonly";

export async function GET(req: NextRequest) {
  void req; // acknowledge the request parameter

  try {
    const clientId = process.env.GHL_CLIENT_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!clientId || !appUrl) {
      return NextResponse.json(
        { error: "GoHighLevel integration is not configured" },
        { status: 503 }
      );
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const state = crypto.randomBytes(16).toString("hex");
    const redirectUri = `${appUrl}/api/ghl/callback`;

    const installUrl = new URL(
      "https://marketplace.gohighlevel.com/oauth/chooselocation"
    );
    installUrl.searchParams.set("response_type", "code");
    installUrl.searchParams.set("redirect_uri", redirectUri);
    installUrl.searchParams.set("client_id", clientId);
    installUrl.searchParams.set("scope", GHL_SCOPES);
    installUrl.searchParams.set("state", state);

    const response = NextResponse.redirect(installUrl.toString());

    response.cookies.set("ghl_state", state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    });
    response.cookies.set("ghl_user_id", userId, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    return response;
  } catch (error) {
    logger.error("GET /api/ghl/install error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
