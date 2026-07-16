import type { ReactNode } from "react";
import type { LandingBlock } from "@/types";
import { CtaButton } from "./CtaButton";
import { safeHttpUrl } from "./url";

type HeroBlockData = Extract<LandingBlock, { type: "hero" }>;

/**
 * Renders the headline with `highlightText` (if present AND found) shown in the
 * brand accent colour. The match is literal and on the FIRST occurrence only;
 * if the substring is absent the plain headline is returned unchanged, so a
 * stale highlight can never corrupt or drop headline text.
 */
function renderHeadline(headline: string, highlightText?: string): ReactNode {
  const needle = highlightText?.trim();
  if (!needle) return headline;
  const index = headline.indexOf(needle);
  if (index === -1) return headline;

  const before = headline.slice(0, index);
  const after = headline.slice(index + needle.length);
  return (
    <>
      {before}
      <span style={{ color: "var(--landing-brand)" }}>{needle}</span>
      {after}
    </>
  );
}

/** Server component. The CTA delegates to the client CtaButton for scrolling. */
export function HeroBlock({ block }: { block: HeroBlockData }) {
  const {
    logoUrl,
    eyebrow,
    headline,
    highlightText,
    subheadline,
    ctaLabel,
    ctaTargetBlockId,
    secondaryCtaLabel,
    secondaryCtaTargetBlockId,
    note,
  } = block.props;
  const showCta = Boolean(ctaLabel && ctaTargetBlockId);
  const showSecondaryCta = Boolean(secondaryCtaLabel && secondaryCtaTargetBlockId);
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

      {eyebrow?.trim() && (
        <span
          className="mb-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
          style={{
            color: "var(--landing-brand)",
            backgroundColor: "var(--landing-brand-light)",
          }}
        >
          {eyebrow}
        </span>
      )}

      <h1
        className="text-3xl font-bold tracking-tight text-[#0A0A0A] sm:text-4xl md:text-5xl"
        style={{ fontFamily: "var(--landing-font-heading)" }}
      >
        {renderHeadline(headline, highlightText)}
      </h1>

      {subheadline && (
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#6B7280] sm:text-lg">
          {subheadline}
        </p>
      )}

      {(showCta || showSecondaryCta) && (
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {showCta && (
            <CtaButton label={ctaLabel ?? ""} action="scroll" targetBlockId={ctaTargetBlockId} />
          )}
          {showSecondaryCta && (
            <CtaButton
              label={secondaryCtaLabel ?? ""}
              action="scroll"
              targetBlockId={secondaryCtaTargetBlockId}
              variant="secondary"
            />
          )}
        </div>
      )}

      {note?.trim() && (
        <p className="mx-auto mt-4 max-w-xl text-sm text-[#9CA3AF]">{note}</p>
      )}
    </section>
  );
}
