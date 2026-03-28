"use client";

import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

/**
 * Polls for new leads and shows a toast notification when one arrives.
 * Uses the /api/leads endpoint with a since parameter to only get new leads.
 */
export function useLeadNotifications(enabled: boolean = true) {
  const lastCheckRef = useRef<string>(new Date().toISOString());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkForNewLeads = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/leads?since=${encodeURIComponent(lastCheckRef.current)}&limit=5`
      );
      if (!res.ok) return;

      const data = await res.json();
      const newLeads = data.leads ?? [];

      if (newLeads.length > 0) {
        lastCheckRef.current = new Date().toISOString();

        if (newLeads.length === 1) {
          const lead = newLeads[0];
          toast.success(`New lead captured`, {
            description: `${lead.email} — ${lead.calendarTier} tier (score: ${lead.score})`,
            duration: 5000,
          });
        } else {
          toast.success(`${newLeads.length} new leads captured`, {
            description: `Latest: ${newLeads[0].email}`,
            duration: 5000,
          });
        }
      }
    } catch {
      // Silently fail — don't spam errors for a background poll
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Poll every 30 seconds
    intervalRef.current = setInterval(checkForNewLeads, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, checkForNewLeads]);
}
