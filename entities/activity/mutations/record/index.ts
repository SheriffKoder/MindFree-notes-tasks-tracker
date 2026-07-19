/**
 * @file entities/activity/mutations/record/index.ts
 * Public surface for activity-record server write use-cases.
 *
 * Records are the write side of the Activity entity; their use-cases live under
 * `mutations/record/` to stay separate from the definition mutations at the
 * layer root. Re-exported by `mutations/index.ts`.
 *
 * Function index:
 * - upsertActivityRecord (upsert-activity-record)
 * - deleteActivityRecord (delete-activity-record)
 */

export { upsertActivityRecord } from "@/entities/activity/mutations/record/upsert-activity-record";
export { deleteActivityRecord } from "@/entities/activity/mutations/record/delete-activity-record";
