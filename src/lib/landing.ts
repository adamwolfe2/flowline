import type { LandingConfig, LandingBlock, AnyFunnelConfig } from "@/types";

/**
 * Pure helpers for the landing-page funnel type.
 *
 * Kept free of DB/network access so the submit path's field handling and the
 * config validation can be unit-tested directly.
 */

/** Booking-form fields we accept. `email` is stored on its own lead column. */
const ALLOWED_FIELDS = ["name", "email", "phone"] as const;

/**
 * Length caps on persisted booking-form values. Prevents an attacker from
 * writing multi-MB strings into `leads.answers` / the email column (storage
 * abuse / minor DoS). 254 is the RFC-5321 max email length.
 */
const MAX_FIELD_LEN = 200;
const MAX_EMAIL_LEN = 254;

/**
 * Normalizes a client-supplied booking-form `fields` object into the shape
 * persisted on `leads.answers`.
 *
 * - drops `email` (it has a dedicated NOT NULL column)
 * - drops unknown keys (a client cannot inject arbitrary data into the lead)
 * - drops non-string and empty values
 * - trims whitespace
 */
export function extractLandingFields(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const source = raw as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const key of ALLOWED_FIELDS) {
    if (key === "email") continue;
    const value = source[key];
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (trimmed === "") continue;
    out[key] = trimmed.slice(0, MAX_FIELD_LEN);
  }
  return out;
}

/** Reads the email out of a landing booking-form payload. */
export function extractLandingEmail(raw: unknown): string | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const value = (raw as Record<string, unknown>).email;
  return typeof value === "string" ? value.trim().slice(0, MAX_EMAIL_LEN) : undefined;
}

/**
 * Minimal structural validation for a landing config, used by the funnel
 * create/update routes (which otherwise hard-require a `quiz` object).
 * Returns an error string, or null when valid.
 */
export function validateLandingConfig(config: unknown): string | null {
  if (!config || typeof config !== "object") return "Config must be an object";
  const c = config as Partial<LandingConfig>;
  if (c.type !== "landing") return "Config type must be 'landing'";
  if (!c.brand || typeof c.brand !== "object") return "Config must include a brand object";
  if (!Array.isArray(c.blocks)) return "Config must include a blocks array";
  if (!c.theme || typeof c.theme !== "object") return "Config must include a theme object";

  const seen = new Set<string>();
  for (const block of c.blocks as LandingBlock[]) {
    if (!block || typeof block !== "object") return "Each block must be an object";
    if (typeof block.id !== "string" || block.id === "") return "Each block needs a non-empty id";
    if (seen.has(block.id)) return `Duplicate block id: ${block.id}`;
    seen.add(block.id);
    if (typeof block.type !== "string") return "Each block needs a type";

    // A booking_form is the one block the public renderer dereferences deeply
    // (`fields.map`, per-field validation). Reject malformed props here so a
    // hand-crafted create/update payload can never crash the renderer, and
    // require `email` — a form without it always 400s on submit.
    if (block.type === "booking_form") {
      const props = (block as { props?: unknown }).props;
      const fields = (props as { fields?: unknown } | undefined)?.fields;
      if (!Array.isArray(fields) || fields.length === 0) {
        return "A booking form must include at least one field";
      }
      if (!fields.every((f) => f === "name" || f === "email" || f === "phone")) {
        return "Booking form fields must be name, email, or phone";
      }
      if (!fields.includes("email")) {
        return "A booking form must collect an email";
      }
    }
  }
  return null;
}

/** True when the config describes a landing page rather than a quiz. */
export function isLanding(config: AnyFunnelConfig): config is LandingConfig {
  return config.type === "landing";
}

/**
 * Resolves the single calendar URL for a landing page, if one is configured.
 * Landing pages have at most one calendar — there is no tier routing.
 */
export function getLandingCalendarUrl(config: LandingConfig): string | undefined {
  const block = config.blocks.find((b) => b.type === "calendar");
  return block && block.type === "calendar" ? block.props.url || undefined : undefined;
}
