import { getFunnelBySlug } from "@/db/queries/funnels";
import { FunnelClient } from "@/components/funnel/FunnelClient";
import { FunnelConfig } from "@/types";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const funnel = await getFunnelBySlug(slug);
  if (!funnel) return { title: "Not Found" };
  const config = funnel.config as FunnelConfig;
  return {
    title: config.meta?.title || config.brand.name,
    description: config.meta?.description || "",
  };
}

export default async function FunnelPage({ params }: Props) {
  const { slug } = await params;
  const funnel = await getFunnelBySlug(slug);
  if (!funnel) notFound();
  const config = funnel.config as FunnelConfig;
  return <FunnelClient config={config} funnelId={funnel.id} />;
}
