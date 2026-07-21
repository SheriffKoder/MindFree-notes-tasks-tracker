/**
 * @file entities/activity/repository/index.ts
 * Public surface for the Activity repository (Supabase data access, RLS-scoped).
 *
 * One responsibility per file (max two functions); import from this barrel.
 *
 * Function index:
 * - getAuthenticatedUserId  (get-authenticated-user-id)
 * - getActivities           (get-activities)
 * - getActivityById         (get-activity-by-id)
 * - getRecordsForMonth      (get-records-for-month)
 * - getAllActivityRecords   (get-all-activity-records)
 * - getAllTimeTaskRecordValues (progress/*)
 * - createActivity          (create-activity)
 * - updateActivityById, archiveActivityById (update-activity)
 * - deleteActivityById      (delete-activity)
 * - upsertRecord, deleteRecord (record/*)
 */

export { getAuthenticatedUserId } from "@/entities/activity/repository/get-authenticated-user-id";
export { getActivities } from "@/entities/activity/repository/get-activities";
export { getActivityById } from "@/entities/activity/repository/get-activity-by-id";
export { getRecordsForMonth } from "@/entities/activity/repository/get-records-for-month";
export { getAllActivityRecords } from "@/entities/activity/repository/get-all-activity-records";
export {
  getAllTimeTaskRecordValues,
  type AllTimeTaskRecordValue,
} from "@/entities/activity/repository/progress";
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
