import { isLandingConfig } from "@/types";
import type { AnyFunnelConfig, FunnelConfig, FunnelType } from "@/types";
import { landingHealthChecks } from "./landing-rules";
import { quizHealthChecks } from "./quiz-rules";
import { scoreChecks } from "./score";
import type { FunnelHealth, HealthContext } from "./types";

export type { FunnelHealth, HealthCheck, HealthContext } from "./types";
export { landingHealthChecks } from "./landing-rules";
export { quizHealthChecks } from "./quiz-rules";
export { scoreChecks } from "./score";

export interface HealthOptions {
  /** Owner's plan. Gates plan-only checks (custom domain). Defaults to 'free'. */
  plan?: HealthContext["plan"];
  /**
   * Authoritative funnel type from the `funnels.type` COLUMN. Prefer passing
   * this: the column is NOT NULL and defaulted, whereas `config.type` is absent
   * on every legacy row. Falls back to sniffing the config when omitted, which
   * resolves legacy rows to 'quiz' exactly as before.
   */
  type?: FunnelType;
}

/**
 * Scores a funnel against the rule set for its type.
 *
 * The widget is type-agnostic — it renders whatever checks come back — so
 * adding a funnel type means adding a rule set here, not a new component.
 */
export function calculateFunnelHealth(
  config: AnyFunnelConfig,
  published: boolean,
  customDomain?: string | null,
  options?: HealthOptions
): FunnelHealth {
  const ctx: HealthContext = {
    published,
    customDomain,
    plan: options?.plan ?? "free",
  };

  const isLanding = options?.type
    ? options.type === "landing"
    : isLandingConfig(config);

  if (isLanding) {
    // Narrowing on the column can disagree with the config on a half-migrated
    // row; trust the column and fall back to the quiz rules if the config is
    // not actually landing-shaped, so we never dereference missing blocks.
    if (isLandingConfig(config)) {
      return scoreChecks(landingHealthChecks(config, ctx));
    }
  }

  return scoreChecks(quizHealthChecks(config as FunnelConfig, ctx));
}
