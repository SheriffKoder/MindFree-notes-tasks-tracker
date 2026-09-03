/**
 * @file entities/note/client/query-keys.ts
 * TanStack Query key factories for note read caches.
 */

/** Query key for month-scoped calendar notes (`calendarDays`, `monthNotes`). */
export function calendarNotesQueryKey(month: string) {
  return ["calendarNotes", month] as const;
}

/** Undated notes for one category. */
export function generalNotesQueryKey(categoryId: string) {
  return ["generalNotes", categoryId] as const;
}

/** Query key for home category strips (quick + starred per strip). */
export const homeNotesQueryKey = ["homeNotes"] as const;

/** Active note categories — manage drawer and view switcher (Phase 05 client). */
export const noteCategoriesQueryKey = ["noteCategories"] as const;
