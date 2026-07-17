/**
 * @file features/activity/activity-today-card/lib/today-progress-segments.ts
 * Pure builder for the Home Today progress cell: which `value / goal` segments
 * to show per tracking mode.
 *
 * The single `goal` applies to the mode's primary dimension (count, except
 * `duration` where it is minutes). `count+duration` therefore shows two
 * segments — a goal-aware count and an unbounded minutes reading. Minute
 * segments carry a `m` unit so the cell can suffix each number.
 */

import type { Activity, ActivityRecord } from "@/entities/activity";

/**
 * One displayable progress reading (a single tracked dimension).
 */
export interface TodayProgressSegment {
  /** Current recorded value for the dimension. */
  value: number;
  /** Target for the dimension, or `null` when unbounded. */
  goal: number | null;
  /** Unit suffix appended to each number (`"m"` for minutes, else `""`). */
  unit: string;
}

/**
 * Builds the progress segments for an activity-day.
 *
 * - `boolean` / `count` → one count segment (goal-aware)
 * - `duration`          → one minutes segment (goal-aware, minutes)
 * - `count+duration`    → count segment (goal) + minutes segment (unbounded)
 *
 * @param activity - activity definition (tracking mode + goal)
 * @param record - the day's record, or `null` when nothing is recorded
 * @returns one or two segments to render, in display order
 */
export function buildTodayProgressSegments(
  activity: Activity,
  record: ActivityRecord | null,
): TodayProgressSegment[] {
  const count = record?.count ?? 0;
  const duration = record?.duration ?? 0;
  const { goal } = activity;

  switch (activity.trackingMode) {
    case "duration":
      return [{ value: duration, goal, unit: "m" }];
    case "count+duration":
      return [
        { value: count, goal, unit: "" },
        { value: duration, goal: null, unit: "m" },
      ];
    case "boolean":
    case "count":
    default:
      return [{ value: count, goal, unit: "" }];
  }
}
