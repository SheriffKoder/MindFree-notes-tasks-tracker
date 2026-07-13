/**
 * @file entities/note/tanstack/query-keys.ts
 * TanStack Query key factories for note read caches.
 */

/** Query key for month-scoped calendar notes (`calendarDays`, `monthNotes`). */
export function calendarNotesQueryKey(month: string) {
  return ["calendarNotes", month] as const;
}

/** Query key for month-independent general notes. */
export const generalNotesQueryKey = ["generalNotes"] as const;

/** Query key for home quick note + starred carousel. */
export const homeNotesQueryKey = ["homeNotes"] as const;
