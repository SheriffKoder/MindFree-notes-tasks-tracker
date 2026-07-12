/**
 * @file entities/note/lib/find-note-in-cache.ts
 * Reads note records from hydrated TanStack caches without network I/O.
 */

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

/**
 * Finds a note by id across general and any cached calendar month buckets.
 */
export function findNoteByIdInCache(
  queryClient: QueryClient,
  noteId: string,
): Note | null {
  const generalData = queryClient.getQueryData<GeneralNotesResponse>(
    generalNotesQueryKey,
  );
  const generalMatch = generalData?.generalNotes.find(
    (note) => note.id === noteId,
  );

  if (generalMatch) {
    return generalMatch;
  }

  const calendarQueries = queryClient.getQueriesData<CalendarNotesResponse>({
    queryKey: ["calendarNotes"],
  });

  for (const [, data] of calendarQueries) {
    const calendarMatch = data?.monthNotes.find((note) => note.id === noteId);

    if (calendarMatch) {
      return calendarMatch;
    }
  }

  return null;
}

/**
 * Finds a calendar note on one day across cached month buckets.
 */
export function findNoteOnDateInCache(
  queryClient: QueryClient,
  date: string,
  excludeNoteId?: string,
): Note | null {
  const preferredMonth = date.slice(0, 7);
  const preferredData = queryClient.getQueryData<CalendarNotesResponse>(
    calendarNotesQueryKey(preferredMonth),
  );
  const preferredMatch = preferredData?.monthNotes.find(
    (note) => note.date === date && note.id !== excludeNoteId,
  );

  if (preferredMatch) {
    return preferredMatch;
  }

  const calendarQueries = queryClient.getQueriesData<CalendarNotesResponse>({
    queryKey: ["calendarNotes"],
  });

  for (const [, data] of calendarQueries) {
    const match = data?.monthNotes.find(
      (note) => note.date === date && note.id !== excludeNoteId,
    );

    if (match) {
      return match;
    }
  }

  return null;
}
