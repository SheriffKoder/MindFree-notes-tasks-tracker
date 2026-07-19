/**
 * @file entities/activity/lib/today/build-today-activities.ts
 * Client-side join of activity definitions + today's records into the Home Today
 * list — the single derived shape every Home Today consumer reads.
 *
 * Purpose: definitions and records live in separate caches; Home Today needs one
 *          `{ activity, record, done, progress }` entry per activity shown today.
 *          Mirrors `transform/build-calendar-days.ts`, scoped to a single date:
 *          recorded days always appear; the schedule only adds empty (due) slots.
 * Used in: `hooks/use-home-today-query`; the Home Today island (later steps).
 *
 * Function index:
 * - buildTodayActivities: activities + recordLookup + todayIso → TodayActivity[]
 */

import { deriveTodayProgress } from "@/entities/activity/lib/record/derive-today-progress";
import {
  recordKey,
  type RecordLookup,
} from "@/entities/activity/lib/record/build-record-lookup";
import { isActiveOnDay } from "@/entities/activity/lib/schedule/resolve-schedule";
import type { TodayActivity } from "@/entities/activity/model/read-models";
import type { Activity } from "@/entities/activity/model/types";

/**
 * Derives the activities that show on Home today. An unarchived activity appears
 * when it has a record for `todayIso` (history, schedule-independent) **or** when
 * it is currently scheduled today (`isActiveOnDay` — empty/due slots). Each entry
 * carries today's record (or `null`) and derived progress. Input order is
 * preserved; filtering/sorting policy belongs to the view.
 *
 * @param activities - task definitions (typically all tasks for the kind)
 * @param recordLookup - derived from the current month's flat records
 * @param todayIso - today as `YYYY-MM-DD`
 * @returns today's derived activity list
 */
export function buildTodayActivities(
  activities: Activity[],
  recordLookup: RecordLookup,
  todayIso: string,
): TodayActivity[] {
  const today: TodayActivity[] = [];

  for (const activity of activities) {
    if (activity.archivedAt !== null) {
      continue;
    }

    const record =
      recordLookup.byTaskDate.get(recordKey(activity.id, todayIso)) ?? null;

    if (!record && !isActiveOnDay(activity, todayIso)) {
      continue;
    }

    const progress = deriveTodayProgress(activity, record);

    today.push({ activity, record, done: progress.done, progress });
  }

  return today;
}
