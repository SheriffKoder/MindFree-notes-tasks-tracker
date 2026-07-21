/**
 * @file entities/activity/lib/definition/normalize-activity-definition.ts
 * Kind-aware canonicalization for activity definition fields.
 *
 * Reminders always store boolean tracking with no color or goals. Tasks keep
 * the selected tracking mode and apply goal cleanup via normalizeActivityGoals.
 */

import { normalizeActivityGoals } from "@/entities/activity/editor/model/normalize-activity-goals";
import type {
  ActivityKind,
  ActivityPriority,
  GoalPeriod,
  TrackingMode,
} from "@/entities/activity/model/types";

/** Definition fields that differ by kind / tracking mode. */
export interface ActivityDefinitionValues {
  trackingMode: TrackingMode;
  color?: string | null;
  goal?: number | null;
  goalDuration?: number | null;
  goalPeriod?: GoalPeriod | null;
  periodGoal?: number | null;
  periodGoalDuration?: number | null;
  priority?: ActivityPriority | null;
}

/** Canonical values safe to persist for the given kind. */
export interface NormalizedActivityDefinition {
  trackingMode: TrackingMode;
  color: string | null;
  goal: number | null;
  goalDuration: number | null;
  goalPeriod: GoalPeriod | null;
  periodGoal: number | null;
  periodGoalDuration: number | null;
  priority: ActivityPriority | null;
}

/**
 * Forces reminder-safe fields; for tasks, clears goals unused by tracking mode.
 *
 * @param kind - page-owned activity kind
 * @param values - candidate tracking / color / goal fields
 * @returns values safe to write for that kind
 */
export function normalizeActivityDefinition(
  kind: ActivityKind,
  values: ActivityDefinitionValues,
): NormalizedActivityDefinition {
  if (kind === "reminder") {
    return {
      trackingMode: "boolean",
      color: null,
      goal: null,
      goalDuration: null,
      goalPeriod: null,
      periodGoal: null,
      periodGoalDuration: null,
      priority: null,
    };
  }

  const goals = normalizeActivityGoals(values.trackingMode, values);

  return {
    trackingMode: values.trackingMode,
    color: values.color ?? null,
    goal: goals.goal,
    goalDuration: goals.goalDuration,
    goalPeriod: values.goalPeriod ?? null,
    periodGoal: values.periodGoal ?? null,
    periodGoalDuration: values.periodGoalDuration ?? null,
    priority: values.priority ?? null,
  };
}
