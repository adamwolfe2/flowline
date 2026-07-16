import { auth } from "@clerk/nextjs/server";
import { getFunnelByIdForPreview } from "@/db/queries/funnels";
import { FunnelSurface } from "@/components/funnel/FunnelSurface";
import { AnyFunnelConfig } from "@/types";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

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

  const config = funnel.config as AnyFunnelConfig;

  // Preview previously never resolved the owner's plan, so Pro/Agency users saw
  // the "Powered by MyVSL" badge in their own preview even though it is absent
  // on the live page. Resolve it here so preview matches production.
  const [funnelOwner] = await db.select({ plan: users.plan })
    .from(users)
    .where(eq(users.id, funnel.userId));
  const hideBranding = funnelOwner?.plan === "pro" || funnelOwner?.plan === "agency";

  // Use "preview" sessionId — tracking calls will fire but silently fail
  // since "preview" is not a valid UUID, preventing polluted analytics
  return (
    <FunnelSurface
      type={funnel.type}
      config={config}
      funnelId={funnel.id}
      sessionId="preview"
      hideBranding={hideBranding}
      slug={funnel.slug}
      published={funnel.published}
    />
  );
}
