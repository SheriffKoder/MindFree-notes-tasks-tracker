/**
 * @file features/activity/activity-today-card/ui/today-card-progress.tsx
 * Progress cell for the Home Today row: current value over goal (e.g. `3 / 5`),
 * or just the value when the activity is unbounded (no goal).
 */

"use client";

import { memo } from "react";

import type { TodayProgress } from "@/entities/activity";

export interface TodayCardProgressProps {
  /** Derived day progress (`value`, `goal`) to display. */
  progress: TodayProgress;
}

/** Renders `value / goal`, or `value` alone when `goal` is `null`. */
export const TodayCardProgress = memo(function TodayCardProgress({
  progress,
}: TodayCardProgressProps) {
  const { value, goal } = progress;

  return (
    <span className="shrink-0 whitespace-nowrap text-xs tabular-nums [color:var(--today-card-progress)]">
      {goal !== null ? `${value} / ${goal}` : value}
    </span>
  );
});
