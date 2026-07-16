import type { FunnelHealth, HealthCheck } from "./types";

/**
 * Rolls a rule set up into a 0-100 score plus its display band.
 *
 * Shared by every funnel type so the widget reads identically regardless of
 * which rules produced the checks. Weights live on the checks themselves, so a
 * rule set that omits a plan-gated check shrinks the denominator with it and
 * the owner can still reach 100.
 */
export function scoreChecks(checks: HealthCheck[]): FunnelHealth {
  const earned = checks
    .filter((c) => c.passed)
    .reduce((sum, c) => sum + c.points, 0);
  const total = checks.reduce((sum, c) => sum + c.points, 0);
  // Guard the empty rule set: the quiz path always has weight, but a future
  // rule set that gates every check away must not produce NaN.
  const score = total > 0 ? Math.round((earned / total) * 100) : 0;

  let label: string;
  let color: string;
  if (score >= 80) {
    label = "Excellent";
    color = "#0A9AFF";
  } else if (score >= 50) {
    label = "Good";
    color = "#D97706";
  } else {
    label = "Needs work";
    color = "#DC2626";
  }

  return { score, checks, label, color };
}
