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
import type { ActivityPageData } from "@/entities/activity/model/read-models";

/**
 * Seeds the kind definitions + current-month records caches from an SSR payload.
 * Shared by activity-page seeds and the Home seed.
 *
 * @param queryClient - per-request server QueryClient
 * @param data - SSR initial payloads (kind definitions + month records)
 */
export function seedActivityCaches(
  queryClient: QueryClient,
  data: ActivityPageData,
): void {
  queryClient.setQueryData(activitiesQueryKey(data.kind), data.activities);
  queryClient.setQueryData(activityRecordsQueryKey(data.month), data.records);
}
