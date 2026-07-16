"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { LandingBlock } from "@/types";
import { Copy, GripVertical, Trash2 } from "lucide-react";
import { BLOCK_META, blockSummary } from "./blockMeta";

interface SortableBlockRowProps {
  block: LandingBlock;
  /** 1-based position, shown so duplicate labels stay distinguishable. */
  position: number;
  selected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

/**
 * One row in the sortable block list.
 *
 * TOUCH / DRAG-HANDLE CONTRACT (see LandingBuilder for the sensor config):
 * `listeners` are attached ONLY to the grip handle via `setActivatorNodeRef`,
 * never to the whole row. Two reasons:
 *   1. The row body stays a plain button, so select-to-edit is an instant tap
 *      with no long-press delay competing for the gesture.
 *   2. A touch that starts anywhere except the ~32px handle scrolls the list
 *      immediately and can never be captured by the drag sensor.
 *
 * The handle deliberately does NOT set `touch-action: none`. With the
 * TouchSensor's delay constraint, dnd-kit calls preventDefault on touchmove
 * only after activation, so a touch-and-drag from the handle still scrolls the
 * page normally if the user never holds still long enough to start a drag.
 * Setting `touch-action: none` here would create a dead zone: the browser would
 * refuse to scroll while the delay constraint refused to activate.
 */
export function SortableBlockRow({
  block,
  position,
  selected,
  onSelect,
  onDuplicate,
  onDelete,
}: SortableBlockRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const meta = BLOCK_META[block.type];
  const summary = blockSummary(block);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        // Lift the dragged row above its siblings without reordering the DOM.
        zIndex: isDragging ? 10 : undefined,
      }}
      className={`relative flex items-center gap-1 rounded-lg border bg-white transition-colors ${
        selected ? "border-[#0A9AFF] ring-1 ring-[#0A9AFF]" : "border-[#E5E7EB]"
      } ${isDragging ? "shadow-lg opacity-90" : ""}`}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        // Handle-only activation: the rest of the row never starts a drag.
        {...attributes}
        {...listeners}
        className="flex-shrink-0 flex items-center justify-center w-8 h-11 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing rounded-l-lg"
        aria-label={`Reorder ${meta.label} block, currently position ${position}`}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={onSelect}
        className="flex-1 min-w-0 flex items-center gap-2 py-2 pr-1 text-left"
        aria-pressed={selected}
      >
        <meta.icon
          className={`w-3.5 h-3.5 flex-shrink-0 ${selected ? "text-[#0A9AFF]" : "text-gray-400"}`}
        />
        <span className="min-w-0">
          <span
            className={`text-xs font-medium block truncate ${
              selected ? "text-[#0883DB]" : "text-gray-700"
            }`}
          >
            {position}. {meta.label}
          </span>
          {summary && <span className="text-[10px] text-gray-400 block truncate">{summary}</span>}
        </span>
      </button>

      <button
        type="button"
        onClick={onDuplicate}
        className="flex-shrink-0 flex items-center justify-center w-11 h-11 text-gray-300 hover:text-[#0A9AFF] transition-colors"
        aria-label={`Duplicate ${meta.label} block`}
      >
        <Copy className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="flex-shrink-0 flex items-center justify-center w-11 h-11 text-gray-300 hover:text-red-500 transition-colors rounded-r-lg"
        aria-label={`Delete ${meta.label} block`}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
