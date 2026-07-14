/**
 * @file entities/note/mutations/delete-note.ts
 * Server use-case for deleting an existing note row.
 */

import { deleteNoteById } from "@/entities/note/repository/note-repository";

/**
 * Deletes one note row owned by the authenticated user (RLS-scoped).
 *
 * @param id - note row id
 * @throws when the note is not found
 */
export async function deleteNote(userId: string, id: string): Promise<void> {
  const deleted = await deleteNoteById(userId, id);

  if (!deleted) {
    throw new Error("Note not found.");
  }
}
