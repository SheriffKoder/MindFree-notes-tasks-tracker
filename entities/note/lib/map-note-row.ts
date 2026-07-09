/**
 * @file entities/note/lib/map-note-row.ts
 * Maps Supabase note rows to domain `Note` objects.
 */

import type { Note, NoteRow } from "@/entities/note/model/types";

/**
 * Maps a Supabase note row to the domain `Note` type.
 *
 * @param row - raw database row
 * @returns domain note
 */
export function mapNoteRow(row: NoteRow): Note {
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    content: row.content,
    starred: row.starred,
    isImportant: row.is_important,
    isQuick: row.is_quick,
    lastEditedAt: row.last_edited_at,
  };
}
