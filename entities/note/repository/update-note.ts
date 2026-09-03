/**
 * @file entities/note/repository/update-note.ts
 * Partial note updates, one-note-per-day lookup, and replace-on-date writes.
 */

import type { Note, NoteRow } from "@/entities/note/model/types";
import { deleteNoteById } from "@/entities/note/repository/delete-note";
import type { UpdateNoteBody } from "@/entities/note/schema";
import { mapNoteRow } from "@/entities/note/transform";
import { NOTES_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type NoteFieldPatch = Pick<
  UpdateNoteBody,
  "title" | "content" | "starred" | "isImportant" | "date" | "isQuick" | "categoryId"
>;

/**
 * Loads one note row owned by the current user (RLS), or `null` when missing.
 */
export async function findNoteById(
  userId: string,
  id: string,
): Promise<Note | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to find note: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapNoteRow(data as NoteRow);
}

/**
 * Applies a partial update to one note row owned by the current user (RLS).
 *
 * The update is gated on `expectedRevision` matching the row's current
 * `revision` so a stale client cannot silently overwrite a newer write.
 *
 * @param id - note row id
 * @param patch - editable fields to merge
 * @param expectedRevision - last server-confirmed revision the client based this write on
 * @returns updated note, or `null` when no row matches id+user+version
 */
export async function updateNoteById(
  userId: string,
  id: string,
  patch: NoteFieldPatch,
  expectedRevision: number,
): Promise<Note | null> {
  const supabase = await createClient();

  const dbPatch: Partial<
    Pick<
      NoteRow,
      | "title"
      | "content"
      | "starred"
      | "is_important"
      | "date"
      | "is_quick"
      | "category_id"
    >
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

  if (patch.isQuick !== undefined) {
    dbPatch.is_quick = patch.isQuick;
  }

  // Calendar notes never keep a category; undated notes persist the picker value
  if (patch.date) {
    dbPatch.category_id = null;
  } else if (patch.categoryId !== undefined) {
    dbPatch.category_id = patch.categoryId;
  }

  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .update(dbPatch)
    .eq("id", id)
    .eq("user_id", userId)
    .eq("revision", expectedRevision)
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
 * Finds the calendar note assigned to one day, optionally excluding one row.
 *
 * @param date - `YYYY-MM-DD`
 * @param excludeNoteId - row to ignore (e.g. the note being moved)
 * @returns conflicting note, if any
 */
export async function findCalendarNoteByDate(
  userId: string,
  date: string,
  excludeNoteId?: string,
): Promise<Note | null> {
  const supabase = await createClient();

  let query = supabase
    .from(NOTES_TABLE)
    .select("*")
    .eq("user_id", userId)
    .eq("date", date);

  if (excludeNoteId && UUID_PATTERN.test(excludeNoteId)) {
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

/**
 * Hard-deletes any other note on `date`, then updates the target row.
 *
 * @param targetId - note row being assigned to `date`
 * @param date - target calendar day
 * @param patch - editable fields including `date`
 * @param expectedRevision - concurrency token for the target row
 * @returns updated note, or `null` when the target row is missing or stale
 */
export async function replaceNoteOnDate(
  userId: string,
  targetId: string,
  date: string,
  patch: NoteFieldPatch,
  expectedRevision: number,
): Promise<Note | null> {
  const conflicting = await findCalendarNoteByDate(userId, date, targetId);

  if (conflicting) {
    await deleteNoteById(userId, conflicting.id);
  }

  return updateNoteById(userId, targetId, { ...patch, date }, expectedRevision);
}
