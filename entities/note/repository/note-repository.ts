/**
 * @file entities/note/repository/note-repository.ts
 * Supabase data access for notes (scoped by RLS to the authenticated user).
 */

import { mapNoteRow } from "@/entities/note/lib/map-note-row";
import { getMonthRange } from "@/entities/note/lib/parse-month";
import type { CreateCalendarNoteBody } from "@/entities/note/mutations/create-note.schema";
import type { CreateGeneralNoteBody } from "@/entities/note/mutations/create-note.schema";
import type { UpdateNoteBody } from "@/entities/note/mutations/update-note.schema";
import type { Note, NoteRow } from "@/entities/note/model/types";
import { NOTES_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Resolves the authenticated user id required by RLS on insert (`auth.uid() = user_id`).
 *
 * @returns current user id from the request session
 * @throws when unauthenticated
 */
async function getAuthenticatedUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user.id;
}

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

/**
 * Inserts a calendar note for one day (`date IS NOT NULL`, `is_quick = false`).
 *
 * @param payload - dated note fields
 * @returns created note, or `null` when the day is already taken
 */
export async function createCalendarNote(
  payload: CreateCalendarNoteBody,
): Promise<Note | null> {
  const userId = await getAuthenticatedUserId();
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

/**
 * Inserts a general note (`date IS NULL`, `is_quick = false`).
 *
 * @param payload - general note fields
 * @returns created note
 */
export async function createGeneralNote(
  payload: CreateGeneralNoteBody,
): Promise<Note> {
  const userId = await getAuthenticatedUserId();
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
 * Deletes one note row owned by the current user (RLS).
 *
 * @param id - note row id
 * @returns whether a row was removed
 */
export async function deleteNoteById(id: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to delete note: ${error.message}`);
  }

  return Boolean(data);
}
