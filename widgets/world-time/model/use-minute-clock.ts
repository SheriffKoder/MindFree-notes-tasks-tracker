/**
 * @file widgets/world-time/model/use-minute-clock.ts
 * Client hook that exposes the current wall clock and ticks once per minute.
 */

"use client";

import { useEffect, useState } from "react";

/**
 * Milliseconds until the start of the next whole minute.
 *
 * @param nowMs - Epoch ms used as the reference instant
 * @returns Delay in ms until the next minute boundary (1–60000)
 */
function msUntilNextMinute(nowMs: number): number {
  return 60_000 - (nowMs % 60_000);
}

/**
 * Wall-clock `Date` that updates at each minute boundary.
 *
 * Aligns the first tick to the next whole minute, then intervals every 60s,
 * so the UI does not re-render every second.
 *
 * @returns Current `Date` (new reference each tick)
 */
export function useMinuteClock(): Date {
  const [now, setNow] = useState(function initialNow() {
    return new Date();
  });

  useEffect(function subscribeToMinuteTicks() {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    /////////////////////////////////////////////////////////////
    // Snap to the next minute, then keep a steady 60s cadence.
    const timeoutId = setTimeout(function alignToMinuteBoundary() {
      setNow(new Date());
      intervalId = setInterval(function tickEveryMinute() {
        setNow(new Date());
      }, 60_000);
    }, msUntilNextMinute(Date.now()));

    /////////////////////////////////////////////////////////////
    // Tab wake-up can skip throttled timers — refresh when visible again.
    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        setNow(new Date());
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);

    return function cleanupMinuteClock() {
      clearTimeout(timeoutId);
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return now;
}
