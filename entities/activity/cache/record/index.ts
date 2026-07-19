/**
 * @file entities/activity/cache/record/index.ts
 * Public surface for pure activity-record cache helpers.
 *
 * Records are the write side of the Activity entity; their cache updaters live
 * under `cache/record/` to stay separate from the definition updaters at the
 * layer root. Re-exported by `cache/index.ts`.
 *
 * Function index:
 * - recordMonthKey        (record-month-key)
 * - upsertRecordInCache   (upsert-record-in-cache)
 * - removeRecordFromCache (remove-record-from-cache)
 */

export { recordMonthKey } from "@/entities/activity/cache/record/record-month-key";
export { upsertRecordInCache } from "@/entities/activity/cache/record/upsert-record-in-cache";
export { removeRecordFromCache } from "@/entities/activity/cache/record/remove-record-from-cache";
