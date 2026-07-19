/**
 * @file entities/note/repository/get-starred-notes.ts
 * Fetches starred notes for the home carousel.
 */

import type { Note, NoteRow } from "@/entities/note/model/types";
import { mapNoteRow } from "@/entities/note/transform";
import { NOTES_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Fetches starred notes for the home carousel (`starred = true`, `is_quick = false`).
 *
 * @param limit - max rows to return (default 20)
 * @returns starred notes ordered by most recently edited
 */
export async function getStarredNotes(
  userId: string,
  limit = 20,
): Promise<Note[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .select("*")
    .eq("user_id", userId)
    .eq("starred", true)
    .eq("is_quick", false)
    .order("last_edited_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch starred notes: ${error.message}`);
  }

  return (data as NoteRow[] | null)?.map(mapNoteRow) ?? [];
}
