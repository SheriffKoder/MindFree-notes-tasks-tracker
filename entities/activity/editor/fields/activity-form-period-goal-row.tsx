/**
 * @file entities/activity/editor/fields/activity-form-period-goal-row.tsx
 * Opt-in period goal: Off / Weekly / Monthly toggle + mode-gated steppers.
 */

"use client";

import { Button } from "@/components/ui/button";
import { ActivityFormFieldRow } from "@/entities/activity/editor/fields/activity-form-field-row";
import { ActivityFormGoalRow } from "@/entities/activity/editor/fields/activity-form-goal-row";
import { GOAL_PERIOD_TOGGLE_LABELS } from "@/entities/activity/editor/lib/form-labels";
import type { GoalPeriod } from "@/entities/activity/model/types";
import { cn } from "@/lib/utils";

const PERIOD_OPTIONS: Array<GoalPeriod | "off"> = ["off", "week", "month"];

export interface ActivityFormPeriodGoalRowProps {
  goalPeriod: GoalPeriod | null | undefined;
  periodGoal: number | null | undefined;
  periodGoalDuration: number | null | undefined;
  showCountGoal: boolean;
  showDurationGoal: boolean;
  goalPeriodError?: string;
  periodGoalError?: string;
  periodGoalDurationError?: string;
  onGoalPeriodChange: (goalPeriod: GoalPeriod | null) => void;
  onPeriodGoalChange: (periodGoal: number | null) => void;
  onPeriodGoalDurationChange: (periodGoalDuration: number | null) => void;
}

/**
 * Three-state period toggle; when active, reveals count and/or duration
 * steppers for the current tracking mode (including boolean → count).
 */
export function ActivityFormPeriodGoalRow({
  goalPeriod,
  periodGoal,
  periodGoalDuration,
  showCountGoal,
  showDurationGoal,
  goalPeriodError,
  periodGoalError,
  periodGoalDurationError,
  onGoalPeriodChange,
  onPeriodGoalChange,
  onPeriodGoalDurationChange,
}: ActivityFormPeriodGoalRowProps) {
  const activeKey: GoalPeriod | "off" = goalPeriod ?? "off";
  const isActive = goalPeriod != null;

  return (
    <div className="flex flex-col gap-2 sm:col-span-2">
      <ActivityFormFieldRow error={goalPeriodError} label="Tracking period">
        <div
          aria-label="Tracking period"
          className="flex items-center gap-0.5 rounded-lg border border-[var(--color-border)] p-0.5"
          role="group"
        >
          {PERIOD_OPTIONS.map((option) => {
            const isSelected = option === activeKey;

            return (
              <Button
                key={option}
                aria-pressed={isSelected}
                className={cn(
                  "h-7 px-2.5 text-xs font-normal",
                  isSelected
                    ? "[color:var(--color-fg)]"
                    : "[color:var(--color-fg-muted)]",
                )}
                size="sm"
                type="button"
                variant={isSelected ? "secondary" : "ghost"}
                onClick={() => {
                  onGoalPeriodChange(option === "off" ? null : option);
                }}
              >
                {GOAL_PERIOD_TOGGLE_LABELS[option]}
              </Button>
            );
          })}
        </div>
      </ActivityFormFieldRow>

      {isActive ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
          {showCountGoal ? (
            <ActivityFormGoalRow
              error={periodGoalError}
              label={
                goalPeriod === "week" ? "Times per week" : "Times per month"
              }
              value={periodGoal}
              onChange={onPeriodGoalChange}
            />
          ) : null}
          {showDurationGoal ? (
            <ActivityFormGoalRow
              error={periodGoalDurationError}
              label={
                goalPeriod === "week"
                  ? "Weekly minutes"
                  : "Monthly minutes"
              }
              value={periodGoalDuration}
              onChange={onPeriodGoalDurationChange}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
