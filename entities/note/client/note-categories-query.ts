/**
 * @file entities/note/client/note-categories-query.ts
 * Client read cache for note categories — fetcher + query options.
 */

import { queryOptions } from "@tanstack/react-query";

import type { NoteCategoriesResponse } from "@/entities/note/category/queries";
import { noteCategoriesQueryKey } from "@/entities/note/client/query-keys";

/**
 * Fetches active note categories from the API route.
 */
export async function fetchNoteCategories(): Promise<NoteCategoriesResponse> {
  const response = await fetch("/api/notes/categories", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Failed to fetch note categories.");
  }

  return response.json() as Promise<NoteCategoriesResponse>;
}

/**
 * TanStack Query options for note categories.
 */
export function noteCategoriesQueryOptions() {
  return queryOptions({
    queryKey: noteCategoriesQueryKey,
    queryFn: fetchNoteCategories,
    retry: 1,
  });
}
