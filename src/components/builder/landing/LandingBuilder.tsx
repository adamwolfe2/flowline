"use client";

import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { LandingBlock, LandingBlockType, LandingConfig } from "@/types";
import { LayoutGrid } from "lucide-react";
import { BlockPalette } from "./BlockPalette";
import { BlockPropertyEditor } from "./BlockPropertyEditor";
import { SortableBlockRow } from "./SortableBlockRow";
import { ThemeSeoEditor } from "./ThemeSeoEditor";
import { addBlock, deleteBlock, duplicateBlock, moveBlock, replaceBlock } from "./blockOperations";

interface LandingBuilderProps {
  config: LandingConfig;
  onSave: (config: LandingConfig) => void;
}

/**
 * Left-panel editor for landing funnels: block palette, sortable block list,
 * per-type property form, and page-level theme/SEO settings.
 *
 * All config transforms live in `./blockOperations` and are pure + immutable —
 * this component only owns UI state (which block is selected).
 *
 * ---------------------------------------------------------------------------
 * TOUCH DRAG AT 375px — why these three sensors
 * ---------------------------------------------------------------------------
 * The block list lives inside a vertically scrolling panel, so a naive DnD
 * setup fights the page scroll: the browser interprets touch-and-move as a
 * scroll, and dnd-kit never gets to activate.
 *
 * `PointerSensor` is NOT used. It handles mouse and touch through one code
 * path, which forces `touch-action: none` on the draggable to stop the browser
 * from claiming the gesture — and that kills scrolling that starts on a handle.
 * dnd-kit's own guidance is to use Mouse + Touch sensors instead of Pointer
 * when the two need different activation rules. They do here:
 *
 *  - MouseSensor, `{ distance: 4 }` — a 4px move starts the drag. A plain click
 *    on the handle (0px movement) never becomes a drag, so it stays a no-op
 *    rather than a jittery 1px reorder.
 *
 *  - TouchSensor, `{ delay: 200, tolerance: 8 }` — long-press to drag. This is
 *    the whole trick for mobile. The two outcomes are mutually exclusive:
 *      • finger moves >8px within 200ms  → constraint aborts, drag never
 *        activates, the browser scrolls the panel as normal.
 *      • finger holds still for 200ms    → drag activates. dnd-kit's touchmove
 *        listener is registered with `{ passive: false }`, so from that point
 *        preventDefault() suppresses scrolling for the rest of the gesture.
 *    Because the browser has not begun a native scroll during a 200ms still
 *    press, activation always wins that race — preventDefault would be ignored
 *    if scrolling had already started, which is exactly why the delay exists
 *    and why `touch-action: none` is unnecessary (and harmful) here.
 *
 *  - KeyboardSensor — Tab to a handle, Space to lift, arrows to move. Free
 *    a11y, and the only reorder path that needs no pointer at all.
 *
 * Listeners are bound to the grip handle alone (see SortableBlockRow), so the
 * remaining ~90% of the row stays instantly tappable and scrollable.
 */
export function LandingBuilder({ config, onSave }: LandingBuilderProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Derived, not mirrored: if the selected block is deleted the lookup simply
  // returns undefined, so there is no stale-selection state to clean up.
  const selectedBlock: LandingBlock | undefined = config.blocks.find((b) => b.id === selectedId);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleAdd(type: LandingBlockType) {
    const result = addBlock(config, type);
    onSave(result.config);
    setSelectedId(result.blockId);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = config.blocks.findIndex((b) => b.id === active.id);
    const to = config.blocks.findIndex((b) => b.id === over.id);
    if (from === -1 || to === -1) return;
    onSave(moveBlock(config, from, to));
  }

  function handleDuplicate(blockId: string) {
    const result = duplicateBlock(config, blockId);
    if (!result.blockId) return;
    onSave(result.config);
    setSelectedId(result.blockId);
  }

  function handleDelete(blockId: string) {
    onSave(deleteBlock(config, blockId));
    if (selectedId === blockId) setSelectedId(null);
  }

  function handleBlockChange(next: LandingBlock) {
    onSave(replaceBlock(config, next));
  }

  return (
    <div className="space-y-5">
      <div className="p-3 bg-[#E6F4FF] rounded-lg border border-[#0A9AFF]/20">
        <p className="text-xs text-[#0883DB] font-medium mb-1">Landing Page</p>
        <p className="text-[11px] text-[#0883DB]/80 leading-relaxed">
          Add blocks, drag the handle to reorder, and tap a block to edit it. Changes save
          automatically.
        </p>
      </div>

      <BlockPalette onAdd={handleAdd} />

      <div>
        <p className="text-[11px] font-medium text-gray-500 mb-2">
          Your blocks ({config.blocks.length})
          <span className="font-normal text-gray-400"> — shown in this order</span>
        </p>

        {config.blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 border border-dashed border-[#E5E7EB] rounded-lg bg-[#F9FAFB] text-center">
            <LayoutGrid className="w-5 h-5 text-[#9CA3AF] mb-2" />
            <p className="text-xs text-gray-500 font-medium">No blocks yet</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Add one from the palette above.</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={config.blocks.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1.5">
                {config.blocks.map((block, index) => (
                  <SortableBlockRow
                    key={block.id}
                    block={block}
                    position={index + 1}
                    selected={block.id === selectedId}
                    onSelect={() => setSelectedId(block.id === selectedId ? null : block.id)}
                    onDuplicate={() => handleDuplicate(block.id)}
                    onDelete={() => handleDelete(block.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {selectedBlock && (
        <BlockPropertyEditor
          block={selectedBlock}
          blocks={config.blocks}
          onChange={handleBlockChange}
        />
      )}

      <div className="pt-1 border-t border-[#E5E7EB]">
        <p className="text-[11px] font-medium text-gray-500 mt-3 mb-2">Page Settings</p>
        <ThemeSeoEditor config={config} onChange={onSave} />
      </div>
    </div>
  );
}
