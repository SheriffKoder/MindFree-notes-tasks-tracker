/**
 * @file entities/note/repository/get-all-notes.ts
 * Fetches every note row for a user (calendar, general, and quick).
 */

import type { Note, NoteRow } from "@/entities/note/model/types";
import { mapNoteRow } from "@/entities/note/transform";
import { NOTES_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Fetches all notes owned by the user, newest edit first.
 */
export async function getAllNotes(userId: string): Promise<Note[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("last_edited_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch notes for export: ${error.message}`);
  }

  return (data as NoteRow[] | null)?.map(mapNoteRow) ?? [];
}
