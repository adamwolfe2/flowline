import type { LandingBlock, SpacingProps } from "@/types";

type SpacerBlockData = Extract<LandingBlock, { type: "spacer" }>;

/** Pure vertical whitespace, keyed off SpacingProps.size. */
const HEIGHT_BY_SIZE: Record<SpacingProps["size"], string> = {
  sm: "h-4 sm:h-6",
  md: "h-8 sm:h-12",
  lg: "h-16 sm:h-24",
};

/** Server component. */
export function SpacerBlock({ block }: { block: SpacerBlockData }) {
  return (
    <div
      id={block.id}
      aria-hidden="true"
      className={`w-full ${HEIGHT_BY_SIZE[block.props.size]}`}
    />
  );
}
