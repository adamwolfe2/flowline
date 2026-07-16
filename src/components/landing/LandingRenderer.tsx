import type { CSSProperties, ReactNode } from "react";
import type { LandingBlock, LandingConfig } from "@/types";
import { LandingInteractive } from "./LandingInteractive";
import { EmbedAutoResize } from "./EmbedAutoResize";
import { HeroBlock } from "./blocks/HeroBlock";
import { TextBlock } from "./blocks/TextBlock";
import { VideoBlock } from "./blocks/VideoBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { CalendarBlock } from "./blocks/CalendarBlock";
import { BookingFormBlock } from "./blocks/BookingFormBlock";
import { TestimonialBlock } from "./blocks/TestimonialBlock";
import { ButtonBlock } from "./blocks/ButtonBlock";
import { DividerBlock } from "./blocks/DividerBlock";
import { SpacerBlock } from "./blocks/SpacerBlock";

interface LandingRendererProps {
  config: LandingConfig;
  funnelId: string;
  sessionId: string;
  /** Pro+ plans hide the "Powered by MyVSL" badge. */
  hideBranding?: boolean;
  /** Embedded renders drop the badge too. */
  isEmbed?: boolean;
}

/** Theme tokens are passed down as CSS vars rather than props on every block. */
type ThemeStyle = CSSProperties & Record<`--${string}`, string>;

const MAX_WIDTH_CLASS: Record<LandingConfig["theme"]["maxWidth"], string> = {
  narrow: "max-w-2xl",
  wide: "max-w-5xl",
};

/**
 * Ids of calendar blocks that a booking form gates behind a successful submit
 * (successMode: 'show_calendar'). Those blocks render hidden until revealed.
 */
function collectGatedCalendarIds(blocks: LandingBlock[]): ReadonlySet<string> {
  const ids = new Set<string>();
  for (const block of blocks) {
    if (block.type !== "booking_form") continue;
    if (block.props.successMode !== "show_calendar") continue;
    if (block.props.successCalendarBlockId) ids.add(block.props.successCalendarBlockId);
  }
  return ids;
}

/**
 * Server component. Renders a landing funnel's blocks in config order inside a
 * themed container.
 *
 * Only the blocks that genuinely need interactivity (video, calendar, booking
 * form, buttons) are client components; the rest stay server-rendered. The
 * LandingInteractive provider is the single client boundary that lets a booking
 * form reveal a calendar and lets CTAs scroll to a block id.
 */
export function LandingRenderer({
  config,
  funnelId,
  sessionId,
  hideBranding = false,
  isEmbed = false,
}: LandingRendererProps) {
  const { theme, brand, blocks } = config;

  const headingFont = theme.font === "inherit-from-brand" ? brand.fontHeading : theme.font;
  const bodyFont = theme.font === "inherit-from-brand" ? brand.fontBody : theme.font;

  const themeStyle: ThemeStyle = {
    backgroundColor: theme.background,
    fontFamily: bodyFont,
    "--landing-font-heading": headingFont,
    "--landing-font-body": bodyFont,
    "--landing-brand": brand.primaryColor,
    "--landing-brand-light": brand.primaryColorLight,
    "--landing-brand-dark": brand.primaryColorDark,
  };

  const gatedCalendarIds = collectGatedCalendarIds(blocks);

  function renderBlock(block: LandingBlock): ReactNode {
    switch (block.type) {
      case "hero":
        return <HeroBlock key={block.id} block={block} />;
      case "text":
        return <TextBlock key={block.id} block={block} />;
      case "video":
        return (
          <VideoBlock key={block.id} block={block} funnelId={funnelId} sessionId={sessionId} />
        );
      case "image":
        return <ImageBlock key={block.id} block={block} />;
      case "calendar":
        return (
          <CalendarBlock
            key={block.id}
            block={block}
            brandColor={brand.primaryColor}
            gated={gatedCalendarIds.has(block.id)}
            funnelId={funnelId}
            sessionId={sessionId}
            tracking={config.tracking}
          />
        );
      case "booking_form":
        return (
          <BookingFormBlock
            key={block.id}
            block={block}
            funnelId={funnelId}
            sessionId={sessionId}
          />
        );
      case "testimonial":
        return <TestimonialBlock key={block.id} block={block} />;
      case "button":
        return <ButtonBlock key={block.id} block={block} />;
      case "divider":
        return <DividerBlock key={block.id} block={block} />;
      case "spacer":
        return <SpacerBlock key={block.id} block={block} />;
      default: {
        // Exhaustiveness guard: adding a LandingBlock variant without a case
        // here is a compile error, not a silently blank block.
        const _never: never = block;
        void _never;
        return null;
      }
    }
  }

  return (
    <div className="min-h-screen w-full" style={themeStyle}>
      {/* When embedded, report content height so the embed script can size the
          iframe. Inert (renders null) on the normal public page. */}
      {isEmbed && <EmbedAutoResize />}
      <LandingInteractive funnelId={funnelId} sessionId={sessionId}>
        <div className={`mx-auto w-full ${MAX_WIDTH_CLASS[theme.maxWidth]} px-4 py-8 sm:px-6 sm:py-12`}>
          {blocks.map(renderBlock)}

          {/* Powered by badge — hidden for Pro+ plans or embed mode */}
          {!hideBranding && !isEmbed && (
            <div className="mt-8 text-center">
              <a
                href="https://getmyvsl.com?utm_source=powered_by&utm_medium=funnel&utm_campaign=badge"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] text-[#9CA3AF] transition-colors hover:text-[#6B7280]"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="flex-shrink-0"
                >
                  <path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z" />
                  <path d="M6 18h12" />
                  <path d="M6 14h12" />
                  <path d="m11.6 4 .4 4 .4-4" />
                </svg>
                Powered by MyVSL
              </a>
            </div>
          )}
        </div>
      </LandingInteractive>
    </div>
  );
}
