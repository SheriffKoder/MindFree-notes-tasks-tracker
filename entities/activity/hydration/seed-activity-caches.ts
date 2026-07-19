/**
 * @file entities/activity/hydration/seed-activity-caches.ts
 * Writes the two canonical activity caches into a QueryClient (no dehydrate).
 *
 * Composable seeder: the entity owns its cache keys; the caller (a seed
 * component) dehydrates once after all entities have written. Isomorphic (no
 * "use client"): runs in server seed components, exported via `server.ts`.
 * Reuses data already fetched on the server — no duplicate reads.
 */

import type { QueryClient } from "@tanstack/react-query";

import {
  activitiesQueryKey,
  activityRecordsQueryKey,
} from "@/entities/activity/client/query-keys";
import type { TasksPageData } from "@/entities/activity/model/read-models";

/**
 * Seeds the definitions + current-month records caches from an SSR payload.
 * Shared by the Tasks page seed and the Home seed (same two caches).
 *
 * @param queryClient - per-request server QueryClient
 * @param data - SSR initial payloads (definitions + month records)
 */
export function seedActivityCaches(
  queryClient: QueryClient,
  data: TasksPageData,
): void {
  queryClient.setQueryData(activitiesQueryKey("task"), data.activities);
  queryClient.setQueryData(activityRecordsQueryKey(data.month), data.records);
}
