import { auth } from "@clerk/nextjs/server";
import { getFunnelByIdForPreview } from "@/db/queries/funnels";
import { FunnelClient } from "@/components/funnel/FunnelClient";
import { FunnelConfig } from "@/types";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ funnelId: string }>;
}

export default async function PreviewPage({ params }: Props) {
  const { funnelId } = await params;
  const funnel = await getFunnelByIdForPreview(funnelId);
  if (!funnel) notFound();

  // Ownership check — owner can always preview, otherwise must be published
  const { userId } = await auth();
  if (userId && funnel.userId === userId) {
    // OK — owner can preview
  } else if (funnel.published) {
    // OK — published funnel is publicly viewable
  } else {
    // Not owner and not published — deny access
    notFound();
  }

  const config = funnel.config as FunnelConfig;

  // Use "preview" sessionId — tracking calls will fire but silently fail
  // since "preview" is not a valid UUID, preventing polluted analytics
  return <FunnelClient config={config} funnelId={funnel.id} sessionId="preview" slug={funnel.slug} published={funnel.published} />;
}
