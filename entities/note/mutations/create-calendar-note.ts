/**
 * @file entities/note/mutations/create-calendar-note.ts
 * Server use-case for lazy calendar note creation.
 *
 * Purpose: Insert a dated note when the drawer first gains meaningful content.
 * Used in: app/api/notes/calendar/route.ts via entities/note/server.ts
 * Used for: Lazy calendar create from the pre-save orchestrator.
 *
 * Function index:
 * - createCalendarNote: validate body → conflict gate → insert (or replace occupant)
 *
 * Steps (createCalendarNote):
 * 1. Parse body and split `replaceExistingOnDate`.
 * 2. Find any existing note on the target ISO date.
 * 3. On conflict without replace consent, throw NoteDateConflictError.
 * 4. On conflict with replace consent, hard-delete the occupant first.
 * 5. Insert the new calendar row and return the domain note.
 */

import { NoteDateConflictError } from "@/entities/note/mutations/note-date-conflict-error";
import {
  createCalendarNoteBodySchema,
  type CreateCalendarNoteBody,
} from "@/entities/note/mutations/create-note.schema";
import type { Note } from "@/entities/note/model/types";
import {
  createCalendarNote as createCalendarNoteRow,
  deleteNoteById,
  findCalendarNoteByDate,
} from "@/entities/note/repository/note-repository";

function splitCreateBody(data: CreateCalendarNoteBody): {
  payload: CreateCalendarNoteBody;
  replaceExistingOnDate: boolean;
} {
  const { replaceExistingOnDate, ...payload } = data;

  return {
    payload,
    replaceExistingOnDate: replaceExistingOnDate ?? false,
  };
}

/**
 * Inserts a dated calendar note for the authenticated user (RLS-scoped).
 *
 * @param body - raw request body (validated here)
 * @returns created domain note
 * @throws when body is invalid or the day is occupied without replace consent
 */
export async function createCalendarNote(
  userId: string,
  body: unknown,
): Promise<Note> {
  const parsed = createCalendarNoteBodySchema.safeParse(body);

  if (!parsed.success) {
    throw new Error("Invalid calendar note payload.");
  }

  const { payload, replaceExistingOnDate } = splitCreateBody(parsed.data);
  const conflicting = await findCalendarNoteByDate(userId, payload.date);

  if (conflicting) {
    if (!replaceExistingOnDate) {
      throw new NoteDateConflictError(payload.date, conflicting.id);
    }

    await deleteNoteById(userId, conflicting.id);
  }

  const note = await createCalendarNoteRow(userId, payload);

  if (!note) {
    throw new Error("Failed to create calendar note.");
  }

  return note;
}
