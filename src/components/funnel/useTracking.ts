"use client";
import { useRef, useCallback, useEffect } from "react";

function getDeviceType(): "mobile" | "desktop" | "tablet" {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
  return "desktop";
}

function getUTMParams(): Record<string, string | null> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source"),
    utmMedium: params.get("utm_medium"),
    utmCampaign: params.get("utm_campaign"),
    utmTerm: params.get("utm_term"),
    utmContent: params.get("utm_content"),
  };
}

function getStepKey(index: number, totalQuestions: number, hasVideo: boolean): string {
  if (index === 0) return "welcome";
  const videoOffset = hasVideo ? 1 : 0;
  if (hasVideo && index === 1) return "video";
  const qStart = 1 + videoOffset;
  if (index >= qStart && index < qStart + totalQuestions) return `q${index - qStart + 1}`;
  if (index === qStart + totalQuestions) return "email";
  if (index === qStart + totalQuestions + 1) return "success";
  return `step_${index}`;
}

// Critical events that should be sent immediately, not batched
const IMMEDIATE_EVENT_TYPES = ["lead_created", "funnel_completed"];

interface TrackingConfig {
  funnelId: string;
  sessionId: string;
  totalQuestions: number;
  hasVideo: boolean;
}

export function useTracking({ funnelId, sessionId, totalQuestions, hasVideo }: TrackingConfig) {
  const sessionStart = useRef(Date.now());
  const stepStart = useRef(Date.now());
  const currentStep = useRef(0);
  const utmParams = useRef<Record<string, string | null>>({});
  const device = useRef<string>("desktop");
  const cumScore = useRef(0);
  const hasFiredView = useRef(false);

  // Batch event queue
  const eventQueueRef = useRef<Array<Record<string, unknown>>>([]);
  const flushTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Store in refs so callbacks don't need them as deps
  const totalQRef = useRef(totalQuestions);
  const hasVideoRef = useRef(hasVideo);
  totalQRef.current = totalQuestions;
  hasVideoRef.current = hasVideo;

  useEffect(() => {
    utmParams.current = getUTMParams();
    device.current = getDeviceType();
  }, []);

  // Flush function — sends all queued events in one batch
  const flushEvents = useCallback(() => {
    const queue = eventQueueRef.current;
    if (queue.length === 0) return;

    const batch = [...queue];
    eventQueueRef.current = [];

    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
      flushTimeoutRef.current = null;
    }

    // Use sendBeacon if available (more reliable on unload)
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/events/batch", JSON.stringify({ events: batch }));
    } else {
      fetch("/api/events/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: batch }),
        keepalive: true,
      }).catch(() => {});
    }
  }, []);

  // Queue an event instead of sending immediately
  const queueEvent = useCallback((event: Record<string, unknown>) => {
    eventQueueRef.current.push(event);

    // Auto-flush after 10 events
    if (eventQueueRef.current.length >= 10) {
      flushEvents();
      return;
    }

    // Set/reset 5-second flush timer
    if (flushTimeoutRef.current) clearTimeout(flushTimeoutRef.current);
    flushTimeoutRef.current = setTimeout(flushEvents, 5000);
  }, [flushEvents]);

  // Send an event immediately (for critical events)
  const sendImmediate = useCallback((payload: Record<string, unknown>) => {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/events", new Blob([JSON.stringify(payload)], { type: "application/json" }));
    } else {
      fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  }, []);

  // Flush on unload
  useEffect(() => {
    const handleUnload = () => flushEvents();
    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
      flushEvents(); // Flush on unmount too
    };
  }, [flushEvents]);

  const track = useCallback(
    (payload: Record<string, unknown>) => {
      const stepKey =
        typeof payload.stepKey === "string"
          ? payload.stepKey
          : getStepKey(currentStep.current, totalQRef.current, hasVideoRef.current);
      const base = {
        sessionId,
        funnelId,
        stepIndex: currentStep.current,
        stepKey,
        sessionDurationMs: Date.now() - sessionStart.current,
        deviceType: device.current,
        ...utmParams.current,
        ...payload,
      };

      const eventType = payload.eventType as string;

      // Critical events and abandon events are sent immediately
      if (IMMEDIATE_EVENT_TYPES.includes(eventType)) {
        sendImmediate(base);
      } else if (eventType === "funnel_abandoned") {
        // Abandon events use sendBeacon directly for reliability
        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
          navigator.sendBeacon("/api/events", new Blob([JSON.stringify(base)], { type: "application/json" }));
        } else {
          fetch("/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(base),
            keepalive: true,
          }).catch(() => {});
        }
      } else {
        // All other events are batched
        queueEvent(base);
      }
    },
    [funnelId, sessionId, sendImmediate, queueEvent]
  );

  useEffect(() => {
    if (hasFiredView.current) return;
    hasFiredView.current = true;
    track({ eventType: "funnel_viewed", stepIndex: 0, stepKey: "welcome" });
  }, [track]);

  useEffect(() => {
    const videoOffset = hasVideoRef.current ? 1 : 0;
    const emailStepIndex = 1 + videoOffset + totalQRef.current;
    const handleAbandon = () => {
      // Flush any queued events first
      flushEvents();
      track({
        eventType: "funnel_abandoned",
        abandonedAtStep: currentStep.current,
        timeOnStepMs: Date.now() - stepStart.current,
        reachedEmail: currentStep.current >= emailStepIndex,
      });
    };
    window.addEventListener("beforeunload", handleAbandon);
    return () => window.removeEventListener("beforeunload", handleAbandon);
  }, [track, flushEvents]);

  const trackPageView = useCallback(
    (stepIndex: number) => {
      currentStep.current = stepIndex;
      stepStart.current = Date.now();
      track({
        eventType: "page_viewed",
        stepIndex,
        stepKey: getStepKey(stepIndex, totalQRef.current, hasVideoRef.current),
      });
    },
    [track]
  );

  const trackAnswer = useCallback(
    (stepIndex: number, questionKey: string, answerId: string, answerLabel: string, answerPoints: number) => {
      cumScore.current += answerPoints;
      track({
        eventType: "answer_selected",
        stepIndex,
        stepKey: getStepKey(stepIndex, totalQRef.current, hasVideoRef.current),
        questionKey,
        answerId,
        answerLabel,
        answerPoints,
        cumulativeScore: cumScore.current,
        timeOnStepMs: Date.now() - stepStart.current,
      });
    },
    [track]
  );

  const trackCTAClick = useCallback(() => {
    track({ eventType: "cta_clicked", stepIndex: 0, stepKey: "welcome" });
  }, [track]);

  const trackFieldFocus = useCallback(() => {
    track({ eventType: "field_focused", stepIndex: currentStep.current, stepKey: "email", timeOnStepMs: Date.now() - stepStart.current });
  }, [track]);

  const trackFormSubmit = useCallback(() => {
    track({ eventType: "form_submitted", stepIndex: currentStep.current, stepKey: "email", timeOnStepMs: Date.now() - stepStart.current });
  }, [track]);

  const trackLeadCreated = useCallback(
    (leadId: string, score: number, calendarTier: string) => {
      track({ eventType: "lead_created", stepIndex: currentStep.current, stepKey: "email", leadId, score, calendarTier });
    },
    [track]
  );

  const trackFunnelCompleted = useCallback(() => {
    track({ eventType: "funnel_completed", stepIndex: currentStep.current, stepKey: "success" });
  }, [track]);

  const trackBackNavigation = useCallback(
    (fromStep: number) => {
      track({ eventType: "back_navigated", stepIndex: fromStep, timeOnStepMs: Date.now() - stepStart.current });
    },
    [track]
  );

  return { trackPageView, trackAnswer, trackCTAClick, trackFieldFocus, trackFormSubmit, trackLeadCreated, trackFunnelCompleted, trackBackNavigation };
}
