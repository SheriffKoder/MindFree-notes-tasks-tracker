/**
 * @file features/activity/quick-record/ui/duration-timer.tsx
 * Play/pause timer button for duration-tracked Today rows.
 *
 * Idle → `Play`; running → `Pause` with `animate-pulse` (surfacing "pause" as
 * the next action). Each 60s tick calls `onTick` (wired to add one absolute
 * minute through the shared recording flow). Holds no record cache logic.
 */

"use client";

import { Pause, Play } from "lucide-react";
import { memo } from "react";

import { useDurationTimer } from "@/features/activity/quick-record/model/use-duration-timer";
import { cn } from "@/lib/utils";

export interface DurationTimerProps {
  /** Activity title, used for the control's accessible name. */
  label: string;
  /** Fired each minute while running (adds one minute via the shared flow). */
  onTick: () => void;
}

/** Toggling play button that ticks `onTick` once per minute while running. */
export const DurationTimer = memo(function DurationTimer({
  label,
  onTick,
}: DurationTimerProps) {
  const { running, toggle } = useDurationTimer({ onTick });
  const Icon = running ? Pause : Play;

  return (
    <button
      aria-label={
        running ? `Pause timer for ${label}` : `Start timer for ${label}`
      }
      aria-pressed={running}
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
        running
          ? "animate-pulse [background-color:var(--today-card-timer-active-bg)] [color:var(--today-card-timer-active)]"
          : "[color:var(--today-card-dim)]",
      )}
      type="button"
      onClick={toggle}
    >
      <Icon aria-hidden className="h-3.5 w-3.5" />
    </button>
  );
});
