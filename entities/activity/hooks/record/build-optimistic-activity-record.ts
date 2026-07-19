/**
 * @file entities/activity/hooks/record/build-optimistic-activity-record.ts
 * Pure builder for optimistic activity-record cache rows.
 *
 * Purpose: mirror the card-owned record form in the month cache before the
 *          server responds. Configuration fields are submitted to HTTP too.
 * Used in: use-upsert-activity-record-mutation.ts
 */

import type {
  ActivityRecord,
  TrackingMode,
} from "@/entities/activity/model/types";

/** Configuration values submitted by the record card. */
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
 * Builds an optimistic `ActivityRecord`. Identity/timestamps come from the
 * existing row when present; submitted configuration and values replace the
 * card's editable record fields.
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
    trackingModeSnapshot: input.trackingMode,
    goalSnapshot: input.goal,
    goalDurationSnapshot: input.goalDuration,
    count: input.count,
    duration: input.duration,
    description: input.description ?? null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}
