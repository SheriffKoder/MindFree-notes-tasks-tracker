/**
 * @file entities/note/repository/note-repository.ts
 * Supabase data access for notes (scoped by RLS to the authenticated user).
 *
 * Purpose: Persistence layer for note reads and writes used by server use-cases.
 * Used in: entities/note/mutations/*, entities/note/queries/*, app/api/notes/*
 * Used for: CRUD, month queries, one-note-per-day lookup, and replace-on-date writes.
 *
 * Step 11 additions:
 * - findCalendarNoteByDate: locate occupant on an ISO day (optional exclude id)
 * - replaceNoteOnDate: delete occupant on target day, then patch the moving note
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
 * Fetches the user's quick note (`date IS NULL AND is_quick = true`).
 *
 * @returns quick note row, or `null` when the slot is empty
 */
export async function getQuickNote(): Promise<Note | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .select("*")
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

/**
 * Fetches starred notes for the home carousel (`starred = true`, `is_quick = false`).
 *
 * @param limit - max rows to return (default 20)
 * @returns starred notes ordered by most recently edited
 */
export async function getStarredNotes(limit = 20): Promise<Note[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .select("*")
    .eq("starred", true)
    .eq("is_quick", false)
    .order("last_edited_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch starred notes: ${error.message}`);
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
    Pick<NoteRow, "title" | "content" | "starred" | "is_important" | "date">
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

  if (patch.date !== undefined) {
    dbPatch.date = patch.date;
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
 * Finds the calendar note assigned to one day, optionally excluding one row.
 *
 * @param date - `YYYY-MM-DD`
 * @param excludeNoteId - row to ignore (e.g. the note being moved)
 * @returns conflicting note, if any
 */
export async function findCalendarNoteByDate(
  date: string,
  excludeNoteId?: string,
): Promise<Note | null> {
  const supabase = await createClient();

  let query = supabase
    .from(NOTES_TABLE)
    .select("*")
    .eq("date", date);

  if (excludeNoteId) {
    query = query.neq("id", excludeNoteId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(`Failed to find calendar note: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapNoteRow(data as NoteRow);
}

type NoteFieldPatch = Pick<
  UpdateNoteBody,
  "title" | "content" | "starred" | "isImportant" | "date"
>;

/**
 * Hard-deletes any other note on `date`, then updates the target row.
 *
 * @param targetId - note row being assigned to `date`
 * @param date - target calendar day
 * @param patch - editable fields including `date`
 * @returns updated note, or `null` when the target row is missing
 */
export async function replaceNoteOnDate(
  targetId: string,
  date: string,
  patch: NoteFieldPatch,
): Promise<Note | null> {
  const conflicting = await findCalendarNoteByDate(date, targetId);

  if (conflicting) {
    await deleteNoteById(conflicting.id);
  }

  return updateNoteById(targetId, { ...patch, date });
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
