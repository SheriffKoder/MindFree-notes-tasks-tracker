/**
 * @file entities/activity/lib/is-remote-activity-newer.ts
 * Pure newer-wins comparison for activity cache reconciliation.
 *
 * Purpose: Gate optimistic/realtime writes so a stale server response cannot
 *          overwrite a newer local edit (`updatedAt`).
 * Used in: entities/activity/hooks/use-*-activity-mutation.ts (onSuccess),
 *          later realtime adapters (Phase 5).
 */

import type { Activity } from "@/entities/activity/model/types";

/**
 * @returns whether the remote row is strictly newer than the cached copy.
 */
export function isRemoteActivityNewer(
  remote: Activity,
  cached: Activity | null | undefined,
): boolean {
  if (!cached) {
    return true;
  }

  return remote.updatedAt.localeCompare(cached.updatedAt) > 0;
}
