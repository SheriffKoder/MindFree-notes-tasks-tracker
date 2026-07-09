/**
 * @file entities/note/model/types.ts
 * Domain and API response types for notes.
 */

/**
 * Note shape returned by the API and used across the Notes page.
 */
export interface Note {
  /** Row id. */
  id: string;
  /** ISO date (`YYYY-MM-DD`) for calendar notes; `null` for general/quick. */
  date: string | null;
  /** Note title. */
  title: string;
  /** Note body. */
  content: string;
  /** Home starred carousel flag. */
  starred: boolean;
  /** Calendar cell dark-red border flag. */
  isImportant: boolean;
  /** Home quick-note slot flag (excluded from Notes page lists). */
  isQuick: boolean;
  /** Last edit timestamp (ISO). */
  lastEditedAt: string;
}

/**
 * One day in a prepared month calendar grid.
 */
export interface CalendarDay {
  /** Day of month (1–31). */
  day: number;
  /** ISO date (`YYYY-MM-DD`). */
  date: string;
  /** Calendar note for the day, or `null` when empty. */
  note: Note | null;
}

/**
 * Aggregated calendar payload for a single month.
 */
export interface CalendarNotesResponse {
  /** Month key (`YYYY-MM`). */
  month: string;
  /** One entry per day in the month. */
  calendarDays: CalendarDay[];
  /** Flat list of calendar notes in the month (list view). */
  monthNotes: Note[];
}

/**
 * All general notes for the authenticated user (month-independent).
 */
export interface GeneralNotesResponse {
  /** Notes where `date IS NULL` and `is_quick = false`. */
  generalNotes: Note[];
}

/**
 * Supabase row shape for `mf_notes` before domain mapping.
 */
export interface NoteRow {
  id: string;
  user_id: string;
  date: string | null;
  title: string;
  content: string;
  starred: boolean;
  is_important: boolean;
  is_quick: boolean;
  last_edited_at: string;
  created_at: string;
}
