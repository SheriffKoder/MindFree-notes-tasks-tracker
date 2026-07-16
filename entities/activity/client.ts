/**
 * @file entities/activity/client.ts
 * Client-side TanStack Query exports for activity read caches + write mutations.
 *
 * Purpose: single import surface for `"use client"` modules — keys, fetchers,
 *          query options, read hooks, and mutation hooks. No server/repository.
 * Used in: views/tasks, features/activity/* client modules.
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
export { fetchPostActivity } from "@/entities/activity/client/post-activity";
export { fetchPatchActivity } from "@/entities/activity/client/patch-activity";
export { fetchDeleteActivity } from "@/entities/activity/client/delete-activity";
export {
  clearActivityMutationPending,
  isActivityMutationPending,
  markActivityMutationPending,
  useActivitiesQuery,
  useActivityRecordsQuery,
  useArchiveActivityMutation,
  useCreateActivityMutation,
  useDeleteActivityMutation,
  useRestoreActivityMutation,
  useUpdateActivityMutation,
} from "@/entities/activity/hooks";

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
