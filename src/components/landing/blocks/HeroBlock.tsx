import type { LandingBlock } from "@/types";
import { CtaButton } from "./CtaButton";
import { safeHttpUrl } from "./url";

type HeroBlockData = Extract<LandingBlock, { type: "hero" }>;

/** Server component. The CTA delegates to the client CtaButton for scrolling. */
export function HeroBlock({ block }: { block: HeroBlockData }) {
  const { logoUrl, headline, subheadline, ctaLabel, ctaTargetBlockId } = block.props;
  const showCta = Boolean(ctaLabel && ctaTargetBlockId);
  // Gate the author-supplied logo URL to http(s), matching ImageBlock. An
  // `<img src>` can't execute javascript:/data:, but keep the surface uniform.
  const safeLogoUrl = safeHttpUrl(logoUrl);

  return (
    <section id={block.id} className="w-full py-8 text-center sm:py-12">
      {safeLogoUrl && (
        // Author-supplied remote logo; next/image would require per-tenant remotePatterns.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={safeLogoUrl}
          alt=""
          className="mx-auto mb-6 h-10 w-auto object-contain sm:h-12"
          loading="eager"
        />
      )}

      <h1
        className="text-3xl font-bold tracking-tight text-[#0A0A0A] sm:text-4xl md:text-5xl"
        style={{ fontFamily: "var(--landing-font-heading)" }}
      >
        {headline}
      </h1>

      {subheadline && (
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#6B7280] sm:text-lg">
          {subheadline}
        </p>
      )}

      {showCta && (
        <div className="mt-8">
          <CtaButton label={ctaLabel ?? ""} action="scroll" targetBlockId={ctaTargetBlockId} />
        </div>
      )}
    </section>
  );
}
