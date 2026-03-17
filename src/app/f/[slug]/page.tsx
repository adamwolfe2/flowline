import { getFunnelBySlug } from "@/db/queries/funnels";
import { insertSession } from "@/db/queries/sessions";
import { FunnelClient } from "@/components/funnel/FunnelClient";
import { FunnelConfig } from "@/types";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import type { Metadata } from "next";

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

export default async function FunnelPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const funnel = await getCachedFunnel(slug);
  if (!funnel) notFound();
  const config = funnel.config as FunnelConfig;

  const utmSource = typeof sp.utm_source === "string" ? sp.utm_source : undefined;
  const utmMedium = typeof sp.utm_medium === "string" ? sp.utm_medium : undefined;
  const utmCampaign = typeof sp.utm_campaign === "string" ? sp.utm_campaign : undefined;

  const session = await insertSession(funnel.id, { utmSource, utmMedium, utmCampaign });

  return <FunnelClient config={config} funnelId={funnel.id} sessionId={session.id} />;
}
