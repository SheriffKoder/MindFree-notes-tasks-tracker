/**
 * @file entities/note/hooks/use-note-categories-query.ts
 * Reads note categories from the TanStack cache.
 */

import { useQuery } from "@tanstack/react-query";

import { noteCategoriesQueryOptions } from "@/entities/note/client/note-categories-query";

/**
 * Reads active note categories from the TanStack cache.
 */
export function useNoteCategoriesQuery() {
  return useQuery(noteCategoriesQueryOptions());
}
