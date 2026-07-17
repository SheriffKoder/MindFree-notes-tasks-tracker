/**
 * @file features/activity/quick-record/model/use-duration-timer.ts
 * Owns the play/pause state + a 60s interval for the Today duration timer.
 *
 * Purpose: keep the timer UI dumb and testable — this hook holds the `running`
 *          flag and fires `onTick` every 60s while running, cleaning up on
 *          stop/unmount. It never touches the record cache; the tick handler
 *          drives the shared recording flow (`useQuickRecord.addMinutes`).
 * Used in: features/activity/quick-record/ui/duration-timer.tsx
 *
 * Non-goals: background-tab interval throttling is accepted for MVP; the
 * persisted record is the source of truth, so a reload resumes from saved
 * minutes rather than a live clock.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TICK_INTERVAL_MS = 60_000;

export interface UseDurationTimerOptions {
  /** Fired on each 60s tick while running (e.g. add one minute). */
  onTick: () => void;
}

export interface UseDurationTimerResult {
  /** Whether the timer is currently running. */
  running: boolean;
  /** Starts ticking. */
  start: () => void;
  /** Stops ticking (value stays put). */
  stop: () => void;
  /** Flips running state. */
  toggle: () => void;
}

/**
 * Runs `onTick` every minute while `running`. The latest `onTick` is read from
 * a ref so re-renders never reset the interval.
 *
 * @param options - the per-minute tick handler
 * @returns running flag + start/stop/toggle controls
 */
export function useDurationTimer({
  onTick,
}: UseDurationTimerOptions): UseDurationTimerResult {
  const [running, setRunning] = useState(false);
  const onTickRef = useRef(onTick);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    onTickRef.current = onTick;
  });

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    setRunning(true);
  }, []);

  const stop = useCallback(() => {
    setRunning(false);
  }, []);

  const toggle = useCallback(() => {
    setRunning((value) => !value);
  }, []);

  useEffect(() => {
    if (!running) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      onTickRef.current();
    }, TICK_INTERVAL_MS);

    return clearTimer;
  }, [running, clearTimer]);

  return { running, start, stop, toggle };
}
