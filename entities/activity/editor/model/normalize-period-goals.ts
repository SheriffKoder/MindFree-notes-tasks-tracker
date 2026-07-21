/**
 * @file entities/activity/editor/model/normalize-period-goals.ts
 * Pure tracking-mode / period-toggle policy for period-shaped goals.
 */

import type { GoalPeriod, TrackingMode } from "@/entities/activity/model/types";

export interface PeriodGoalValues {
  goalPeriod?: GoalPeriod | null;
  periodGoal?: number | null;
  periodGoalDuration?: number | null;
}

export interface NormalizedPeriodGoals {
  goalPeriod: GoalPeriod | null;
  periodGoal: number | null;
  periodGoalDuration: number | null;
}

/**
 * Clears period-goal dimensions the selected tracking mode cannot use, and
 * clears the whole period goal when the toggle is Off (`goalPeriod: null`).
 *
 * Boolean routes through count semantics (decision 3): `periodGoal` is kept,
 * `periodGoalDuration` is cleared.
 */
export function normalizePeriodGoals(
  trackingMode: TrackingMode,
  values: PeriodGoalValues,
): NormalizedPeriodGoals {
  const goalPeriod = values.goalPeriod ?? null;

  if (goalPeriod === null) {
    return {
      goalPeriod: null,
      periodGoal: null,
      periodGoalDuration: null,
    };
  }

  const periodGoal = values.periodGoal ?? null;
  const periodGoalDuration = values.periodGoalDuration ?? null;

  switch (trackingMode) {
    case "boolean":
    case "count":
      return { goalPeriod, periodGoal, periodGoalDuration: null };
    case "duration":
      return { goalPeriod, periodGoal: null, periodGoalDuration };
    case "count+duration":
      return { goalPeriod, periodGoal, periodGoalDuration };
  }
}
