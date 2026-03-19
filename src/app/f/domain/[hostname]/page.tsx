import { getFunnelByCustomDomain } from "@/db/queries/funnels";
import { insertSession } from "@/db/queries/sessions";
import { FunnelClient } from "@/components/funnel/FunnelClient";
import { FunnelConfig } from "@/types";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import type { Metadata } from "next";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

export const revalidate = 60; // Regenerate every 60 seconds

const getCachedFunnel = unstable_cache(
  async (hostname: string) => getFunnelByCustomDomain(hostname),
  ["funnel-by-domain"],
  { revalidate: 60 }
);

interface Props {
  params: Promise<{ hostname: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { hostname } = await params;
  const funnel = await getCachedFunnel(hostname);
  if (!funnel) return { title: "Not Found" };
  const config = funnel.config as FunnelConfig;
  const metaTitle = config.meta?.title || config.brand.name;
  const metaDesc = config.meta?.description || "";
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

export default async function DomainFunnelPage({ params, searchParams }: Props) {
  const { hostname } = await params;
  const sp = await searchParams;
  const funnel = await getCachedFunnel(hostname);
  if (!funnel) notFound();
  const config = funnel.config as FunnelConfig;

  const utmSource = typeof sp.utm_source === "string" ? sp.utm_source : undefined;
  const utmMedium = typeof sp.utm_medium === "string" ? sp.utm_medium : undefined;
  const utmCampaign = typeof sp.utm_campaign === "string" ? sp.utm_campaign : undefined;

  let sessionId: string;
  try {
    const session = await insertSession(funnel.id, { utmSource, utmMedium, utmCampaign });
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

  return <FunnelClient config={config} funnelId={funnel.id} sessionId={sessionId} hideBranding={hideBranding} />;
}
