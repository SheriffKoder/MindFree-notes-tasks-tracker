/**
 * @file entities/activity/lib/schedule/resolve-schedule.ts
 * Whether an activity is scheduled on a given day / anywhere in a month.
 *
 * Purpose: gate the recurrence pattern (matches-recurrence) by the validity
 *          window (afterthoughts §7). Single source used by the Tasks calendar
 *          and the Home Today list.
 * Used in: calendar empty/due slots, month progress denominator, Home Today
 *          (later). Recorded calendar history does **not** go through this gate.
 *
 * Function index:
 * - isWithinValidityWindow: startsAt/endsAt only (no recurrence)
 * - overlapsValidityWindow: whether a month intersects the validity window
 * - isActiveOnDay:   window gate + recurrence match for one day
 * - isActiveInMonth: any active day within a month (delegates to isActiveOnDay)
 */

import { getMonthRange } from "@/entities/activity/lib/month/parse-month";
import { matchesRecurrence } from "@/entities/activity/lib/schedule/matches-recurrence";
import type { Activity } from "@/entities/activity/model/types";

/**
 * Whether a day falls inside the activity's inclusive `startsAt`/`endsAt`
 * window. Open ends (`null`) do not constrain that side.
 *
 * Does **not** check recurrence — Progress period-goal membership uses this
 * (and {@link overlapsValidityWindow}) without `isActiveOnDay`.
 *
 * @param activity - activity definition
 * @param isoDate - day as `YYYY-MM-DD`
 */
export function isWithinValidityWindow(
  activity: Pick<Activity, "startsAt" | "endsAt">,
  isoDate: string,
): boolean {
  if (activity.startsAt && isoDate < activity.startsAt) {
    return false;
  }

  if (activity.endsAt && isoDate > activity.endsAt) {
    return false;
  }

  return true;
}

/**
 * Whether the selected month overlaps the activity's validity window.
 *
 * Used by Progress period-goal card membership so a July-start task does not
 * appear on June (and an ended task does not appear after `endsAt`).
 *
 * @param activity - activity definition
 * @param month - `YYYY-MM` month key
 */
export function overlapsValidityWindow(
  activity: Pick<Activity, "startsAt" | "endsAt">,
  month: string,
): boolean {
  const { year, monthNumber, daysInMonth } = getMonthRange(month);
  const paddedMonth = String(monthNumber).padStart(2, "0");
  const monthStart = `${year}-${paddedMonth}-01`;
  const monthEnd = `${year}-${paddedMonth}-${String(daysInMonth).padStart(2, "0")}`;

  if (activity.startsAt && monthEnd < activity.startsAt) {
    return false;
  }

  if (activity.endsAt && monthStart > activity.endsAt) {
    return false;
  }

  return true;
}

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
  if (!isWithinValidityWindow(activity, isoDate)) {
    return false;
  }

  return matchesRecurrence(
    isoDate,
    activity.scheduleType,
    activity.scheduleConfig,
  );
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
