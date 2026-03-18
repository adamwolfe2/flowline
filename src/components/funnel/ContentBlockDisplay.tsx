"use client";

import { motion } from "framer-motion";
import { ContentBlock, FunnelConfig } from "@/types";

interface ContentBlockDisplayProps {
  blocks: ContentBlock[];
  brand: FunnelConfig["brand"];
  onContinue: () => void;
}

function getVideoEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      const id = u.hostname.includes("youtu.be") ? u.pathname.slice(1) : u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    if (u.hostname.includes("loom.com")) {
      const id = u.pathname.split("/").pop();
      return id ? `https://www.loom.com/embed/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

export function ContentBlockDisplay({ blocks, brand, onContinue }: ContentBlockDisplayProps) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="flex flex-col items-center text-center px-4">
      <div className="w-full max-w-md space-y-6 mb-8">
        {blocks.map((block, i) => (
          <motion.div
            key={block.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
          >
            {block.type === "testimonial" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-left">
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-4 h-4" style={{ color: brand.primaryColor }} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-4 italic">
                  &ldquo;{block.content.quote}&rdquo;
                </p>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{block.content.author}</p>
                  {block.content.role && (
                    <p className="text-xs text-gray-500">{block.content.role}</p>
                  )}
                </div>
              </div>
            )}

            {block.type === "image" && block.content.imageUrl && (
              <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <img
                  src={block.content.imageUrl}
                  alt={block.content.caption || "Content image"}
                  className="w-full object-cover"
                  style={{ maxHeight: "300px" }}
                  loading="lazy"
                />
                {block.content.caption && (
                  <p className="text-xs text-gray-500 p-3 text-center">{block.content.caption}</p>
                )}
              </div>
            )}

            {block.type === "video" && block.content.videoUrl && (
              <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                {(() => {
                  const embedUrl = getVideoEmbedUrl(block.content.videoUrl || "");
                  if (!embedUrl) return <p className="p-6 text-sm text-gray-400">Invalid video URL</p>;
                  return (
                    <div className="relative" style={{ paddingBottom: "56.25%" }}>
                      <iframe
                        src={embedUrl}
                        className="absolute inset-0 w-full h-full"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        title="Video"
                      />
                    </div>
                  );
                })()}
              </div>
            )}

            {block.type === "text" && (
              <div className="text-left">
                {block.content.heading && (
                  <h3
                    className="text-lg font-bold text-gray-900 mb-2"
                    style={{ fontFamily: brand.fontHeading }}
                  >
                    {block.content.heading}
                  </h3>
                )}
                {block.content.body && (
                  <p className="text-sm text-gray-600 leading-relaxed">{block.content.body}</p>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: blocks.length * 0.1 + 0.2 }}
        onClick={onContinue}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="px-8 py-3 rounded-xl text-white font-semibold text-sm shadow-lg"
        style={{ backgroundColor: brand.primaryColor }}
      >
        Continue
      </motion.button>
    </div>
  );
}
