/**
 * @file entities/activity/server.ts
 * Server-side activity barrel — read/write use-cases and the auth helper.
 *
 * Purpose: single import surface for server-only activity operations.
 * Used in: app/api/activities/*, app/api/activity-records/*, Server Components.
 * Used for: SSR reads (definitions + month records), write use-cases, RLS user
 *          resolution.
 *
 * Types (TasksPageData, ActivitiesResponse, ActivityRecordsResponse) come from
 * `@/entities/activity`.
 */

export { getActivitiesResponse } from "@/entities/activity/queries/get-activities-response";
export { getActivityRecordsResponse } from "@/entities/activity/queries/get-activity-records-response";
export { getTasksPageInitialData } from "@/entities/activity/queries/get-tasks-page-initial-data";
export { hydrateTasksPageQueries } from "@/entities/activity/client/hydrate-tasks-page-queries";
export {
  archiveActivity,
  createActivity,
  deleteActivity,
  updateActivity,
} from "@/entities/activity/mutations";
export { getAuthenticatedUserId } from "@/entities/activity/repository";
