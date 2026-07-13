/**
 * @file entities/note/mutations/update-note.schema.ts
 * Zod contracts for PATCH /api/notes/:id.
 *
 * Purpose: Validate drawer autosave bodies, including optional date moves.
 * Used in: entities/note/mutations/update-note.ts, mutations/patch-note.ts,
 *          app/api/notes/[id]/route.ts
 * Used for: PATCH payloads with `date`, `replaceExistingOnDate`, and form fields.
 *
 * Exports:
 * - updateNoteBodySchema / UpdateNoteBody: partial form + optional date fields
 * - updateNoteResponseSchema / UpdateNoteResponse: `{ note }` success shape
 */

import { z } from "zod";

import { noteFormSchema } from "@/entities/note/editor/model/note-form.schema";
import type { Note } from "@/entities/note/model/types";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Partial PATCH body — any subset of editable drawer fields.
 */
export const updateNoteBodySchema = noteFormSchema.partial().extend({
  date: z
    .string()
    .regex(ISO_DATE_PATTERN, "Date must be YYYY-MM-DD.")
    .nullable()
    .optional(),
  isQuick: z.boolean().optional(),
  replaceExistingOnDate: z.boolean().optional(),
});

export type UpdateNoteBody = z.infer<typeof updateNoteBodySchema>;

/** Successful PATCH response shape. */
export const updateNoteResponseSchema = z.object({
  note: z.custom<Note>(),
});

export type UpdateNoteResponse = z.infer<typeof updateNoteResponseSchema>;
