/**
 * @file entities/note/repository/get-starred-notes.ts
 * Fetches starred undated notes for one category.
 */

import type { Note, NoteRow } from "@/entities/note/model/types";
import { mapNoteRow } from "@/entities/note/transform";
import { NOTES_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Fetches starred undated notes for one category (`starred = true`, `is_quick = false`).
 */
export async function getStarredNotes(
  userId: string,
  categoryId: string,
  limit = 20,
): Promise<Note[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .select("*")
    .eq("user_id", userId)
    .eq("category_id", categoryId)
    .eq("starred", true)
    .eq("is_quick", false)
    .is("date", null)
    .order("last_edited_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch starred notes: ${error.message}`);
  }

  return (data as NoteRow[] | null)?.map(mapNoteRow) ?? [];
}
