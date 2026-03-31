import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { popupImpressions } from "@/db/schema";
import { logger } from "@/lib/logger";
import { popupImpressionLimiter, checkRateLimit } from "@/lib/rate-limit";

const VALID_ACTIONS = ["triggered", "shown", "dismissed", "engaged", "converted"] as const;
const VALID_TRIGGER_TYPES = ["exit_intent", "time_delay", "scroll_depth", "idle", "immediate"] as const;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const rateResult = await checkRateLimit(popupImpressionLimiter, ip);
    if (rateResult.limited) {
      return NextResponse.json(
        { success: false, error: "Rate limited" },
        { status: 429, headers: corsHeaders }
      );
    }

    // Parse body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON" },
        { status: 400, headers: corsHeaders }
      );
    }

    const { campaignId, visitorId, action, triggerType, pageUrl, referrer } =
      body as Record<string, unknown>;

    // Validate campaignId is UUID
    if (
      typeof campaignId !== "string" ||
      !UUID_REGEX.test(campaignId)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid campaignId" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate action
    if (
      typeof action !== "string" ||
      !VALID_ACTIONS.includes(action as (typeof VALID_ACTIONS)[number])
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid action" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate visitorId
    if (typeof visitorId !== "string" || visitorId.length === 0 || visitorId.length > 100) {
      return NextResponse.json(
        { success: false, error: "Invalid visitorId" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Insert impression — non-blocking errors
    await db.insert(popupImpressions).values({
      campaignId,
      visitorId,
      action: action as (typeof VALID_ACTIONS)[number],
      triggerType: typeof triggerType === "string" && (VALID_TRIGGER_TYPES as readonly string[]).includes(triggerType) ? triggerType : null,
      pageUrl: typeof pageUrl === "string" ? pageUrl.slice(0, 2048) : null,
      referrer: typeof referrer === "string" ? referrer.slice(0, 2048) : null,
    });

    return NextResponse.json(
      { success: true },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    // Log but return 200 to avoid client-side errors
    logger.error("POST /api/popup/impression error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { success: true },
      { status: 200, headers: corsHeaders }
    );
  }
}
