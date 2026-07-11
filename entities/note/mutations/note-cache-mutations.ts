/**
 * @file entities/note/mutations/note-cache-mutations.ts
 * Pure TanStack cache updaters for create, delete, and relocate writes.
 *
 * Purpose: Keep calendar and general read caches consistent after mutations.
 * Used in: entities/note/tanstack/use-*-note-mutation.ts, patch-note-in-cache.ts
 * Used for: Optimistic upserts, removals, and cross-bucket note relocation.
 *
 * Function index:
 * - buildOptimisticCalendarNote / upsertCalendarNoteInCache / remove* helpers
 * - relocateNoteInCache: strip note id from all buckets, upsert into new owner
 */

import type { NoteFormValues } from "@/entities/note/editor/model/types";
import type { QueryClient } from "@tanstack/react-query";

import type {
  CalendarNotesResponse,
  GeneralNotesResponse,
  Note,
} from "@/entities/note/model/types";
import {
  calendarNotesQueryKey,
  generalNotesQueryKey,
} from "@/entities/note/tanstack/query-keys";
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
  options?: { replaceSameDate?: boolean },
): CalendarNotesResponse {
  const withoutExisting = data.monthNotes.filter((entry) => {
    if (entry.id === note.id) {
      return false;
    }

    if (options?.replaceSameDate && entry.date === note.date) {
      return false;
    }

    return true;
  });
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

/**
 * Removes a general note from the cached list.
 *
 * @param data - cached general notes payload
 * @param noteId - row id to remove
 * @returns updated general cache entry
 */
export function removeGeneralNoteFromCache(
  data: GeneralNotesResponse,
  noteId: string,
): GeneralNotesResponse {
  return {
    generalNotes: data.generalNotes.filter((note) => note.id !== noteId),
  };
}

/**
 * Removes a note from every cached bucket, then upserts it into the new owner.
 *
 * @param queryClient - TanStack query client
 * @param previousNote - note row before the date move
 * @param updatedNote - optimistic or server-confirmed note in the new bucket
 */
export function relocateNoteInCache(
  queryClient: QueryClient,
  previousNote: Note,
  updatedNote: Note,
): void {
  const calendarQueries = queryClient.getQueriesData<CalendarNotesResponse>({
    queryKey: ["calendarNotes"],
  });

  for (const [queryKey] of calendarQueries) {
    queryClient.setQueryData<CalendarNotesResponse>(queryKey, (current) =>
      current
        ? removeCalendarNoteFromCache(current, previousNote.id)
        : current,
    );
  }

  queryClient.setQueryData<GeneralNotesResponse>(generalNotesQueryKey, (current) =>
    current
      ? removeGeneralNoteFromCache(current, previousNote.id)
      : current,
  );

  if (updatedNote.date) {
    const nextMonth = updatedNote.date.slice(0, 7);
    const newKey = calendarNotesQueryKey(nextMonth);

    queryClient.setQueryData<CalendarNotesResponse>(newKey, (current) =>
      current
        ? upsertCalendarNoteInCache(current, updatedNote, {
            replaceSameDate: true,
          })
        : current,
    );

    return;
  }

  queryClient.setQueryData<GeneralNotesResponse>(generalNotesQueryKey, (current) =>
    current ? upsertGeneralNoteInCache(current, updatedNote) : current,
  );
}
