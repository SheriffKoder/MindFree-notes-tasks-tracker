/**
 * @file entities/note/mutations/update-note.ts
 * Server use-case for PATCH note autosave.
 */

import {
  updateNoteBodySchema,
  type UpdateNoteBody,
} from "@/entities/note/mutations/update-note.schema";
import type { Note } from "@/entities/note/model/types";
import { updateNoteById } from "@/entities/note/repository/note-repository";

/**
 * Updates an existing note row for the authenticated user (RLS-scoped).
 *
 * @param id - note row id
 * @param body - raw request body (validated here)
 * @returns updated domain note
 * @throws when body is invalid or the note is not found
 */
export async function updateNote(id: string, body: unknown): Promise<Note> {
  const parsed = updateNoteBodySchema.safeParse(body);

  if (!parsed.success) {
    throw new Error("Invalid note update payload.");
  }

  const patch: UpdateNoteBody = parsed.data;
  const note = await updateNoteById(id, patch);

  if (!note) {
    throw new Error("Note not found.");
  }

  return note;
}
