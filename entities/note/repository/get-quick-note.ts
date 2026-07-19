/**
 * @file entities/note/repository/get-quick-note.ts
 * Fetches the user's quick note (`date IS NULL AND is_quick = true`).
 */

import type { Note, NoteRow } from "@/entities/note/model/types";
import { mapNoteRow } from "@/entities/note/transform";
import { NOTES_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Fetches the user's quick note (`date IS NULL AND is_quick = true`).
 *
 * @returns quick note row, or `null` when the slot is empty
 */
export async function getQuickNote(userId: string): Promise<Note | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .select("*")
    .eq("user_id", userId)
    .is("date", null)
    .eq("is_quick", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch quick note: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapNoteRow(data as NoteRow);
}
