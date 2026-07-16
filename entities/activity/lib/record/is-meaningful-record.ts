/**
 * @file entities/activity/lib/is-meaningful-record.ts
 * Whether a record holds meaningful work for its tracking mode (afterthoughts §2).
 *
 * Purpose: single predicate driving both display (show a completion) and the
 *          later delete-on-empty watcher. Completion is derived — there is no
 *          stored flag.
 * Used in: calendar/list overlays now; the recording delete watcher (Phase 2).
 */

import type { ActivityRecord, TrackingMode } from "@/entities/activity/model/types";

/** Only the value fields matter here; accept any record-like shape. */
type RecordValues = Pick<ActivityRecord, "count" | "duration">;

/**
 * Whether a record is meaningful for its mode:
 *
 * - `boolean` / `count`  → `count > 0`
 * - `duration`           → `duration > 0`
 * - `count+duration`     → either dimension positive (delete only when both zero)
 *
 * @param record - record value fields (`count`, `duration`)
 * @param trackingMode - owning activity's tracking mode
 * @returns whether the record should persist / render as done
 */
export function isMeaningfulRecord(
  record: RecordValues,
  trackingMode: TrackingMode,
): boolean {
  switch (trackingMode) {
    case "boolean":
    case "count":
      return record.count > 0;
    case "duration":
      return record.duration > 0;
    case "count+duration":
      return record.count > 0 || record.duration > 0;
    default:
      return false;
  }
}
