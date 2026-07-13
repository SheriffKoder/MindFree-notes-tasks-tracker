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
  HomeNotesResponse,
  Note,
} from "@/entities/note/model/types";
import {
  calendarNotesQueryKey,
  generalNotesQueryKey,
  homeNotesQueryKey,
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

/** Max starred rows kept in the home read cache (matches repository fetch cap). */
export const HOME_STARRED_CACHE_LIMIT = 20;

function sortStarredNotesByLastEdited(notes: Note[]): Note[] {
  return [...notes].sort((left, right) =>
    right.lastEditedAt.localeCompare(left.lastEditedAt),
  );
}

/**
 * Applies an update to the home read cache from a previous → next note transition.
 *
 * @param data - cached home payload
 * @param previous - note row before the write
 * @param next - optimistic or server-confirmed note after the write
 */
export function applyHomeNoteUpdate(
  data: HomeNotesResponse,
  previous: Note,
  next: Note,
): HomeNotesResponse {
  let quickNote = data.quickNote;
  let starredNotes = data.starredNotes;

  if (next.isQuick) {
    quickNote = next;
  } else if (quickNote?.id === previous.id || quickNote?.id === next.id) {
    quickNote = null;
  }

  starredNotes = starredNotes.filter(
    (entry) => entry.id !== previous.id && entry.id !== next.id,
  );

  if (next.starred && !next.isQuick) {
    starredNotes = sortStarredNotesByLastEdited([next, ...starredNotes]).slice(
      0,
      HOME_STARRED_CACHE_LIMIT,
    );
  }

  return { quickNote, starredNotes };
}

/**
 * Applies a create write to the home read cache.
 *
 * @param data - cached home payload
 * @param note - created note row
 */
export function applyHomeNoteCreate(
  data: HomeNotesResponse,
  note: Note,
): HomeNotesResponse {
  if (note.isQuick) {
    return { ...data, quickNote: note };
  }

  let starredNotes = data.starredNotes.filter((entry) => entry.id !== note.id);

  if (note.starred) {
    starredNotes = sortStarredNotesByLastEdited([note, ...starredNotes]).slice(
      0,
      HOME_STARRED_CACHE_LIMIT,
    );
  }

  return { quickNote: data.quickNote, starredNotes };
}

/**
 * Removes one note from the home quick slot and starred carousel.
 *
 * @param data - cached home payload
 * @param noteId - row id to remove
 */
export function applyHomeNoteDelete(
  data: HomeNotesResponse,
  noteId: string,
): HomeNotesResponse {
  return {
    quickNote: data.quickNote?.id === noteId ? null : data.quickNote,
    starredNotes: data.starredNotes.filter((note) => note.id !== noteId),
  };
}

/**
 * Writes a home note update into the TanStack cache.
 */
export function patchHomeNotesCache(
  queryClient: QueryClient,
  previous: Note,
  next: Note,
): void {
  queryClient.setQueryData<HomeNotesResponse>(homeNotesQueryKey, (current) => {
    const base = current ?? { quickNote: null, starredNotes: [] };
    return applyHomeNoteUpdate(base, previous, next);
  });
}

/**
 * Writes a home note create into the TanStack cache.
 */
export function upsertHomeNoteInCache(queryClient: QueryClient, note: Note): void {
  queryClient.setQueryData<HomeNotesResponse>(homeNotesQueryKey, (current) => {
    const base = current ?? { quickNote: null, starredNotes: [] };
    return applyHomeNoteCreate(base, note);
  });
}

/**
 * Removes one note from the home TanStack cache.
 */
export function removeHomeNoteFromCacheQuery(
  queryClient: QueryClient,
  noteId: string,
): void {
  queryClient.setQueryData<HomeNotesResponse>(homeNotesQueryKey, (current) => {
    if (!current) {
      return current;
    }

    return applyHomeNoteDelete(current, noteId);
  });
}

/**
 * Builds an optimistic quick note before the server assigns an id.
 */
export function buildOptimisticQuickNote(values: NoteFormValues): Note {
  return {
    id: "optimistic-quick",
    date: null,
    title: values.title,
    content: values.content,
    starred: values.starred,
    isImportant: values.isImportant,
    isQuick: true,
    lastEditedAt: new Date().toISOString(),
  };
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
