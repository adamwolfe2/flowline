import { getFunnelByIdForPreview } from "@/db/queries/funnels";
import { insertSession } from "@/db/queries/sessions";
import { FunnelClient } from "@/components/funnel/FunnelClient";
import { FunnelConfig } from "@/types";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ funnelId: string }>;
}

export default async function PreviewPage({ params }: Props) {
  const { funnelId } = await params;
  const funnel = await getFunnelByIdForPreview(funnelId);
  if (!funnel) notFound();
  const config = funnel.config as FunnelConfig;

  const session = await insertSession(funnel.id);

  return <FunnelClient config={config} funnelId={funnel.id} sessionId={session.id} />;
}
