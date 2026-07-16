"use client";

import type { LandingBlock } from "@/types";
import { BLOCK_META } from "./blockMeta";
import { HeroForm, TestimonialForm, TextForm } from "./forms/ContentForms";
import { ImageForm, VideoForm } from "./forms/MediaForms";
import { BookingFormForm, ButtonForm, CalendarForm } from "./forms/ActionForms";
import { SpacingSizeField } from "./forms/SpacingForms";

interface BlockPropertyEditorProps {
  block: LandingBlock;
  blocks: readonly LandingBlock[];
  onChange: (block: LandingBlock) => void;
}

/**
 * Dispatches the selected block to its per-type property form.
 *
 * The `switch` is exhaustive over the discriminated union, so adding an 11th
 * block type to `LandingBlock` is a compile error here until a form exists.
 * Inside each case `block` is narrowed to one variant, which is what lets the
 * forms rebuild `{ ...block, props: { ...block.props, x } }` without a cast.
 */
export function BlockPropertyEditor({ block, blocks, onChange }: BlockPropertyEditorProps) {
  const meta = BLOCK_META[block.type];

  return (
    <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 bg-[#F9FAFB] border-b border-[#E5E7EB]">
        <meta.icon className="w-3.5 h-3.5 text-[#0A9AFF]" />
        <span className="text-xs font-medium text-gray-700">{meta.label}</span>
        <span className="text-[10px] text-gray-400 ml-auto">Editing</span>
      </div>
      <div className="p-3">{renderForm(block, blocks, onChange)}</div>
    </div>
  );
}

function renderForm(
  block: LandingBlock,
  blocks: readonly LandingBlock[],
  onChange: (block: LandingBlock) => void,
) {
  switch (block.type) {
    case "hero":
      return <HeroForm block={block} blocks={blocks} onChange={onChange} />;
    case "text":
      return <TextForm block={block} blocks={blocks} onChange={onChange} />;
    case "video":
      return <VideoForm block={block} blocks={blocks} onChange={onChange} />;
    case "image":
      return <ImageForm block={block} blocks={blocks} onChange={onChange} />;
    case "calendar":
      return <CalendarForm block={block} blocks={blocks} onChange={onChange} />;
    case "booking_form":
      return <BookingFormForm block={block} blocks={blocks} onChange={onChange} />;
    case "testimonial":
      return <TestimonialForm block={block} blocks={blocks} onChange={onChange} />;
    case "button":
      return <ButtonForm block={block} blocks={blocks} onChange={onChange} />;
    case "divider":
      return (
        <SpacingSizeField
          value={block.props.size}
          onChange={(size) => onChange({ ...block, props: { ...block.props, size } })}
          helpText="Controls the space around the rule."
        />
      );
    case "spacer":
      return (
        <SpacingSizeField
          value={block.props.size}
          onChange={(size) => onChange({ ...block, props: { ...block.props, size } })}
          helpText="Adds empty vertical space between blocks."
        />
      );
    default: {
      // Exhaustiveness check: a new block type needs a form above.
      const exhaustive: never = block;
      return String(exhaustive);
    }
  }
}
