/**
 * @file entities/note/model/read-models.ts
 * Prepared note payloads returned by page and dashboard read use-cases.
 */

import type { Note } from "@/entities/note/model/types";

/** One day in a prepared month calendar grid. */
export interface CalendarDay {
  /** Day of month (1–31). */
  day: number;
  /** ISO date (`YYYY-MM-DD`). */
  date: string;
  /** Calendar note for the day, or `null` when empty. */
  note: Note | null;
}

/** Aggregated calendar payload for a single month. */
export interface CalendarNotesResponse {
  /** Month key (`YYYY-MM`). */
  month: string;
  /** One entry per day in the month. */
  calendarDays: CalendarDay[];
  /** Flat list of calendar notes in the month (list view). */
  monthNotes: Note[];
}

/** Undated non-quick notes for one category. */
export interface GeneralNotesResponse {
  categoryId: string;
  /** Notes where `date IS NULL` and `is_quick = false`. */
  generalNotes: Note[];
}

/** One Home strip — quick slot + starred for a showOnHome category. */
export interface HomeNotesStrip {
  categoryId: string;
  /** Denormalized for UI; also available from categories query. */
  categoryName: string;
  /** Seeded Diary strip — receives starred calendar notes. */
  isDefault: boolean;
  quickNote: Note | null;
  starredNotes: Note[];
}

export interface HomeNotesResponse {
  strips: HomeNotesStrip[];
}
