"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TeamBranding {
  logoUrl?: string;
  logoWidth?: number;
  primaryColor?: string;
  appName?: string;
  faviconUrl?: string;
}

interface WorkspaceTeam {
  id: string;
  name: string;
  role: string;
  branding?: TeamBranding;
}

interface WorkspaceContextValue {
  workspace: "personal" | string;
  setWorkspace: (id: "personal" | string) => void;
  teams: WorkspaceTeam[];
  isTeamContext: boolean;
  activeTeamId: string | null;
  activeTeam: WorkspaceTeam | null;
  loading: boolean;
  refetchTeams: () => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const STORAGE_KEY = "myvsl_workspace";

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<WorkspaceTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspaceRaw] = useState<"personal" | string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY) ?? "personal";
    }
    return "personal";
  });

  // Fetch teams from the API
  const fetchTeams = useCallback(async () => {
    try {
      const res = await fetch("/api/teams");

      // Not authenticated — treat as empty
      if (res.status === 401) {
        setTeams([]);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setTeams([]);
        setLoading(false);
        return;
      }

      const data: WorkspaceTeam[] = await res.json();
      setTeams(data);

      // If the stored workspace references a team that no longer exists, reset
      const stored =
        typeof window !== "undefined"
          ? localStorage.getItem(STORAGE_KEY)
          : null;
      if (stored && stored !== "personal") {
        const exists = data.some((t) => t.id === stored);
        if (!exists) {
          setWorkspaceRaw("personal");
          localStorage.setItem(STORAGE_KEY, "personal");
        }
      }
    } catch {
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Persist workspace selection
  const setWorkspace = useCallback((id: "personal" | string) => {
    setWorkspaceRaw(id);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, id);
    }
  }, []);

  const isTeamContext = workspace !== "personal";
  const activeTeamId = isTeamContext ? workspace : null;
  const activeTeam = teams.find((t) => t.id === activeTeamId) ?? null;

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        setWorkspace,
        teams,
        isTeamContext,
        activeTeamId,
        activeTeam,
        loading,
        refetchTeams: fetchTeams,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Fetch helper
// ---------------------------------------------------------------------------

export function workspaceFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const teamId =
    typeof window !== "undefined"
      ? localStorage.getItem(STORAGE_KEY)
      : null;

  const headers = new Headers(options.headers);

  if (teamId && teamId !== "personal") {
    headers.set("x-workspace-team-id", teamId);
  }

  return fetch(url, { ...options, headers });
}
