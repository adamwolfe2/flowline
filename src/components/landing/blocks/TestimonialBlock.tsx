import { Star } from "lucide-react";
import type { LandingBlock } from "@/types";
import { safeHttpUrl } from "./url";

type TestimonialBlockData = Extract<LandingBlock, { type: "testimonial" }>;

const STARS = [1, 2, 3, 4, 5];

/** Server component. Styling mirrors ContentBlockDisplay's testimonial block. */
export function TestimonialBlock({ block }: { block: TestimonialBlockData }) {
  const { quote, author, role, avatarUrl } = block.props;
  const avatar = safeHttpUrl(avatarUrl);

  return (
    <section id={block.id} className="w-full py-6 sm:py-8">
      <figure className="mx-auto max-w-2xl rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="mb-3 flex gap-1" aria-hidden="true">
          {STARS.map((star) => (
            <Star
              key={star}
              className="h-4 w-4"
              style={{ color: "var(--landing-brand)" }}
              fill="currentColor"
              strokeWidth={0}
            />
          ))}
        </div>

        <blockquote className="mb-4 text-sm italic leading-relaxed text-[#374151] sm:text-base">
          &ldquo;{quote}&rdquo;
        </blockquote>

        <figcaption className="flex items-center gap-3">
          {avatar && (
            // Author-supplied remote avatar; next/image would require per-tenant remotePatterns.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar}
              alt=""
              className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
              loading="lazy"
              decoding="async"
            />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#0A0A0A]">{author}</p>
            {role && <p className="truncate text-xs text-[#6B7280]">{role}</p>}
          </div>
        </figcaption>
      </figure>
    </section>
  );
}
