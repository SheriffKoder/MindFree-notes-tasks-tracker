/**
 * @file entities/note/client/prefetch-adjacent-calendar-months.ts
 * Warms previous and next month caches after the active month is available.
 */

import type { QueryClient } from "@tanstack/react-query";

import { prefetchCalendarMonth } from "@/entities/note/client/prefetch-calendar-month";
import { shiftMonth } from "@/shared/month-navigator";

/**
 * Prefetches calendar notes for the months immediately before and after `month`.
 */
export function prefetchAdjacentCalendarMonths(
  queryClient: QueryClient,
  month: string,
): Promise<unknown[]> {
  return Promise.all([
    prefetchCalendarMonth(queryClient, shiftMonth(month, -1)),
    prefetchCalendarMonth(queryClient, shiftMonth(month, 1)),
  ]);
}
