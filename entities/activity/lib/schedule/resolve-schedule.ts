/**
 * @file entities/activity/lib/resolve-schedule.ts
 * Whether an activity is scheduled on a given day / anywhere in a month.
 *
 * Purpose: gate the recurrence pattern (matches-recurrence) by the validity
 *          window (afterthoughts §7). Single source used by the Tasks calendar
 *          and the Home Today list.
 * Used in: calendar empty/due slots, month progress denominator, Home Today
 *          (later). Recorded calendar history does **not** go through this gate.
 *
 * Function index:
 * - isActiveOnDay:   window gate + recurrence match for one day
 * - isActiveInMonth: any active day within a month (delegates to isActiveOnDay)
 */

import { getMonthRange } from "@/entities/activity/lib/month/parse-month";
import { matchesRecurrence } from "@/entities/activity/lib/schedule/matches-recurrence";
import type { Activity } from "@/entities/activity/model/types";

/**
 * Whether an activity is scheduled on a specific day. The window is checked
 * per day (inclusive), then the recurrence pattern. `once` needs no window —
 * its config date is matched directly by the recurrence.
 *
 * @param activity - activity definition
 * @param isoDate - day as `YYYY-MM-DD`
 * @returns whether the activity is active on the day
 */
export function isActiveOnDay(activity: Activity, isoDate: string): boolean {
  const { startsAt, endsAt, scheduleType, scheduleConfig } = activity;

  if (startsAt && isoDate < startsAt) {
    return false;
  }

  if (endsAt && isoDate > endsAt) {
    return false;
  }

  return matchesRecurrence(isoDate, scheduleType, scheduleConfig);
}

/**
 * Whether an activity is active on at least one day of a month — used to decide
 * if it appears on that month's calendar / list.
 *
 * @param activity - activity definition
 * @param month - `YYYY-MM` month key
 * @returns whether any day in the month is active
 */
export function isActiveInMonth(activity: Activity, month: string): boolean {
  const { year, monthNumber, daysInMonth } = getMonthRange(month);
  const paddedMonth = String(monthNumber).padStart(2, "0");

  for (let day = 1; day <= daysInMonth; day += 1) {
    const isoDate = `${year}-${paddedMonth}-${String(day).padStart(2, "0")}`;

    if (isActiveOnDay(activity, isoDate)) {
      return true;
    }
  }

  return false;
}
