/**
 * @file entities/note/repository/get-general-notes.ts
 * Fetches all general notes (`date IS NULL AND is_quick = false`).
 */

import type { Note, NoteRow } from "@/entities/note/model/types";
import { mapNoteRow } from "@/entities/note/transform";
import { NOTES_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Fetches all general notes (`date IS NULL AND is_quick = false`).
 *
 * @returns general notes ordered by most recently edited
 */
export async function getGeneralNotes(userId: string): Promise<Note[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .select("*")
    .eq("user_id", userId)
    .is("date", null)
    .eq("is_quick", false)
    .order("last_edited_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch general notes: ${error.message}`);
  }

  return (data as NoteRow[] | null)?.map(mapNoteRow) ?? [];
}
