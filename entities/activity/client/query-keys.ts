/**
 * @file entities/activity/client/query-keys.ts
 * TanStack Query key factories for activity read caches.
 *
 * Definitions are keyed by `kind` (stable across month navigation); records are
 * keyed by `month` so navigation refetches records only (afterthoughts §4).
 */

import type { ActivityKind } from "@/entities/activity/model/types";

/** Query key for definitions of one kind (stable, not month-scoped). */
export function activitiesQueryKey(kind: ActivityKind) {
  return ["activities", kind] as const;
}

/** Query key for a month's completion records. */
export function activityRecordsQueryKey(month: string) {
  return ["activityRecords", month] as const;
}
