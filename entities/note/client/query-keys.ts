/**
 * @file entities/note/client/query-keys.ts
 * TanStack Query key factories for note read caches.
 *
 * Category keys are owned by `entities/note/category/client/query-keys` and
 * re-exported here so existing note-client imports keep working.
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

/** Active note categories — re-exported from the category nest. */
export {
  noteCategoriesQueryKey,
  noteCategoriesWithDeletedQueryKey,
  noteCategoriesKeyFor,
} from "@/entities/note/category/client/query-keys";
