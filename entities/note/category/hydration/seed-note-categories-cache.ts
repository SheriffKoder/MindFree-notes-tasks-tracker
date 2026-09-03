/**
 * @file entities/note/category/hydration/seed-note-categories-cache.ts
 * Writes SSR category payloads into a QueryClient (no dehydrate).
 *
 * Purpose: Seed active categories before Notes/Home client islands hydrate.
 * Used in: seedNotesPageCache / Home hydration when categories are prefetched
 * Used for: Avoid empty switcher flash on first paint.
 */

import type { QueryClient } from "@tanstack/react-query";

import { noteCategoriesQueryKey } from "@/entities/note/category/client/query-keys";
import type { NoteCategory } from "@/entities/note/category/model/types";

/**
 * Seeds the active note-categories cache from an SSR list.
 */
export function seedNoteCategoriesCache(
  queryClient: QueryClient,
  categories: NoteCategory[],
): void {
  queryClient.setQueryData(noteCategoriesQueryKey, { categories });
}
