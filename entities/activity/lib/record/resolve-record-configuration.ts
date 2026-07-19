/**
 * @file entities/activity/lib/record/resolve-record-configuration.ts
 * Chooses the tracking configuration that interprets one activity-day.
 *
 * Purpose: recorded history must keep the mode/goals frozen at first insert;
 *          empty scheduled slots follow the activity's current definition.
 *          One pure helper owns that fallback so Home, calendar, filters, and
 *          quick-record never invent divergent rules.
 * Used in: deriveTodayProgress, month progress, task filter, quick-record
 *          (Steps 5–7 of the record-snapshot plan).
 *
 * Function index:
 * - resolveRecordConfiguration: activity + optional record → effective config
 */

import type {
  Activity,
  ActivityRecord,
  TrackingMode,
} from "@/entities/activity/model/types";

/**
 * Effective tracking configuration for progress, meaningfulness, and controls.
 */
export interface RecordConfiguration {
  /** Mode that governs how count/duration are interpreted. */
  trackingMode: TrackingMode;
  /** Count target, or `null` when unbounded / unused. */
  goal: number | null;
  /** Duration target in minutes, or `null` when unbounded / unused. */
  goalDuration: number | null;
}

/**
 * Resolves the configuration for one activity-day:
 *
 * ```text
 * record exists → record tracking/goal snapshots
 * no record     → current activity tracking mode/goals
 * ```
 *
 * @param activity - current activity definition
 * @param record - day's record, or `null` when nothing is recorded
 * @returns configuration consumers must use for that day
 */
export function resolveRecordConfiguration(
  activity: Pick<Activity, "trackingMode" | "goal" | "goalDuration">,
  record: ActivityRecord | null,
): RecordConfiguration {
  if (record !== null) {
    return {
      trackingMode: record.trackingModeSnapshot,
      goal: record.goalSnapshot,
      goalDuration: record.goalDurationSnapshot,
    };
  }

  return {
    trackingMode: activity.trackingMode,
    goal: activity.goal,
    goalDuration: activity.goalDuration,
  };
}
