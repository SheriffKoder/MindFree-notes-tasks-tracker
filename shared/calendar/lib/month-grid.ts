/**
 * @file shared/calendar/lib/month-grid.ts
 * Pure helpers for building a 6×7 ISO week month grid.
 */

import type { CalendarGridCell, InMonthDay } from "@/shared/calendar/model/types";

const MONTH_KEY_PATTERN = /^\d{4}-\d{2}$/;
const GRID_CELL_COUNT = 42;

export const WEEKDAY_LABELS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;

interface MonthParts {
  year: number;
  monthNumber: number;
  daysInMonth: number;
}

function parseMonthKey(month: string): MonthParts {
  if (!MONTH_KEY_PATTERN.test(month)) {
    throw new Error(`Invalid month key: ${month}`);
  }

  const [yearPart, monthPart] = month.split("-");
  const year = Number(yearPart);
  const monthNumber = Number(monthPart);
  const daysInMonth = new Date(year, monthNumber, 0).getDate();

  return { year, monthNumber, daysInMonth };
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/** Monday = 0 … Sunday = 6. */
function getIsoWeekday(date: Date): number {
  const weekday = date.getDay();

  return weekday === 0 ? 6 : weekday - 1;
}

/**
 * Formats a month key for screen-reader labels (e.g. `July 2026`).
 *
 * @param month - `YYYY-MM` month key
 * @returns human-readable month label
 */
export function formatMonthAriaLabel(month: string): string {
  const { year, monthNumber } = parseMonthKey(month);
  const date = new Date(year, monthNumber - 1, 1);

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Formats an ISO date for cell `aria-label` text.
 *
 * @param isoDate - `YYYY-MM-DD`
 * @returns long date label
 */
export function formatDayAriaLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/**
 * Builds a fixed 6×7 grid (42 cells) for a month, Mon–Sun columns.
 *
 * @param month - `YYYY-MM` month key
 * @param calendarDays - in-month day entries from the caller
 * @returns row-major grid cells with leading/trailing padding
 */
export function buildMonthGrid<TDay extends InMonthDay>(
  month: string,
  calendarDays: TDay[],
): CalendarGridCell<TDay>[] {
  const { year, monthNumber } = parseMonthKey(month);
  const daysByDate = new Map(calendarDays.map((day) => [day.date, day]));

  const firstOfMonth = new Date(year, monthNumber - 1, 1);
  const leadingPadding = getIsoWeekday(firstOfMonth);
  const gridStart = new Date(year, monthNumber - 1, 1 - leadingPadding);

  const cells: CalendarGridCell<TDay>[] = [];

  for (let index = 0; index < GRID_CELL_COUNT; index += 1) {
    const current = new Date(gridStart);
    current.setDate(gridStart.getDate() + index);

    const date = toIsoDate(current);
    const isInMonth =
      current.getFullYear() === year && current.getMonth() === monthNumber - 1;

    if (isInMonth) {
      const day = daysByDate.get(date) ?? ({
        day: current.getDate(),
        date,
      } as TDay);

      cells.push({ kind: "in-month", day });
      continue;
    }

    cells.push({
      kind: "padding",
      day: current.getDate(),
      date,
    });
  }

  return cells;
}
