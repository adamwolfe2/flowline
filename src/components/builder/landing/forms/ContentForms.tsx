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
