import type { LandingBlock, SpacingProps } from "@/types";

type DividerBlockData = Extract<LandingBlock, { type: "divider" }>;

/** Vertical breathing room around the rule, keyed off SpacingProps.size. */
const PADDING_BY_SIZE: Record<SpacingProps["size"], string> = {
  sm: "py-3",
  md: "py-6",
  lg: "py-10",
};

/** Server component. */
export function DividerBlock({ block }: { block: DividerBlockData }) {
  return (
    <section id={block.id} className={`w-full ${PADDING_BY_SIZE[block.props.size]}`}>
      <hr className="border-0 border-t border-[#E5E7EB]" />
    </section>
  );
}
