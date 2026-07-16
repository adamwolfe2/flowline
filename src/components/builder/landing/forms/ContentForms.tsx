"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BlockReferenceSelect } from "../BlockReferenceSelect";
import type { BlockFormProps } from "./formTypes";

/** Property forms for the copy-led blocks: hero, text, testimonial. */

export function HeroForm({ block, blocks, onChange }: BlockFormProps<"hero">) {
  const { props } = block;

  return (
    <div className="space-y-2.5">
      <div>
        <Label className="text-[10px] text-gray-400">Eyebrow / badge (optional)</Label>
        <Input
          value={props.eyebrow ?? ""}
          onChange={(e) => onChange({ ...block, props: { ...props, eyebrow: e.target.value } })}
          placeholder="For revenue leaders with 10+ reps"
          className="text-xs mt-1"
          maxLength={60}
        />
      </div>
      <div>
        <Label className="text-[10px] text-gray-400">Headline</Label>
        <Textarea
          value={props.headline}
          onChange={(e) => onChange({ ...block, props: { ...props, headline: e.target.value } })}
          className="text-xs mt-1 resize-none"
          rows={2}
          maxLength={120}
        />
      </div>
      <div>
        <Label className="text-[10px] text-gray-400">Highlight word/phrase (optional)</Label>
        <Input
          value={props.highlightText ?? ""}
          onChange={(e) => onChange({ ...block, props: { ...props, highlightText: e.target.value } })}
          placeholder="A part of the headline to accent"
          className="text-xs mt-1"
          maxLength={60}
        />
        <p className="text-[10px] text-gray-400 mt-1">
          Must match text in the headline exactly. Shown in your brand colour.
        </p>
      </div>
      <div>
        <Label className="text-[10px] text-gray-400">Subheadline</Label>
        <Textarea
          value={props.subheadline ?? ""}
          onChange={(e) => onChange({ ...block, props: { ...props, subheadline: e.target.value } })}
          className="text-xs mt-1 resize-none"
          rows={2}
          maxLength={200}
        />
      </div>
      <div>
        <Label className="text-[10px] text-gray-400">Logo URL (optional)</Label>
        <Input
          value={props.logoUrl ?? ""}
          onChange={(e) => onChange({ ...block, props: { ...props, logoUrl: e.target.value } })}
          placeholder="Leave empty to use your brand logo"
          className="text-xs mt-1"
        />
      </div>
      <div>
        <Label className="text-[10px] text-gray-400">CTA Label</Label>
        <Input
          value={props.ctaLabel ?? ""}
          onChange={(e) => onChange({ ...block, props: { ...props, ctaLabel: e.target.value } })}
          placeholder="Book a Call"
          className="text-xs mt-1"
          maxLength={40}
        />
      </div>
      <BlockReferenceSelect
        label="CTA scrolls to"
        blocks={blocks}
        selfId={block.id}
        value={props.ctaTargetBlockId}
        onChange={(id) => onChange({ ...block, props: { ...props, ctaTargetBlockId: id } })}
        emptyHint="Add another block (e.g. a booking form) to give the CTA somewhere to scroll to."
        helpText="Usually your booking form or calendar."
      />
      <div className="pt-1 border-t border-[#E5E7EB]">
        <p className="text-[11px] font-medium text-gray-500 mt-2 mb-1">Secondary CTA (optional)</p>
        <Label className="text-[10px] text-gray-400">Label</Label>
        <Input
          value={props.secondaryCtaLabel ?? ""}
          onChange={(e) =>
            onChange({ ...block, props: { ...props, secondaryCtaLabel: e.target.value } })
          }
          placeholder="Try for Free"
          className="text-xs mt-1"
          maxLength={40}
        />
      </div>
      <BlockReferenceSelect
        label="Secondary CTA scrolls to"
        blocks={blocks}
        selfId={block.id}
        value={props.secondaryCtaTargetBlockId}
        onChange={(id) =>
          onChange({ ...block, props: { ...props, secondaryCtaTargetBlockId: id } })
        }
        emptyHint="Add another block to give the secondary CTA a destination."
      />
      <div>
        <Label className="text-[10px] text-gray-400">Reassurance line (optional)</Label>
        <Input
          value={props.note ?? ""}
          onChange={(e) => onChange({ ...block, props: { ...props, note: e.target.value } })}
          placeholder="Free 15-minute call. No card required."
          className="text-xs mt-1"
          maxLength={120}
        />
      </div>
    </div>
  );
}

export function TextForm({ block, onChange }: BlockFormProps<"text">) {
  const { props } = block;

  return (
    <div className="space-y-2.5">
      <div>
        <Label className="text-[10px] text-gray-400">Heading (optional)</Label>
        <Input
          value={props.heading ?? ""}
          onChange={(e) => onChange({ ...block, props: { ...props, heading: e.target.value } })}
          className="text-xs mt-1"
          maxLength={100}
        />
      </div>
      <div>
        <Label className="text-[10px] text-gray-400">Body</Label>
        <Textarea
          value={props.body}
          onChange={(e) => onChange({ ...block, props: { ...props, body: e.target.value } })}
          className="text-xs mt-1 resize-none"
          rows={6}
          maxLength={2000}
        />
        <p className="text-[10px] text-gray-400 mt-1">
          Markdown supported — **bold**, _italic_, and lists.
        </p>
      </div>
    </div>
  );
}

export function TestimonialForm({ block, onChange }: BlockFormProps<"testimonial">) {
  const { props } = block;

  return (
    <div className="space-y-2.5">
      <div>
        <Label className="text-[10px] text-gray-400">Quote</Label>
        <Textarea
          value={props.quote}
          onChange={(e) => onChange({ ...block, props: { ...props, quote: e.target.value } })}
          className="text-xs mt-1 resize-none"
          rows={3}
          maxLength={300}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-[10px] text-gray-400">Author</Label>
          <Input
            value={props.author}
            onChange={(e) => onChange({ ...block, props: { ...props, author: e.target.value } })}
            className="text-xs mt-1"
            maxLength={50}
          />
        </div>
        <div>
          <Label className="text-[10px] text-gray-400">Role (optional)</Label>
          <Input
            value={props.role ?? ""}
            onChange={(e) => onChange({ ...block, props: { ...props, role: e.target.value } })}
            className="text-xs mt-1"
            maxLength={50}
          />
        </div>
      </div>
      <div>
        <Label className="text-[10px] text-gray-400">Avatar URL (optional)</Label>
        <Input
          value={props.avatarUrl ?? ""}
          onChange={(e) => onChange({ ...block, props: { ...props, avatarUrl: e.target.value } })}
          placeholder="https://..."
          className="text-xs mt-1"
        />
      </div>
    </div>
  );
}
