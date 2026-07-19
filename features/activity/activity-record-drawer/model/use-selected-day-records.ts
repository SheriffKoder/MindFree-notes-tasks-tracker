/**
 * @file features/activity/activity-record-drawer/model/use-selected-day-records.ts
 * Derived selected-day records + Add candidates — no drawer-specific cache.
 *
 * Subscribes to the same canonical TanStack keys the Tasks calendar already
 * uses (`["activities","task"]` + `["activityRecords", month]`), then joins
 * them for one calendar date. Mutations elsewhere update those keys; this
 * selector recomputes when either slice changes.
 */

"use client";

import { useMemo } from "react";

import {
  buildRecordLookup,
  buildRecordedDayActivities,
  buildRecordTaskCandidates,
  type RecordTaskCandidates,
  type TodayActivity,
} from "@/entities/activity";
import {
  useActivitiesQuery,
  useActivityRecordsQuery,
} from "@/entities/activity/client";

/** Derived selected-day lists plus a combined loading/error state. */
export interface UseSelectedDayRecordsResult {
  /** Persisted records for `date` (empty until both caches resolve). */
  items: TodayActivity[];
  /** Tasks not yet recorded for `date`, split active vs archived. */
  candidates: RecordTaskCandidates;
  /** True while either underlying query is still loading. */
  isPending: boolean;
  /** True when either underlying query errored. */
  isError: boolean;
}

const EMPTY_CANDIDATES: RecordTaskCandidates = {
  active: [],
  archived: [],
};

/**
 * Derives the drawer's day rows and Add-menu candidates from canonical caches.
 *
 * @param date - selected calendar day (`YYYY-MM-DD`)
 * @returns day entries, add candidates, and combined pending/error flags
 */
export function useSelectedDayRecords(
  date: string,
): UseSelectedDayRecordsResult {
  // Records are stored one month per query key. Definitions are one stable
  // `["activities", "task"]` cache containing active and archived tasks.
  const month = date.slice(0, 7);
  const activitiesQuery = useActivitiesQuery("task");
  const recordsQuery = useActivityRecordsQuery(month);

  const activities = activitiesQuery.data?.activities;
  const records = recordsQuery.data?.records;

  // Visible rows are persisted records for this exact date only. Scheduling
  // does not create empty drawer rows.
  const items = useMemo(() => {
    if (!activities || !records) {
      return [];
    }

    return buildRecordedDayActivities(
      activities,
      buildRecordLookup(records),
      date,
    );
  }, [activities, date, records]);

  // The Add menu starts from all definitions, removes the tasks represented by
  // `items`, then keeps active and archived tasks in separate sections.
  const candidates = useMemo(() => {
    if (!activities) {
      return EMPTY_CANDIDATES;
    }

    return buildRecordTaskCandidates(
      activities,
      new Set(items.map((item) => item.activity.id)),
    );
  }, [activities, items]);

  return {
    items,
    candidates,
    isPending: activitiesQuery.isPending || recordsQuery.isPending,
    isError: activitiesQuery.isError || recordsQuery.isError,
  };
}
