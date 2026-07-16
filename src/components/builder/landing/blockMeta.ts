import type { LandingBlock, LandingBlockType } from "@/types";
import {
  Calendar,
  ClipboardList,
  Image as ImageIcon,
  Minus,
  MousePointerClick,
  MoveVertical,
  Quote,
  Sparkles,
  Type,
  Video,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Presentation metadata for the 10 landing block types.
 *
 * Kept separate from the forms so the palette, the sortable rows and the
 * property editor all read the same labels/icons.
 */

interface BlockMeta {
  label: string;
  /** One-liner shown in the palette. */
  description: string;
  icon: LucideIcon;
}

/** Palette order — most-used first, structural spacers last. */
export const BLOCK_TYPE_ORDER: readonly LandingBlockType[] = [
  "hero",
  "text",
  "video",
  "image",
  "calendar",
  "booking_form",
  "testimonial",
  "button",
  "divider",
  "spacer",
];

export const BLOCK_META: Record<LandingBlockType, BlockMeta> = {
  hero: { label: "Hero", description: "Headline + CTA", icon: Sparkles },
  text: { label: "Text", description: "Heading + copy", icon: Type },
  video: { label: "Video", description: "YouTube, Vimeo, Loom", icon: Video },
  image: { label: "Image", description: "Photo or graphic", icon: ImageIcon },
  calendar: { label: "Calendar", description: "Cal.com or Calendly", icon: Calendar },
  booking_form: { label: "Booking Form", description: "Capture a lead", icon: ClipboardList },
  testimonial: { label: "Testimonial", description: "Social proof quote", icon: Quote },
  button: { label: "Button", description: "Scroll or link out", icon: MousePointerClick },
  divider: { label: "Divider", description: "Horizontal rule", icon: Minus },
  spacer: { label: "Spacer", description: "Vertical gap", icon: MoveVertical },
};

/** Truncates a summary so long headlines do not blow out a 375px row. */
function clamp(value: string, max = 42): string {
  const trimmed = value.trim();
  if (trimmed === "") return "";
  return trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed;
}

/**
 * Short, human summary of a block's current content, shown next to the label
 * in the sortable list. Returns "" when there is nothing worth showing (the
 * row then falls back to showing just the type label).
 */
export function blockSummary(block: LandingBlock): string {
  switch (block.type) {
    case "hero":
      return clamp(block.props.headline);
    case "text":
      return clamp(block.props.heading || block.props.body);
    case "video":
      return block.props.url ? clamp(block.props.url) : "No video URL yet";
    case "image":
      return block.props.url ? clamp(block.props.alt || block.props.url) : "No image URL yet";
    case "calendar":
      return block.props.url ? clamp(block.props.url) : "No calendar URL yet";
    case "booking_form":
      return clamp(`${block.props.fields.join(", ")} → ${block.props.submitLabel}`);
    case "testimonial":
      return clamp(block.props.author || block.props.quote);
    case "button":
      return clamp(block.props.label);
    case "divider":
    case "spacer":
      return `${block.props.size.toUpperCase()} size`;
    default: {
      // Exhaustiveness check: a new block type must be summarised here.
      const exhaustive: never = block;
      return String(exhaustive);
    }
  }
}
