/**
 * @file entities/note/mutations/update-note.ts
 * Server use-case for PATCH note autosave and date moves.
 *
 * Purpose: Apply drawer PATCH writes with optional calendar-day relocation.
 * Used in: app/api/notes/[id]/route.ts via entities/note/server.ts
 * Used for: Autosave, general→calendar moves, calendar→general moves, same-day replace.
 *
 * Function index:
 * - updateNote: validate body → conflict gate → patch or replace-on-date
 *
 * Steps (updateNote):
 * 1. Parse and split `replaceExistingOnDate` from the PATCH body.
 * 2. When `date` is set, look up an occupant on that day (excluding self).
 * 3. On conflict without replace consent, throw NoteDateConflictError.
 * 4. On conflict with replace consent, delete occupant then update target row.
 * 5. Otherwise run a normal updateNoteById patch.
 */

import { NoteDateConflictError } from "@/entities/note/errors";
import {
  updateNoteBodySchema,
  type UpdateNoteBody,
} from "@/entities/note/schema";
import type { Note } from "@/entities/note/model/types";
import {
  findCalendarNoteByDate,
  replaceNoteOnDate,
  updateNoteById,
} from "@/entities/note/repository";

function splitUpdateBody(data: UpdateNoteBody): {
  patch: UpdateNoteBody;
  replaceExistingOnDate: boolean;
} {
  const { replaceExistingOnDate, ...patch } = data;

  return {
    patch,
    replaceExistingOnDate: replaceExistingOnDate ?? false,
  };
}

/**
 * Updates an existing note row for the authenticated user (RLS-scoped).
 *
 * @param id - note row id
 * @param body - raw request body (validated here)
 * @returns updated domain note
 * @throws when body is invalid or the note is not found
 */
export async function updateNote(
  userId: string,
  id: string,
  body: unknown,
): Promise<Note> {
  const parsed = updateNoteBodySchema.safeParse(body);

  if (!parsed.success) {
    throw new Error("Invalid note update payload.");
  }

  const { patch, replaceExistingOnDate } = splitUpdateBody(parsed.data);

  if (patch.date) {
    const conflicting = await findCalendarNoteByDate(userId, patch.date, id);

    if (conflicting) {
      if (!replaceExistingOnDate) {
        throw new NoteDateConflictError(patch.date, conflicting.id);
      }

      const note = await replaceNoteOnDate(userId, id, patch.date, patch);

      if (!note) {
        throw new Error("Note not found.");
      }

      return note;
    }
  }

  const note = await updateNoteById(userId, id, patch);

  if (!note) {
    throw new Error("Note not found.");
  }

  return note;
}
