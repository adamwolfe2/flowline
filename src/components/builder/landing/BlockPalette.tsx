"use client";

import type { LandingBlockType } from "@/types";
import { Plus } from "lucide-react";
import { BLOCK_META, BLOCK_TYPE_ORDER } from "./blockMeta";

interface BlockPaletteProps {
  onAdd: (type: LandingBlockType) => void;
}

/**
 * Click-to-add palette for all 10 block types.
 *
 * Deliberately click-to-add rather than drag-from-palette: dragging a new block
 * in from a palette is a second, harder DnD interaction that is genuinely bad
 * on a 375px screen (the palette and the drop target rarely fit on screen at
 * once). Click appends to the end of the list, then the block can be dragged
 * into position — one DnD interaction to get right instead of two.
 *
 * Two columns at 375px: each button is ~168px wide, comfortably above the 44px
 * minimum touch target in both axes.
 */
export function BlockPalette({ onAdd }: BlockPaletteProps) {
  return (
    <div>
      <p className="text-[11px] font-medium text-gray-500 mb-2 flex items-center gap-1.5">
        <Plus className="w-3 h-3" />
        Add a block
      </p>
      <div className="grid grid-cols-2 gap-2">
        {BLOCK_TYPE_ORDER.map((type) => {
          const meta = BLOCK_META[type];
          return (
            <button
              key={type}
              type="button"
              onClick={() => onAdd(type)}
              className="flex items-start gap-2.5 p-2.5 border border-[#E5E7EB] rounded-lg hover:border-[#0A9AFF] hover:bg-[#E6F4FF]/40 transition-colors text-left group min-h-11"
            >
              <meta.icon className="w-4 h-4 text-gray-400 group-hover:text-[#0A9AFF] mt-0.5 flex-shrink-0" />
              <span className="min-w-0">
                <span className="text-xs font-medium text-gray-700 group-hover:text-[#0A9AFF] block">
                  {meta.label}
                </span>
                <span className="text-[10px] text-gray-400 block truncate">{meta.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
