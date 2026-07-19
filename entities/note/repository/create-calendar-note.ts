/**
 * @file entities/note/repository/create-calendar-note.ts
 * Inserts a calendar note for one day (`date IS NOT NULL`, `is_quick = false`).
 */

import type { Note, NoteRow } from "@/entities/note/model/types";
import type { CreateCalendarNoteBody } from "@/entities/note/schema";
import { mapNoteRow } from "@/entities/note/transform";
import { NOTES_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Inserts a calendar note for one day (`date IS NOT NULL`, `is_quick = false`).
 *
 * @param userId - authenticated user id
 * @param payload - dated note fields
 * @returns created note, or `null` when the day is already taken
 */
export async function createCalendarNote(
  userId: string,
  payload: CreateCalendarNoteBody,
): Promise<Note | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .insert({
      user_id: userId,
      date: payload.date,
      title: payload.title,
      content: payload.content,
      starred: payload.starred,
      is_important: payload.isImportant,
      is_quick: false,
    })
    .select("*")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      return null;
    }

    throw new Error(`Failed to create calendar note: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapNoteRow(data as NoteRow);
}
