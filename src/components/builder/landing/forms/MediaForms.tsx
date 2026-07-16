"use client";

import type { VideoProvider } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { BlockFormProps } from "./formTypes";

/** Property forms for the media blocks: video, image. */

const VIDEO_PROVIDERS: readonly VideoProvider[] = ["youtube", "vimeo", "loom", "vidalytics"];

const VIDEO_PROVIDER_LABELS: Record<VideoProvider, string> = {
  youtube: "YouTube",
  vimeo: "Vimeo",
  loom: "Loom",
  vidalytics: "Vidalytics",
};

const VIDEO_PROVIDER_PLACEHOLDERS: Record<VideoProvider, string> = {
  youtube: "https://youtube.com/watch?v=...",
  vimeo: "https://vimeo.com/...",
  loom: "https://loom.com/share/...",
  vidalytics: "https://vidalytics.com/embed/...",
};

/** Type guard so the `<select>` never widens `provider` to `string`. */
function isVideoProvider(value: string): value is VideoProvider {
  return (VIDEO_PROVIDERS as readonly string[]).includes(value);
}

export function VideoForm({ block, onChange }: BlockFormProps<"video">) {
  const { props } = block;

  return (
    <div className="space-y-2.5">
      <div>
        <Label className="text-[10px] text-gray-400">Provider</Label>
        <select
          value={props.provider}
          onChange={(e) => {
            if (!isVideoProvider(e.target.value)) return;
            onChange({ ...block, props: { ...props, provider: e.target.value } });
          }}
          className="w-full border border-[#E5E7EB] rounded-md px-2.5 py-2 text-xs bg-white mt-1"
          aria-label="Video provider"
        >
          {VIDEO_PROVIDERS.map((provider) => (
            <option key={provider} value={provider}>
              {VIDEO_PROVIDER_LABELS[provider]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label className="text-[10px] text-gray-400">Video URL</Label>
        <Input
          value={props.url}
          onChange={(e) => onChange({ ...block, props: { ...props, url: e.target.value } })}
          placeholder={VIDEO_PROVIDER_PLACEHOLDERS[props.provider]}
          className="text-xs mt-1"
        />
      </div>
      <div className="flex items-center justify-between gap-3 py-1">
        <div>
          <Label className="text-[10px] text-gray-400">Autoplay</Label>
          <p className="text-[10px] text-gray-400">Most browsers require the video to start muted.</p>
        </div>
        <Switch
          checked={props.autoplay}
          onCheckedChange={(checked) =>
            onChange({ ...block, props: { ...props, autoplay: checked } })
          }
          aria-label="Autoplay video"
        />
      </div>
      {/* aspectRatio is "16:9" in the type contract — no other value is valid,
          so it is shown as a readout rather than a one-option select. */}
      <div className="flex items-center justify-between text-[10px] text-gray-400 bg-gray-50 rounded-md px-2.5 py-1.5">
        <span>Aspect ratio</span>
        <span className="font-medium text-gray-500">{props.aspectRatio}</span>
      </div>
    </div>
  );
}

export function ImageForm({ block, onChange }: BlockFormProps<"image">) {
  const { props } = block;

  return (
    <div className="space-y-2.5">
      <div>
        <Label className="text-[10px] text-gray-400">Image URL</Label>
        <Input
          value={props.url}
          onChange={(e) => onChange({ ...block, props: { ...props, url: e.target.value } })}
          placeholder="https://..."
          className="text-xs mt-1"
        />
      </div>
      <div>
        <Label className="text-[10px] text-gray-400">Alt text</Label>
        <Input
          value={props.alt}
          onChange={(e) => onChange({ ...block, props: { ...props, alt: e.target.value } })}
          placeholder="Describe the image for screen readers"
          className="text-xs mt-1"
          maxLength={120}
        />
      </div>
      <div>
        <Label className="text-[10px] text-gray-400">Link (optional)</Label>
        <Input
          value={props.link ?? ""}
          onChange={(e) => onChange({ ...block, props: { ...props, link: e.target.value } })}
          placeholder="https://..."
          className="text-xs mt-1"
        />
        <p className="text-[10px] text-gray-400 mt-1">Wraps the image in a link when set.</p>
      </div>
      {props.url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={props.url}
          alt={props.alt}
          className="w-full max-h-32 object-contain rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]"
        />
      )}
    </div>
  );
}
