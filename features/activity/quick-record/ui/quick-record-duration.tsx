/**
 * @file features/activity/quick-record/ui/quick-record-duration.tsx
 * Dumb duration control for the Home Today row: clock icon + minutes stepper.
 *
 * Presentational only — value + onChange come from `useQuickRecord`. The live
 * play/pause timer mounts *before* this control in plan Step 11.
 */

"use client";

import { Clock } from "lucide-react";
import { memo } from "react";

import { Incrementer } from "@/shared/incrementer";

export interface QuickRecordDurationProps {
  /** Activity title, used for the control's accessible name. */
  label: string;
  /** Absolute duration in minutes for the day. */
  value: number;
  /** Sets the absolute duration in minutes (`null` clears to empty). */
  onChange: (value: number | null) => void;
}

/** Clock icon + editable boxed stepper bound to the day's minutes. */
export const QuickRecordDuration = memo(function QuickRecordDuration({
  label,
  value,
  onChange,
}: QuickRecordDurationProps) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <Clock
        aria-hidden
        className="h-3.5 w-3.5 shrink-0 [color:var(--today-card-dim)]"
      />
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
