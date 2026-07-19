/**
 * @file entities/activity/server.ts
 * Server-side activity barrel — read/write use-cases and the auth helper.
 *
 * Purpose: single import surface for server-only activity operations.
 * Used in: app/api/activities/*, app/api/activity-records/*, Server Components.
 * Used for: SSR reads (definitions + month records), write use-cases, RLS user
 *          resolution.
 *
 * Types (ActivityPageData, HomeActivityData, ActivitiesResponse,
 * ActivityRecordsResponse) come from `@/entities/activity`.
 */

export { getActivitiesResponse } from "@/entities/activity/queries/get-activities-response";
export { getActivityRecordsResponse } from "@/entities/activity/queries/get-activity-records-response";
export { getActivityPageInitialData } from "@/entities/activity/queries/get-activity-page-initial-data";
export { getHomeActivityInitialData } from "@/entities/activity/queries/get-home-activity-initial-data";
export {
  seedActivityCaches,
  seedHomeActivityCaches,
} from "@/entities/activity/hydration";
export {
  archiveActivity,
  createActivity,
  deleteActivity,
  deleteActivityRecord,
  updateActivity,
  upsertActivityRecord,
} from "@/entities/activity/mutations";
export { getAuthenticatedUserId } from "@/entities/activity/repository";
