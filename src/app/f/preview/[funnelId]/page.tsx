import { notFound } from "next/navigation";
import { Metadata } from "next";
import { store } from "@/lib/store";
import { FunnelClient } from "@/components/funnel/FunnelClient";

interface PageProps {
  params: Promise<{ funnelId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { funnelId } = await params;
  const funnel = store.getFunnel(funnelId);
  if (!funnel) return { title: "Preview — Not Found" };
  return {
    title: `Preview — ${funnel.config.meta.title}`,
    description: funnel.config.meta.description,
  };
}

export default async function FunnelPreviewPage({ params }: PageProps) {
  const { funnelId } = await params;
  const funnel = store.getFunnel(funnelId);

  if (!funnel) {
    notFound();
  }

  // Preview does NOT require published = true (shows drafts)
  return <FunnelClient config={funnel.config} funnelId={funnel.id} />;
}
