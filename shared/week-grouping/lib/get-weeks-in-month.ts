/**
 * @file shared/week-grouping/lib/get-weeks-in-month.ts
 * Builds every ISO calendar week range that overlaps a month.
 *
 * Purpose: Single source of truth for clipped Monday–Sunday week ranges inside
 *          a month, including empty weeks so consumers emit stable `W1`…`Wn`
 *          columns.
 * Used in: `entities/activity/lib/progress/build-task-progress.ts` (Progress
 *          weekly rollups), `shared/week-grouping/lib/group-by-week-in-month.ts`
 *          (notes week grouping).
 * Used for: Bucketing Progress records into weeks and grouping dated note lists.
 *
 * Function index:
 * - getWeeksInMonth: `YYYY-MM` → `WeekInMonthRange[]`
 */

const MONTH_KEY_PATTERN = /^\d{4}-\d{2}$/;

/**
 * One clipped ISO week range inside a month.
 */
export interface WeekInMonthRange {
  /** 1-based week index (`W1`, `W2`, …) within the month. */
  weekNumber: number;
  /** Inclusive ISO start, clipped to the month. */
  rangeStart: string;
  /** Inclusive ISO end, clipped to the month. */
  rangeEnd: string;
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
 * Returns every Monday–Sunday week overlapping `month`, clipped to month bounds.
 *
 * @param month - month key (`YYYY-MM`)
 * @returns chronological week ranges (`W1`…`Wn`), or `[]` for invalid keys
 *
 * @example
 * ```ts
 * getWeeksInMonth("2026-06");
 * // => [
 * //   { weekNumber: 1, rangeStart: "2026-06-01", rangeEnd: "2026-06-07" },
 * //   …
 * // ]
 * ```
 */
export function getWeeksInMonth(month: string): WeekInMonthRange[] {
  if (!MONTH_KEY_PATTERN.test(month)) {
    return [];
  }

  const { start: monthStart, end: monthEnd } = getMonthBounds(month);
  const weeks: WeekInMonthRange[] = [];
  let monday = getIsoWeekMonday(monthStart);

  while (monday <= monthEnd) {
    const sunday = getIsoWeekSunday(monday);

    weeks.push({
      weekNumber: weeks.length + 1,
      rangeStart: toIsoDate(clipDate(monday, monthStart, monthEnd)),
      rangeEnd: toIsoDate(clipDate(sunday, monthStart, monthEnd)),
    });

    monday = new Date(monday);
    monday.setDate(monday.getDate() + 7);
  }

  return weeks;
}
