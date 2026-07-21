/**
 * @file entities/activity/offline/index.ts
 * Segment barrel for activity offline queue adapters and flush → ActivityChange.
 *
 * Function index:
 * - createActivityOfflineSyncAdapter, saveActivityOfflinePending,
 *   applyActivityOfflinePending
 * - buildActivityOfflineKey, toActivityOfflineWrite, ACTIVITY_OFFLINE_ENTITY
 * - activityChangeFromOfflineFlush, reconcileOptimisticCreateInCache
 */

export {
  ACTIVITY_OFFLINE_ENTITY,
  applyActivityOfflinePending,
  buildActivityOfflineKey,
  createActivityOfflineSyncAdapter,
  saveActivityOfflinePending,
  toActivityOfflineWrite,
  type ActivityOfflineOperation,
  type ActivityOfflinePayload,
  type ActivityOfflinePendingInput,
} from "@/entities/activity/offline/activity-offline-storage";
export {
  activityChangeFromOfflineFlush,
  reconcileOptimisticCreateInCache,
} from "@/entities/activity/offline/activity-change-from-offline";
