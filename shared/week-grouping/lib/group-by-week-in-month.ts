/**
 * @file shared/week-grouping/lib/group-by-week-in-month.ts
 * Groups dated list items into calendar weeks within a month.
 */

import {
  getWeeksInMonth,
  type WeekInMonthRange,
} from "@/shared/week-grouping/lib/get-weeks-in-month";

const MONTH_KEY_PATTERN = /^\d{4}-\d{2}$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * One week bucket inside a month list.
 */
export interface WeekInMonthGroup<T> {
  /** 1-based week index (`W1`, `W2`, …) within the month. */
  weekNumber: number;
  /** Inclusive ISO start, clipped to the month. */
  rangeStart: string;
  /** Inclusive ISO end, clipped to the month. */
  rangeEnd: string;
  /** Items whose date falls in this week. */
  items: T[];
}

/**
 * Result of grouping list items by week in a month.
 */
export interface GroupByWeekInMonthResult<T> {
  /** Weeks in chronological order (may include empty weeks when requested). */
  weeks: WeekInMonthGroup<T>[];
  /** Items without a valid in-month date (rendered without a week header). */
  ungrouped: T[];
}

export interface GroupByWeekInMonthOptions {
  /** When `true`, emits every week overlapping the month, not only weeks with items. */
  includeEmptyWeeks?: boolean;
}

function sortItemsByDate<T>(
  items: T[],
  getDate: (item: T) => string | null | undefined,
): T[] {
  return [...items].sort((left, right) => {
    const leftDate = getDate(left) ?? "";
    const rightDate = getDate(right) ?? "";

    return leftDate.localeCompare(rightDate);
  });
}

function findWeekRange(
  weeks: WeekInMonthRange[],
  dateValue: string,
): WeekInMonthRange | undefined {
  return weeks.find(
    (week) => dateValue >= week.rangeStart && dateValue <= week.rangeEnd,
  );
}

/**
 * Reads an ISO date string from an item using a property key.
 *
 * @param item - list row
 * @param dateKey - property name holding `YYYY-MM-DD` (e.g. `"date"`)
 * @returns ISO date, `null`, or `undefined` when missing/invalid type
 *
 * @example
 * ```ts
 * resolveItemDateByKey({ date: "2026-07-09" }, "date");
 * // => "2026-07-09"
 * ```
 */
export function resolveItemDateByKey<T>(
  item: T,
  dateKey: string,
): string | null | undefined {
  const value = (item as Record<string, unknown>)[dateKey];

  if (typeof value === "string") {
    return value;
  }

  if (value === null) {
    return null;
  }

  return undefined;
}

/**
 * Groups items by ISO calendar week (Monday–Sunday) within a month.
 *
 * @param items - list rows to group
 * @param month - month key (`YYYY-MM`)
 * @param dateKey - item property holding the ISO date (`YYYY-MM-DD`)
 * @returns week buckets plus any ungrouped rows
 */
export function groupItemsByWeekInMonth<T>(
  items: T[],
  month: string,
  dateKey: string,
  options: GroupByWeekInMonthOptions = {},
): GroupByWeekInMonthResult<T> {
  const { includeEmptyWeeks = false } = options;
  if (!MONTH_KEY_PATTERN.test(month)) {
    return { weeks: [], ungrouped: items };
  }

  const getDate = (item: T) => resolveItemDateByKey(item, dateKey);
  const weekRanges = getWeeksInMonth(month);
  const itemsByWeekNumber = new Map<number, T[]>();
  const ungrouped: T[] = [];

  for (const item of items) {
    const dateValue = getDate(item);

    if (!dateValue || !ISO_DATE_PATTERN.test(dateValue)) {
      ungrouped.push(item);
      continue;
    }

    const week = findWeekRange(weekRanges, dateValue);

    if (!week) {
      ungrouped.push(item);
      continue;
    }

    const bucket = itemsByWeekNumber.get(week.weekNumber);

    if (bucket) {
      bucket.push(item);
    } else {
      itemsByWeekNumber.set(week.weekNumber, [item]);
    }
  }

  const weeks = (
    includeEmptyWeeks
      ? weekRanges
      : weekRanges.filter((week) => itemsByWeekNumber.has(week.weekNumber))
  ).map((week, index) => ({
    weekNumber: includeEmptyWeeks ? week.weekNumber : index + 1,
    rangeStart: week.rangeStart,
    rangeEnd: week.rangeEnd,
    items: sortItemsByDate(itemsByWeekNumber.get(week.weekNumber) ?? [], getDate),
  }));

  return { weeks, ungrouped };
}
