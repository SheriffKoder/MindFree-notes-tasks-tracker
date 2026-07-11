/**
 * @file entities/note/mutations/update-note.schema.ts
 * Zod contracts for PATCH /api/notes/:id.
 */

import { z } from "zod";

import { noteFormSchema } from "@/entities/note/editor/model/note-form.schema";
import type { Note } from "@/entities/note/model/types";

/**
 * Partial PATCH body — any subset of editable drawer fields.
 */
export const updateNoteBodySchema = noteFormSchema.partial();

export type UpdateNoteBody = z.infer<typeof updateNoteBodySchema>;

/** Successful PATCH response shape. */
export const updateNoteResponseSchema = z.object({
  note: z.custom<Note>(),
});

export type UpdateNoteResponse = z.infer<typeof updateNoteResponseSchema>;
