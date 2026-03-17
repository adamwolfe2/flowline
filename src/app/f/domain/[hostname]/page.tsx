import { getFunnelByCustomDomain } from "@/db/queries/funnels";
import { insertSession } from "@/db/queries/sessions";
import { FunnelClient } from "@/components/funnel/FunnelClient";
import { FunnelConfig } from "@/types";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import type { Metadata } from "next";

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
  return {
    title: config.meta?.title || config.brand.name,
    description: config.meta?.description || "",
    openGraph: {
      title: config.meta?.title || config.brand.name,
      description: config.meta?.description || "",
      images: [{
        url: `/api/og?title=${encodeURIComponent(config.brand.name)}&description=${encodeURIComponent(config.quiz.headline)}`,
        width: 1200,
        height: 630,
      }],
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
    console.error("Failed to create session:", error);
    sessionId = crypto.randomUUID();
  }

  return <FunnelClient config={config} funnelId={funnel.id} sessionId={sessionId} />;
}
