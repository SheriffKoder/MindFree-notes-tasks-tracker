/**
 * @file entities/note/queries/get-notes-page-initial-data.ts
 * Read use-case: SSR initial payloads for the Notes page.
 */

import type { NoteCategory } from "@/entities/note/category/model/types";
import { getCategories } from "@/entities/note/category/repository";
import { ensureDefaultCategory } from "@/entities/note/category/repository";
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
  /** Active note categories for the user. */
  categories: NoteCategory[];
  /** Undated lists — one payload per active category. */
  generalByCategory: GeneralNotesResponse[];
}

/**
 * Fetches calendar, categories, and per-category undated lists for SSR.
 */
export async function getNotesPageInitialData(
  userId: string,
  monthParam: string | null | undefined,
  parseOptions: ParseMonthParamOptions = {},
): Promise<NotesPageInitialData> {
  const month = parseMonthParam(monthParam, parseOptions);

  await ensureDefaultCategory(userId);
  const categories = await getCategories(userId);

  const [calendarNotes, ...generalByCategory] = await Promise.all([
    getCalendarNotesResponse(userId, month),
    ...categories.map((category) =>
      getGeneralNotesResponse(userId, category.id),
    ),
  ]);

  return {
    month,
    calendarNotes,
    categories,
    generalByCategory,
  };
}
