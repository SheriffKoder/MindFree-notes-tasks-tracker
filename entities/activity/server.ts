/**
 * @file entities/activity/server.ts
 * Server-side activity barrel — read use-cases and the auth helper.
 *
 * Purpose: single import surface for server-only activity operations.
 * Used in: app/api/activities/*, app/api/activity-records/*, Server Components.
 * Used for: SSR reads (definitions + month records) and RLS user resolution.
 *
 * Types (TasksPageData, ActivitiesResponse, ActivityRecordsResponse) come from
 * `@/entities/activity`. Write use-cases (Step 12) are added here as they land.
 */

export { getActivitiesResponse } from "@/entities/activity/queries/get-activities-response";
export { getActivityRecordsResponse } from "@/entities/activity/queries/get-activity-records-response";
export { getTasksPageInitialData } from "@/entities/activity/queries/get-tasks-page-initial-data";
export { hydrateTasksPageQueries } from "@/entities/activity/client/hydrate-tasks-page-queries";
export { getAuthenticatedUserId } from "@/entities/activity/repository";
