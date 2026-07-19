/**
 * @file entities/note/schema/create-note.schema.ts
 * Zod contracts for POST note creation routes.
 *
 * Purpose: Validate lazy-create bodies for calendar and general notes.
 * Used in: entities/note/mutations/create-calendar-note.ts, create-general-note.ts,
 *          mutations/post-note.ts, app/api/notes/calendar|general/route.ts
 * Used for: Calendar POST with `date` + `replaceExistingOnDate`; general POST without date.
 *
 * Exports:
 * - createCalendarNoteBodySchema / CreateCalendarNoteBody
 * - createGeneralNoteBodySchema / CreateGeneralNoteBody
 * - createNoteResponseSchema / CreateNoteResponse
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
  replaceExistingOnDate: z.boolean().optional(),
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
