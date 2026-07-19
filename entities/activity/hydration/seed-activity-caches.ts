/**
 * @file entities/activity/hydration/seed-activity-caches.ts
 * Writes canonical activity caches into a QueryClient (no dehydrate).
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
import type {
  ActivityPageData,
  HomeActivityData,
} from "@/entities/activity/model/read-models";

/**
 * Seeds one kind's definitions + the month records cache from an SSR payload.
 * Used by `/tasks` and `/reminders` page seeds.
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

/**
 * Seeds both definition kinds + one shared month records cache for Home SSR.
 *
 * @param queryClient - per-request server QueryClient
 * @param data - Home activity payload (tasks + reminders + one records month)
 */
export function seedHomeActivityCaches(
  queryClient: QueryClient,
  data: HomeActivityData,
): void {
  queryClient.setQueryData(activitiesQueryKey("task"), data.tasks);
  queryClient.setQueryData(activitiesQueryKey("reminder"), data.reminders);
  queryClient.setQueryData(activityRecordsQueryKey(data.month), data.records);
}
