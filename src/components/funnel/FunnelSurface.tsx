import type { AnyFunnelConfig, FunnelConfig, FunnelType } from "@/types";
import { isLandingConfig } from "@/types";
import { FunnelClient } from "@/components/funnel/FunnelClient";
import { LandingRenderer } from "@/components/landing/LandingRenderer";
import { logger } from "@/lib/logger";

interface FunnelSurfaceProps {
  /** Authoritative funnel type — the `funnels.type` column, NOT config.type. */
  type: FunnelType;
  config: AnyFunnelConfig;
  funnelId: string;
  sessionId: string;
  hideBranding?: boolean;
  isEmbed?: boolean;
  /** Preview-only chrome props, forwarded to the quiz renderer. */
  slug?: string;
  published?: boolean;
}

/**
 * The single place a funnel is dispatched to its renderer.
 *
 * There are three public surfaces (`/f/[slug]`, `/f/domain/[hostname]`,
 * `/f/preview/[funnelId]`) that all resolve a funnel and render it. They have
 * already drifted apart once (the A/B variant block exists on /f/[slug] but not
 * on the domain path), so the type branch lives here rather than being copied
 * three times.
 */
export function FunnelSurface({
  type,
  config,
  funnelId,
  sessionId,
  hideBranding,
  isEmbed,
  slug,
  published,
}: FunnelSurfaceProps) {
  if (type === "landing") {
    // The column says landing but the JSONB is not landing-shaped. Rendering
    // the quiz client here would throw on `config.quiz.questions.length`, so
    // fail soft instead of 500-ing a live page.
    if (!isLandingConfig(config)) {
      logger.error("Landing funnel has a non-landing config", { funnelId });
      return <MisconfiguredFunnel />;
    }
    return (
      <LandingRenderer
        config={config}
        funnelId={funnelId}
        sessionId={sessionId}
        hideBranding={hideBranding}
        isEmbed={isEmbed}
      />
    );
  }

  // Quiz path. Guard the same way: a quiz row whose config lost its `quiz`
  // block would otherwise crash in FunnelClient on first render.
  const quizConfig = config as FunnelConfig;
  if (!quizConfig?.quiz?.questions) {
    logger.error("Quiz funnel has a config with no quiz.questions", { funnelId });
    return <MisconfiguredFunnel />;
  }

  return (
    <FunnelClient
      config={quizConfig}
      funnelId={funnelId}
      sessionId={sessionId}
      hideBranding={hideBranding}
      slug={slug}
      published={published}
    />
  );
}

function MisconfiguredFunnel() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-6">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-[#0A0A0A]">This page isn&apos;t available</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          It looks like this page is still being set up. Please check back shortly.
        </p>
      </div>
    </main>
  );
}
