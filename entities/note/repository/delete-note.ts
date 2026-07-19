/**
 * @file entities/note/repository/delete-note.ts
 * Deletes one note row owned by the current user (RLS).
 */

import { NOTES_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Deletes one note row owned by the current user (RLS).
 *
 * @param id - note row id
 * @returns whether a row was removed
 */
export async function deleteNoteById(
  userId: string,
  id: string,
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to delete note: ${error.message}`);
  }

  return Boolean(data);
}
