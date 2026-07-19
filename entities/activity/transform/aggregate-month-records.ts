/**
 * @file entities/activity/transform/aggregate-month-records.ts
 * Shapes a month of records into the read-ready API response.
 *
 * Purpose: records stay flat over the wire (a day holds records for many
 *          activities); lookup maps are derived client-side via
 *          entities/activity/lib/record/build-record-lookup. This only orders the flat
 *          list deterministically for stable rendering.
 * Used in: entities/activity/queries/get-activity-records-response.ts
 */

import type { ActivityRecord } from "@/entities/activity/model/types";
import type { ActivityRecordsResponse } from "@/entities/activity/model/read-models";

/**
 * Builds the month records response, sorting by `(date, taskId)` for stable
 * ordering across reads.
 *
 * @param month - `YYYY-MM` month key
 * @param records - records already filtered to the month
 * @returns read-ready records payload
 */
export function buildActivityRecordsResponse(
  month: string,
  records: ActivityRecord[],
): ActivityRecordsResponse {
  const sorted = [...records].sort((left, right) => {
    const byDate = left.date.localeCompare(right.date);

    return byDate !== 0 ? byDate : left.taskId.localeCompare(right.taskId);
  });

  return { month, records: sorted };
}
