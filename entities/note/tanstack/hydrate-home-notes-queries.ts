/**
 * @file entities/note/tanstack/hydrate-home-notes-queries.ts
 * Seeds the TanStack cache from SSR home notes payload and returns dehydrated state.
 */

import { dehydrate, type DehydratedState, type QueryClient } from "@tanstack/react-query";

import type { HomeNotesResponse } from "@/entities/note/model/types";
import { homeNotesQueryKey } from "@/entities/note/tanstack/query-keys";

/**
 * Writes SSR home notes into a QueryClient and dehydrates for the client boundary.
 *
 * Reuses data already fetched on the server — no duplicate repository calls.
 */
export function hydrateHomeNotesQueries(
  queryClient: QueryClient,
  data: HomeNotesResponse,
): DehydratedState {
  queryClient.setQueryData(homeNotesQueryKey, data);

  return dehydrate(queryClient);
}
