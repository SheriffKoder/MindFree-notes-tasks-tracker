/**
 * @file entities/activity/editor/fields/activity-form-goal-row.tsx
 * Optional goal stepper beside its label.
 */

"use client";

import { ActivityFormFieldRow } from "@/entities/activity/editor/fields/activity-form-field-row";
import { Incrementer } from "@/shared/incrementer";

export interface ActivityFormGoalRowProps {
  goal: number | null | undefined;
  error?: string;
  onChange: (goal: number | null) => void;
}

/**
 * Goal as an editable `[input] {− | +}` — type directly or step.
 */
export function ActivityFormGoalRow({
  goal,
  error,
  onChange,
}: ActivityFormGoalRowProps) {
  return (
    <ActivityFormFieldRow error={error} label="Goal">
      <Incrementer
        allowNull
        aria-label="Goal"
        editable
        min={1}
        value={goal ?? null}
        onChange={onChange}
      />
    </ActivityFormFieldRow>
  );
}
