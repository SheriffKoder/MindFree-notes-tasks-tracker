/**
 * @file entities/note/cache/find-note-in-cache.ts
 * Reads note records from hydrated TanStack caches without network I/O.
 */

import type { QueryClient } from "@tanstack/react-query";

import type {
  CalendarNotesResponse,
  GeneralNotesResponse,
  HomeNotesResponse,
} from "@/entities/note/model/read-models";
import type { Note } from "@/entities/note/model/types";
import {
  calendarNotesQueryKey,
  homeNotesQueryKey,
} from "@/entities/note/client/query-keys";

/**
 * Finds a note by id across general, home strips, and cached calendar months.
 */
export function findNoteByIdInCache(
  queryClient: QueryClient,
  noteId: string,
): Note | null {
  const generalQueries = queryClient.getQueriesData<GeneralNotesResponse>({
    queryKey: ["generalNotes"],
  });

  for (const [, data] of generalQueries) {
    const generalMatch = data?.generalNotes.find((note) => note.id === noteId);

    if (generalMatch) {
      return generalMatch;
    }
  }

  const homeData = queryClient.getQueryData<HomeNotesResponse>(homeNotesQueryKey);

  if (homeData) {
    for (const strip of homeData.strips) {
      if (strip.quickNote?.id === noteId) {
        return strip.quickNote;
      }

      const starredMatch = strip.starredNotes.find((note) => note.id === noteId);

      if (starredMatch) {
        return starredMatch;
      }
    }
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
