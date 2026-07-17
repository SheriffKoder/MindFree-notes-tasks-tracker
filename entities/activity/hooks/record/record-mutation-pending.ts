/**
 * @file entities/activity/hooks/record/record-mutation-pending.ts
 * Tracks in-flight record mutations by `(taskId, date)` so realtime can skip
 * echo events (mirrors activity-mutation-pending for the record write path).
 */

const pendingRecordKeys = new Set<string>();

function recordPendingKey(taskId: string, date: string): string {
  return `${taskId}:${date}`;
}

/**
 * Marks a `(taskId, date)` record as having an in-flight TanStack mutation.
 */
export function markRecordMutationPending(taskId: string, date: string): void {
  pendingRecordKeys.add(recordPendingKey(taskId, date));
}

/**
 * Clears the pending flag after a record mutation settles.
 */
export function clearRecordMutationPending(taskId: string, date: string): void {
  pendingRecordKeys.delete(recordPendingKey(taskId, date));
}

/**
 * @returns whether a mutation is currently in flight for the `(taskId, date)`.
 */
export function isRecordMutationPending(taskId: string, date: string): boolean {
  return pendingRecordKeys.has(recordPendingKey(taskId, date));
}
