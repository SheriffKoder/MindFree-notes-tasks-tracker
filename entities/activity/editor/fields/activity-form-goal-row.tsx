/**
 * @file entities/activity/editor/fields/activity-form-goal-row.tsx
 * Reusable optional goal stepper beside its label (count or duration).
 */

"use client";

import { ActivityFormFieldRow } from "@/entities/activity/editor/fields/activity-form-field-row";
import { Incrementer } from "@/shared/incrementer";

export interface ActivityFormGoalRowProps {
  /** Field label shown beside the stepper. */
  label: string;
  /** Accessible name for the Incrementer. Defaults to {@link label}. */
  ariaLabel?: string;
  /** Current goal value, or `null`/`undefined` when unbounded. */
  value: number | null | undefined;
  /** Field-level validation message. */
  error?: string;
  /** Called with the next absolute goal, or `null` when cleared. */
  onChange: (value: number | null) => void;
}

/**
 * Goal as an editable `[input] {− | +}` — type directly or step.
 */
export function ActivityFormGoalRow({
  label,
  ariaLabel = label,
  value,
  error,
  onChange,
}: ActivityFormGoalRowProps) {
  return (
    <ActivityFormFieldRow error={error} label={label}>
      <Incrementer
        allowNull
        aria-label={ariaLabel}
        editable
        min={1}
        value={value ?? null}
        onChange={onChange}
      />
    </ActivityFormFieldRow>
  );
}
