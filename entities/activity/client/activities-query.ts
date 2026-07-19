/**
 * @file entities/activity/client/activities-query.ts
 * Client read cache for activity definitions — fetcher + query options.
 *
 * The hook lives in hooks/use-activities-query (one responsibility per file).
 * Shared by SSR prefetch (Step 7) and the read hook.
 */

import { queryOptions } from "@tanstack/react-query";

import { activitiesQueryKey } from "@/entities/activity/client/query-keys";
import type { ActivitiesResponse } from "@/entities/activity/model/read-models";
import type { ActivityKind } from "@/entities/activity/model/types";

/**
 * Fetches definitions for a kind from the API route.
 *
 * @param kind - task or reminder
 * @returns definitions response
 * @throws when the request fails
 */
export async function fetchActivities(
  kind: ActivityKind,
): Promise<ActivitiesResponse> {
  const response = await fetch(
    `/api/activities?kind=${encodeURIComponent(kind)}`,
    { credentials: "same-origin" },
  );

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Failed to fetch activities.");
  }

  return response.json() as Promise<ActivitiesResponse>;
}

/**
 * TanStack Query options for definitions — used by SSR prefetch and the hook.
 *
 * @param kind - task or reminder
 * @returns query options for the definitions cache
 */
export function activitiesQueryOptions(kind: ActivityKind) {
  return queryOptions({
    queryKey: activitiesQueryKey(kind),
    queryFn: () => fetchActivities(kind),
    retry: 1,
  });
}
