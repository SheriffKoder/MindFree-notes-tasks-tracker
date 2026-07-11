/**
 * @file features/notes/note-drawer/lib/find-note-in-cache.ts
 * Reads note records from hydrated TanStack caches without network I/O.
 */

import type { QueryClient } from "@tanstack/react-query";

import type {
  CalendarNotesResponse,
  GeneralNotesResponse,
  Note,
} from "@/entities/note/model/types";
import {
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
