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
 * - findRecordInCache, hasRecordMonthCache (find-record-in-cache)
 * - applyRealtimeActivityChange (apply-realtime-activity-change)
 * - applyRealtimeActivityRecordChange (apply-realtime-activity-record-change)
 */

export {
  applyRealtimeActivityChange,
  type ApplyRealtimeActivityChangeResult,
  type RealtimeActivityChangeEvent,
} from "@/entities/activity/cache/apply-realtime-activity-change";
export {
  applyRealtimeActivityRecordChange,
  type ApplyRealtimeActivityRecordChangeResult,
  type RealtimeActivityRecordChangeEvent,
} from "@/entities/activity/cache/apply-realtime-activity-record-change";
export {
  removeActivityFromCache,
  upsertActivityInCache,
} from "@/entities/activity/cache/activity-cache-mutations";
export { findActivityByIdInCache } from "@/entities/activity/cache/find-activity-in-cache";
export {
  findRecordInCache,
  hasRecordMonthCache,
} from "@/entities/activity/cache/find-record-in-cache";
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
