import type { ReactNode } from "react";
import type { LandingBlock } from "@/types";
import { safeHttpUrl } from "./url";

type ImageBlockData = Extract<LandingBlock, { type: "image" }>;

/** Server component. Styling mirrors ContentBlockDisplay's image block. */
export function ImageBlock({ block }: { block: ImageBlockData }) {
  const { url, alt, link } = block.props;
  const src = safeHttpUrl(url);
  const href = safeHttpUrl(link);

  if (!src) return <section id={block.id} className="hidden" aria-hidden="true" />;

  const image = (
    // Author-supplied remote image; next/image would require per-tenant remotePatterns.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="w-full object-cover"
      loading="lazy"
      decoding="async"
    />
  );

  const frame: ReactNode = (
    <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] shadow-sm">
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="block">
          {image}
        </a>
      ) : (
        image
      )}
    </div>
  );

  return (
    <section id={block.id} className="w-full py-6 sm:py-8">
      {frame}
    </section>
  );
}
