/**
 * @file entities/note/queries/get-notes-page-initial-data.ts
 * Read use-case: SSR initial payloads for the Notes page.
 */

import { parseMonthParam } from "@/entities/note/lib/parse-month";
import type {
  CalendarNotesResponse,
  GeneralNotesResponse,
} from "@/entities/note/model/types";
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
 * @returns both initial payloads for hydration
 */
export async function getNotesPageInitialData(
  monthParam: string | null | undefined,
): Promise<NotesPageInitialData> {
  const month = parseMonthParam(monthParam);

  const [calendarNotes, generalNotes] = await Promise.all([
    getCalendarNotesResponse(month),
    getGeneralNotesResponse(),
  ]);

  return {
    month,
    calendarNotes,
    generalNotes,
  };
}
