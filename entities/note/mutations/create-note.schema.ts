/**
 * @file entities/note/mutations/create-note.schema.ts
 * Zod contracts for POST note creation routes.
 */

import { z } from "zod";

import { noteFormSchema } from "@/entities/note/editor/model/note-form.schema";
import type { Note } from "@/entities/note/model/types";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Body for creating a calendar note on a specific day.
 */
export const createCalendarNoteBodySchema = noteFormSchema.extend({
  date: z
    .string()
    .regex(ISO_DATE_PATTERN, "Date must be YYYY-MM-DD."),
});

export type CreateCalendarNoteBody = z.infer<
  typeof createCalendarNoteBodySchema
>;

/**
 * Body for creating a general note (`date IS NULL`).
 */
export const createGeneralNoteBodySchema = noteFormSchema;

export type CreateGeneralNoteBody = z.infer<
  typeof createGeneralNoteBodySchema
>;

/** Successful create response shape. */
export const createNoteResponseSchema = z.object({
  note: z.custom<Note>(),
});

export type CreateNoteResponse = z.infer<typeof createNoteResponseSchema>;
