/**
 * @file entities/note/hooks/use-calendar-notes-query.ts
 * Reads calendar notes for a month from the TanStack cache.
 */

import { useQuery } from "@tanstack/react-query";

import { calendarNotesQueryOptions } from "@/entities/note/client/calendar-notes-query";

/**
 * Reads calendar notes for the current URL month from the TanStack cache.
 */
export function useCalendarNotesQuery(month: string) {
  return useQuery(calendarNotesQueryOptions(month));
}
