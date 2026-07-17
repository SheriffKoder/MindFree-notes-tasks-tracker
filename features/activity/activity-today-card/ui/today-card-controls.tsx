/**
 * @file features/activity/activity-today-card/ui/today-card-controls.tsx
 * Controls cell for the Home Today row: tracking-mode icon + inline stepper.
 *
 * Dumb by design. Recording is wired in Milestone 2; the play/pause duration
 * timer (plan Step 11) mounts before the Incrementer here for duration modes.
 */

"use client";

import { Clock, Hash } from "lucide-react";
import { memo } from "react";

import type { Activity } from "@/entities/activity";
import { TodayCardTimer } from "@/features/activity/activity-today-card/ui/today-card-timer";
import { Incrementer } from "@/shared/incrementer";

export interface TodayCardControlsProps {
  /** Activity whose tracking mode selects the icon + control. */
  activity: Activity;
  /** Current stepper value (primary tracked value for the mode). */
  value: number | null;
  /** Value change handler (placeholder until Milestone 2 wiring). */
  onChange: (value: number | null) => void;
}

/** Mode icon (`Clock` for duration modes, else `Hash`) + boxed editable stepper. */
export const TodayCardControls = memo(function TodayCardControls({
  activity,
  value,
  onChange,
}: TodayCardControlsProps) {
  const isDurationMode =
    activity.trackingMode === "duration" ||
    activity.trackingMode === "count+duration";
  const ModeIcon = isDurationMode ? Clock : Hash;

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {!isDurationMode && 
        <ModeIcon
          aria-hidden
          className="h-3.5 w-3.5 shrink-0 [color:var(--today-card-dim)]"
        />
      }
      {isDurationMode ? <TodayCardTimer label={activity.title} /> : null}
      <Incrementer
        aria-label={`Adjust ${activity.title}`}
        editable
        min={0}
        value={value}
        valueVariant="boxed"
        onChange={onChange}
      />
    </div>
  );
});
