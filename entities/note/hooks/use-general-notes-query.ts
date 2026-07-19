/**
 * @file entities/note/hooks/use-general-notes-query.ts
 * Reads general notes from the TanStack cache (month-independent).
 */

import { useQuery } from "@tanstack/react-query";

import { generalNotesQueryOptions } from "@/entities/note/client/general-notes-query";

/**
 * Reads general notes from the TanStack cache (month-independent).
 */
export function useGeneralNotesQuery() {
  return useQuery(generalNotesQueryOptions());
}
