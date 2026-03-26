export const PLAN_LIMITS = {
  free: {
    maxFunnels: 1,
    customDomains: false,
    removeBranding: false,
    advancedAnalytics: false,
    emailSequences: false,
    abTesting: false,
    webhooks: false,
    teamMembers: 0,
  },
  pro: {
    maxFunnels: 25,
    customDomains: true,
    removeBranding: true,
    advancedAnalytics: true,
    emailSequences: true,
    abTesting: true,
    webhooks: true,
    teamMembers: 3,
  },
  agency: {
    maxFunnels: -1,
    customDomains: true,
    removeBranding: true,
    advancedAnalytics: true,
    emailSequences: true,
    abTesting: true,
    webhooks: true,
    teamMembers: 10,
  },
} as const;

export type Plan = keyof typeof PLAN_LIMITS;

export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[plan as Plan] || PLAN_LIMITS.free;
}

export function canCreateFunnel(plan: string, currentCount: number): boolean {
  const limits = getPlanLimits(plan);
  if (limits.maxFunnels === -1) return true;
  return currentCount < limits.maxFunnels;
}

export function hasFeature(plan: string, feature: keyof typeof PLAN_LIMITS.free): boolean {
  const limits = getPlanLimits(plan);
  const value = limits[feature];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  return false;
}
