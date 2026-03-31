"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface PopupPreviewProps {
  funnelId: string;
  displayMode: "modal" | "slide_in" | "full_screen";
  position: "center" | "bottom_left" | "bottom_right";
  styleOverrides: {
    overlayOpacity: number;
    borderRadius: number;
    animation: string;
    maxWidth: number;
  };
}

export function PopupPreview({
  funnelId,
  displayMode,
  position,
  styleOverrides,
}: PopupPreviewProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return (
      <div className="w-full h-full flex flex-col">
        {/* Fake website */}
        <FakeWebsite />
        {/* Re-trigger button */}
        <button
          onClick={() => setDismissed(false)}
          className="absolute bottom-4 right-4 z-20 bg-[#2D6A4F] text-white text-xs px-3 py-2 rounded-lg shadow-lg hover:bg-[#245840] transition-colors"
        >
          Show popup again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Fake website background */}
      <FakeWebsite />

      {/* Popup overlay + container */}
      {displayMode === "full_screen" ? (
        <div className="absolute inset-0 z-10 bg-white flex flex-col">
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-3 z-20 w-7 h-7 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
          <iframe
            src={`/f/preview/${funnelId}?embed=true&popup=true`}
            className="w-full flex-1 border-0"
            title="Popup preview"
          />
        </div>
      ) : displayMode === "slide_in" ? (
        <div
          className="absolute z-10 animate-in slide-in-from-bottom-4 duration-300"
          style={{
            bottom: 12,
            [position === "bottom_left" ? "left" : "right"]: 12,
            width: Math.min(styleOverrides.maxWidth, 360),
            maxHeight: "75%",
            borderRadius: styleOverrides.borderRadius,
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            overflow: "hidden",
            background: "white",
          }}
        >
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-600" />
          </button>
          <iframe
            src={`/f/preview/${funnelId}?embed=true&popup=true`}
            className="w-full border-0"
            style={{ height: 520 }}
            title="Popup preview"
          />
        </div>
      ) : (
        /* Modal */
        <>
          <div
            className="absolute inset-0 z-10"
            style={{
              background: `rgba(0,0,0,${styleOverrides.overlayOpacity})`,
            }}
            onClick={() => setDismissed(true)}
          />
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="relative pointer-events-auto animate-in zoom-in-95 duration-300"
              style={{
                width: Math.min(styleOverrides.maxWidth, 420),
                maxWidth: "100%",
                maxHeight: "80%",
                borderRadius: styleOverrides.borderRadius,
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                overflow: "hidden",
                background: "white",
              }}
            >
              <button
                onClick={() => setDismissed(true)}
                className="absolute top-2 right-3 z-20 w-7 h-7 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
              <iframe
                src={`/f/preview/${funnelId}?embed=true&popup=true`}
                className="w-full border-0"
                style={{ height: 540 }}
                title="Popup preview"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/** Fake website mockup to show behind the popup */
function FakeWebsite() {
  return (
    <div className="w-full h-full bg-white overflow-hidden select-none pointer-events-none">
      {/* Nav bar */}
      <div className="h-10 border-b border-gray-200 flex items-center px-4 gap-3">
        <div className="w-6 h-6 rounded bg-gray-200" />
        <div className="w-20 h-3 rounded bg-gray-200" />
        <div className="flex-1" />
        <div className="flex gap-3">
          <div className="w-12 h-3 rounded bg-gray-100" />
          <div className="w-12 h-3 rounded bg-gray-100" />
          <div className="w-12 h-3 rounded bg-gray-100" />
          <div className="w-16 h-6 rounded bg-gray-200" />
        </div>
      </div>

      {/* Hero section */}
      <div className="px-8 pt-12 pb-8">
        <div className="max-w-md mx-auto text-center space-y-4">
          <div className="w-16 h-3 rounded bg-gray-100 mx-auto" />
          <div className="space-y-2">
            <div className="w-64 h-5 rounded bg-gray-200 mx-auto" />
            <div className="w-48 h-5 rounded bg-gray-200 mx-auto" />
          </div>
          <div className="space-y-1.5">
            <div className="w-56 h-3 rounded bg-gray-100 mx-auto" />
            <div className="w-44 h-3 rounded bg-gray-100 mx-auto" />
          </div>
          <div className="flex gap-2 justify-center pt-2">
            <div className="w-24 h-8 rounded-lg bg-gray-200" />
            <div className="w-24 h-8 rounded-lg bg-gray-100" />
          </div>
        </div>
      </div>

      {/* Content blocks */}
      <div className="px-8 pb-8">
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="w-full aspect-[4/3] rounded-lg bg-gray-100" />
              <div className="w-3/4 h-3 rounded bg-gray-100" />
              <div className="w-full h-2 rounded bg-gray-50" />
              <div className="w-2/3 h-2 rounded bg-gray-50" />
            </div>
          ))}
        </div>
      </div>

      {/* More content */}
      <div className="px-8 pb-8">
        <div className="max-w-lg mx-auto space-y-2">
          <div className="w-40 h-4 rounded bg-gray-200" />
          <div className="w-full h-2 rounded bg-gray-50" />
          <div className="w-full h-2 rounded bg-gray-50" />
          <div className="w-3/4 h-2 rounded bg-gray-50" />
        </div>
      </div>
    </div>
  );
}
