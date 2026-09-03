/**
 * @file entities/note/category/editor/model/types.ts
 * Contracts for the note-category editor form.
 *
 * Purpose: Shared types between the dumb form, useNoteCategoryForm, and the drawer.
 * Used in: entities/note/category/editor/*, features/notes/note-category-drawer
 * Used for: Form values, change meta, and field errors — no mutations here.
 */

import type { NoteCategory } from "@/entities/note/category/model/types";
import type { NoteCategoryFormSchema } from "@/entities/note/category/editor/model/note-category-form.schema";

/** Editable category fields managed by the manage-drawer form. */
export type NoteCategoryFormValues = NoteCategoryFormSchema;

/** Field-level validation messages keyed by form field. */
export type NoteCategoryFormFieldErrors = Partial<
  Record<keyof NoteCategoryFormValues, string>
>;

/** Metadata emitted with each controlled change. */
export interface NoteCategoryFormChangeMeta {
  isDirty: boolean;
  isValid: boolean;
}

export interface NoteCategoryFormProps {
  /** Existing category to edit, or `null` for create. */
  category: NoteCategory | null;
  /**
   * Identifies the active editor context (`new` or category id).
   * Changing it resets local field state without reacting to cache writes.
   */
  resetKey: string;
  /** Incremented after a successful save to snap the dirty baseline. */
  commitKey?: number;
  /** Called when local field state changes. No network I/O in the form. */
  onChange?: (
    values: NoteCategoryFormValues,
    meta: NoteCategoryFormChangeMeta,
  ) => void;
  /** Optional wrapper class for drawer layouts. */
  className?: string;
}

export interface UseNoteCategoryFormOptions {
  category: NoteCategory | null;
  /** Identifies drawer/editor context — changing it resets local field state. */
  resetKey: string;
  /** Incremented after a successful save to snap the dirty baseline. */
  commitKey?: number;
  onChange?: (
    values: NoteCategoryFormValues,
    meta: NoteCategoryFormChangeMeta,
  ) => void;
}

export interface UseNoteCategoryFormResult {
  values: NoteCategoryFormValues;
  errors: NoteCategoryFormFieldErrors;
  isDirty: boolean;
  isValid: boolean;
  setName: (name: string) => void;
  setShowOnHome: (showOnHome: boolean) => void;
}
