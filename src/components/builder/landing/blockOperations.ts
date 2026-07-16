import type { LandingBlock, LandingBlockType, LandingConfig } from "@/types";
import { createDefaultBlock, makeBlockId } from "@/lib/landing-defaults";

/**
 * Pure, immutable block-list operations for the landing builder.
 *
 * Every function returns a NEW config/array — nothing here mutates its input.
 * Keeping them free of React lets the reference-integrity rules (below) be
 * reasoned about and unit-tested in one place.
 *
 * REFERENCE INTEGRITY
 * -------------------
 * Three props are block-id references:
 *   - hero.props.ctaTargetBlockId          → any other block (scroll target)
 *   - button.props.targetBlockId           → any other block (scroll target)
 *   - booking_form.props.successCalendarBlockId → a `calendar` block only
 *
 * A reference can only ever go stale by a block disappearing, so every
 * operation that removes or replaces the block list funnels through
 * `sanitizeBlockReferences`, which clears (sets to undefined) any reference
 * that no longer resolves. We clear rather than leave it dangling so the
 * renderer never has to defend against a target that isn't there, and so the
 * `<select>` in the property editor always reflects the true stored value.
 */

/**
 * Clears any block-id reference that no longer resolves to a valid target.
 * Idempotent: running it on a clean list returns structurally equal blocks.
 */
export function sanitizeBlockReferences(blocks: readonly LandingBlock[]): LandingBlock[] {
  const allIds = new Set(blocks.map((b) => b.id));
  const calendarIds = new Set(blocks.filter((b) => b.type === "calendar").map((b) => b.id));

  return blocks.map((block): LandingBlock => {
    switch (block.type) {
      case "hero": {
        const target = block.props.ctaTargetBlockId;
        // A hero may not scroll to itself, and the target must still exist.
        if (target && (target === block.id || !allIds.has(target))) {
          return { ...block, props: { ...block.props, ctaTargetBlockId: undefined } };
        }
        return block;
      }
      case "button": {
        const target = block.props.targetBlockId;
        if (target && (target === block.id || !allIds.has(target))) {
          return { ...block, props: { ...block.props, targetBlockId: undefined } };
        }
        return block;
      }
      case "booking_form": {
        const target = block.props.successCalendarBlockId;
        // Must point at a block that both exists AND is still a calendar.
        if (target && !calendarIds.has(target)) {
          return { ...block, props: { ...block.props, successCalendarBlockId: undefined } };
        }
        return block;
      }
      default:
        return block;
    }
  });
}

/** Replaces `config.blocks` and re-checks every reference. */
function withBlocks(config: LandingConfig, blocks: readonly LandingBlock[]): LandingConfig {
  return { ...config, blocks: sanitizeBlockReferences(blocks) };
}

/** Appends a default block of `type` to the end of the list. */
export function addBlock(
  config: LandingConfig,
  type: LandingBlockType,
): { config: LandingConfig; blockId: string } {
  const block = createDefaultBlock(type);
  return { config: withBlocks(config, [...config.blocks, block]), blockId: block.id };
}

/** Swaps a single block for an edited copy of itself (same id). */
export function replaceBlock(config: LandingConfig, next: LandingBlock): LandingConfig {
  return withBlocks(
    config,
    config.blocks.map((block) => (block.id === next.id ? next : block)),
  );
}

/**
 * Inserts a deep copy of `blockId` directly after the original.
 * The copy gets a fresh id; any references the copy carries still resolve, so
 * they are intentionally preserved.
 */
export function duplicateBlock(
  config: LandingConfig,
  blockId: string,
): { config: LandingConfig; blockId: string | null } {
  const index = config.blocks.findIndex((b) => b.id === blockId);
  if (index === -1) return { config, blockId: null };

  const source = config.blocks[index];
  // Spreading a discriminated union widens `type`/`props` into an unrelated
  // pair, so the assertion re-associates them. Sound here: only `id` changes,
  // and structuredClone preserves the exact prop shape.
  const copy = {
    ...source,
    id: makeBlockId(),
    props: structuredClone(source.props),
  } as LandingBlock;

  const blocks = [...config.blocks.slice(0, index + 1), copy, ...config.blocks.slice(index + 1)];
  return { config: withBlocks(config, blocks), blockId: copy.id };
}

/**
 * Removes a block. Any reference pointing at it is cleared by the
 * `sanitizeBlockReferences` pass inside `withBlocks` — never left dangling.
 */
export function deleteBlock(config: LandingConfig, blockId: string): LandingConfig {
  return withBlocks(
    config,
    config.blocks.filter((b) => b.id !== blockId),
  );
}

/**
 * Moves the block at `fromIndex` to `toIndex`, rewriting the order.
 * Out-of-range indices are a no-op (defensive: dnd-kit can report an `over`
 * that has since been removed from the list).
 */
export function moveBlock(config: LandingConfig, fromIndex: number, toIndex: number): LandingConfig {
  const { blocks } = config;
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= blocks.length ||
    toIndex >= blocks.length
  ) {
    return config;
  }
  const next = [...blocks];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return withBlocks(config, next);
}

/** Updates the page theme without touching anything else. */
export function updateTheme(
  config: LandingConfig,
  patch: Partial<LandingConfig["theme"]>,
): LandingConfig {
  return { ...config, theme: { ...config.theme, ...patch } };
}

/** Updates SEO metadata, creating the optional `seo` object on first write. */
export function updateSeo(
  config: LandingConfig,
  patch: { metaTitle?: string; metaDescription?: string },
): LandingConfig {
  return { ...config, seo: { ...config.seo, ...patch } };
}
