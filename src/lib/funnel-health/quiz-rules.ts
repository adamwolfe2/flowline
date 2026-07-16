import type { FunnelConfig } from "@/types";
import type { HealthCheck, HealthContext, HealthRuleSet } from "./types";

/**
 * Quiz funnel health rules.
 *
 * Moved verbatim out of the old single-file `funnel-health.ts` when the landing
 * rule set landed — ids, labels, points, tips and pass predicates are unchanged
 * so existing quiz scores do not move. This rule set ignores `ctx.plan`: the
 * custom-domain check has always been shown to every plan here and staying put
 * is what keeps quiz scores stable.
 */
export const quizHealthChecks: HealthRuleSet<FunnelConfig> = (
  config: FunnelConfig,
  ctx: HealthContext
): HealthCheck[] => [
  {
    id: "headline",
    label: "Has a headline",
    passed: Boolean(config.quiz.headline?.trim()),
    points: 10,
    tip: "Add a headline to your welcome page",
  },
  {
    id: "questions",
    label: "3+ quiz questions",
    passed: (config.quiz.questions?.length ?? 0) >= 3,
    points: 15,
    tip: "Add at least 3 questions to qualify leads",
  },
  {
    id: "options",
    label: "All questions have 2+ options",
    passed:
      (config.quiz.questions?.length ?? 0) > 0 &&
      config.quiz.questions.every((q) => (q.options?.length ?? 0) >= 2),
    points: 10,
    tip: "Make sure every question has at least 2 answer options",
  },
  {
    id: "logo",
    label: "Logo uploaded",
    passed: Boolean(config.brand.logoUrl?.trim()),
    points: 10,
    tip: "Upload your logo in the Brand tab",
  },
  {
    id: "color",
    label: "Custom brand color",
    passed: config.brand.primaryColor !== "#0A9AFF",
    points: 5,
    tip: "Set your brand color in the Brand tab",
  },
  {
    id: "calendar",
    label: "Calendar link configured",
    passed: Boolean(
      config.quiz.calendars?.high?.trim() ||
        config.quiz.calendars?.mid?.trim() ||
        config.quiz.calendars?.low?.trim()
    ),
    points: 15,
    tip: "Add a calendar link in the Calendars tab",
  },
  {
    id: "trust",
    label: "Trust badges filled in",
    passed: Boolean(
      config.quiz.trustBadges && config.quiz.trustBadges.some((b) => b?.trim())
    ),
    points: 5,
    tip: "Add trust badges (e.g. '500+ clients') on the welcome page",
  },
  {
    id: "email",
    label: "Email step customized",
    passed: Boolean(config.quiz.emailHeadline?.trim()),
    points: 10,
    tip: "Customize your email collection step headline",
  },
  {
    id: "published",
    label: "Funnel is published",
    passed: ctx.published,
    points: 10,
    tip: "Publish your funnel to start capturing leads",
  },
  {
    id: "domain",
    label: "Custom domain connected",
    passed: Boolean(ctx.customDomain?.trim()),
    points: 10,
    tip: "Connect a custom domain in the Publish tab",
  },
];
