/**
 * @file entities/note/hooks/use-general-notes-query.ts
 * Reads general notes for one category from the TanStack cache.
 *
 * Purpose: Category-scoped undated list for Notes page category views.
 * Used in: views/notes/ui/notes-views-section.tsx
 * Used for: `useGeneralNotesQuery(categoryId, { enabled })` when view is category:*.
 */

import { useQuery } from "@tanstack/react-query";

import { generalNotesQueryOptions } from "@/entities/note/client/general-notes-query";

export interface UseGeneralNotesQueryOptions {
  /** When false, skips the fetch (e.g. calendar view active). */
  enabled?: boolean;
}

/**
 * Reads undated notes for one category from the TanStack cache.
 *
 * @param categoryId - target category; empty string keeps the query disabled
 * @param options.enabled - extra gate beyond non-empty categoryId
 */
export function useGeneralNotesQuery(
  categoryId: string,
  options: UseGeneralNotesQueryOptions = {},
) {
  const base = generalNotesQueryOptions(categoryId);

  return useQuery({
    ...base,
    // Combine factory `enabled` with caller gate (category view only)
    enabled: (options.enabled ?? true) && Boolean(categoryId),
  });
}
