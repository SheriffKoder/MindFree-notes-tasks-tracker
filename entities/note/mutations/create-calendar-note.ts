/**
 * @file entities/note/mutations/create-calendar-note.ts
 * Server use-case for lazy calendar note creation.
 */

import {
  createCalendarNoteBodySchema,
  type CreateCalendarNoteBody,
} from "@/entities/note/mutations/create-note.schema";
import type { Note } from "@/entities/note/model/types";
import { createCalendarNote as createCalendarNoteRow } from "@/entities/note/repository/note-repository";

/**
 * Inserts a dated calendar note for the authenticated user (RLS-scoped).
 *
 * @param body - raw request body (validated here)
 * @returns created domain note
 * @throws when body is invalid or the day already has a note
 */
export async function createCalendarNote(body: unknown): Promise<Note> {
  const parsed = createCalendarNoteBodySchema.safeParse(body);

  if (!parsed.success) {
    throw new Error("Invalid calendar note payload.");
  }

  const payload: CreateCalendarNoteBody = parsed.data;
  const note = await createCalendarNoteRow(payload);

  if (!note) {
    throw new Error("Calendar note already exists for this date.");
  }

  return note;
}
