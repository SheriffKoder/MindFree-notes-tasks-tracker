/**
 * @file entities/activity/cache/index.ts
 * Segment barrel for pure Activity TanStack cache helpers + sync hub.
 *
 * Function index:
 * - upsertActivityInCache, removeActivityFromCache (activity-cache-mutations)
 * - purgeActivityRecordsInCache (purge-activity-records-in-cache)
 * - recordMonthKey, upsertRecordInCache, removeRecordFromCache (record/*)
 * - synchronizeActivityCaches, ActivityChange (synchronize-activity-caches)
 * - findActivityByIdInCache (find-activity-in-cache)
 */

export {
  removeActivityFromCache,
  upsertActivityInCache,
} from "@/entities/activity/cache/activity-cache-mutations";
export { findActivityByIdInCache } from "@/entities/activity/cache/find-activity-in-cache";
export { purgeActivityRecordsInCache } from "@/entities/activity/cache/purge-activity-records-in-cache";
export {
  recordMonthKey,
  removeRecordFromCache,
  upsertRecordInCache,
} from "@/entities/activity/cache/record";
export {
  synchronizeActivityCaches,
  type ActivityChange,
} from "@/entities/activity/cache/synchronize-activity-caches";
