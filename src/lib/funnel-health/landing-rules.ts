import type { LandingConfig } from "@/types";
import type { HealthCheck, HealthContext, HealthRuleSet } from "./types";

/** Plans that can actually attach a custom domain. */
function canUseCustomDomain(ctx: HealthContext): boolean {
  return ctx.plan === "pro" || ctx.plan === "agency";
}

/**
 * Landing page health rules.
 *
 * A landing page has no steps, no questions and no tier routing, so the quiz
 * rules do not apply. What makes a landing page work is: it says something
 * (hero headline), it can take a booking (booking_form or calendar block), it
 * looks like the customer's brand (logo + color), and it is reachable
 * (published, optionally on their own domain).
 *
 * The custom-domain check is Pro-only — it is omitted entirely on free plans
 * rather than shown as a permanent fail, so a free landing page can still score
 * 100 on the things it actually controls.
 */
export const landingHealthChecks: HealthRuleSet<LandingConfig> = (
  config: LandingConfig,
  ctx: HealthContext
): HealthCheck[] => {
  const blocks = config.blocks ?? [];

  const hasHeroHeadline = blocks.some(
    (b) => b.type === "hero" && Boolean(b.props.headline?.trim())
  );

  const hasBookingSurface = blocks.some(
    (b) => b.type === "booking_form" || b.type === "calendar"
  );

  // A logo can live on the brand (used by the shell) or on the hero block
  // itself — either one means the page is branded.
  const hasLogo =
    Boolean(config.brand.logoUrl?.trim()) ||
    blocks.some((b) => b.type === "hero" && Boolean(b.props.logoUrl?.trim()));

  const checks: HealthCheck[] = [
    {
      id: "hero-headline",
      label: "Hero has a headline",
      passed: hasHeroHeadline,
      points: 20,
      tip: "Add a hero block with a headline so visitors know what this page offers",
    },
    {
      id: "booking",
      label: "Has a booking form or calendar",
      passed: hasBookingSurface,
      points: 25,
      tip: "Add a booking form or calendar block — without one the page cannot convert",
    },
    {
      id: "logo",
      label: "Logo uploaded",
      passed: hasLogo,
      points: 15,
      tip: "Upload your logo in the Brand tab",
    },
    {
      id: "color",
      label: "Custom brand color",
      passed: config.brand.primaryColor !== "#0A9AFF",
      points: 10,
      tip: "Set your brand color in the Brand tab",
    },
    {
      id: "published",
      label: "Page is published",
      passed: ctx.published,
      points: 20,
      tip: "Publish your page to start capturing leads",
    },
  ];

  if (canUseCustomDomain(ctx)) {
    checks.push({
      id: "domain",
      label: "Custom domain connected",
      passed: Boolean(ctx.customDomain?.trim()),
      points: 10,
      tip: "Connect a custom domain in the Publish tab",
    });
  }

  return checks;
};
