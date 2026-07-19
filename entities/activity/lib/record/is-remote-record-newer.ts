/**
 * @file entities/activity/lib/record/is-remote-record-newer.ts
 * Pure newer-wins comparison for record cache reconciliation.
 *
 * Purpose: Gate optimistic/realtime record writes so a slow/stale server echo
 *          cannot overwrite a newer local edit (`updatedAt`). Mirrors
 *          `is-remote-activity-newer` for the record write path.
 * Used in: entities/activity/hooks/record/use-upsert-activity-record-mutation.ts,
 *          later realtime adapters.
 */

import type { ActivityRecord } from "@/entities/activity/model/types";

/**
 * @returns whether the remote record is strictly newer than the cached copy.
 */
export function isRemoteRecordNewer(
  remote: ActivityRecord,
  cached: ActivityRecord | null | undefined,
): boolean {
  if (!cached) {
    return true;
  }

  return remote.updatedAt.localeCompare(cached.updatedAt) > 0;
}
