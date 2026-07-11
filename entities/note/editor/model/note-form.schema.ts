/**
 * @file entities/note/editor/model/note-form.schema.ts
 * Zod schema for the note editor form.
 */

import { z } from "zod";

/**
 * Validates editable note fields shown in the drawer editor.
 */
export const noteFormSchema = z.object({
  title: z
    .string()
    .max(200, "Title must be 200 characters or fewer."),
  content: z
    .string()
    .max(10_000, "Content must be 10,000 characters or fewer."),
  starred: z.boolean(),
  isImportant: z.boolean(),
});

/**
 * Parsed note form values inferred from {@link noteFormSchema}.
 */
export type NoteFormSchema = z.infer<typeof noteFormSchema>;
