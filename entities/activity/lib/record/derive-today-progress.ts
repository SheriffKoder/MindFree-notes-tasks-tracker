/**
 * @file entities/activity/lib/record/derive-today-progress.ts
 * Derives a single day's progress for one activity from its record (afterthoughts §2).
 *
 * Purpose: Home Today shows `value / goal` (+ remaining) per activity; the math
 *          must live in the entity so no consumer recomputes it
 *          (home-page.md: "The Home page should never calculate these values
 *          independently"). Completion is derived — there is no stored flag.
 * Used in: Home Today derivation (`build-today-activities`); quick-record slot copy.
 *
 * Function index:
 * - deriveTodayProgress: activity + record → { done, value, goal, remaining, percent }
 */

import { isMeaningfulRecord } from "@/entities/activity/lib/record/is-meaningful-record";
import type { TodayProgress } from "@/entities/activity/model/read-models";
import type { Activity, ActivityRecord } from "@/entities/activity/model/types";

/**
 * Picks the dimension a single `value / goal` pair tracks. `duration` mode is
 * minutes; every other mode (including `count+duration`) is driven by count.
 *
 * @param activity - activity definition (for `trackingMode`)
 * @param record - the day's record, or `null` when nothing is recorded
 * @returns the primary tracked value (`0` when unrecorded)
 */
function selectValue(activity: Activity, record: ActivityRecord | null): number {
  if (!record) {
    return 0;
  }

  return activity.trackingMode === "duration" ? record.duration : record.count;
}

/**
 * Derives one day's progress for an activity. `done` is goal-aware: when a goal
 * is set it means the value reached it; otherwise it falls back to
 * `isMeaningfulRecord`. `remaining`/`percent` are `null` for unbounded
 * activities (no goal).
 *
 * @param activity - activity definition
 * @param record - the day's record, or `null` when nothing is recorded
 * @returns derived progress fields
 */
export function deriveTodayProgress(
  activity: Activity,
  record: ActivityRecord | null,
): TodayProgress {
  const value = selectValue(activity, record);
  const goal = activity.goal;
  const hasGoal = goal !== null && goal > 0;

  const done = !record
    ? false
    : hasGoal
      ? value >= goal
      : isMeaningfulRecord(record, activity.trackingMode);

  const remaining = hasGoal ? Math.max(0, goal - value) : null;
  const percent = hasGoal ? Math.min(100, Math.round((value / goal) * 100)) : null;

  return { done, value, goal, remaining, percent };
}
