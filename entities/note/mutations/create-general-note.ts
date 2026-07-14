/**
 * @file entities/note/mutations/create-general-note.ts
 * Server use-case for lazy general note creation.
 */

import {
  createGeneralNoteBodySchema,
  type CreateGeneralNoteBody,
} from "@/entities/note/mutations/create-note.schema";
import type { Note } from "@/entities/note/model/types";
import { createGeneralNote as createGeneralNoteRow } from "@/entities/note/repository/note-repository";

/**
 * Inserts a general note (`date IS NULL`, `is_quick = false`) for the user.
 *
 * @param body - raw request body (validated here)
 * @returns created domain note
 * @throws when body is invalid
 */
export async function createGeneralNote(
  userId: string,
  body: unknown,
): Promise<Note> {
  const parsed = createGeneralNoteBodySchema.safeParse(body);

  if (!parsed.success) {
    throw new Error("Invalid general note payload.");
  }

  const payload: CreateGeneralNoteBody = parsed.data;
  return createGeneralNoteRow(userId, payload);
}
