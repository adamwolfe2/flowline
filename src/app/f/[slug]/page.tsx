import { notFound } from "next/navigation";
import { Metadata } from "next";
import { store } from "@/lib/store";
import { FunnelClient } from "@/components/funnel/FunnelClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const funnel = store.getFunnelBySlug(slug);
  if (!funnel) return { title: "Not Found" };
  return {
    title: funnel.config.meta.title,
    description: funnel.config.meta.description,
  };
}

export default async function FunnelPage({ params }: PageProps) {
  const { slug } = await params;
  const funnel = store.getFunnelBySlug(slug);

  if (!funnel) {
    notFound();
  }

  return <FunnelClient config={funnel.config} funnelId={funnel.id} />;
}
