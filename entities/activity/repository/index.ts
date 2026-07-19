/**
 * @file entities/activity/repository/index.ts
 * Public surface for the Activity repository (Supabase data access, RLS-scoped).
 *
 * One responsibility per file (max two functions); import from this barrel.
 *
 * Function index:
 * - getAuthenticatedUserId  (get-authenticated-user-id)
 * - getActivities           (get-activities)
 * - getRecordsForMonth      (get-records-for-month)
 * - createActivity          (create-activity)
 * - updateActivityById, archiveActivityById (update-activity)
 * - deleteActivityById      (delete-activity)
 * - upsertRecord, deleteRecord (record/*)
 */

export { getAuthenticatedUserId } from "@/entities/activity/repository/get-authenticated-user-id";
export { getActivities } from "@/entities/activity/repository/get-activities";
export { getRecordsForMonth } from "@/entities/activity/repository/get-records-for-month";
export { createActivity } from "@/entities/activity/repository/create-activity";
export {
  archiveActivityById,
  updateActivityById,
} from "@/entities/activity/repository/update-activity";
export { deleteActivityById } from "@/entities/activity/repository/delete-activity";
export {
  deleteRecord,
  upsertRecord,
} from "@/entities/activity/repository/record";
