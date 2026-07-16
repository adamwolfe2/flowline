import { deriveLightColor, deriveDarkColor } from "@/lib/colors";
import { DEFAULT_LANDING_CONFIG } from "@/lib/landing-defaults";
import type { LandingBlock, LandingConfig } from "@/types";

interface BuildLandingConfigParams {
  /** The user's raw business description — used to derive a brand name. */
  description: string;
  /** Content blocks returned by /api/ai/generate-landing. */
  blocks: LandingBlock[];
  /** Optional explicit brand name; falls back to the description. */
  brandName?: string;
  /** Optional primary brand color; falls back to the app default. */
  primaryColor?: string;
  /** Optional logo URL to seed the brand. */
  logoUrl?: string;
}

/**
 * Assembles a complete LandingConfig from the AI's content blocks plus a brand
 * derived the same way the quiz flow derives it (name from an explicit brand
 * name or the first few words of the description; light/dark colors derived
 * from a single primary color). Brand/theme/meta/webhook scaffolding comes from
 * DEFAULT_LANDING_CONFIG so the result always satisfies validateLandingConfig.
 */
export function buildLandingConfig({
  description,
  blocks,
  brandName,
  primaryColor,
  logoUrl,
}: BuildLandingConfigParams): LandingConfig {
  const color = primaryColor || "#0A9AFF";
  const name = (
    brandName?.trim() ||
    description.trim().split(/\s+/).slice(0, 3).join(" ") ||
    "My Business"
  ).slice(0, 100);

  return {
    ...DEFAULT_LANDING_CONFIG,
    type: "landing",
    brand: {
      ...DEFAULT_LANDING_CONFIG.brand,
      name,
      logoUrl: logoUrl || "",
      primaryColor: color,
      primaryColorLight: deriveLightColor(color),
      primaryColorDark: deriveDarkColor(color),
    },
    theme: { ...DEFAULT_LANDING_CONFIG.theme },
    webhook: { ...DEFAULT_LANDING_CONFIG.webhook },
    blocks: blocks.length > 0 ? blocks : DEFAULT_LANDING_CONFIG.blocks,
    meta: {
      title: name,
      description: `Book a call with ${name}.`,
    },
  };
}
