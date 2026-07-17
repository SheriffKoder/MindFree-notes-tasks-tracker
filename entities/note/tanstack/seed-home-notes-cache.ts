/**
 * @file entities/note/tanstack/seed-home-notes-cache.ts
 * Writes the SSR home-notes payload into a QueryClient (no dehydrate).
 *
 * Composable seeder: the entity owns its cache key; the caller (a seed
 * component) dehydrates once after all entities have written. Reuses data
 * already fetched on the server — no duplicate repository calls.
 */

import type { QueryClient } from "@tanstack/react-query";

import type { HomeNotesResponse } from "@/entities/note/model/types";
import { homeNotesQueryKey } from "@/entities/note/tanstack/query-keys";

/**
 * Seeds the home-notes cache from an SSR payload.
 *
 * @param queryClient - per-request server QueryClient
 * @param data - SSR home-notes payload
 */
export function seedHomeNotesCache(
  queryClient: QueryClient,
  data: HomeNotesResponse,
): void {
  queryClient.setQueryData(homeNotesQueryKey, data);
}
