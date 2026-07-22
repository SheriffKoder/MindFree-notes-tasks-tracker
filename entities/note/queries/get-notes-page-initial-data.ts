/**
 * @file entities/note/queries/get-notes-page-initial-data.ts
 * Read use-case: SSR initial payloads for the Notes page.
 */

import { parseMonthParam, type ParseMonthParamOptions } from "@/entities/note/lib/parse-month";
import type {
  CalendarNotesResponse,
  GeneralNotesResponse,
} from "@/entities/note/model/read-models";
import { getCalendarNotesResponse } from "@/entities/note/queries/get-calendar-notes-response";
import { getGeneralNotesResponse } from "@/entities/note/queries/get-general-notes-response";

/**
 * Initial data loaded by the Notes server page.
 */
export interface NotesPageInitialData {
  /** Resolved month key (`YYYY-MM`). */
  month: string;
  /** Calendar notes aggregated for the month. */
  calendarNotes: CalendarNotesResponse;
  /** All general notes (month-independent). */
  generalNotes: GeneralNotesResponse;
}

/**
 * Fetches calendar and general note payloads in parallel for SSR.
 *
 * @param monthParam - raw `month` search param (defaults to current month)
 * @param parseOptions - optional demo-session flags for fallback resolution
 * @returns both initial payloads for hydration
 */
export async function getNotesPageInitialData(
  userId: string,
  monthParam: string | null | undefined,
  parseOptions: ParseMonthParamOptions = {},
): Promise<NotesPageInitialData> {
  const month = parseMonthParam(monthParam, parseOptions);

  const [calendarNotes, generalNotes] = await Promise.all([
    getCalendarNotesResponse(userId, month),
    getGeneralNotesResponse(userId),
  ]);

  return {
    month,
    calendarNotes,
    generalNotes,
  };
}
