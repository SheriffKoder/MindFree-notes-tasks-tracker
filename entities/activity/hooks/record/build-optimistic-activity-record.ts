/**
 * @file entities/activity/hooks/record/build-optimistic-activity-record.ts
 * Pure builder for optimistic activity-record cache rows.
 *
 * Purpose: seed first-create snapshots from the current activity while
 *          preserving immutable snapshots on later natural-key upserts. The
 *          HTTP body stays totals-only; these fields exist only for optimistic
 *          UI until the server response replaces them.
 * Used in: use-upsert-activity-record-mutation.ts
 */

import type {
  ActivityRecord,
  TrackingMode,
} from "@/entities/activity/model/types";

/** Activity configuration needed to seed a new optimistic record. */
export interface OptimisticRecordConfiguration {
  trackingMode: TrackingMode;
  goal: number | null;
  goalDuration: number | null;
}

/** Absolute totals plus seed configuration for an optimistic upsert. */
export interface BuildOptimisticActivityRecordInput
  extends OptimisticRecordConfiguration {
  taskId: string;
  date: string;
  count: number;
  duration: number;
  description?: string | null;
}

/**
 * Builds an optimistic `ActivityRecord`. Existing cached rows keep their
 * snapshots; new rows copy the current activity configuration.
 *
 * @param input - absolute totals and current activity configuration
 * @param existing - cached record for the same natural key, if any
 * @returns optimistic domain record
 */
export function buildOptimisticActivityRecord(
  input: BuildOptimisticActivityRecordInput,
  existing: ActivityRecord | undefined,
): ActivityRecord {
  const now = new Date().toISOString();

  return {
    id: existing?.id ?? `optimistic-${input.taskId}-${input.date}`,
    taskId: input.taskId,
    date: input.date,
    trackingModeSnapshot:
      existing !== undefined
        ? existing.trackingModeSnapshot
        : input.trackingMode,
    goalSnapshot: existing !== undefined ? existing.goalSnapshot : input.goal,
    goalDurationSnapshot:
      existing !== undefined
        ? existing.goalDurationSnapshot
        : input.goalDuration,
    count: input.count,
    duration: input.duration,
    description: input.description ?? null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}
