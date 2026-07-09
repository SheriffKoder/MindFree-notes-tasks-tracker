/**
 * @file entities/note/queries/get-calendar-notes-response.ts
 * Read use-case: calendar notes aggregated for one month.
 */

import { parseMonthParam } from "@/entities/note/lib/parse-month";
import type { CalendarNotesResponse } from "@/entities/note/model/types";
import { getCalendarNotesForMonth } from "@/entities/note/repository/note-repository";
import { buildCalendarNotesResponse } from "@/entities/note/transform/aggregate-month-notes";

/**
 * Fetches and aggregates calendar notes for a month.
 *
 * Used by `GET /api/notes/calendar` and any server code that needs the same payload.
 *
 * @param monthParam - raw `month` query param (defaults to current month)
 * @returns aggregated calendar response
 */
export async function getCalendarNotesResponse(
  monthParam: string | null | undefined,
): Promise<CalendarNotesResponse> {
  const month = parseMonthParam(monthParam);
  const notes = await getCalendarNotesForMonth(month);

  return buildCalendarNotesResponse(month, notes);
}
