/**
 * @file entities/note/hydration/seed-notes-page-cache.ts
 * Writes SSR Notes-page payloads into a QueryClient (no dehydrate).
 */

import type { QueryClient } from "@tanstack/react-query";

import type { NotesPageInitialData } from "@/entities/note/queries";
import {
  calendarNotesQueryKey,
  generalNotesQueryKey,
  noteCategoriesQueryKey,
} from "@/entities/note/client/query-keys";

/**
 * Seeds calendar, categories, and per-category general note caches from SSR.
 */
export function seedNotesPageCache(
  queryClient: QueryClient,
  data: Pick<
    NotesPageInitialData,
    "month" | "calendarNotes" | "categories" | "generalByCategory"
  >,
): void {
  queryClient.setQueryData(calendarNotesQueryKey(data.month), data.calendarNotes);
  queryClient.setQueryData(noteCategoriesQueryKey, {
    categories: data.categories,
  });

  for (const payload of data.generalByCategory) {
    queryClient.setQueryData(
      generalNotesQueryKey(payload.categoryId),
      payload,
    );
  }
}
