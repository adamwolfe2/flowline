/**
 * URL helpers shared by the landing blocks.
 *
 * Every URL rendered on a landing page (image links, button links, calendar
 * iframes, post-submit redirects) is author-supplied config, so each one is
 * validated to be http(s) before it reaches an `href`, an iframe `src`, or
 * `window.location.assign`. This blocks `javascript:`, `data:`, and other
 * scheme-based injection vectors.
 */

/**
 * Returns the URL when it parses and uses the http/https scheme, else null.
 * Callers should treat null as "do not render this link/embed".
 */
export function safeHttpUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return trimmed;
  } catch {
    // Relative or malformed URLs are not embeddable/navigable here.
    return null;
  }
}

/**
 * True when the URL's host is cal.com or a cal.com subdomain (app.cal.com, …).
 *
 * NOTE: this is an exact hostname check on purpose. `SuccessStep.tsx` uses
 * `url.includes("cal.com")`, an unanchored substring match that also matches
 * hostile lookalikes such as `cal.com.evil.example` or `notcal.com`. Do not
 * reintroduce that pattern — a false positive here injects Cal.com's embed
 * script against an attacker-chosen origin.
 */
export function isCalDotComUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return hostname === "cal.com" || hostname.endsWith(".cal.com");
  } catch {
    return false;
  }
}

/**
 * Extracts the Cal.com "calLink" (e.g. `adam/30min`) from a cal.com URL.
 * Returns "" when the URL is not a usable cal.com link.
 */
export function extractCalLink(url: string): string {
  if (!isCalDotComUrl(url)) return "";
  try {
    const pathname = new URL(url).pathname;
    return pathname.replace(/^\/+/, "").replace(/\/+$/, "");
  } catch {
    return "";
  }
}

/** Derives a DOM/JS-safe Cal.com embed namespace from a calLink. */
export function calNamespaceFor(calLink: string): string {
  if (!calLink) return "default";
  return calLink.replace(/[^a-zA-Z0-9]/g, "-") || "default";
}
