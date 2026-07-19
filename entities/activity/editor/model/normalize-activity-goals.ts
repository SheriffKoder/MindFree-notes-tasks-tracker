/**
 * @file entities/activity/editor/model/normalize-activity-goals.ts
 * Pure tracking-mode transition policy for count and duration goals.
 */

import type { TrackingMode } from "@/entities/activity/model/types";

export interface ActivityGoalValues {
  goal?: number | null;
  goalDuration?: number | null;
}

export interface NormalizedActivityGoals {
  goal: number | null;
  goalDuration: number | null;
}

/**
 * Clears goal dimensions that the selected tracking mode cannot use while
 * retaining relevant values when switching between compatible modes.
 */
export function normalizeActivityGoals(
  trackingMode: TrackingMode,
  values: ActivityGoalValues,
): NormalizedActivityGoals {
  const goal = values.goal ?? null;
  const goalDuration = values.goalDuration ?? null;

  switch (trackingMode) {
    case "boolean":
      return { goal: null, goalDuration: null };
    case "count":
      return { goal, goalDuration: null };
    case "duration":
      return { goal: null, goalDuration };
    case "count+duration":
      return { goal, goalDuration };
  }
}
