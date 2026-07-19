/**
 * @file entities/activity/client/activity-records-query.ts
 * Client read cache for a month's records — fetcher + query options.
 *
 * The hook lives in hooks/use-activity-records-query (one responsibility per
 * file). Records travel flat; lookup maps are derived in the view
 * (entities/activity/lib/record/build-record-lookup).
 */

import { queryOptions } from "@tanstack/react-query";

import { activityRecordsQueryKey } from "@/entities/activity/client/query-keys";
import type { ActivityRecordsResponse } from "@/entities/activity/model/read-models";

/**
 * Fetches completion records for a month from the API route.
 *
 * @param month - `YYYY-MM` month key
 * @returns records response
 * @throws when the request fails
 */
export async function fetchActivityRecords(
  month: string,
): Promise<ActivityRecordsResponse> {
  const response = await fetch(
    `/api/activity-records?month=${encodeURIComponent(month)}`,
    { credentials: "same-origin" },
  );

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Failed to fetch activity records.");
  }

  return response.json() as Promise<ActivityRecordsResponse>;
}

/**
 * TanStack Query options for a month's records — used by SSR prefetch and hook.
 *
 * @param month - `YYYY-MM` month key
 * @returns query options for the records cache
 */
export function activityRecordsQueryOptions(month: string) {
  return queryOptions({
    queryKey: activityRecordsQueryKey(month),
    queryFn: () => fetchActivityRecords(month),
    retry: 1,
  });
}
