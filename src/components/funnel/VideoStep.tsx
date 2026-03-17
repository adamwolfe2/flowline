"use client";

import { motion } from "framer-motion";
import { getVideoEmbedUrl } from "@/lib/video";
import { FunnelConfig } from "@/types";

interface VideoStepProps {
  config: FunnelConfig;
  onContinue: () => void;
}

export function VideoStep({ config, onContinue }: VideoStepProps) {
  const videoUrl = config.quiz.video?.url;
  const embedUrl = videoUrl ? getVideoEmbedUrl(videoUrl) : null;

  if (!embedUrl) return null;

  return (
    <div className="w-full px-4">
      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm mb-6">
        <div className="relative" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Video"
          />
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-colors"
        style={{ backgroundColor: config.brand.primaryColor }}
      >
        Continue
      </motion.button>
    </div>
  );
}
