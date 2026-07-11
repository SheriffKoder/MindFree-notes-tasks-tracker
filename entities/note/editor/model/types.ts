/**
 * @file entities/note/editor/model/types.ts
 * Contracts for the note editor form.
 */

import type { Note } from "@/entities/note";
import type { NoteFormSchema } from "@/entities/note/editor/model/note-form.schema";

/** Editable note fields managed by the drawer form. */
export type NoteFormValues = NoteFormSchema;

/** Field-level validation messages keyed by form field. */
export type NoteFormFieldErrors = Partial<
  Record<keyof NoteFormValues, string>
>;

/** Autosave feedback surfaced beside the editor (wired in Step 9). */
export type NoteSaveStatus = "idle" | "saving" | "saved" | "error";

/** Metadata emitted with each controlled change. */
export interface NoteFormChangeMeta {
  isDirty: boolean;
  isValid: boolean;
}

/** Footer metadata emitted when last-saved is rendered outside the content row. */
export interface NoteFormFooterMeta {
  formattedLastEditedAt: string | null;
  saveStatus: NoteSaveStatus;
}

export interface NoteFormProps {
  /** Existing note to edit, or `null` for lazy create / empty draft. */
  note: Note | null;
  /**
   * Identifies the active editor context (note id, date, or draft slot).
   * Changing it resets local field state without reacting to cache writes.
   */
  resetKey: string;
  /** Incremented after a successful autosave to snap the dirty baseline. */
  commitKey?: number;
  /** Called when local field state changes. No network I/O in the form. */
  onChange?: (values: NoteFormValues, meta: NoteFormChangeMeta) => void;
  /** Optional save feedback from the drawer island (Step 9). */
  saveStatus?: NoteSaveStatus;
  /** When `false`, the content row omits the overlaid last-saved label. */
  showContentLastSaved?: boolean;
  /** Receives footer metadata for an external thin footer (drawer island). */
  onFooterMetaChange?: (meta: NoteFormFooterMeta) => void;
  /** Optional wrapper class for drawer layouts that need `flex-1` growth. */
  className?: string;
}

export interface UseNoteFormOptions {
  note: Note | null;
  /** Identifies drawer/editor context — changing it resets local field state. */
  resetKey: string;
  /** Incremented after a successful autosave to snap the dirty baseline. */
  commitKey?: number;
  onChange?: (values: NoteFormValues, meta: NoteFormChangeMeta) => void;
}

export interface UseNoteFormResult {
  values: NoteFormValues;
  errors: NoteFormFieldErrors;
  isDirty: boolean;
  isValid: boolean;
  formattedLastEditedAt: string | null;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  toggleStarred: () => void;
  toggleImportant: () => void;
}
