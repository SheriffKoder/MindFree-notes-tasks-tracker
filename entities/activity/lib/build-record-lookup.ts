/**
 * @file entities/activity/lib/build-record-lookup.ts
 * Derives client-side lookup maps from a flat month of records (afterthoughts §1, §4).
 *
 * Purpose: records travel flat over the wire; consumers need O(1) access by
 *          `(taskId, date)` (recording, calendar/Home cells) and per-task
 *          grouping (metadata + progress). Both maps derive from one pass.
 * Used in: Tasks calendar/list overlays, Home Today derivation, recording.
 *
 * Function index:
 * - recordKey:         `${taskId}:${date}` key builder (shared with consumers)
 * - buildRecordLookup: flat records → `{ byTaskDate, byTaskId }`
 */

import type { ActivityRecord } from "@/entities/activity/model/types";

/** Lookup maps derived from a flat month of records. */
export interface RecordLookup {
  /** `${taskId}:${date}` → the single record for that activity-day. */
  byTaskDate: Map<string, ActivityRecord>;
  /** `taskId` → the activity's records in the set, insertion order preserved. */
  byTaskId: Map<string, ActivityRecord[]>;
}

/**
 * Builds the natural-key string that addresses a record without its id.
 *
 * @param taskId - owning activity id
 * @param date - record day (`YYYY-MM-DD`)
 * @returns `${taskId}:${date}` lookup key
 */
export function recordKey(taskId: string, date: string): string {
  return `${taskId}:${date}`;
}

/**
 * Derives both lookup maps in a single pass over the flat record list.
 *
 * @param records - flat records (typically one month)
 * @returns `byTaskDate` (natural key) and `byTaskId` (grouped) maps
 */
export function buildRecordLookup(records: ActivityRecord[]): RecordLookup {
  const byTaskDate = new Map<string, ActivityRecord>();
  const byTaskId = new Map<string, ActivityRecord[]>();

  for (const record of records) {
    byTaskDate.set(recordKey(record.taskId, record.date), record);

    const group = byTaskId.get(record.taskId);

    if (group) {
      group.push(record);
    } else {
      byTaskId.set(record.taskId, [record]);
    }
  }

  return { byTaskDate, byTaskId };
}
