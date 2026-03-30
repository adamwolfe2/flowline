import { getFunnelBySlug } from "@/db/queries/funnels";
import { insertSession, parseDeviceType } from "@/db/queries/sessions";
import { getActiveVariants, selectVariant, recordAssignment } from "@/db/queries/variants";
import { FunnelClient } from "@/components/funnel/FunnelClient";
import { FunnelConfig } from "@/types";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

export const revalidate = 60; // Regenerate every 60 seconds

const getCachedFunnel = unstable_cache(
  async (slug: string) => getFunnelBySlug(slug),
  ["funnel-by-slug"],
  { revalidate: 60 }
);

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const funnel = await getCachedFunnel(slug);
  if (!funnel) return { title: "Not Found" };
  const config = funnel.config as FunnelConfig;
  const metaTitle = config.meta?.title || config.quiz?.headline || config.brand.name;
  const metaDesc = config.meta?.description || config.quiz?.subheadline || "";
  return {
    title: metaTitle,
    description: metaDesc,
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      images: [`/api/og/funnel/${funnel.id}`],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDesc,
      images: [`/api/og/funnel/${funnel.id}`],
    },
  };
}

export default async function FunnelPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const funnel = await getCachedFunnel(slug);
  if (!funnel) notFound();
  const config = funnel.config as FunnelConfig;

  const utmSource = typeof sp.utm_source === "string" ? sp.utm_source : undefined;
  const utmMedium = typeof sp.utm_medium === "string" ? sp.utm_medium : undefined;
  const utmCampaign = typeof sp.utm_campaign === "string" ? sp.utm_campaign : undefined;

  const headersList = await headers();
  const userAgent = headersList.get("user-agent") ?? "";
  const deviceType = parseDeviceType(userAgent);

  let sessionId: string;
  try {
    const session = await insertSession(funnel.id, { utmSource, utmMedium, utmCampaign }, deviceType);
    sessionId = session.id;
  } catch (error) {
    logger.error("Failed to create session", { error: error instanceof Error ? error.message : String(error) });
    sessionId = crypto.randomUUID();
  }

  // Check if funnel owner has Pro+ plan (hide branding)
  const [funnelOwner] = await db.select({ plan: users.plan })
    .from(users)
    .where(eq(users.id, funnel.userId));
  const hideBranding = funnelOwner?.plan === "pro" || funnelOwner?.plan === "agency";

  // A/B testing: check for active variants
  const variants = await getActiveVariants(funnel.id);
  let activeConfig = config;

  if (variants.length > 0) {
    const selected = selectVariant(variants);
    if (selected) {
      activeConfig = selected.config as FunnelConfig;
      await recordAssignment(sessionId, funnel.id, selected.id);
    }
  }

  return <FunnelClient config={activeConfig} funnelId={funnel.id} sessionId={sessionId} hideBranding={hideBranding} />;
}
