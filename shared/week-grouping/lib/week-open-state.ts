/**
 * @file shared/week-grouping/lib/week-open-state.ts
 * Helpers for resolving week section open state.
 */

import { getTodayIsoDate } from "@/shared/calendar/lib/today";

/**
 * Returns whether an ISO date falls within an inclusive ISO date range.
 */
export function isIsoDateInRange(
  date: string,
  rangeStart: string,
  rangeEnd: string,
): boolean {
  return date >= rangeStart && date <= rangeEnd;
}

/**
 * Returns whether a week range contains today in local time.
 */
export function isCurrentWeekRange(
  rangeStart: string,
  rangeEnd: string,
  todayIso = getTodayIsoDate(),
): boolean {
  return isIsoDateInRange(todayIso, rangeStart, rangeEnd);
}

/**
 * Resolves the initial open state for a week section.
 */
export function resolveWeekSectionOpen(
  defaultOpen: boolean | "current-week" | undefined,
  rangeStart: string,
  rangeEnd: string,
): boolean {
  if (defaultOpen === "current-week") {
    return isCurrentWeekRange(rangeStart, rangeEnd);
  }

  return defaultOpen ?? true;
}
