import type { LandingBlock, LandingBlockType } from "@/types";

/** Narrows the block union to a single variant, e.g. `BlockOfType<"hero">`. */
export type BlockOfType<T extends LandingBlockType> = Extract<LandingBlock, { type: T }>;

/** Shared prop shape for every per-type property form. */
export interface BlockFormProps<T extends LandingBlockType> {
  block: BlockOfType<T>;
  /** Full block list, needed by the block-id reference selects. */
  blocks: readonly LandingBlock[];
  /** Receives a NEW block object — forms never mutate `block`. */
  onChange: (block: LandingBlock) => void;
}
