"use client";

import type { LandingBlock } from "@/types";
import { Label } from "@/components/ui/label";
import { BLOCK_META, blockSummary } from "./blockMeta";

interface BlockReferenceSelectProps {
  label: string;
  /** The full block list, in page order. */
  blocks: readonly LandingBlock[];
  /** The block doing the referencing — excluded so nothing targets itself. */
  selfId: string;
  /** Current stored reference. `undefined` renders as "None". */
  value: string | undefined;
  onChange: (blockId: string | undefined) => void;
  /** Narrows the candidate list (e.g. calendar blocks only). */
  filter?: (block: LandingBlock) => boolean;
  /** Shown when no candidate blocks exist. */
  emptyHint: string;
  helpText?: string;
}

const NONE_VALUE = "";

/**
 * A `<select>` over real block ids — never a free-text id field.
 *
 * Options are labelled by type + content summary, because a raw uuid is
 * meaningless to a user. Position is included so two "Booking Form" blocks
 * are still distinguishable.
 *
 * Dangling values: `sanitizeBlockReferences` clears stale references at the
 * data layer, but this component ALSO falls back to "None" when `value` does
 * not resolve to a listed candidate. That keeps the control honest if a config
 * is loaded from the API with a reference this select would not offer (e.g. a
 * `successCalendarBlockId` written when the target was still a calendar).
 */
export function BlockReferenceSelect({
  label,
  blocks,
  selfId,
  value,
  onChange,
  filter,
  emptyHint,
  helpText,
}: BlockReferenceSelectProps) {
  const candidates = blocks.filter((b) => b.id !== selfId && (filter ? filter(b) : true));
  const resolved = value && candidates.some((b) => b.id === value) ? value : NONE_VALUE;

  if (candidates.length === 0) {
    return (
      <div>
        <Label className="text-[10px] text-gray-400">{label}</Label>
        <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-md px-2 py-1.5 mt-1">
          {emptyHint}
        </p>
      </div>
    );
  }

  return (
    <div>
      <Label className="text-[10px] text-gray-400">{label}</Label>
      <select
        value={resolved}
        onChange={(e) => onChange(e.target.value === NONE_VALUE ? undefined : e.target.value)}
        className="w-full border border-[#E5E7EB] rounded-md px-2.5 py-2 text-xs bg-white mt-1"
        aria-label={label}
      >
        <option value={NONE_VALUE}>None</option>
        {candidates.map((block) => {
          const position = blocks.findIndex((b) => b.id === block.id) + 1;
          const summary = blockSummary(block);
          return (
            <option key={block.id} value={block.id}>
              {position}. {BLOCK_META[block.type].label}
              {summary ? ` — ${summary}` : ""}
            </option>
          );
        })}
      </select>
      {helpText && <p className="text-[10px] text-gray-400 mt-1">{helpText}</p>}
    </div>
  );
}
