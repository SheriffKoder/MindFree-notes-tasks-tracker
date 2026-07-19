/**
 * @file features/activity/quick-record/ui/quick-record-count.tsx
 * Dumb count control for the Home Today row: visible label + boxed stepper.
 *
 * Presentational only — value + onChange come from `useQuickRecord`. Consumes
 * the `--today-card-dim` var provided by the card wrapper.
 */

"use client";

import { memo } from "react";

import { Incrementer } from "@/shared/incrementer";

export interface QuickRecordCountProps {
  /** Activity title, used for the control's accessible name. */
  label: string;
  /** Absolute count for the day. */
  value: number;
  /** Sets the absolute count (`null` clears to empty). */
  onChange: (value: number | null) => void;
  /**
   * Whether to show the visible `Count` label. Defaults to false; Home only
   * shows it for `count+duration` where two inputs need distinguishing.
   */
  showLabel?: boolean;
}

/** Editable boxed count stepper; optional visible Count label. */
export const QuickRecordCount = memo(function QuickRecordCount({
  label,
  value,
  onChange,
  showLabel = false,
}: QuickRecordCountProps) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {showLabel ? (
        <span className="text-[10px] [color:var(--today-card-dim)]">Count</span>
      ) : null}
      <Incrementer
        aria-label={`Adjust ${label} count`}
        editable
        min={0}
        value={value}
        valueVariant="boxed"
        onChange={onChange}
      />
    </div>
  );
});
