/**
 * @file entities/note/category/editor/index.ts
 * Note-category editor form — schema, hook, and UI.
 *
 * Purpose: Public nest for reusable category fields (no save routing).
 * Used in: features/notes/note-category-drawer
 * Used for: Manage-drawer create/edit form.
 */

export {
  noteCategoryFormSchema,
  type NoteCategoryFormSchema,
} from "@/entities/note/category/editor/model/note-category-form.schema";
export type {
  NoteCategoryFormChangeMeta,
  NoteCategoryFormFieldErrors,
  NoteCategoryFormProps,
  NoteCategoryFormValues,
  UseNoteCategoryFormOptions,
  UseNoteCategoryFormResult,
} from "@/entities/note/category/editor/model/types";
export { useNoteCategoryForm } from "@/entities/note/category/editor/model/use-note-category-form";
export { NoteCategoryForm } from "@/entities/note/category/editor/ui/note-category-form";
