/**
 * @file entities/activity/lib/compute-task-month-progress.ts
 * Month-level completion rate per task for calendar pills and progress surfaces.
 *
 * Purpose: a task can appear on many calendar days; computing % inside each
 *          pill would repeat the same work. This derives one rate per taskId
 *          in a single pass over the month.
 * Used in: Tasks calendar pane (Step 9.5); Progress page (later).
 *
 * Function index:
 * - computeTaskMonthProgress: activities + month + lookup → Map<taskId, percent>
 */

import { getMonthRange } from "@/entities/activity/lib/month/parse-month";
import {
  recordKey,
  type RecordLookup,
} from "@/entities/activity/lib/record/build-record-lookup";
import { isMeaningfulRecord } from "@/entities/activity/lib/record/is-meaningful-record";
import { isActiveOnDay } from "@/entities/activity/lib/schedule/resolve-schedule";
import type { Activity } from "@/entities/activity/model/types";

/**
 * Computes each task's month completion rate as a whole-number percent
 * (`completed active days / scheduled active days × 100`). Tasks with no
 * scheduled days in the month map to `0`.
 *
 * @param month - `YYYY-MM` month key
 * @param activities - task definitions
 * @param recordLookup - derived from the month's flat records
 * @returns `taskId` → completion percent (0–100)
 */
export function computeTaskMonthProgress(
  month: string,
  activities: Activity[],
  recordLookup: RecordLookup,
): Map<string, number> {
  const { year, monthNumber, daysInMonth } = getMonthRange(month);
  const paddedMonth = String(monthNumber).padStart(2, "0");
  const progressByTaskId = new Map<string, number>();

  for (const activity of activities) {
    let scheduledDays = 0;
    let completedDays = 0;

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = `${year}-${paddedMonth}-${String(day).padStart(2, "0")}`;

      if (!isActiveOnDay(activity, date)) {
        continue;
      }

      scheduledDays += 1;

      const record = recordLookup.byTaskDate.get(recordKey(activity.id, date));

      if (record !== undefined && isMeaningfulRecord(record, activity.trackingMode)) {
        completedDays += 1;
      }
    }

    const percent =
      scheduledDays === 0
        ? 0
        : Math.round((completedDays / scheduledDays) * 100);

    progressByTaskId.set(activity.id, percent);
  }

  return progressByTaskId;
}
