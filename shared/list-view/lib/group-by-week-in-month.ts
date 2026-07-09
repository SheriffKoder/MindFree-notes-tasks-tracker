/**
 * @file shared/list-view/lib/group-by-week-in-month.ts
 * Groups dated list items into calendar weeks within a month.
 */

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
  /** Weeks that contain at least one item, in chronological order. */
  weeks: WeekInMonthGroup<T>[];
  /** Items without a valid in-month date (rendered without a week header). */
  ungrouped: T[];
}

function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthBounds(month: string): { start: Date; end: Date } {
  const [year, monthNumber] = month.split("-").map(Number);

  return {
    start: new Date(year, monthNumber - 1, 1),
    end: new Date(year, monthNumber, 0),
  };
}

function getIsoWeekMonday(date: Date): Date {
  const monday = new Date(date);
  const weekday = monday.getDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;

  monday.setDate(monday.getDate() + diff);

  return monday;
}

function getIsoWeekSunday(monday: Date): Date {
  const sunday = new Date(monday);

  sunday.setDate(sunday.getDate() + 6);

  return sunday;
}

function clipDate(date: Date, min: Date, max: Date): Date {
  if (date < min) {
    return min;
  }

  if (date > max) {
    return max;
  }

  return date;
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
): GroupByWeekInMonthResult<T> {
  if (!MONTH_KEY_PATTERN.test(month)) {
    return { weeks: [], ungrouped: items };
  }

  const getDate = (item: T) => resolveItemDateByKey(item, dateKey);
  const { start: monthStart, end: monthEnd } = getMonthBounds(month);
  const weekMap = new Map<string, { monday: Date; items: T[] }>();
  const ungrouped: T[] = [];

  for (const item of items) {
    const dateValue = getDate(item);

    if (!dateValue || !ISO_DATE_PATTERN.test(dateValue)) {
      ungrouped.push(item);
      continue;
    }

    const date = parseIsoDate(dateValue);

    if (date < monthStart || date > monthEnd) {
      ungrouped.push(item);
      continue;
    }

    const monday = getIsoWeekMonday(date);
    const weekKey = toIsoDate(monday);
    const bucket = weekMap.get(weekKey);

    if (bucket) {
      bucket.items.push(item);
    } else {
      weekMap.set(weekKey, { monday, items: [item] });
    }
  }

  const weeks = [...weekMap.entries()]
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([, { monday, items: weekItems }], index) => {
      const sunday = getIsoWeekSunday(monday);

      return {
        weekNumber: index + 1,
        rangeStart: toIsoDate(clipDate(monday, monthStart, monthEnd)),
        rangeEnd: toIsoDate(clipDate(sunday, monthStart, monthEnd)),
        items: [...weekItems].sort((left, right) => {
          const leftDate = getDate(left) ?? "";
          const rightDate = getDate(right) ?? "";

          return leftDate.localeCompare(rightDate);
        }),
      };
    });

  return { weeks, ungrouped };
}
