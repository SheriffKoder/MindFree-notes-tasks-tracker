/**
 * @file entities/note/mutations/note-cache-mutations.ts
 * Pure TanStack cache updaters for create and delete writes.
 */

import type { NoteFormValues } from "@/entities/note/editor/model/types";
import type {
  CalendarNotesResponse,
  GeneralNotesResponse,
  Note,
} from "@/entities/note/model/types";
import { aggregateMonthNotes } from "@/entities/note/transform/aggregate-month-notes";

/**
 * Builds an optimistic calendar note before the server assigns an id.
 *
 * @param date - `YYYY-MM-DD`
 * @param values - editable form snapshot
 * @returns optimistic note placeholder
 */
export function buildOptimisticCalendarNote(
  date: string,
  values: NoteFormValues,
): Note {
  return {
    id: `optimistic-calendar-${date}`,
    date,
    title: values.title,
    content: values.content,
    starred: values.starred,
    isImportant: values.isImportant,
    isQuick: false,
    lastEditedAt: new Date().toISOString(),
  };
}

/**
 * Builds an optimistic general note before the server assigns an id.
 *
 * @param values - editable form snapshot
 * @returns optimistic note placeholder
 */
export function buildOptimisticGeneralNote(values: NoteFormValues): Note {
  return {
    id: "optimistic-general",
    date: null,
    title: values.title,
    content: values.content,
    starred: values.starred,
    isImportant: values.isImportant,
    isQuick: false,
    lastEditedAt: new Date().toISOString(),
  };
}

/**
 * Inserts or replaces a calendar note and rebuilds `calendarDays`.
 *
 * @param data - cached calendar payload
 * @param note - note row to upsert by `id`
 * @returns updated calendar cache entry
 */
export function upsertCalendarNoteInCache(
  data: CalendarNotesResponse,
  note: Note,
): CalendarNotesResponse {
  const withoutExisting = data.monthNotes.filter(
    (entry) => entry.id !== note.id && entry.date !== note.date,
  );
  const monthNotes = [...withoutExisting, note].sort((left, right) => {
    if (!left.date || !right.date) {
      return 0;
    }

    return left.date.localeCompare(right.date);
  });

  return {
    month: data.month,
    monthNotes,
    calendarDays: aggregateMonthNotes(data.month, monthNotes),
  };
}

/**
 * Inserts a general note and preserves `lastEditedAt` sort order.
 *
 * @param data - cached general notes payload
 * @param note - note row to prepend/replace
 * @returns updated general cache entry
 */
export function upsertGeneralNoteInCache(
  data: GeneralNotesResponse,
  note: Note,
): GeneralNotesResponse {
  const withoutExisting = data.generalNotes.filter((entry) => entry.id !== note.id);
  const generalNotes = [note, ...withoutExisting].sort((left, right) =>
    right.lastEditedAt.localeCompare(left.lastEditedAt),
  );

  return { generalNotes };
}

/**
 * Removes a calendar note and rebuilds `calendarDays`.
 *
 * @param data - cached calendar payload
 * @param noteId - row id to remove
 * @returns updated calendar cache entry
 */
export function removeCalendarNoteFromCache(
  data: CalendarNotesResponse,
  noteId: string,
): CalendarNotesResponse {
  const monthNotes = data.monthNotes.filter((note) => note.id !== noteId);

  return {
    month: data.month,
    monthNotes,
    calendarDays: aggregateMonthNotes(data.month, monthNotes),
  };
}
