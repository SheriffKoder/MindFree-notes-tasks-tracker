/**
 * @file entities/note/tanstack/hydrate-notes-page-queries.ts
 * Seeds the TanStack cache from SSR payloads and returns dehydrated state.
 */

import { dehydrate, type DehydratedState, type QueryClient } from "@tanstack/react-query";

import type { NotesPageInitialData } from "@/entities/note/queries/get-notes-page-initial-data";
import {
  calendarNotesQueryKey,
  generalNotesQueryKey,
} from "@/entities/note/tanstack/query-keys";

/**
 * Writes SSR note payloads into a QueryClient and dehydrates for the client boundary.
 *
 * Reuses data already fetched on the server — no duplicate repository calls.
 */
export function hydrateNotesPageQueries(
  queryClient: QueryClient,
  data: Pick<NotesPageInitialData, "month" | "calendarNotes" | "generalNotes">,
): DehydratedState {
  queryClient.setQueryData(
    calendarNotesQueryKey(data.month),
    data.calendarNotes,
  );
  queryClient.setQueryData(generalNotesQueryKey, data.generalNotes);

  return dehydrate(queryClient);
}
