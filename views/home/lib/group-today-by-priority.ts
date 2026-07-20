/**
 * @file views/home/lib/group-today-by-priority.ts
 * Partitions Home Today rows into priority buckets for section rendering.
 *
 * Purpose: Keep Home list composition dumb — bucket by `activity.priority`
 *          while preserving input order within each bucket. Empty buckets are
 *          omitted by the caller.
 * Used in: views/home/ui/home-today-priority-list.tsx
 */

import type { ActivityPriority, TodayActivity } from "@/entities/activity";

/** Home priority section keys; `other` is unset (`null`) priority. */
export type TodayPrioritySectionKey = ActivityPriority | "other";

export interface TodayPrioritySection {
  key: TodayPrioritySectionKey;
  label: string;
  items: TodayActivity[];
}

const SECTION_ORDER: readonly TodayPrioritySectionKey[] = [
  "high",
  "medium",
  "low",
  "other",
] as const;

const SECTION_LABELS: Record<TodayPrioritySectionKey, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  other: "Other",
};

function sectionKeyFor(
  priority: ActivityPriority | null,
): TodayPrioritySectionKey {
  if (priority === "high" || priority === "medium" || priority === "low") {
    return priority;
  }

  return "other";
}

/**
 * Groups today's activities into High → Medium → Low → Other.
 *
 * @param items - flat TodayActivity list from `useHomeTodayQuery`
 * @returns only non-empty sections, in display order
 */
export function groupTodayByPriority(
  items: TodayActivity[],
): TodayPrioritySection[] {
  const buckets: Record<TodayPrioritySectionKey, TodayActivity[]> = {
    high: [],
    medium: [],
    low: [],
    other: [],
  };

  for (const item of items) {
    buckets[sectionKeyFor(item.activity.priority)].push(item);
  }

  return SECTION_ORDER.filter((key) => buckets[key].length > 0).map((key) => ({
    key,
    label: SECTION_LABELS[key],
    items: buckets[key],
  }));
}
