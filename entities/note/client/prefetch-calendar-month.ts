/**
 * @file entities/note/client/prefetch-calendar-month.ts
 * Silently warms one month in the TanStack calendar cache.
 */

import type { QueryClient } from "@tanstack/react-query";

import { calendarNotesQueryOptions } from "@/entities/note/client/calendar-notes-query";

/**
 * Prefetches calendar notes for a month when not already cached.
 */
export function prefetchCalendarMonth(
  queryClient: QueryClient,
  month: string,
): Promise<void> {
  return queryClient.prefetchQuery(calendarNotesQueryOptions(month));
}
