/**
 * @file entities/activity/client.ts
 * Client-side TanStack Query exports for activity read caches.
 *
 * Purpose: single import surface for `"use client"` modules — keys, fetchers,
 *          query options, and read hooks. No server/repository code.
 * Used in: views/tasks, features/activity/* client modules.
 *
 * Hydration (Step 7) and mutation hooks (Step 12) are added here as those steps
 * land.
 */

export {
  activitiesQueryKey,
  activityRecordsQueryKey,
} from "@/entities/activity/client/query-keys";
export {
  activitiesQueryOptions,
  fetchActivities,
} from "@/entities/activity/client/activities-query";
export {
  activityRecordsQueryOptions,
  fetchActivityRecords,
} from "@/entities/activity/client/activity-records-query";
export { useActivitiesQuery } from "@/entities/activity/hooks/use-activities-query";
export { useActivityRecordsQuery } from "@/entities/activity/hooks/use-activity-records-query";

export type {
  ActivitiesResponse,
  ActivityRecordsResponse,
  TasksPageData,
} from "@/entities/activity/model/read-models";
export type {
  Activity,
  ActivityKind,
  ActivityRecord,
} from "@/entities/activity/model/types";
