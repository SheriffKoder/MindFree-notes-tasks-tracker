/**
 * @file entities/activity/hooks/use-home-today-query.ts
 * Derived Home Today read hook — no bespoke cache.
 *
 * Home Today is a selector over the two existing caches (`["activities","task"]`
 * + `["activityRecords", currentMonth]`), not a new query key
 * (read-models.md: "derive from the same two caches"; ADR 0014 client join).
 * Recomputes only when either underlying cache changes.
 */

import { useMemo } from "react";

import { useActivitiesQuery } from "@/entities/activity/hooks/use-activities-query";
import { useActivityRecordsQuery } from "@/entities/activity/hooks/use-activity-records-query";
import { getCurrentMonth } from "@/entities/activity/lib/month/parse-month";
import { buildRecordLookup } from "@/entities/activity/lib/record/build-record-lookup";
import { buildTodayActivities } from "@/entities/activity/lib/today/build-today-activities";
import type { TodayActivity } from "@/entities/activity/model/read-models";
import { getTodayIsoDate } from "@/shared/calendar";

/** Derived Home Today list plus a combined loading/error state. */
export interface UseHomeTodayQueryResult {
  /** Today's derived activities (empty until both caches resolve). */
  today: TodayActivity[];
  /** True while either underlying query is still loading. */
  isPending: boolean;
  /** True when either underlying query errored. */
  isError: boolean;
}

/**
 * Reads today's activity list by deriving over the definitions + current-month
 * records caches. Never writes a cache; purely a selector. The derivation runs
 * only when the two cache slices change (memoized), pairing each activity with
 * today's record and its derived progress.
 *
 * @returns today's derived list plus combined pending/error flags
 */
export function useHomeTodayQuery(): UseHomeTodayQueryResult {
  const month = getCurrentMonth();
  const activitiesQuery = useActivitiesQuery("task");
  const recordsQuery = useActivityRecordsQuery(month);

  const activities = activitiesQuery.data?.activities;
  const records = recordsQuery.data?.records;

  const today = useMemo<TodayActivity[]>(() => {
    if (!activities || !records) {
      return [];
    }

    const recordLookup = buildRecordLookup(records);

    return buildTodayActivities(activities, recordLookup, getTodayIsoDate());
  }, [activities, records]);

  return {
    today,
    isPending: activitiesQuery.isPending || recordsQuery.isPending,
    isError: activitiesQuery.isError || recordsQuery.isError,
  };
}
