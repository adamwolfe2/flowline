"use client";

import type { LandingBlock } from "@/types";
import { CtaButton } from "./CtaButton";

type ButtonBlockData = Extract<LandingBlock, { type: "button" }>;

/**
 * Standalone CTA block. The scroll/link behaviour lives in CtaButton so this
 * block and HeroBlock's CTA stay identical.
 */
export function ButtonBlock({ block }: { block: ButtonBlockData }) {
  const { label, action, targetBlockId, url } = block.props;

  return (
    <section id={block.id} className="w-full py-6 text-center sm:py-8">
      <CtaButton label={label} action={action} targetBlockId={targetBlockId} url={url} />
    </section>
  );
}
