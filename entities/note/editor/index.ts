/**
 * @file entities/note/editor/index.ts
 * Note editor form — schema, hook, and UI.
 */

export { formatNoteLastEditedAt } from "@/entities/note/editor/lib/format-last-edited";
export { NOTE_FORM_STYLE_CONFIG } from "@/entities/note/editor/lib/note-form-style-config";
export {
  noteFormSchema,
  type NoteFormSchema,
} from "@/entities/note/editor/model/note-form.schema";
export type {
  NoteFormChangeMeta,
  NoteFormFieldErrors,
  NoteFormFooterMeta,
  NoteFormProps,
  NoteFormValues,
  NoteSaveStatus,
  UseNoteFormOptions,
  UseNoteFormResult,
} from "@/entities/note/editor/model/types";
export { useNoteForm } from "@/entities/note/editor/model/use-note-form";
export { NoteForm } from "@/entities/note/editor/ui/note-form";
