/**
 * @file entities/note/mutations/patch-note-in-cache.ts
 * Pure TanStack cache updaters for optimistic note PATCH writes.
 *
 * Purpose: Merge form snapshots into cached note rows during PATCH autosave.
 * Used in: entities/note/tanstack/use-update-note-mutation.ts
 * Used for: In-place patches and optimistic date moves before relocateNoteInCache.
 *
 * Function index:
 * - mergeFormValuesIntoNote: apply form values + optional date override
 * - patchCalendarNotesCache / patchGeneralNotesCache: replace one row in a bucket
 * - resolveOwningQueryKey: calendar month key vs general notes key
 */

import type { NoteFormValues } from "@/entities/note/editor/model/types";
import type {
  CalendarNotesResponse,
  GeneralNotesResponse,
  Note,
} from "@/entities/note/model/types";
import { aggregateMonthNotes } from "@/entities/note/transform/aggregate-month-notes";
import {
  calendarNotesQueryKey,
  generalNotesQueryKey,
} from "@/entities/note/tanstack/query-keys";

/**
 * Merges current form values into a note for an optimistic cache write.
 *
 * @param note - existing note row
 * @param values - editable form snapshot
 * @returns note with updated fields and optimistic `lastEditedAt`
 */
export function mergeFormValuesIntoNote(
  note: Note,
  values: NoteFormValues,
  date?: string | null,
): Note {
  return {
    ...note,
    title: values.title,
    content: values.content,
    starred: values.starred,
    isImportant: values.isImportant,
    date: date !== undefined ? date : note.date,
    lastEditedAt: new Date().toISOString(),
  };
}

/**
 * Replaces one calendar note and rebuilds `calendarDays` from `monthNotes`.
 *
 * @param data - cached calendar payload for the note's month
 * @param updatedNote - patched note row
 * @returns updated calendar cache entry
 */
export function patchCalendarNotesCache(
  data: CalendarNotesResponse,
  updatedNote: Note,
): CalendarNotesResponse {
  const monthNotes = data.monthNotes.map((note) =>
    note.id === updatedNote.id ? updatedNote : note,
  );

  return {
    month: data.month,
    monthNotes,
    calendarDays: aggregateMonthNotes(data.month, monthNotes),
  };
}

/**
 * Replaces one general note and preserves `lastEditedAt` sort order.
 *
 * @param data - cached general notes payload
 * @param updatedNote - patched note row
 * @returns updated general cache entry
 */
export function patchGeneralNotesCache(
  data: GeneralNotesResponse,
  updatedNote: Note,
): GeneralNotesResponse {
  const generalNotes = data.generalNotes
    .map((note) => (note.id === updatedNote.id ? updatedNote : note))
    .sort((left, right) =>
      right.lastEditedAt.localeCompare(left.lastEditedAt),
    );

  return { generalNotes };
}

/**
 * Resolves the TanStack query key that owns a note row.
 *
 * @param note - note being edited
 * @returns calendar month key or general notes key
 */
export function resolveOwningQueryKey(note: Note) {
  if (note.date) {
    return calendarNotesQueryKey(note.date.slice(0, 7));
  }

  return generalNotesQueryKey;
}
