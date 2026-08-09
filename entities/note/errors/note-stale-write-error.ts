/**
 * @file entities/note/errors/note-stale-write-error.ts
 * Typed error when a PATCH is based on an outdated `lastEditedAt`.
 *
 * Purpose: Signal optimistic-concurrency failures from server use-cases to API routes.
 * Used in: entities/note/mutations/update-note.ts; app/api/notes/[id]/route.ts
 * Used for: Returning 409 with `code: "STALE_WRITE"` and the current note row.
 *
 * Exports:
 * - NoteStaleWriteError: domain error with `currentNote`
 */

import type { Note } from "@/entities/note/model/types";

export class NoteStaleWriteError extends Error {
  readonly currentNote: Note;

  constructor(currentNote: Note) {
    super("Note was updated elsewhere. Reload before saving.");
    this.name = "NoteStaleWriteError";
    this.currentNote = currentNote;
  }
}
