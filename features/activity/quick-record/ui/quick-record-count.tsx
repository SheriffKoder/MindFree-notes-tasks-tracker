/**
 * @file features/activity/quick-record/ui/quick-record-count.tsx
 * Dumb count control for the Home Today row: `#` icon + boxed stepper.
 *
 * Presentational only — value + onChange come from `useQuickRecord`. Consumes
 * the `--today-card-dim` var provided by the card wrapper.
 */

"use client";

import { Hash } from "lucide-react";
import { memo } from "react";

import { Incrementer } from "@/shared/incrementer";

export interface QuickRecordCountProps {
  /** Activity title, used for the control's accessible name. */
  label: string;
  /** Absolute count for the day. */
  value: number;
  /** Sets the absolute count (`null` clears to empty). */
  onChange: (value: number | null) => void;
}

/** `#` icon + editable boxed stepper bound to the day's count. */
export const QuickRecordCount = memo(function QuickRecordCount({
  label,
  value,
  onChange,
}: QuickRecordCountProps) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
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
