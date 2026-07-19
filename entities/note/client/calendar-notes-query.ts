/**
 * @file entities/note/client/calendar-notes-query.ts
 * Client read cache for calendar notes — fetcher + query options.
 *
 * The hook lives in hooks/use-calendar-notes-query (one responsibility per file).
 */

import { queryOptions } from "@tanstack/react-query";

import { calendarNotesQueryKey } from "@/entities/note/client/query-keys";
import type { CalendarNotesResponse } from "@/entities/note/model/read-models";

/**
 * Fetches aggregated calendar notes for a month from the API route.
 */
export async function fetchCalendarNotes(
  month: string,
): Promise<CalendarNotesResponse> {
  const response = await fetch(
    `/api/notes/calendar?month=${encodeURIComponent(month)}`,
    { credentials: "same-origin" },
  );

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Failed to fetch calendar notes.");
  }

  return response.json() as Promise<CalendarNotesResponse>;
}

/**
 * TanStack Query options for calendar notes — used by SSR prefetch and hooks.
 */
export function calendarNotesQueryOptions(month: string) {
  return queryOptions({
    queryKey: calendarNotesQueryKey(month),
    queryFn: () => fetchCalendarNotes(month),
    retry: 1,
  });
}
