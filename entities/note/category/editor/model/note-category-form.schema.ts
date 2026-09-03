/**
 * @file entities/note/category/editor/model/note-category-form.schema.ts
 * Zod schema for the note-category editor form (name + show on Home).
 *
 * Purpose: Client validation for the manage-drawer form — no save routing.
 * Used in: useNoteCategoryForm, NoteCategoryForm
 * Used for: Dirty/valid checks before the parent calls create/update mutations.
 */

import { z } from "zod";

/**
 * Validates editable category fields shown in the manage drawer.
 */
export const noteCategoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(80, "Name must be 80 characters or fewer."),
  showOnHome: z.boolean(),
});

/**
 * Parsed category form values inferred from {@link noteCategoryFormSchema}.
 */
export type NoteCategoryFormSchema = z.infer<typeof noteCategoryFormSchema>;
