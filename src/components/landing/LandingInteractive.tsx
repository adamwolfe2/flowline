"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Client-side coordination for an otherwise server-rendered landing page.
 *
 * Two block pairs need to talk across the tree without the server renderer
 * becoming a client component:
 *
 *  - BookingFormBlock (successMode: 'show_calendar') must reveal the
 *    CalendarBlock whose id === successCalendarBlockId.
 *  - HeroBlock / ButtonBlock CTAs must smooth-scroll to an arbitrary block id.
 *
 * The provider owns the revealed-id set and a pending scroll target so that
 * scrolling happens only AFTER the revealed block has committed to the DOM.
 */
interface LandingInteractiveValue {
  /** Ids of blocks that started hidden and have since been revealed. */
  revealedBlockIds: ReadonlySet<string>;
  /** Reveals a gated block and scrolls to it once it is in the DOM. */
  revealBlock: (blockId: string) => void;
  /** Smooth-scrolls to an already-rendered block. No-op if it is absent. */
  scrollToBlock: (blockId: string) => void;
}

const LandingInteractiveContext = createContext<LandingInteractiveValue | null>(null);

export function useLandingInteractive(): LandingInteractiveValue {
  const context = useContext(LandingInteractiveContext);
  if (!context) {
    throw new Error("useLandingInteractive must be used inside <LandingInteractive>");
  }
  return context;
}

export function LandingInteractive({ children }: { children: ReactNode }) {
  const [revealedBlockIds, setRevealedBlockIds] = useState<ReadonlySet<string>>(
    () => new Set<string>()
  );
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);

  const scrollToBlock = useCallback((blockId: string) => {
    const element = document.getElementById(blockId);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const revealBlock = useCallback((blockId: string) => {
    // New Set per update — never mutate the existing state value.
    setRevealedBlockIds((previous) => {
      if (previous.has(blockId)) return previous;
      const next = new Set(previous);
      next.add(blockId);
      return next;
    });
    setPendingScrollId(blockId);
  }, []);

  // A revealed block is not in the DOM until after this render commits, so the
  // scroll is deferred by one frame; otherwise getElementById misses it.
  useEffect(() => {
    if (!pendingScrollId) return;
    const frame = window.requestAnimationFrame(() => {
      scrollToBlock(pendingScrollId);
      setPendingScrollId(null);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pendingScrollId, scrollToBlock]);

  const value = useMemo<LandingInteractiveValue>(
    () => ({ revealedBlockIds, revealBlock, scrollToBlock }),
    [revealedBlockIds, revealBlock, scrollToBlock]
  );

  return (
    <LandingInteractiveContext.Provider value={value}>
      {children}
    </LandingInteractiveContext.Provider>
  );
}
