/**
 * @file features/activity/activity-record-drawer/model/use-selected-day-records.ts
 * Derived selected-day records + Add candidates — no drawer-specific cache.
 *
 * Subscribes to the same canonical TanStack keys the activity page already
 * uses (`["activities", kind]` + `["activityRecords", month]`), then joins
 * them for one calendar date.
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
import type { ActivityKind } from "@/entities/activity/model/types";

/** Derived selected-day lists plus a combined loading/error state. */
export interface UseSelectedDayRecordsResult {
  /** Persisted records for `date` (empty until both caches resolve). */
  items: TodayActivity[];
  /** Activities not yet recorded for `date`, split active vs archived. */
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
 */
export function useSelectedDayRecords(
  date: string,
  kind: ActivityKind,
): UseSelectedDayRecordsResult {
  const month = date.slice(0, 7);
  const activitiesQuery = useActivitiesQuery(kind);
  const recordsQuery = useActivityRecordsQuery(month);

  const activities = activitiesQuery.data?.activities;
  const records = recordsQuery.data?.records;

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
