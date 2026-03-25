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
      className="relative cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        window.parent.postMessage({ type: "myvsl:edit", section, field }, "*");
      }}
    >
      {children}
    </div>
  );
}
