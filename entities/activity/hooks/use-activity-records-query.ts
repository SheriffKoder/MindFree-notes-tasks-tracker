/**
 * @file entities/activity/hooks/use-activity-records-query.ts
 * Reads a month's completion records from the TanStack cache.
 *
 * The key is `["activityRecords", month]`, so changing the URL month refetches
 * records only while definitions stay cached (afterthoughts §4).
 */

import { useQuery } from "@tanstack/react-query";

import { activityRecordsQueryOptions } from "@/entities/activity/client/activity-records-query";

/**
 * Reads records for the current month from the cache (SSR-seeded, then live).
 *
 * @param month - `YYYY-MM` month key
 * @returns TanStack query result for the records cache
 */
export function useActivityRecordsQuery(month: string) {
  return useQuery(activityRecordsQueryOptions(month));
}
