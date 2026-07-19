/**
 * @file features/activity/quick-record/ui/quick-record-duration.tsx
 * Dumb duration control for the Home Today row: play/pause timer + visible
 * Minutes label + minute stepper.
 *
 * Presentational only — value/onChange/onTick come from `useQuickRecord`. The
 * live timer sits before the stepper and adds one minute per tick.
 */

"use client";

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
  /**
   * Whether to show the visible `Minutes` label. Defaults to false; Home only
   * shows it for `count+duration` where two inputs need distinguishing.
   */
  showLabel?: boolean;
}

/** Timer + editable boxed minutes stepper; optional visible Minutes label. */
export const QuickRecordDuration = memo(function QuickRecordDuration({
  label,
  value,
  onChange,
  onTick,
  showLabel = false,
}: QuickRecordDurationProps) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <DurationTimer label={label} onTick={onTick} />
      {showLabel ? (
        <span className="text-[10px] [color:var(--today-card-dim)]">Minutes</span>
      ) : null}
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
