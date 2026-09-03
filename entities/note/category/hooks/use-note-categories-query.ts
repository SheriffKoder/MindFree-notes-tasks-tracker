/**
 * @file entities/note/category/hooks/use-note-categories-query.ts
 * Reads note categories from the TanStack cache.
 *
 * Purpose: Active or archived category lists for Notes/Home/manage drawer.
 * Used in: views/notes, views/home, Phase 07 manage drawer
 * Used for: Switcher config, add dropdown, archive list.
 */

"use client";

import { useQuery } from "@tanstack/react-query";

import { noteCategoriesQueryOptions } from "@/entities/note/category/client/categories-query";

export interface UseNoteCategoriesQueryOptions {
  /** When true, includes soft-deleted categories (manage drawer). */
  includeDeleted?: boolean;
}

/**
 * Reads note categories from the TanStack cache.
 *
 * @param options.includeDeleted - manage drawer uses true; default active-only
 */
export function useNoteCategoriesQuery(
  options: UseNoteCategoriesQueryOptions = {},
) {
  const includeDeleted = options.includeDeleted ?? false;

  return useQuery(noteCategoriesQueryOptions(includeDeleted));
}
