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

/** All general notes for the authenticated user. */
export interface GeneralNotesResponse {
  /** Notes where `date IS NULL` and `is_quick = false`. */
  generalNotes: Note[];
}

/** Home dashboard payload — quick-note slot plus starred carousel. */
export interface HomeNotesResponse {
  /** Single quick note, or `null` before lazy creation. */
  quickNote: Note | null;
  /** Starred non-quick notes, most recently edited first. */
  starredNotes: Note[];
}
