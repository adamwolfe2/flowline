import type { AnyFunnelConfig } from "@/types";
import { isLandingConfig } from "@/types";

/**
 * Resolves SEO title/description for either funnel type.
 *
 * Shared by `/f/[slug]` and `/f/domain/[hostname]`, which both build metadata
 * and have historically drifted apart.
 *
 * Landing pages carry their own `seo` block; quizzes fall back to the quiz
 * headline. Both fall back to the brand name last.
 */
export function resolveFunnelMeta(config: AnyFunnelConfig): {
  title: string;
  description: string;
} {
  if (isLandingConfig(config)) {
    return {
      title: config.seo?.metaTitle || config.meta?.title || config.brand?.name || "",
      description: config.seo?.metaDescription || config.meta?.description || "",
    };
  }

  return {
    title: config.meta?.title || config.quiz?.headline || config.brand?.name || "",
    description: config.meta?.description || config.quiz?.subheadline || "",
  };
}
