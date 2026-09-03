/**
 * @file entities/note/repository/get-starred-notes-for-home-strip.ts
 * Fetches starred notes for one Home strip (Diary includes starred calendar notes).
 */

import type { NoteCategory } from "@/entities/note/category/model/types";
import type { Note, NoteRow } from "@/entities/note/model/types";
import { mapNoteRow } from "@/entities/note/transform";
import { NOTES_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Returns starred notes for a Home strip.
 * Diary: undated starred in category OR starred calendar notes.
 * Other categories: undated starred in category only.
 */
export async function getStarredNotesForHomeStrip(
  userId: string,
  category: NoteCategory,
  limit = 20,
): Promise<Note[]> {
  const supabase = await createClient();

  let query = supabase
    .from(NOTES_TABLE)
    .select("*")
    .eq("user_id", userId)
    .eq("starred", true)
    .eq("is_quick", false)
    .order("last_edited_at", { ascending: false })
    .limit(limit);

  if (category.isDefault) {
    query = query.or(
      `and(category_id.eq.${category.id},date.is.null),date.not.is.null`,
    );
  } else {
    query = query
      .eq("category_id", category.id)
      .is("date", null);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(
      `Failed to fetch starred notes for home strip: ${error.message}`,
    );
  }

  return (data as NoteRow[] | null)?.map(mapNoteRow) ?? [];
}
