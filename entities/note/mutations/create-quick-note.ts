/**
 * @file entities/note/mutations/create-quick-note.ts
 * Server use-case for lazy quick note creation.
 */

import {
  createGeneralNoteBodySchema,
  type CreateGeneralNoteBody,
} from "@/entities/note/schema";
import type { Note } from "@/entities/note/model/types";
import { createQuickNote as createQuickNoteRow } from "@/entities/note/repository";

/**
 * Inserts a quick note (`date IS NULL`, `is_quick = true`) for the user.
 *
 * @param body - raw request body (validated here)
 * @returns created domain note
 * @throws when body is invalid
 */
export async function createQuickNote(
  userId: string,
  body: unknown,
): Promise<Note> {
  const parsed = createGeneralNoteBodySchema.safeParse(body);

  if (!parsed.success) {
    throw new Error("Invalid quick note payload.");
  }

  const payload: CreateGeneralNoteBody = parsed.data;
  return createQuickNoteRow(userId, payload);
}
