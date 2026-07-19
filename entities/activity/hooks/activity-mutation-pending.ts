/**
 * @file entities/activity/hooks/activity-mutation-pending.ts
 * Tracks in-flight activity mutation ids so realtime can skip echo events.
 */

const pendingActivityIds = new Set<string>();

/**
 * Marks an activity id as having an in-flight TanStack mutation.
 */
export function markActivityMutationPending(activityId: string): void {
  pendingActivityIds.add(activityId);
}

/**
 * Clears the pending flag after a mutation settles.
 */
export function clearActivityMutationPending(activityId: string): void {
  pendingActivityIds.delete(activityId);
}

/**
 * @returns whether a mutation is currently in flight for the activity id.
 */
export function isActivityMutationPending(activityId: string): boolean {
  return pendingActivityIds.has(activityId);
}
