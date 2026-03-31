import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { popupCampaigns, funnels } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { popupWidgetLimiter, checkRateLimit } from "@/lib/rate-limit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const jsHeaders = {
    "Content-Type": "application/javascript",
    "Cache-Control": "public, max-age=300, s-maxage=300",
    "Access-Control-Allow-Origin": "*",
  };

  try {
    const { userId } = await params;

    if (!userId || typeof userId !== "string" || userId.length === 0) {
      return new NextResponse("// Invalid user ID", {
        status: 400,
        headers: jsHeaders,
      });
    }

    // Rate limit by IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const rateResult = await checkRateLimit(popupWidgetLimiter, ip);
    if (rateResult.limited) {
      return new NextResponse("// Rate limited", {
        status: 429,
        headers: jsHeaders,
      });
    }

    // Query all active popup campaigns for this user, joined with funnels for slug
    const campaigns = await db
      .select({
        id: popupCampaigns.id,
        name: popupCampaigns.name,
        displayMode: popupCampaigns.displayMode,
        position: popupCampaigns.position,
        triggers: popupCampaigns.triggers,
        targeting: popupCampaigns.targeting,
        suppression: popupCampaigns.suppression,
        styleOverrides: popupCampaigns.styleOverrides,
        priority: popupCampaigns.priority,
        funnelSlug: funnels.slug,
      })
      .from(popupCampaigns)
      .innerJoin(funnels, eq(popupCampaigns.funnelId, funnels.id))
      .where(
        and(
          eq(popupCampaigns.userId, userId),
          eq(popupCampaigns.status, "active"),
          eq(funnels.published, true)
        )
      )
      .orderBy(popupCampaigns.priority);

    if (campaigns.length === 0) {
      return new NextResponse("// No active popup campaigns", {
        status: 200,
        headers: jsHeaders,
      });
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "https://getmyvsl.com";

    const serializedCampaigns = JSON.stringify(
      campaigns.map((c) => ({
        id: c.id,
        name: c.name,
        displayMode: c.displayMode,
        position: c.position,
        triggers: c.triggers,
        targeting: c.targeting,
        suppression: c.suppression,
        styleOverrides: c.styleOverrides,
        priority: c.priority,
        funnelSlug: c.funnelSlug,
      }))
    );

    const script = buildWidgetScript(serializedCampaigns, appUrl);

    return new NextResponse(script, {
      status: 200,
      headers: jsHeaders,
    });
  } catch (error) {
    logger.error("GET /api/popup/widget/[userId] error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return new NextResponse("// Internal server error", {
      status: 500,
      headers: jsHeaders,
    });
  }
}

function buildWidgetScript(
  serializedCampaigns: string,
  appUrl: string
): string {
  return `(function() {
  "use strict";

  // ── A. Configuration ──
  var campaigns = ${serializedCampaigns};
  var appUrl = ${JSON.stringify(appUrl)};
  var impressionUrl = appUrl + "/api/popup/impression";

  // ── B. Visitor ID ──
  var STORAGE_KEY = "_myvsl_vid";
  var visitorId;
  try {
    visitorId = localStorage.getItem(STORAGE_KEY);
    if (!visitorId) {
      visitorId = "v_" + Math.random().toString(36).substr(2, 12);
      localStorage.setItem(STORAGE_KEY, visitorId);
    }
  } catch (e) {
    visitorId = "v_" + Math.random().toString(36).substr(2, 12);
  }

  var popupShown = false;
  var activeTriggerType = null;

  // ── J. Set returning visitor flag ──
  try { localStorage.setItem("_myvsl_returning", "1"); } catch (e) {}

  // ── D. Targeting evaluation helpers ──
  function matchesWildcard(url, pattern) {
    if (!pattern) return false;
    var escaped = pattern.replace(/[-\\/\\\\^$+?.()|[\\]{}]/g, "\\\\$&");
    var regex = escaped.replace(/\\*/g, ".*");
    try { return new RegExp("^" + regex + "$", "i").test(url); } catch (e) { return false; }
  }

  function getQueryParam(name) {
    try {
      var params = new URLSearchParams(window.location.search);
      return params.get(name) || "";
    } catch (e) { return ""; }
  }

  function isMobileDevice() {
    return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  function getDeviceType() {
    return isMobileDevice() ? "mobile" : "desktop";
  }

  function evaluateTargeting(campaign) {
    var targeting = campaign.targeting;
    if (!targeting) return true;

    // Page URL matching
    if (targeting.pageUrls && targeting.pageUrls.length > 0) {
      var currentUrl = window.location.href;
      var currentPath = window.location.pathname;
      var matched = false;
      for (var i = 0; i < targeting.pageUrls.length; i++) {
        if (matchesWildcard(currentUrl, targeting.pageUrls[i]) || matchesWildcard(currentPath, targeting.pageUrls[i])) {
          matched = true;
          break;
        }
      }
      if (!matched) return false;
    }

    // UTM source matching
    if (targeting.utmSources && targeting.utmSources.length > 0) {
      var utmSource = getQueryParam("utm_source").toLowerCase();
      var sourceMatched = false;
      for (var j = 0; j < targeting.utmSources.length; j++) {
        if (utmSource === targeting.utmSources[j].toLowerCase()) {
          sourceMatched = true;
          break;
        }
      }
      if (!sourceMatched) return false;
    }

    // Device type matching
    if (targeting.deviceTypes && targeting.deviceTypes.length > 0) {
      var deviceType = getDeviceType();
      if (targeting.deviceTypes.indexOf(deviceType) === -1) return false;
    }

    // New visitor only
    if (targeting.newVisitorsOnly) {
      try {
        if (localStorage.getItem("_myvsl_returning")) return false;
      } catch (e) {}
    }

    return true;
  }

  // ── I. Track impression (fire-and-forget) ──
  function trackImpression(campaignId, action, triggerType) {
    try {
      var data = JSON.stringify({
        campaignId: campaignId,
        visitorId: visitorId,
        action: action,
        triggerType: triggerType || null,
        pageUrl: location.href,
        referrer: document.referrer
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(impressionUrl, new Blob([data], { type: "application/json" }));
      } else {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", impressionUrl, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(data);
      }
    } catch (e) {}
  }

  // ── H. Handle messages from iframe ──
  function handlePopupMessage(event) {
    if (!event.data) return;
    if (event.data.type === "myvsl:resize") {
      var iframe = document.querySelector("#myvsl-popup-container iframe");
      if (iframe) {
        var h = parseInt(event.data.height, 10);
        if (h > 0 && h < 5000) iframe.style.height = h + "px";
      }
    }
    if (event.data.type === "myvsl:lead-created") {
      var matchedCampaign = null;
      for (var i = 0; i < campaigns.length; i++) {
        if (campaigns[i].funnelSlug === event.data.slug) {
          matchedCampaign = campaigns[i];
          break;
        }
      }
      if (matchedCampaign) closePopup(matchedCampaign, "converted");
    }
  }

  // ── G. Close popup ──
  function closePopup(campaign, action) {
    trackImpression(campaign.id, action, activeTriggerType);

    // Set suppression
    var days = action === "converted"
      ? campaign.suppression.convertedCookieDays
      : campaign.suppression.dismissCookieDays;
    try {
      localStorage.setItem("_myvsl_s_" + campaign.id, String(Date.now() + days * 86400000));
    } catch (e) {}

    // Animate out and remove
    var overlay = document.getElementById("myvsl-popup-overlay");
    var container = document.getElementById("myvsl-popup-container");
    if (overlay) {
      overlay.style.opacity = "0";
      setTimeout(function() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 300);
    }
    if (container && !overlay) {
      container.style.opacity = "0";
      setTimeout(function() { if (container.parentNode) container.parentNode.removeChild(container); }, 300);
    }

    document.body.style.overflow = "";
    window.removeEventListener("message", handlePopupMessage);
    popupShown = false;
  }

  // ── F. Show popup ──
  function showPopup(campaign) {
    if (popupShown) return;
    popupShown = true;

    trackImpression(campaign.id, "shown", activeTriggerType);

    var so = campaign.styleOverrides || {};
    var overlayOpacity = so.overlayOpacity != null ? so.overlayOpacity : 0.5;
    var borderRadius = so.borderRadius != null ? so.borderRadius : 16;
    var maxWidth = so.maxWidth || 480;
    var isMobile = window.innerWidth < 640;

    // Create overlay
    var overlay = document.createElement("div");
    overlay.id = "myvsl-popup-overlay";
    overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;z-index:999998;background:rgba(0,0,0," + overlayOpacity + ");display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s ease;";

    // Create container
    var container = document.createElement("div");
    container.id = "myvsl-popup-container";

    if (isMobile || campaign.displayMode === "full_screen") {
      container.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;z-index:999999;background:white;";
    } else if (campaign.displayMode === "slide_in") {
      var pos = campaign.position === "bottom_left" ? "left:20px;" : "right:20px;";
      container.style.cssText = "position:fixed;bottom:20px;" + pos + "width:" + maxWidth + "px;max-height:80vh;z-index:999999;background:white;border-radius:" + borderRadius + "px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);overflow:hidden;transform:translateY(20px);opacity:0;transition:all 0.3s ease;";
    } else {
      container.style.cssText = "width:" + maxWidth + "px;max-width:calc(100vw - 32px);max-height:85vh;background:white;border-radius:" + borderRadius + "px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);overflow:hidden;position:relative;transform:scale(0.95);opacity:0;transition:all 0.3s ease;";
    }

    // Close button
    var closeBtn = document.createElement("button");
    closeBtn.innerHTML = "&times;";
    closeBtn.style.cssText = "position:absolute;top:8px;right:12px;z-index:10;background:rgba(0,0,0,0.1);border:none;width:32px;height:32px;border-radius:50%;font-size:20px;line-height:1;cursor:pointer;color:#666;display:flex;align-items:center;justify-content:center;";
    closeBtn.onclick = function() { closePopup(campaign, "dismissed"); };

    // Create iframe
    var iframe = document.createElement("iframe");
    iframe.src = appUrl + "/f/" + campaign.funnelSlug + "?embed=true&popup=true";
    iframe.style.cssText = "width:100%;height:100%;border:none;min-height:500px;";
    iframe.setAttribute("allow", "clipboard-write");
    iframe.title = "MyVSL Quiz";

    container.appendChild(closeBtn);
    container.appendChild(iframe);

    if (campaign.displayMode !== "full_screen" && !isMobile) {
      overlay.appendChild(container);
      document.body.appendChild(overlay);
      overlay.addEventListener("click", function(e) {
        if (e.target === overlay) closePopup(campaign, "dismissed");
      });
    } else {
      document.body.appendChild(container);
    }

    // Animate in
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        if (overlay.parentNode) overlay.style.opacity = "1";
        container.style.opacity = "1";
        container.style.transform = "scale(1) translateY(0)";
      });
    });

    // Prevent body scroll
    document.body.style.overflow = "hidden";

    // Listen for messages from iframe
    window.addEventListener("message", handlePopupMessage);
  }

  // ── C & D. Find first matching campaign ──
  var matchedCampaign = null;
  for (var i = 0; i < campaigns.length; i++) {
    var c = campaigns[i];

    // C. Suppression check
    try {
      var suppressKey = "_myvsl_s_" + c.id;
      var suppressed = localStorage.getItem(suppressKey);
      if (suppressed) {
        var expiresAt = parseInt(suppressed, 10);
        if (Date.now() < expiresAt) continue;
        else localStorage.removeItem(suppressKey);
      }
    } catch (e) {}

    // D. Targeting evaluation
    if (!evaluateTargeting(c)) continue;

    matchedCampaign = c;
    break;
  }

  if (!matchedCampaign) return;

  // Track that a campaign was triggered (targeting matched)
  trackImpression(matchedCampaign.id, "triggered", null);

  // ── E. Set up trigger listeners ──
  var triggers = matchedCampaign.triggers || {};
  var triggerSet = false;

  // Exit Intent
  if (triggers.exitIntent) {
    triggerSet = true;
    document.addEventListener("mouseleave", function(e) {
      if (e.clientY < 0) {
        activeTriggerType = "exit_intent";
        showPopup(matchedCampaign);
      }
    }, { once: true });

    // Mobile: detect scroll-up gesture
    var lastTouchY = 0;
    document.addEventListener("touchstart", function(e) {
      lastTouchY = e.touches[0].clientY;
    }, { passive: true });
    document.addEventListener("touchmove", function(e) {
      if (e.touches[0].clientY - lastTouchY > 60) {
        activeTriggerType = "exit_intent";
        showPopup(matchedCampaign);
      }
    }, { once: true, passive: true });
  }

  // Time Delay
  if (triggers.timeDelay) {
    triggerSet = true;
    setTimeout(function() {
      activeTriggerType = "time_delay";
      showPopup(matchedCampaign);
    }, triggers.timeDelay * 1000);
  }

  // Scroll Depth
  if (triggers.scrollDepth) {
    triggerSet = true;
    window.addEventListener("scroll", function onScroll() {
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      var scrollPct = (window.scrollY / docHeight) * 100;
      if (scrollPct >= triggers.scrollDepth) {
        window.removeEventListener("scroll", onScroll);
        activeTriggerType = "scroll_depth";
        showPopup(matchedCampaign);
      }
    }, { passive: true });
  }

  // Idle Detection
  if (triggers.idleTime) {
    triggerSet = true;
    var idleTimer;
    function resetIdle() {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(function() {
        activeTriggerType = "idle";
        showPopup(matchedCampaign);
      }, triggers.idleTime * 1000);
    }
    ["mousemove", "keydown", "scroll", "touchstart"].forEach(function(evt) {
      document.addEventListener(evt, resetIdle, { passive: true });
    });
    resetIdle();
  }

  // Fallback: if no triggers configured, show immediately
  if (!triggerSet) {
    activeTriggerType = "immediate";
    showPopup(matchedCampaign);
  }
})();`;
}
