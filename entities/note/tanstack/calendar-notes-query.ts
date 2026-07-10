/**
 * @file entities/note/tanstack/calendar-notes-query.ts
 * Client read cache for calendar notes — shared by SSR prefetch and `useQuery`.
 */

import { queryOptions, useQuery } from "@tanstack/react-query";

import type { CalendarNotesResponse } from "@/entities/note/model/types";
import { calendarNotesQueryKey } from "@/entities/note/tanstack/query-keys";

/**
 * Fetches aggregated calendar notes for a month from the API route.
 */
export async function fetchCalendarNotes(
  month: string,
): Promise<CalendarNotesResponse> {
  const response = await fetch(
    `/api/notes/calendar?month=${encodeURIComponent(month)}`,
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
  });
}

/**
 * Reads calendar notes for the current URL month from the TanStack cache.
 */
export function useCalendarNotesQuery(month: string) {
  return useQuery(calendarNotesQueryOptions(month));
}
