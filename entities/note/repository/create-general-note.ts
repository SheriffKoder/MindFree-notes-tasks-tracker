/**
 * @file entities/note/repository/create-general-note.ts
 * Inserts general and quick notes (`date IS NULL`).
 */

import type { Note, NoteRow } from "@/entities/note/model/types";
import type { CreateGeneralNoteBody } from "@/entities/note/schema";
import { mapNoteRow } from "@/entities/note/transform";
import { NOTES_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Inserts a general note (`date IS NULL`, `is_quick = false`).
 *
 * @param payload - general note fields
 * @returns created note
 */
export async function createGeneralNote(
  userId: string,
  payload: CreateGeneralNoteBody,
): Promise<Note> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .insert({
      user_id: userId,
      date: null,
      title: payload.title,
      content: payload.content,
      starred: payload.starred,
      is_important: payload.isImportant,
      is_quick: false,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create general note: ${error.message}`);
  }

  return mapNoteRow(data as NoteRow);
}

/**
 * Inserts a quick note (`date IS NULL`, `is_quick = true`).
 *
 * @param payload - quick note fields
 * @returns created note
 */
export async function createQuickNote(
  userId: string,
  payload: CreateGeneralNoteBody,
): Promise<Note> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .insert({
      user_id: userId,
      date: null,
      title: "",
      content: payload.content,
      starred: payload.starred,
      is_important: payload.isImportant,
      is_quick: true,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create quick note: ${error.message}`);
  }

  return mapNoteRow(data as NoteRow);
}
