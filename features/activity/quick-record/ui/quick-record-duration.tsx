/**
 * @file features/activity/quick-record/ui/quick-record-duration.tsx
 * Dumb duration control for the Home Today row: play/pause timer + clock icon +
 * minutes stepper.
 *
 * Presentational only — value/onChange/onTick come from `useQuickRecord`. The
 * live timer sits before the stepper and adds one minute per tick.
 */

"use client";

import { Clock } from "lucide-react";
import { memo } from "react";

import { DurationTimer } from "@/features/activity/quick-record/ui/duration-timer";
import { Incrementer } from "@/shared/incrementer";

export interface QuickRecordDurationProps {
  /** Activity title, used for the control's accessible name. */
  label: string;
  /** Absolute duration in minutes for the day. */
  value: number;
  /** Sets the absolute duration in minutes (`null` clears to empty). */
  onChange: (value: number | null) => void;
  /** Adds one minute each timer tick (wired to the shared recording flow). */
  onTick: () => void;
}

/** Timer + clock icon + editable boxed stepper bound to the day's minutes. */
export const QuickRecordDuration = memo(function QuickRecordDuration({
  label,
  value,
  onChange,
  onTick,
}: QuickRecordDurationProps) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <DurationTimer label={label} onTick={onTick} />
      <Incrementer
        aria-label={`Adjust ${label} minutes`}
        editable
        min={0}
        value={value}
        valueVariant="boxed"
        onChange={onChange}
      />
    </div>
  );
});
