/**
 * @file entities/note/transform/aggregate-month-notes.ts
 * Server-side calendar aggregation for a single month.
 */

import { getMonthRange } from "@/entities/note/lib/parse-month";
import type {
  CalendarDay,
  CalendarNotesResponse,
  Note,
} from "@/entities/note/model/types";

/**
 * Builds one `CalendarDay` entry per day in the month.
 *
 * @param month - `YYYY-MM` month key
 * @param notes - calendar notes already filtered to the month
 * @returns ordered calendar days with note or `null`
 */
export function aggregateMonthNotes(month: string, notes: Note[]): CalendarDay[] {
  const { year, monthNumber, daysInMonth } = getMonthRange(month);
  const notesByDate = new Map(
    notes
      .filter((note) => note.date !== null)
      .map((note) => [note.date as string, note]),
  );

  const calendarDays: CalendarDay[] = [];

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${year}-${String(monthNumber).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    calendarDays.push({
      day,
      date,
      note: notesByDate.get(date) ?? null,
    });
  }

  return calendarDays;
}

/**
 * Builds the full calendar API response for a month.
 *
 * @param month - `YYYY-MM` month key
 * @param notes - calendar notes already filtered to the month
 * @returns aggregated calendar payload
 */
export function buildCalendarNotesResponse(
  month: string,
  notes: Note[],
): CalendarNotesResponse {
  const calendarDays = aggregateMonthNotes(month, notes);
  const monthNotes = [...notes].sort((left, right) => {
    if (!left.date || !right.date) {
      return 0;
    }

    return left.date.localeCompare(right.date);
  });

  return {
    month,
    calendarDays,
    monthNotes,
  };
}
