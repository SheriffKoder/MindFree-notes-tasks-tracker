/**
 * @file features/activity/activity-today-card/ui/today-card-timer.tsx
 * Placeholder play/pause timer for the Home Today row (duration modes).
 *
 * DUMMY for now — renders a static, non-functional play button. Rewritten in
 * Milestone 2 (plan Step 11) as the live minute timer that drives the shared
 * recording flow: while running it adds +1 minute every 60s and the pause
 * button pulsates (`animate-pulse`) as the logical next action.
 */

"use client";

import { Play } from "lucide-react";
import { memo } from "react";

export interface TodayCardTimerProps {
  /** Accessible label source (typically the activity title). */
  label: string;
}

/** Non-functional placeholder; swapped for the real timer in Milestone 2. */
export const TodayCardTimer = memo(function TodayCardTimer({
  label,
}: TodayCardTimerProps) {
  return (
    <button
      aria-label={`Start timer for ${label}`}
      className="shrink-0 [color:var(--today-card-dim)]"
      type="button"
    >
      <Play aria-hidden className="h-3.5 w-3.5" />
    </button>
  );
});
