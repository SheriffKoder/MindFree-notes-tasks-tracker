/**
 * @file entities/note/repository/note-repository.ts
 * Supabase data access for notes (scoped by RLS to the authenticated user).
 */

import { mapNoteRow } from "@/entities/note/lib/map-note-row";
import { getMonthRange } from "@/entities/note/lib/parse-month";
import type { UpdateNoteBody } from "@/entities/note/mutations/update-note.schema";
import type { Note, NoteRow } from "@/entities/note/model/types";
import { NOTES_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Fetches calendar notes for the given month (`date IS NOT NULL`).
 *
 * @param month - `YYYY-MM` month key
 * @returns calendar notes in the month, ordered by date ascending
 */
export async function getCalendarNotesForMonth(month: string): Promise<Note[]> {
  const { monthStart, monthEnd } = getMonthRange(month);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .select("*")
    .gte("date", monthStart)
    .lt("date", monthEnd)
    .not("date", "is", null)
    .order("date", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch calendar notes: ${error.message}`);
  }

  return (data as NoteRow[] | null)?.map(mapNoteRow) ?? [];
}

/**
 * Fetches all general notes (`date IS NULL AND is_quick = false`).
 *
 * @returns general notes ordered by most recently edited
 */
export async function getGeneralNotes(): Promise<Note[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .select("*")
    .is("date", null)
    .eq("is_quick", false)
    .order("last_edited_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch general notes: ${error.message}`);
  }

  return (data as NoteRow[] | null)?.map(mapNoteRow) ?? [];
}

/**
 * Applies a partial update to one note row owned by the current user (RLS).
 *
 * @param id - note row id
 * @param patch - editable fields to merge
 * @returns updated note, or `null` when no row matches
 */
export async function updateNoteById(
  id: string,
  patch: UpdateNoteBody,
): Promise<Note | null> {
  const supabase = await createClient();

  const dbPatch: Partial<
    Pick<NoteRow, "title" | "content" | "starred" | "is_important">
  > = {};

  if (patch.title !== undefined) {
    dbPatch.title = patch.title;
  }

  if (patch.content !== undefined) {
    dbPatch.content = patch.content;
  }

  if (patch.starred !== undefined) {
    dbPatch.starred = patch.starred;
  }

  if (patch.isImportant !== undefined) {
    dbPatch.is_important = patch.isImportant;
  }

  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .update(dbPatch)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update note: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapNoteRow(data as NoteRow);
}
