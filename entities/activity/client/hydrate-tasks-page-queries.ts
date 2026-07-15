/**
 * @file entities/activity/client/hydrate-tasks-page-queries.ts
 * Seeds the TanStack cache from Tasks SSR payloads and returns dehydrated state.
 *
 * Isomorphic (no "use client"): runs in the server seed component, exported via
 * `server.ts`. Reuses data already fetched on the server — no duplicate reads.
 */

import {
  dehydrate,
  type DehydratedState,
  type QueryClient,
} from "@tanstack/react-query";

import {
  activitiesQueryKey,
  activityRecordsQueryKey,
} from "@/entities/activity/client/query-keys";
import type { TasksPageData } from "@/entities/activity/model/read-models";

/**
 * Writes the two canonical Tasks caches (definitions + current-month records)
 * into a QueryClient and dehydrates for the client boundary.
 *
 * @param queryClient - per-request server QueryClient
 * @param data - SSR initial payloads (definitions + month records)
 * @returns dehydrated cache state for `<QueryHydration>`
 */
export function hydrateTasksPageQueries(
  queryClient: QueryClient,
  data: TasksPageData,
): DehydratedState {
  queryClient.setQueryData(activitiesQueryKey("task"), data.activities);
  queryClient.setQueryData(activityRecordsQueryKey(data.month), data.records);

  return dehydrate(queryClient);
}
