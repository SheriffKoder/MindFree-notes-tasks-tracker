/**
 * @file entities/note/category/client/categories-query.ts
 * Client read cache for note categories — fetcher + query options.
 *
 * Purpose: GET `/api/notes/categories` into TanStack Query.
 * Used in: useNoteCategoriesQuery; Notes/Home hydration consumers
 * Used for: Active-only by default; `includeDeleted` for manage drawer.
 */

import { queryOptions } from "@tanstack/react-query";

import {
  noteCategoriesKeyFor,
  noteCategoriesQueryKey,
} from "@/entities/note/category/client/query-keys";
import type { NoteCategoriesResponse } from "@/entities/note/category/queries";

/**
 * Fetches note categories from the API route.
 *
 * @param includeDeleted - when true, includes soft-deleted (archived) rows
 */
export async function fetchNoteCategories(
  includeDeleted = false,
): Promise<NoteCategoriesResponse> {
  // 1. Build URL — manage drawer passes includeDeleted=1
  const search = includeDeleted ? "?includeDeleted=1" : "";
  const response = await fetch(`/api/notes/categories${search}`, {
    credentials: "same-origin",
  });

  // 2. Surface API error message when present
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
 *
 * @param includeDeleted - manage drawer uses true; Notes/Home use false
 */
export function noteCategoriesQueryOptions(includeDeleted = false) {
  return queryOptions({
    queryKey: noteCategoriesKeyFor(includeDeleted),
    queryFn: () => fetchNoteCategories(includeDeleted),
    retry: 1,
  });
}

/** Convenience alias — active-only key (same as `noteCategoriesKeyFor(false)`). */
export { noteCategoriesQueryKey };
