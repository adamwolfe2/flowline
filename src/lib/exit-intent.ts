import type { LandingConfig } from "@/types";

/**
 * Pure helpers for the landing-page exit-intent popup.
 *
 * Kept free of React/DOM so the "should this ever show" decision and the copy
 * resolution can be unit-tested directly.
 */

export interface ExitIntentCopy {
  title: string;
  body: string;
  ctaLabel: string;
}

/** Spot-held urgency default copy. Author copy overrides these when non-empty. */
const DEFAULT_COPY: ExitIntentCopy = {
  title: "Wait — your spot is still open",
  body: "Your spot is held for the next 15 minutes. Grab a time before it's gone.",
  ctaLabel: "Claim my spot",
};

/**
 * Exit-intent is ON by default: an absent config (legacy rows) or any value
 * other than an explicit `enabled: false` counts as enabled.
 */
export function isExitIntentEnabled(config: Pick<LandingConfig, "exitIntent">): boolean {
  return config.exitIntent?.enabled !== false;
}

/** Resolves author copy over the spot-held defaults, ignoring blank overrides. */
export function resolveExitIntentCopy(
  exitIntent: LandingConfig["exitIntent"]
): ExitIntentCopy {
  return {
    title: exitIntent?.title?.trim() || DEFAULT_COPY.title,
    body: exitIntent?.body?.trim() || DEFAULT_COPY.body,
    ctaLabel: exitIntent?.ctaLabel?.trim() || DEFAULT_COPY.ctaLabel,
  };
}

export interface ExitIntentGuardState {
  enabled: boolean;
  /** A booking form / gate has already captured this visitor. */
  hasConverted: boolean;
  /** Already fired once this session (sessionStorage guard). */
  alreadyShown: boolean;
  /** Rendered inside an embed iframe — never hijack the parent page. */
  isEmbed: boolean;
  /** Builder preview (sessionId === 'preview') — don't nag the author. */
  isPreview: boolean;
}

/**
 * Whether the exit-intent popup may fire right now. The DOM listener still
 * gates on the cursor leaving through the top of the viewport; this is the
 * context-level "is it allowed at all" decision.
 */
export function canFireExitIntent(state: ExitIntentGuardState): boolean {
  if (!state.enabled) return false;
  if (state.hasConverted) return false;
  if (state.alreadyShown) return false;
  if (state.isEmbed) return false;
  if (state.isPreview) return false;
  return true;
}
