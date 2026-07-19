/**
 * @file entities/activity/lib/day/build-record-task-candidates.ts
 * Tasks eligible to add a record for a selected calendar day.
 *
 * Excludes tasks that already have a record for that day. Schedule is ignored —
 * any definition may be added. Archived tasks remain available but are returned
 * in a separate group for UI separation.
 */

import type { Activity } from "@/entities/activity/model/types";

/** Add-dropdown candidates split by archive status. */
export interface RecordTaskCandidates {
  /** Non-archived tasks not yet recorded for the day. */
  active: Activity[];
  /** Archived tasks not yet recorded for the day. */
  archived: Activity[];
}

/**
 * Derives Add-dropdown candidates for a selected day.
 *
 * @param activities - all task definitions (active and archived)
 * @param recordedTaskIds - task ids that already have a record for the day
 * @returns active and archived candidate lists in definition order
 */
export function buildRecordTaskCandidates(
  activities: Activity[],
  recordedTaskIds: ReadonlySet<string>,
): RecordTaskCandidates {
  const active: Activity[] = [];
  const archived: Activity[] = [];

  for (const activity of activities) {
    if (recordedTaskIds.has(activity.id)) {
      continue;
    }

    if (activity.archivedAt !== null) {
      archived.push(activity);
      continue;
    }

    active.push(activity);
  }

  return { active, archived };
}
