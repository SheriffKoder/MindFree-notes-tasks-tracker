/**
 * @file entities/note/hydration/seed-notes-page-cache.ts
 * Writes SSR Notes-page payloads into a QueryClient (no dehydrate).
 *
 * Purpose: Seed calendar, categories, and per-category general lists before hydrate.
 * Used in: views/notes/ui/notes-hydration-seed.tsx
 * Used for: First-paint switcher + undated lists without a client round-trip.
 */

import type { QueryClient } from "@tanstack/react-query";

import { seedNoteCategoriesCache } from "@/entities/note/category/hydration/seed-note-categories-cache";
import type { NotesPageInitialData } from "@/entities/note/queries";
import {
  calendarNotesQueryKey,
  generalNotesQueryKey,
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
  // Calendar month payload
  queryClient.setQueryData(calendarNotesQueryKey(data.month), data.calendarNotes);

  // Active categories — owned seeder from the category nest
  seedNoteCategoriesCache(queryClient, data.categories);

  // One generalNotes cache entry per active category
  for (const payload of data.generalByCategory) {
    queryClient.setQueryData(
      generalNotesQueryKey(payload.categoryId),
      payload,
    );
  }
}
