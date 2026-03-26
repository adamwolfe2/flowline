import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { funnels } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ funnelId: string }> }) {
  try {
    const { funnelId } = await params;

    // Validate UUID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(funnelId)) {
      return new NextResponse("// Invalid funnel ID", {
        status: 400,
        headers: { "Content-Type": "application/javascript" },
      });
    }

    // Verify funnel exists and is published
    const [funnel] = await db
      .select({ slug: funnels.slug })
      .from(funnels)
      .where(and(eq(funnels.id, funnelId), eq(funnels.published, true)));

    if (!funnel) {
      return new NextResponse("// Funnel not found or not published", {
        status: 404,
        headers: { "Content-Type": "application/javascript" },
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://getmyvsl.com";
    const embedUrl = `${appUrl}/f/${funnel.slug}?embed=true`;

    const script = `(function() {
  "use strict";
  var containerId = "myvsl-quiz-${funnelId}";
  var container = document.getElementById(containerId);
  if (!container) {
    var containers = document.querySelectorAll("[id^='myvsl-quiz-']");
    if (containers.length > 0) container = containers[containers.length - 1];
  }
  if (!container) return;

  var iframe = document.createElement("iframe");
  iframe.src = "${embedUrl}";
  iframe.style.width = "100%";
  iframe.style.minHeight = "500px";
  iframe.style.border = "none";
  iframe.style.borderRadius = "12px";
  iframe.style.display = "block";
  iframe.style.overflow = "hidden";
  iframe.setAttribute("scrolling", "no");
  iframe.setAttribute("allowtransparency", "true");
  iframe.setAttribute("allow", "clipboard-write");
  iframe.title = "MyVSL Quiz";
  container.appendChild(iframe);

  window.addEventListener("message", function(event) {
    if (!event.data || event.data.type !== "myvsl:resize") return;
    var height = parseInt(event.data.height, 10);
    if (height > 0 && height < 10000) {
      iframe.style.height = height + "px";
    }
  });
})();`;

    return new NextResponse(script, {
      status: 200,
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    logger.error("GET /api/embed/[funnelId]/script.js error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return new NextResponse("// Internal server error", {
      status: 500,
      headers: { "Content-Type": "application/javascript" },
    });
  }
}
