/**
 * @file entities/note/hooks/use-general-notes-query.ts
 * Reads general notes for one category from the TanStack cache.
 */

import { useQuery } from "@tanstack/react-query";

import { generalNotesQueryOptions } from "@/entities/note/client/general-notes-query";

/**
 * Reads undated notes for one category from the TanStack cache.
 */
export function useGeneralNotesQuery(categoryId: string) {
  return useQuery(generalNotesQueryOptions(categoryId));
}
