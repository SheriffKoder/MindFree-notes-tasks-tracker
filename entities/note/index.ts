/**
 * @file entities/note/index.ts
 * Public exports for the note entity.
 */

export {
  getCalendarNotesResponse,
} from "@/entities/note/queries/get-calendar-notes-response";
export {
  getGeneralNotesResponse,
} from "@/entities/note/queries/get-general-notes-response";
export {
  getNotesPageInitialData,
} from "@/entities/note/queries/get-notes-page-initial-data";
export type { NotesPageInitialData } from "@/entities/note/queries/get-notes-page-initial-data";
export {
  getCurrentMonth,
  getMonthRange,
  parseMonthParam,
} from "@/entities/note/lib/parse-month";
export type { MonthRange } from "@/entities/note/lib/parse-month";
export type {
  CalendarDay,
  CalendarNotesResponse,
  GeneralNotesResponse,
  Note,
} from "@/entities/note/model/types";
