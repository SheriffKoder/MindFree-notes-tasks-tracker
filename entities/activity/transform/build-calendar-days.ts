/**
 * @file entities/activity/lib/build-calendar-days.ts
 * Client-side join of activity definitions + month record lookup into per-day
 * calendar rows for Tasks (and later Reminders).
 *
 * Purpose: definitions and records live in separate caches; the calendar needs
 *          one `{ day, date, activities[] }` entry per day with each active
 *          activity paired to its record (or `null`).
 * Used in: Tasks calendar pane (Step 9.5); Reminders calendar (Phase 3).
 *
 * Function index:
 * - buildTaskCalendarDays: month + activities + lookup → `TaskCalendarDay[]`
 */

import { getMonthRange } from "@/entities/activity/lib/month/parse-month";
import {
  recordKey,
  type RecordLookup,
} from "@/entities/activity/lib/record/build-record-lookup";
import { isActiveOnDay } from "@/entities/activity/lib/schedule/resolve-schedule";
import type { TaskCalendarDay } from "@/entities/activity/model/read-models";
import type { Activity } from "@/entities/activity/model/types";

/**
 * Joins task definitions and a month's record lookup into one calendar day per
 * date. Each day lists every activity active on that day (`isActiveOnDay`) with
 * its record from `recordLookup` or `null`. Visibility filtering is left to
 * the view layer.
 *
 * @param month - `YYYY-MM` month key
 * @param activities - task definitions (typically all tasks for the kind)
 * @param recordLookup - derived from the month's flat records
 * @returns ordered calendar days, one per day in the month
 */
export function buildTaskCalendarDays(
  month: string,
  activities: Activity[],
  recordLookup: RecordLookup,
): TaskCalendarDay[] {
  const { year, monthNumber, daysInMonth } = getMonthRange(month);
  const paddedMonth = String(monthNumber).padStart(2, "0");
  const calendarDays: TaskCalendarDay[] = [];

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${year}-${paddedMonth}-${String(day).padStart(2, "0")}`;
    const dayActivities: TaskCalendarDay["activities"] = [];

    for (const activity of activities) {
      if (!isActiveOnDay(activity, date)) {
        continue;
      }

      dayActivities.push({
        activity,
        record:
          recordLookup.byTaskDate.get(recordKey(activity.id, date)) ?? null,
      });
    }

    calendarDays.push({
      day,
      date,
      activities: dayActivities,
    });
  }

  return calendarDays;
}
