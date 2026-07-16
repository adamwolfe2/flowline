import type { Plan } from "@/types";

export interface HealthCheck {
  id: string;
  label: string;
  passed: boolean;
  points: number;
  tip: string;
}

export interface FunnelHealth {
  score: number;
  checks: HealthCheck[];
  label: string;
  color: string;
}

/**
 * Everything a rule set needs that does NOT live in the funnel config —
 * i.e. columns on the `funnels` row plus the owner's plan.
 */
export interface HealthContext {
  published: boolean;
  customDomain?: string | null;
  /** Gates plan-only checks (custom domain is Pro+). Defaults to 'free'. */
  plan?: Plan;
}

/** Builds the checks for one funnel type. */
export type HealthRuleSet<TConfig> = (
  config: TConfig,
  ctx: HealthContext
) => HealthCheck[];
