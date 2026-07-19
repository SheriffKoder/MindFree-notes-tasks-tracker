/**
 * @file entities/activity/lib/day/build-recorded-day-activities.ts
 * Client-side join of definitions + records for one calendar day — records only.
 *
 * Unlike `buildTodayActivities`, this does not add scheduled empty slots. A row
 * appears only when a record exists for `dateIso`. Archived definitions remain
 * visible when they still have a record (historical facts).
 */

import { deriveTodayProgress } from "@/entities/activity/lib/record/derive-today-progress";
import {
  recordKey,
  type RecordLookup,
} from "@/entities/activity/lib/record/build-record-lookup";
import type { TodayActivity } from "@/entities/activity/model/read-models";
import type { Activity } from "@/entities/activity/model/types";

/**
 * Derives the recorded activities for one day. Input activity order is
 * preserved; activities without a record for `dateIso` are omitted.
 *
 * @param activities - task definitions (active and archived)
 * @param recordLookup - derived from the day's month flat records
 * @param dateIso - day as `YYYY-MM-DD`
 * @returns recorded activity entries for that day
 */
export function buildRecordedDayActivities(
  activities: Activity[],
  recordLookup: RecordLookup,
  dateIso: string,
): TodayActivity[] {
  const day: TodayActivity[] = [];

  for (const activity of activities) {
    const record =
      recordLookup.byTaskDate.get(recordKey(activity.id, dateIso)) ?? null;

    if (!record) {
      continue;
    }

    const progress = deriveTodayProgress(activity, record);

    day.push({ activity, record, done: progress.done, progress });
  }

  return day;
}
