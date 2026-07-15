/**
 * @file entities/activity/hooks/use-activities-query.ts
 * Reads activity definitions for a kind from the TanStack cache.
 *
 * The key is `["activities", kind]` — independent of month, so month navigation
 * never refetches definitions (afterthoughts §4).
 */

import { useQuery } from "@tanstack/react-query";

import { activitiesQueryOptions } from "@/entities/activity/client/activities-query";
import type { ActivityKind } from "@/entities/activity/model/types";

/**
 * Reads definitions for a kind from the cache (SSR-seeded, then live).
 *
 * @param kind - task or reminder
 * @returns TanStack query result for the definitions cache
 */
export function useActivitiesQuery(kind: ActivityKind) {
  return useQuery(activitiesQueryOptions(kind));
}
