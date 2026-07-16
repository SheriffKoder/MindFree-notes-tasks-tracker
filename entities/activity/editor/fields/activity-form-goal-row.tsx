/**
 * @file entities/activity/editor/fields/activity-form-goal-row.tsx
 * Optional positive integer goal for count/duration tracking.
 */

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ActivityFormGoalRowProps {
  goal: number | null | undefined;
  error?: string;
  onChange: (goal: number | null) => void;
}

/**
 * Number input that maps empty → `null` and invalid → previous-or-null via parse.
 */
export function ActivityFormGoalRow({
  goal,
  error,
  onChange,
}: ActivityFormGoalRowProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="activity-goal">Goal (optional)</Label>
      <Input
        aria-invalid={Boolean(error)}
        id="activity-goal"
        inputMode="numeric"
        min={1}
        name="goal"
        placeholder="e.g. 10"
        type="number"
        value={goal ?? ""}
        onChange={(event) => {
          const raw = event.target.value;

          if (raw.trim() === "") {
            onChange(null);
            return;
          }

          const parsed = Number.parseInt(raw, 10);
          onChange(Number.isFinite(parsed) ? parsed : null);
        }}
      />
      {error ? (
        <p className="text-caption [color:var(--color-error)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
