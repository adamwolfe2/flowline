"use client";

import { WorkspaceProvider } from "@/hooks/useWorkspace";

export function WorkspaceWrapper({ children }: { children: React.ReactNode }) {
  return <WorkspaceProvider>{children}</WorkspaceProvider>;
}
