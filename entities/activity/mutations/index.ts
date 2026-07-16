/**
 * @file entities/activity/mutations/index.ts
 * Segment barrel for activity server write use-cases.
 *
 * Function index:
 * - createActivity   (create-activity)
 * - updateActivity   (update-activity)
 * - archiveActivity  (archive-activity)
 * - deleteActivity   (delete-activity)
 */

export { createActivity } from "@/entities/activity/mutations/create-activity";
export { updateActivity } from "@/entities/activity/mutations/update-activity";
export { archiveActivity } from "@/entities/activity/mutations/archive-activity";
export { deleteActivity } from "@/entities/activity/mutations/delete-activity";
