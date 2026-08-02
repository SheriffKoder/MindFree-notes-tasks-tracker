/**
 * @file widgets/uptime/model/use-uptime-hands.ts
 * Imperatively rotates analog clock hands to match wall-clock time.
 *
 * Purpose: Snap hour / minute / second hands once per second — no animation.
 * Used in: widgets/uptime/ui/uptime-clock.tsx
 */

"use client";

import { useEffect, type RefObject } from "react";

/**
 * Options for {@link useUptimeHands}.
 */
export interface UseUptimeHandsOptions {
  hourHandRef: RefObject<SVGGElement | null>;
  minuteHandRef: RefObject<SVGGElement | null>;
  /** Omit when the second hand is not rendered. */
  secondHandRef?: RefObject<SVGGElement | null>;
}

/**
 * Milliseconds until the start of the next whole second.
 *
 * @param nowMs - Epoch ms used as the reference instant
 * @returns Delay in ms until the next second boundary (1–1000)
 */
function msUntilNextSecond(nowMs: number): number {
  return 1_000 - (nowMs % 1_000);
}

/**
 * Apply hand transforms for the current wall-clock second.
 *
 * Hands are drawn pointing at 12 o’clock; positive rotation is clockwise.
 */
function applyHandTransforms(
  hourHand: SVGGElement | null,
  minuteHand: SVGGElement | null,
  secondHand: SVGGElement | null,
): void {
  const now = new Date();
  const seconds = now.getSeconds();
  const minutes = now.getMinutes() + seconds / 60;
  const hours = (now.getHours() % 12) + minutes / 60;

  hourHand?.setAttribute("transform", `rotate(${30 * hours} 50 50)`);
  minuteHand?.setAttribute("transform", `rotate(${6 * minutes} 50 50)`);
  secondHand?.setAttribute("transform", `rotate(${6 * seconds} 50 50)`);
}

/**
 * Keep clock hands aligned to wall-clock time, updating once per second.
 *
 * @param options - SVG refs for the three hand groups
 */
export function useUptimeHands({
  hourHandRef,
  minuteHandRef,
  secondHandRef,
}: UseUptimeHandsOptions): void {
  useEffect(
    function subscribeToUptimeHands() {
      let intervalId: number | undefined;

      function updateHands() {
        applyHandTransforms(
          hourHandRef.current,
          minuteHandRef.current,
          secondHandRef?.current ?? null,
        );
      }

      updateHands();

      /////////////////////////////////////////////////////////////
      // Align to the next second, then tick once per second.
      const timeoutId = window.setTimeout(function alignToSecondBoundary() {
        updateHands();
        intervalId = window.setInterval(updateHands, 1_000);
      }, msUntilNextSecond(Date.now()));

      return function cleanupUptimeHands() {
        window.clearTimeout(timeoutId);
        if (intervalId !== undefined) {
          window.clearInterval(intervalId);
        }
      };
    },
    [hourHandRef, minuteHandRef, secondHandRef],
  );
}
