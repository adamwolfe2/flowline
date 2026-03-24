"use client";

import { ReactNode, useEffect, useState } from "react";

interface EditableOverlayProps {
  section: string;
  field: string;
  children: ReactNode;
}

export function EditableOverlay({ section, field, children }: EditableOverlayProps) {
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    setIsPreview(window.location.pathname.includes("/f/preview/"));
  }, []);

  if (!isPreview) return <>{children}</>;

  return (
    <div
      className="relative group/edit cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        window.parent.postMessage({ type: "myvsl:edit", section, field }, "*");
      }}
    >
      <div className="absolute inset-0 border-2 border-transparent group-hover/edit:border-[#2D6A4F] rounded-lg transition-colors pointer-events-none z-10" />
      <div className="absolute top-1 right-1 opacity-0 group-hover/edit:opacity-100 transition-opacity pointer-events-none z-10">
        <div className="bg-[#2D6A4F] text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
          Edit
        </div>
      </div>
      {children}
    </div>
  );
}
