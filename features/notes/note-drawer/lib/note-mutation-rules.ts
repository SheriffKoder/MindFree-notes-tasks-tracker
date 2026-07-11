/**
 * @file features/notes/note-drawer/lib/note-mutation-rules.ts
 * Pure rules for lazy create, PATCH, and calendar-only delete routing.
 */

import type {
  NoteFormChangeMeta,
  NoteFormValues,
} from "@/entities/note/editor/model/types";
import type { Note } from "@/entities/note";
import type { NoteEditorRequest } from "@/views/notes/model/editor/note-editor-request";

/**
 * @returns whether the form has text worth persisting (title or content).
 */
export function hasMeaningfulContent(values: NoteFormValues): boolean {
  return Boolean(values.title.trim() || values.content.trim());
}

/**
 * Calendar dated notes delete when content is cleared; general notes never auto-delete.
 *
 * @param note - resolved note row, if any
 * @param values - current form snapshot
 * @param meta - dirty/valid flags from the editor
 * @returns whether to DELETE instead of PATCH
 */
export function shouldDeleteCalendarNoteOnEmptyContent(
  note: Note,
  values: NoteFormValues,
  meta: NoteFormChangeMeta,
): boolean {
  return Boolean(note.date) && meta.isDirty && values.content.trim() === "";
}

/**
 * @returns active ISO date for calendar create/navigation context.
 */
export function resolveCalendarDate(
  activeDate: string | null,
  request: NoteEditorRequest | null,
): string | null {
  if (activeDate) {
    return activeDate;
  }

  if (request?.mode === "create" && "date" in request) {
    return request.date;
  }

  return null;
}

/**
 * @returns whether the drawer is in general lazy-create mode.
 */
export function isGeneralCreateRequest(
  request: NoteEditorRequest | null,
): boolean {
  return request?.mode === "create" && "general" in request;
}

/**
 * @returns whether calendar date create/edit routing applies.
 */
export function isCalendarDateContext(
  request: NoteEditorRequest | null,
  activeDate: string | null,
  isDateNavEnabled: boolean,
): boolean {
  if (isDateNavEnabled && activeDate) {
    return true;
  }

  return request?.mode === "create" && "date" in request;
}
