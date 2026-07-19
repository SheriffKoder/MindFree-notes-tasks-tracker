/**
 * @file entities/note/index.ts
 * Shared domain exports — types and pure helpers only.
 *
 * Server reads: `entities/note/server`
 * Client cache: `entities/note/client`
 */

export {
  getCurrentMonth,
  getMonthRange,
  parseMonthParam,
} from "@/entities/note/lib/parse-month";
export type { MonthRange } from "@/entities/note/lib/parse-month";
export type { Note } from "@/entities/note/model/types";
export type {
  CalendarDay,
  CalendarNotesResponse,
  GeneralNotesResponse,
} from "@/entities/note/model/read-models";
