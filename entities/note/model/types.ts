/**
 * @file entities/note/model/types.ts
 * Domain and database-row types for notes.
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
