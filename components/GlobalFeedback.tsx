"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { AlertTriangle, Check, X } from "lucide-react";
import { GLOBAL_FEEDBACK_EVENT, type FeedbackPayload } from "@/lib/feedback";

type ActiveFeedback = FeedbackPayload & { id: number };
type Phase = "entering" | "visible" | "leaving";

const EXIT_MS = 360;
const DEFAULT_DURATION = 3800;

export default function GlobalFeedback() {
  const [active, setActive] = useState<ActiveFeedback | null>(null);
  const [phase, setPhase] = useState<Phase>("entering");
  const idRef = useRef(0);
  const dismissTimer = useRef<number | null>(null);
  const exitTimer = useRef<number | null>(null);
  const frameOne = useRef<number | null>(null);
  const frameTwo = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (dismissTimer.current !== null) window.clearTimeout(dismissTimer.current);
    if (exitTimer.current !== null) window.clearTimeout(exitTimer.current);
    if (frameOne.current !== null) window.cancelAnimationFrame(frameOne.current);
    if (frameTwo.current !== null) window.cancelAnimationFrame(frameTwo.current);
    dismissTimer.current = null;
    exitTimer.current = null;
    frameOne.current = null;
    frameTwo.current = null;
  }, []);

  const dismiss = useCallback(() => {
    if (!active || phase === "leaving") return;
    if (dismissTimer.current !== null) window.clearTimeout(dismissTimer.current);
    dismissTimer.current = null;
    setPhase("leaving");
    exitTimer.current = window.setTimeout(() => {
      setActive(null);
      setPhase("entering");
      exitTimer.current = null;
    }, EXIT_MS);
  }, [active, phase]);

  useEffect(() => {
    const onFeedback = (event: Event) => {
      const detail = (event as CustomEvent<FeedbackPayload>).detail;
      if (!detail?.message || (detail.type !== "success" && detail.type !== "error")) return;

      clearTimers();
      const next: ActiveFeedback = {
        ...detail,
        id: ++idRef.current,
        duration: Math.max(1200, detail.duration ?? DEFAULT_DURATION),
      };

      setActive(next);
      setPhase("entering");



      frameOne.current = window.requestAnimationFrame(() => {
        frameTwo.current = window.requestAnimationFrame(() => {
          setPhase("visible");
          frameOne.current = null;
          frameTwo.current = null;
        });
      });
    };

    window.addEventListener(GLOBAL_FEEDBACK_EVENT, onFeedback as EventListener);
    return () => {
      window.removeEventListener(GLOBAL_FEEDBACK_EVENT, onFeedback as EventListener);
      clearTimers();
    };
  }, [clearTimers]);

  useEffect(() => {
    if (!active || phase !== "visible") return;
    dismissTimer.current = window.setTimeout(() => dismiss(), active.duration ?? DEFAULT_DURATION);
    return () => {
      if (dismissTimer.current !== null) window.clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    };
  }, [active, dismiss, phase]);

  if (!active) return null;

  const title = active.title ?? (active.type === "success" ? "SUCCESS" : "ERROR");
  const liveMode = active.type === "error" ? "assertive" : "polite";

  return (
    <div className="global-feedback-layer" aria-live={liveMode} aria-atomic="true">
      <div
        key={active.id}
        className={`global-feedback global-feedback--${active.type} is-${phase}`}
        role={active.type === "error" ? "alert" : "status"}
      >
        <span className="global-feedback__accent" aria-hidden="true" />
        <span className="global-feedback__icon" aria-hidden="true">
          {active.type === "success" ? <Check size={17} strokeWidth={2.2} /> : <AlertTriangle size={17} strokeWidth={2} />}
        </span>
        <span className="global-feedback__copy">
          <strong>{title}</strong>
          <span>{active.message}</span>
        </span>
        <button className="global-feedback__close" type="button" onClick={dismiss} aria-label="Dismiss message">
          <X size={15} />
        </button>
        <span className="global-feedback__timer" aria-hidden="true" style={{ "--feedback-duration": `${active.duration ?? DEFAULT_DURATION}ms` } as CSSProperties} />
      </div>
    </div>
  );
}
